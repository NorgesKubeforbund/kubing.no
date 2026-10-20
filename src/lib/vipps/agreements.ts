import { getClient } from "@/db";
import { getCurrentMonth, getCurrentYear, toNorwayDateString } from "@/lib/time";
import {
  addCharge,
  getActiveAgreementByUserId,
  getActiveAgreementWithNoCreatedChargeByUserId,
  getChargeToBeCreated,
  getOrderNumber,
  getUserLock,
  getUsersForChargeCreation,
  getUsersWithNotCreatedCharges,
  saveCreatedAgreement,
  saveCreatedCharge,
  setAgreementStopped,
  setChargeCancelled,
  setChargeCancelledBeforeCreation,
  setChargeCreated,
} from "@/lib/vipps/queries";
import { isUserMemberInYearWithClient } from "@/lib/membership";
import { hasUserActiveAgreementWithClient } from "@/lib/agreement";
import { apiStopAgreement, createCharge, createVippsAgreement, getCharge } from "@/lib/vipps/api";
import { AgreementCreation } from "@/types";
import { notifyOfPaymentDue } from "@/lib/mail";
import { getMembershipCost, getVippsReference } from "@/lib/vipps/util";
import { handleOpenOrderForCreation } from "@/lib/vipps/shared";

export async function createVippsAgreementAndGetRedirectUrl(userId: number, baseUrl: string): Promise<AgreementCreation> {
  const year = getCurrentYear();
  const client = await getClient();
  try {
    await client.query("BEGIN");
    const user = await getUserLock(userId, client);
    if (!user) {
      await client.query("ROLLBACK");
      return { success: false };
    }
    const hasActiveAgreement = await hasUserActiveAgreementWithClient(userId, client);
    if (hasActiveAgreement) {
      return {
        success: true,
        status: "already_has_agreement",
      };
    }
    const handleOrderRes = await handleOpenOrderForCreation(user, year, client);
    if (!handleOrderRes.success) {
      await client.query("ROLLBACK");
      return { success: false };
    }
    const handleOrderStatus = handleOrderRes.data;
    switch (handleOrderStatus) {
      case "order_paid":
        break;
      case "order_cancelled":
        break;
      case "no_order":
        // TODO: Handle possibility of created agreement order 
        break;
    }
    const isMember = await isUserMemberInYearWithClient(userId, year, client);
    if (isMember) {
      const agreementRes = await createVippsAgreement(baseUrl);
      if (!agreementRes.success) {
        await client.query("ROLLBACK");
        return { success: false };
      }
      const agreement = agreementRes.data;
      await saveCreatedAgreement(userId, agreement.agreementId, client);
      await client.query("COMMIT");
      return {
        success: true,
        status: "created_agreement",
        redirectUrl: agreement.vippsConfirmationUrl,
      };
    }
    const chargeId = await getOrderNumber(client);
    const vippsReference = getVippsReference(chargeId);
    const agreementRes = await createVippsAgreement(baseUrl, { year, vippsReference });
    if (!agreementRes.success) {
      await client.query("ROLLBACK");
      return { success: false };
    }
    const agreement = agreementRes.data;
    const agreementId = await saveCreatedAgreement(userId, agreement.agreementId, client);
    await saveCreatedCharge(chargeId, agreementId, year, vippsReference, client);
    await client.query("COMMIT");
    return {
      success: true,
      status: "created_agreement",
      redirectUrl: agreement.vippsConfirmationUrl,
    };
  } catch (e) {
    await client.query("ROLLBACK").catch(() => { });
    console.error(e);
    return { success: false };
  } finally {
    client.release();
  }
}

export async function stopAgreement(userId: number): Promise<boolean> {
  const client = await getClient();
  try {
    await client.query("BEGIN");
    const user = await getUserLock(userId, client);
    if (!user) {
      await client.query("ROLLBACK");
      return false;
    }
    const agreement = await getActiveAgreementByUserId(userId, client);
    if (!agreement) {
      await client.query("ROLLBACK");
      return true;
    }
    const stopSuccess = await apiStopAgreement(agreement.vippsReference);
    if (!stopSuccess) {
      await client.query("ROLLBACK");
      return false;
    }
    await setAgreementStopped(agreement.id, client);
    await setChargeCancelled(agreement.id, client);
    await client.query("COMMIT");
    return true;
  } catch (e) {
    await client.query("ROLLBACK").catch(() => { });
    console.error(e);
    return false;
  } finally {
    client.release();
  }
}

export async function createCharges(): Promise<boolean> {
  const chargeDate = getNextChargeDate();
  if (!chargeDate) {
    return true;
  }
  const eligbleUsers = await getUsersForChargeCreation();
  for (const user of eligbleUsers) {
    await createChargeDatabase(user.userId, chargeDate);
  }

  const usersWithNotCreatedCharges = await getUsersWithNotCreatedCharges();
  for (const user of usersWithNotCreatedCharges) {
    await createChargeVipps(user.userId)
  }
  return true;
}

function getNextChargeDate(): { year: number, due: string } | null {
  const month = getCurrentMonth();
  if (month !== 1 && month !== 12) {
    return null;
  }
  if (month === 1) {
    const tommorow = new Date(Date.now() + 1000 * 60 * 60 * 24);
    const due = toNorwayDateString(tommorow);
    const year = getCurrentYear();
    return {
      year,
      due,
    };
  }
  const year = getCurrentYear() + 1;
  const due = `${year}-01-01`;
  return {
    year,
    due,
  };
}

async function createChargeDatabase(userId: number, chargeDate: { year: number, due: string }) {
  const client = await getClient();
  try {
    const user = await getUserLock(userId, client);
    if (!user) {
      await client.query("ROLLBACK");
      return;
    }
    const agreement = await getActiveAgreementWithNoCreatedChargeByUserId(userId, client);
    if (!agreement) {
      await client.query("ROLLBACK");
      return;
    }
    const { agreementId } = agreement;
    const { year, due } = chargeDate;
    const chargeId = await getOrderNumber(client);
    const vippsReference = getVippsReference(chargeId);
    await addCharge(chargeId, agreementId, year, vippsReference, due, client);
    await client.query("COMMIT");
  } catch (e) {
    console.error(e);
    await client.query("ROLLBACK");
  } finally {
    client.release();
  }
}

async function createChargeVipps(userId: number): Promise<void> {
  const client = await getClient();
  try {
    const user = await getUserLock(userId, client);
    if (!user) {
      await client.query("ROLLBACK");
      return;
    }
    const chargeToBeCreated = await getChargeToBeCreated(userId, client);
    if (!chargeToBeCreated) {
      await client.query("ROLLBACK");
      return;
    }
    const { agreementRef, chargeRef, year, due, chargeId } = chargeToBeCreated;
    if (toNorwayDateString(new Date()) >= due) {
      const charge = await getCharge(agreementRef, chargeRef);

      if (charge.success) {
        await setChargeCreated(chargeId, client);
        await client.query("COMMIT")
        return;
      }

      if (charge.status === 404) {
        await setChargeCancelledBeforeCreation(chargeId, client);
        await client.query("COMMIT")
        return;
      }

      await client.query("ROLLBACK")
      return;
    }
    const createChargeSuccess = await createCharge(agreementRef, chargeRef, due, year);
    if (!createChargeSuccess) {
      await client.query("ROLLBACK");
      return;
    }
    await setChargeCreated(chargeId, client);
    await notifyOfPaymentDue(user, Math.floor(getMembershipCost() / 100).toString(), due);
    await client.query("COMMIT");
  } catch (e) {
    console.error(e);
    await client.query("ROLLBACK");
  } finally {
    client.release();
  }
}
