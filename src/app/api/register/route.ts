import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { teamName, captainName, captainPhone, captainEmail, pilots, training } = body;

    if (!teamName || !captainName || !captainEmail) {
      return NextResponse.json(
        { error: "Team name, captain name, and captain email are required." },
        { status: 400 }
      );
    }

    if (!pilots || !Array.isArray(pilots) || pilots.length < 3 || pilots.length > 5) {
      return NextResponse.json(
        { error: "A team must have between 3 and 5 active pilots." },
        { status: 400 }
      );
    }

    // Slugify team name
    const slug = teamName
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // If Supabase is not yet configured, return a simulated success response
    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: true,
        simulated: true,
        message: "Registration received (demo mode). Configure Supabase credentials to persist to database.",
        data: {
          teamName,
          slug,
          captainEmail,
          pilotCount: pilots.length,
          total: 100 + (training ? 100 : 0),
        },
      });
    }

    const supabase = createAdminSupabaseClient();

    // 1. Insert Team
    const newTeamPayload = {
      name: teamName,
      slug: `${slug}-${Date.now().toString().slice(-4)}`,
      captain_name: captainName,
      captain_email: captainEmail,
      captain_phone: captainPhone || null,
      training_addon: Boolean(training),
      status: "pending" as const,
    };

    const { data: teamData, error: teamError } = await (supabase.from("teams") as any)
      .insert(newTeamPayload)
      .select("id, name, slug")
      .single();

    if (teamError || !teamData) {
      console.error("Supabase team insert error:", teamError);
      return NextResponse.json(
        { error: `Database error: ${teamError?.message || "Failed to create team"}` },
        { status: 500 }
      );
    }

    // 2. Insert Pilots into team_members
    const membersToInsert = pilots.map((p: { name: string; role?: string }, idx: number) => ({
      team_id: teamData.id,
      name: p.name,
      role: (p.role === "Striker" ? "Striker" : p.role === "Keeper" ? "Keeper" : "Defender") as "Striker" | "Defender" | "Keeper",
      jersey_no: idx + 1,
    }));

    const { error: membersError } = await (supabase.from("team_members") as any)
      .insert(membersToInsert);

    if (membersError) {
      console.error("Supabase members insert error:", membersError);
      return NextResponse.json(
        { error: `Database error inserting pilots: ${membersError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      team: teamData,
      message: "Team and pilots registered successfully in Supabase.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
