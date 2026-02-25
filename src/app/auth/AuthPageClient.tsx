"use client";

import dynamic from "next/dynamic";

const AuthForm = dynamic(() => import("@/components/AuthForm"), { ssr: false });
const HistoryList = dynamic(() => import("@/components/HistoryList"), { ssr: false });

export default function AuthPageClient() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <AuthForm />
      <HistoryList />
    </div>
  );
}
