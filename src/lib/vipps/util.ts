if (!process.env.VIPPS_REF) throw new Error("VIPPS_REF is missing");
const VIPPS_REF = process.env.VIPPS_REF;
const MEMBERSHIP_COST = 100_00; // 100_00 = 100.00kr

export function getVippsReference(id: number) {
  return `${VIPPS_REF}-${id}`;
}

export function getMembershipCost(): number {
  return MEMBERSHIP_COST;
}

export function getMembershipCostRoundedString(): string {
  return Math.floor(getMembershipCost() / 100).toString();
}
