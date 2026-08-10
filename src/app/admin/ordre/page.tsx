import OrderOverview from "@/components/admin/order-overview";
import BackArrow from "@/components/ui/back-arrow";
import Title from "@/components/ui/title";
import { getAuth } from "@/lib/auth";
import { getAllOrders } from "@/lib/vipps";
import { redirect } from "next/navigation";

export default async function OrderOverviewPage() {
  const { permissions } = await getAuth();
  if (!permissions || !permissions.includes("order_overview")) {
    redirect("/admin");
  }
  const orders = await getAllOrders();

  return (
    <div className="flex flex-col px-4 sm:px-8 gap-8 text-center w-full max-w-5xl">
      <div className="flex flex-col gap-2">
        <BackArrow href="/admin" />
        <Title>Ordreoversikt</Title>
      </div>
      <OrderOverview
        orders={orders}
      />
    </div>
  );
}
