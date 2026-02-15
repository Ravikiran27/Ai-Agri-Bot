import { getDatabase, ref, set, get, child } from "firebase/database";
import { app } from "@/lib/firebase";

export async function saveUserData(uid: string, data: any) {
  const db = getDatabase(app);
  await set(ref(db, `users/${uid}`), data);
}

export async function getUserData(uid: string) {
  const db = getDatabase(app);
  const snapshot = await get(child(ref(db), `users/${uid}`));
  return snapshot.exists() ? snapshot.val() : null;
}
