// Utility to insert and fetch chat messages from Supabase
import { supabase } from "@/lib/supabase";

export interface ChatMessage {
  id?: string;
  user_id: string;
  message: string;
  created_at?: string;
}

export async function addChatMessage({ user_id, message }: { user_id: string; message: string }) {
  const { data, error } = await supabase.from("chats").insert([{ user_id, message }]);
  return { data, error };
}

export async function getChatMessages(user_id: string) {
  const { data, error } = await supabase
    .from("chats")
    .select("*")
    .eq("user_id", user_id)
    .order("created_at", { ascending: true });
  return { data, error };
}
