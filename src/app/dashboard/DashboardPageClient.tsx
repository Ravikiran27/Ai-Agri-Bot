"use client";

import dynamic from "next/dynamic";

const Dashboard = dynamic(() => import("@/components/Dashboard"), { ssr: false });
const HistoryList = dynamic(() => import("@/components/HistoryList"), { ssr: false });

export default function DashboardPageClient() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Dashboard />
      <HistoryList />
    </div>
  );
}
