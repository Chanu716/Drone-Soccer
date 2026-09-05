import { NextResponse } from "next/server";
import { createServerSupabaseClient, createAdminSupabaseClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/auth";

export async function GET() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    const email = user.email || "";
    const isAdmin = isAdminEmail(email);

    let team = null;
    let standings = null;

    // Fetch team info for captain
    const adminSupabase = createAdminSupabaseClient();
    const { data: teamData } = await (adminSupabase.from("teams") as any)
      .select(`
        id,
        name,
        slug,
        tagline,
        captain_name,
        captain_email,
        captain_phone,
        training_addon,
        status,
        created_at,
        team_members (
          id,
          name,
          role,
          jersey_no
        ),
        payments (
          id,
          amount_paise,
          status,
          method,
          razorpay_payment_id,
          paid_at
        )
      `)
      .or(`captain_email.ilike.${email},captain_id.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (teamData) {
      team = teamData;
      // Fetch standings for this team
      const { data: standingData } = await (adminSupabase.from("standings") as any)
        .select("*")
        .eq("team_id", teamData.id)
        .maybeSingle();
      standings = standingData || null;
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || team?.captain_name || email.split("@")[0],
      },
      role: isAdmin ? "admin" : team ? "captain" : "user",
      isAdmin,
      team,
      standings,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
