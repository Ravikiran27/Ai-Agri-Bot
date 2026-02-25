"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getChatMessages } from "@/lib/chat-supabase";

interface HistoryItem {
  id: string;
  user_id: string;
  feature?: string;
  input?: string;
  output?: string;
  created_at: string;
  chat?: string[];
}

const FEATURES = [
  "auth",
  "crop-recommendation",
  "disease-prediction"
];

export default function HistoryPage() {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError("");
      const {
        data: { user },
        error: userError
      } = await supabase.auth.getUser();
      if (userError || !user) {
        setError("Not logged in");
        setLoading(false);
        return;
      }
      // Fetch feature history
      const { data: featureData, error: featureError } = await supabase
        .from("history")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      // Fetch chat history
      const { data: chatData, error: chatError } = await getChatMessages(user.id);
      let chatHistory: HistoryItem[] = [];
      if (chatData && chatData.length > 0) {
        chatHistory = chatData.map((chat: any) => {
          let chatArr: string[] = [];
          try {
            const parsed = JSON.parse(chat.message);
            if (Array.isArray(parsed)) {
              chatArr = parsed.map((msg: any) => `${msg.role}: ${msg.content}`);
            }
          } catch {}
          return {
            id: chat.id,
            user_id: chat.user_id,
            created_at: chat.created_at,
            chat: chatArr,
          };
        });
      }
      let allHistory = [];
      if (featureData) allHistory = [...featureData];
      if (chatHistory.length > 0) allHistory = [...allHistory, ...chatHistory];
      allHistory.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      if (featureError || chatError) setError(featureError?.message || chatError?.message || "");
      setHistory(allHistory);
      setLoading(false);
    };
    fetchHistory();
  }, []);

  return (
    <div className="max-w-2xl mx-auto mt-8 p-4">
      <h1 className="text-2xl font-bold mb-4">History</h1>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      <table className="w-full border">
        <thead>
          <tr>
            <th className="border p-2">Type</th>
            <th className="border p-2">Details</th>
            <th className="border p-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {history.map(item => (
            <tr key={item.id}>
              <td className="border p-2">{item.feature ? item.feature : 'chat'}</td>
              <td className="border p-2">
                {item.feature ? (
                  <>
                    <div><b>Input:</b> {item.input}</div>
                    <div><b>Output:</b> {item.output}</div>
                  </>
                ) : (
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {item.chat && item.chat.map((msg, i) => {
                      // Parse role and content
                      const [role, ...rest] = msg.split(": ");
                      const content = rest.join(": ");
                      const isUser = role === 'user';
                      return (
                        <div key={i} className={`flex items-start gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
                          {!isUser && (
                            <span className="inline-block rounded-full bg-gray-200 p-1 text-xs font-bold">🤖</span>
                          )}
                          <span className={`inline-block rounded-lg px-3 py-2 text-sm ${isUser ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>{content}</span>
                          {isUser && (
                            <span className="inline-block rounded-full bg-blue-500 text-white p-1 text-xs font-bold">🧑</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </td>
              <td className="border p-2">{new Date(item.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!loading && history.length === 0 && <div>No history found.</div>}
    </div>
  );
}
