// Utility to insert a history record into Supabase
import { supabase } from "@/lib/supabase";

export async function addHistory({ user_id, feature, input, output }: {
  user_id: string;
  feature: string;
  input: string;
  output: string;
}) {
  const { data, error } = await supabase.from("history").insert([
    { user_id, feature, input, output }
  ]);
  return { data, error };
}
