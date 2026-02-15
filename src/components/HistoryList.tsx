"use client";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";

async function fetchHistory(type: string, uid: string) {
  const res = await fetch(`/api/history?uid=${uid}&type=${type}`);
  const data = await res.json();
  return data.history || [];
}

export default function HistoryList({ type }: { type: string }) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      setUser(u);
      if (u) {
        setLoading(true);
        const h = await fetchHistory(type, u.uid);
        setHistory(h);
        setLoading(false);
      }
    });
    return () => unsub();
  }, [type]);

  if (!user) return <div>Please sign in to view history.</div>;
  if (loading) return <div>Loading history...</div>;
  if (!history.length) return <div>No history found.</div>;

  return (
    <div className="mt-4">
      <h3 className="font-bold mb-2">{type.replace(/-/g, ' ').toUpperCase()} HISTORY</h3>
      <ul className="space-y-2">
        {history.map((item) => (
          <li key={item.id} className="p-2 border rounded bg-muted">
            <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(item, null, 2)}</pre>
          </li>
        ))}
      </ul>
    </div>
  );
}
