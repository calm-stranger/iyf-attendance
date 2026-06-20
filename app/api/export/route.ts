import { createClient } from "@/lib/supabase/server";
import { NextRequest } from "next/server";

function escapeCsv(value: string | null | undefined) {
  if (!value) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(request: NextRequest) {
  const dateStr = request.nextUrl.searchParams.get("date");
  if (!dateStr) {
    return new Response("Missing date", { status: 400 });
  }

  const supabase = await createClient();

  const { data: session } = await supabase
    .from("sessions")
    .select("id")
    .eq("session_date", dateStr)
    .single();

  if (!session) {
    return new Response("Session not found", { status: 404 });
  }

  const { data: attendance } = await supabase
    .from("attendance")
    .select("marked_at, students(name, dob, address, occupation)")
    .eq("session_id", session.id)
    .order("marked_at", { ascending: true });

  const header = [
    "Name",
    "Date of Birth",
    "Address",
    "Occupation",
    "Marked Present At",
  ];
  const rows = (attendance || []).map((a: any) =>
    [
      escapeCsv(a.students?.name),
      escapeCsv(a.students?.dob),
      escapeCsv(a.students?.address),
      escapeCsv(a.students?.occupation),
      escapeCsv(new Date(a.marked_at).toLocaleString("en-IN")),
    ].join(","),
  );

  const csv = [header.join(","), ...rows].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="iyf-attendance-${dateStr}.csv"`,
    },
  });
}
