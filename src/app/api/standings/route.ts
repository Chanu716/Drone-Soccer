import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { SAMPLE_TEAMS } from "@/content/sample-data";

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ standings: SAMPLE_TEAMS.map(t => ({ ...t.stats, team_name: t.name, captain_name: t.captain })), source: "mock" });
    }

    const supabase = createAdminSupabaseClient();
    const { data: standings, error } = await supabase
      .from("standings")
      .select("*");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ standings, source: "supabase" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
