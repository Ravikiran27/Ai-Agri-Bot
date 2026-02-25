"use client";

import dynamic from "next/dynamic";

import SimpleAuthForm from "@/components/SimpleAuthForm";

const AuthForm = dynamic(() => import("@/components/AuthForm"), { ssr: false });
const HistoryList = dynamic(() => import("@/components/HistoryList"), { ssr: false });

export default function AuthPageClient() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <SimpleAuthForm />
      <AuthForm />
      <HistoryList />
    </div>
  );
}
