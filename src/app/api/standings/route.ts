import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createAdminSupabaseClient();
    const { data: standings, error } = await supabase
      .from("standings")
      .select("*");

    if (error) {
      return NextResponse.json({ error: error.message, standings: [] }, { status: 500 });
    }

    return NextResponse.json({ standings: standings || [], source: "supabase" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message, standings: [] }, { status: 500 });
  }
}
