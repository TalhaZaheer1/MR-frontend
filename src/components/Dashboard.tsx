import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import {  getDashboardStats } from "../services/api";
import toast from "react-hot-toast";
import AdminBackupButton from "./AdminBackupButton";

interface StatGroup {
  [key: string]: number;
}

interface DashboardData {
  requestStatusStats?: StatGroup;
  quotationStats?: StatGroup;
  lowStockMaterials?: any[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardData>({});

  async function fetchData() {
    try {
      const stats = await getDashboardStats();
      setStats(stats);
    } catch (error: any) {
      console.log(error);
      toast.error(error.message || "Error fetching stats");
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const formatStatsToChartData = (data: StatGroup) => {
    return Object.entries(data).map(([key, value]) => ({
      name: key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase()),
      value,
    }));
  };

  const chartCards = Object.entries(stats)
    .filter(([key, val]) => typeof val === "object" && !Array.isArray(val) && key)
    .map(([title, statObj], index) => (
      <div
        key={index}
        className="p-4 rounded-2xl shadow-md bg-white w-full flex justify-center"
      >
        <h2 className="text-base sm:text-lg font-semibold mb-4 capitalize text-center">
          {title.replace(/([A-Z])/g, " $1")}
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={formatStatsToChartData(statObj as StatGroup)}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#3B82F6" radius={[10, 10, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    ));

  return (
    <div className="flex w-full p-6 flex-col sm:pl-[18rem]">
      <h1 className="text-xl sm:text-2xl font-bold mb-10">Dashboard</h1>
     <AdminBackupButton /> 
      <div className=" grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6 ">
        {/* Dashboard charts */}
        {chartCards.length > 0 ? chartCards : <p>Loading dashboard...</p>}

        {/* Low Stock Materials */}
        {stats.lowStockMaterials && stats.lowStockMaterials.length > 0 && (
          <div className="col-span-full bg-white p-6 rounded-2xl shadow-md">
            <h2 className="text-lg font-semibold mb-4">Low Stock Materials</h2>
            <ul className="space-y-3 max-h-96 overflow-y-auto pr-2">
              {stats.lowStockMaterials.map((mat, i) => (
                <li
                  key={i}
                  className="border border-red-200 rounded-lg p-4 hover:bg-red-50 transition"
                >
                  <p className="text-sm font-medium text-gray-900">
                    {mat.maximoId} - {mat.description}
                  </p>
                  <p className="text-sm text-gray-600">
                    Current: <strong>{mat.currentStock}</strong> | Threshold:{" "}
                    <strong>{mat.lowStockValue}</strong>
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
