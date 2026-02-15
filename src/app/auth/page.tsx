import dynamic from "next/dynamic";

const AuthForm = dynamic(() => import("@/components/AuthForm"), { ssr: false });
const HistoryList = dynamic(() => import("@/components/HistoryList"), { ssr: false });

export default function Page() {
  return (
    <main className="flex min-h-screen items-center justify-center flex-col">
      <AuthForm />
      <HistoryList type="auth" />
    </main>
  );
}
