"use client";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, User } from "firebase/auth";
import { useEffect } from "react";

async function logAuthHistory(uid: string, mode: string, email: string) {
  await fetch("/api/history", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      uid,
      type: "auth",
      data: { mode, email },
    }),
  });
}

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("signin");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (mode === "signup") {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        setUser(userCredential.user);
        await logAuthHistory(userCredential.user.uid, "signup", email);
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        setUser(userCredential.user);
        await logAuthHistory(userCredential.user.uid, "signin", email);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Removed old Firebase AuthForm component. Supabase is now the only auth system.
    await signOut(auth);
