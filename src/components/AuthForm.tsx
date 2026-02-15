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

  const handleSignOut = async () => {
    await signOut(auth);
    setUser(null);
  };

  return (
    <div className="max-w-sm mx-auto mt-10 p-6 bg-card rounded shadow">
      {user ? (
        <div>
          <p className="mb-4">Signed in as {user.email}</p>
          <button className="btn btn-primary" onClick={handleSignOut}>Sign Out</button>
        </div>
      ) : (
        <form onSubmit={handleAuth} className="space-y-4">
          <h2 className="text-xl font-bold mb-2">{mode === "signup" ? "Sign Up" : "Sign In"}</h2>
          <input
            className="w-full p-2 border rounded"
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            className="w-full p-2 border rounded"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-red-500">{error}</p>}
          <button className="btn btn-primary w-full" type="submit">
            {mode === "signup" ? "Sign Up" : "Sign In"}
          </button>
          <button
            type="button"
            className="text-sm underline mt-2"
            onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
          >
            {mode === "signup" ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
          </button>
        </form>
      )}
    </div>
  );
}
