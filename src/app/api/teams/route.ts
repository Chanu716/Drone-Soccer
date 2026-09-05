import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  try {
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
      return NextResponse.json({ error: error.message, teams: [] }, { status: 500 });
    }

    return NextResponse.json({ teams: teams || [], source: "supabase" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message, teams: [] }, { status: 500 });
  }
}
