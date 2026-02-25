"use client";
import { useState } from "react";
import { auth } from "@/lib/firebase";
import { saveUserData, getUserData } from "@/lib/user-db";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState("");
  const [mode, setMode] = useState("signin");

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      if (mode === "signup") {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        setUser(userCredential.user);
        await saveUserData(userCredential.user.uid, { email });
      } else {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        setUser(userCredential.user);
        const data = await getUserData(userCredential.user.uid);
        setProfile(data);
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleSignOut = async () => {
    await signOut(auth);
    setUser(null);
    setProfile(null);
  };

  return (
    <div className="max-w-sm mx-auto mt-10 p-6 bg-card rounded shadow">
      {user ? (
        <div>
          <p className="mb-2">Signed in as {user.email}</p>
          <p className="mb-4">Profile: {profile ? JSON.stringify(profile) : "No profile data"}</p>
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
            // Removed old Firebase Dashboard component. Supabase is now the only auth system.
            onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
