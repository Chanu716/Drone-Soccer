import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { SAMPLE_TEAMS } from "@/content/sample-data";

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ teams: SAMPLE_TEAMS, source: "mock" });
    }

    const supabase = createAdminSupabaseClient();
    const { data: teams, error } = await supabase
      .from("teams")
      .select(`
        id,
        name,
        slug,
        tagline,
        captain_name,
        captain_email,
        status,
        team_members (
          name,
          role,
          jersey_no
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ teams, source: "supabase" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
