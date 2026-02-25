"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SimpleAuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Logged in!");
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setMessage(error.message);
      } else {
        setMessage("Signed up! Please check your email to confirm.");
      }
    }
  };

  return (
    <div className="max-w-xs mx-auto mt-8 p-4 border rounded shadow">
      <h2 className="text-xl font-bold mb-4">{isLogin ? "Login" : "Sign Up"}</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="border p-2 rounded"
          required
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          {isLogin ? "Login" : "Sign Up"}
        </button>
      </form>
      <button
        className="mt-2 text-sm text-blue-600 underline"
        onClick={() => {
          setIsLogin(!isLogin);
          setMessage("");
        }}
      >
        {isLogin ? "Need an account? Sign Up" : "Already have an account? Login"}
      </button>
      {message && <div className="mt-4 text-green-600">{message}</div>}
    </div>
  );
}
