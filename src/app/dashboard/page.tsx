import dynamic from "next/dynamic";

const Dashboard = dynamic(() => import("@/components/Dashboard"), { ssr: false });
const HistoryList = dynamic(() => import("@/components/HistoryList"), { ssr: false });

export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center flex-col">
      <Dashboard />
      <div className="w-full max-w-lg">
        <HistoryList type="crop-recommendation" />
        <HistoryList type="disease-prediction" />
      </div>
    </main>
  );
}
