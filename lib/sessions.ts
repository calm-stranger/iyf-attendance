import { createClient } from "@/lib/supabase/server";

export async function getOrCreateSession(dateStr: string) {
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("sessions")
    .select("*")
    .eq("session_date", dateStr)
    .single();

  if (existing) return existing;

  const { data: created, error } = await supabase
    .from("sessions")
    .insert({ session_date: dateStr })
    .select()
    .single();

  if (error) throw error;
  return created;
}

export function todayStr() {
  const d = new Date();
  return d.toISOString().split("T")[0]; // YYYY-MM-DD
}
