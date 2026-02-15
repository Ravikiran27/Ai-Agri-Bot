import { getDatabase, ref, push, get, query, orderByChild, equalTo } from "firebase/database";
import { app } from "@/lib/firebase";

export async function addHistory(uid: string, type: string, data: any) {
  const db = getDatabase(app);
  const historyRef = ref(db, `history/${uid}/${type}`);
  await push(historyRef, {
    ...data,
    timestamp: Date.now(),
  });
}

export async function getHistory(uid: string, type: string) {
  const db = getDatabase(app);
  const historyRef = ref(db, `history/${uid}/${type}`);
  const snapshot = await get(historyRef);
  if (!snapshot.exists()) return [];
  const val = snapshot.val();
  return Object.entries(val).map(([id, entry]) => ({ id, ...entry }));
}
