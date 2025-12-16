
import React, { useEffect, useState } from "react";
import client from "../Services/clientServices";
import { FiBox, FiLayers, FiUsers, FiShoppingCart, FiTrendingUp } from "react-icons/fi";


type Metric = {
  label: string;
  value: string | number;
  icon: React.ReactNode;
};

type MonthlySale = {
  month: string;
  total: number;
};


const Home = () => {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [monthlySales, setMonthlySales] = useState<MonthlySale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [productsRes, sellersRes, ordersRes] =
          await Promise.allSettled([
            client.get("/products?limit=999"),
            client.get("/sellers?limit=999"),
            client.get("/orders?limit=999"),
          ]);


        const products =
          productsRes.status === "fulfilled"
            ? productsRes.value.data?.data || []
            : [];

        const sellers =
          sellersRes.status === "fulfilled"
            ? sellersRes.value.data?.data || []
            : [];

        const orders =
          ordersRes.status === "fulfilled"
            ? ordersRes.value.data?.data || []
            : [];

        const variantCount = products.reduce(
          (s: number, p: any) => s + (p.variants?.length || 0),
          0
        );

        const stockValue = products.reduce(
          (sum: number, p: any) =>
            sum +
            (p.variants || []).reduce(
              (vSum: number, v: any) =>
                vSum + Number(v.price || 0) * Number(v.stockInHand || 0),
              0
            ),
          0
        );

        const salesMap: Record<string, number> = {};
        orders.forEach((o: any) => {
          const d = new Date(o.createdAt);
          const key = d.toLocaleString("default", {
            month: "short",
            year: "numeric",
          });
          salesMap[key] =
            (salesMap[key] || 0) + Number(o.grandTotal || 0);
        });

        setMonthlySales(
          Object.entries(salesMap)
            .slice(-6)
            .map(([month, total]) => ({ month, total }))
        );

        setMetrics([
          { label: "Products", value: products.length, icon: <FiBox /> },
          { label: "Variants", value: variantCount, icon: <FiLayers /> },
          { label: "Sellers", value: sellers.length, icon: <FiUsers /> },
          { label: "Orders", value: orders.length, icon: <FiShoppingCart /> },
          {
            label: "Stock Value",
            value: `₹ ${stockValue.toLocaleString()}`,
            icon: <FiTrendingUp />,
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="space-y-10">
      {/* ================= HEADER ================= */}
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-wide">
          Command Center
        </h1>
        <p className="text-slate-500 text-sm">
          Real-time inventory & sales intelligence
        </p>
      </div>

      {/* ================= METRICS GRID ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {metrics.map((m) => (
          <MetricBlock key={m.label} {...m} loading={loading} />
        ))}
      </div>

      {/* ================= SALES GRAPH ================= */}
      <div className="bg-[#071022] border border-[#0e1724] rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-slate-100">
            Monthly Sales
          </h2>
          <span className="text-xs text-slate-400">
            Last 6 months
          </span>
        </div>

        {monthlySales.length === 0 ? (
          <div className="text-slate-500 text-sm">
            No sales data available
          </div>
        ) : (
          <div className="flex items-end gap-4 h-44">
            {monthlySales.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center">
                <div
                  className="w-full rounded-t bg-linear-to-t from-amber-500 to-amber-300"
                  style={{
                    height: `${Math.max(
                      12,
                      (m.total /
                        Math.max(...monthlySales.map((x) => x.total))) *
                        100
                    )}%`,
                  }}
                />
                <div className="mt-2 text-xs text-slate-400">
                  {m.month}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


// MetricBlock component
const MetricBlock = ({ label, value, icon, loading }: Metric & { loading: boolean }) => (
  <div className="bg-[#071022] border border-[#0e1724] rounded-xl p-5 relative overflow-hidden">
    <div className="absolute inset-0 bg-linear-to-br from-white/5 to-transparent pointer-events-none" />
    <div className="flex justify-between items-center">
      <div>
        <div className="text-xs uppercase tracking-widest text-slate-400">{label}</div>
        <div className="text-2xl font-semibold text-slate-100 mt-1">{loading ? "—" : value}</div>
      </div>
      <div className="text-amber-400 text-2xl">{icon}</div>
    </div>
  </div>
);


export default Home;
