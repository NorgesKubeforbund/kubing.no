"use client";
import { Order } from "@/types";
import { Fragment, useMemo, useState } from "react";

const PAGE_SIZE = 25;

type OrderStatus = "CREATED" | "CANCELLED" | "COMPLETED";

export default function OrderOverview({ orders }: { orders: Order[] }) {
  const [page, setPage] = useState<number>(1);
  const [orderFilter, setOrderFilter] = useState<OrderStatus | "ALL">("ALL");
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  const filteredOrders = useMemo(() => {
    return orders.filter(order => orderFilter === "ALL" || order.status === orderFilter);
  }, [orders, orderFilter]);

  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredOrders.slice(start, start + PAGE_SIZE);
  }, [filteredOrders, page]);

  const pageCount = Math.max(1, Math.ceil(filteredOrders.length / PAGE_SIZE));

  function toggleExpanded(id: number) {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  return (
    <div className="flex flex-col gap-4">

      <select
        onChange={e => {
          setOrderFilter(e.target.value as OrderStatus);
          setPage(1);
        }}
        className="self-center bg-neutral-100 cursor-pointer disabled:cursor-not-allowed disabled:hover:bg-neutral-100 disabled:text-neutral-400 border rounded-md px-2 py-1 w-fit justify-self-center sm:justify-self-start"
      >
        <option value="ALL">
          Vis alle
        </option>
        <option value="COMPLETED">
          Betalt
        </option>
        <option value="CREATED">
          Laget
        </option>
        <option value="CANCELLED">
          Kansellert
        </option>
      </select>
      <table>
        <thead>
          <tr>
            <th>Ordrenummer</th>
            <th>Navn</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {paginatedOrders.map((order, index) => {
            const isExpanded = expandedIds.has(order.id);
            return (
              <Fragment key={order.id}>
                <tr
                  onClick={() => toggleExpanded(order.id)}
                  className={`cursor-pointer hover:bg-neutral-400 ${index % 2 === 0 ? "bg-neutral-300" : "bg-neutral-200"}`}
                >
                  <td>{order.id}</td>
                  <td>{order.userName}</td>
                  <td>{translateStatus(order.status)}</td>
                </tr>
                {isExpanded && (
                  <tr className="bg-neutral-100">
                    <td colSpan={3} className="p-0">
                      <table className="w-full text-left text-sm">
                        <tbody>
                          <tr>
                            <td>NKF ID</td>
                            <td>{order.userId}</td>
                          </tr>
                          <tr className="border-t border-neutral-300">
                            <td>E-post</td>
                            <td>{order.email}</td>
                          </tr>
                          <tr className="border-t border-neutral-300">
                            <td>Vipps-referanse</td>
                            <td>{order.vippsReference}</td>
                          </tr>
                          <tr className="border-t border-neutral-300">
                            <td>Medlemsår</td>
                            <td>{order.year}</td>
                          </tr>
                          <tr className="border-t border-neutral-300">
                            <td>Opprettet</td>
                            <td>{new Date(order.createdAt).toLocaleString("nb-NO", { dateStyle: "full", timeStyle: "medium" })}</td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
      {pageCount > 1 &&
        <div className="flex items-center gap-6 self-center mt-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="bg-neutral-100 hover:bg-neutral-400 cursor-pointer disabled:cursor-not-allowed disabled:hover:bg-neutral-100 disabled:text-neutral-400 border rounded-md px-2 py-1"
          >
            Forrige
          </button>
          <span className="text-sm">
            Side {page} av {pageCount}
          </span>
          <button
            onClick={() => setPage(p => Math.min(pageCount, p + 1))}
            disabled={page === pageCount}
            className="bg-neutral-100 hover:bg-neutral-400 cursor-pointer disabled:cursor-not-allowed disabled:hover:bg-neutral-100 disabled:text-neutral-400 border rounded-md px-2 py-1"
          >
            Neste
          </button>
        </div>
      }
    </div>
  );
}

function translateStatus(status: string) {
  switch (status) {
    case "CREATED":
      return "Laget";
    case "COMPLETED":
      return "Betalt";
    case "CANCELLED":
      return "Kansellert";
    default:
      return status;
  }
}
