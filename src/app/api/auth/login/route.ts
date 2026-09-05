import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createAdminSupabaseClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Authenticate with Supabase Auth
    const supabase = await createServerSupabaseClient();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || "Invalid email or password." },
        { status: 401 }
      );
    }

    const user = authData.user;

    // 2. Check if Admin
    if (isAdminEmail(cleanEmail)) {
      return NextResponse.json({
        success: true,
        role: "admin",
        destination: "/admin/registrations",
        user: {
          id: user.id,
          email: user.email,
        },
      });
    }

    // 3. Check if Team Captain
    const adminSupabase = createAdminSupabaseClient();
    const { data: team } = await (adminSupabase.from("teams") as any)
      .select("id, name, slug, captain_name, status")
      .or(`captain_email.ilike.${cleanEmail},captain_id.eq.${user.id}`)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    return NextResponse.json({
      success: true,
      role: team ? "captain" : "player",
      destination: "/dashboard",
      team: team || null,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
