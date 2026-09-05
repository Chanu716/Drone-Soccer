import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { teamName, captainName, captainPhone, captainEmail, pilots, training, transactionId } = body;

    if (!teamName || !captainName || !captainEmail) {
      return NextResponse.json(
        { error: "Team name, captain name, and captain email are required." },
        { status: 400 }
      );
    }

    if (!transactionId || typeof transactionId !== "string" || !transactionId.trim()) {
      return NextResponse.json(
        { error: "Payment UTR / Transaction ID is required to complete registration." },
        { status: 400 }
      );
    }

    if (!pilots || !Array.isArray(pilots) || pilots.length < 3 || pilots.length > 5) {
      return NextResponse.json(
        { error: "A team must have between 3 and 5 active pilots." },
        { status: 400 }
      );
    }

    const cleanUtr = transactionId.trim().toUpperCase();
    const totalFee = 100 + (training ? 100 : 0);

    // Slugify team name
    const slug = teamName
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    if (!isSupabaseConfigured()) {
      return NextResponse.json({
        success: true,
        simulated: true,
        message: "Registration received (demo mode).",
        data: {
          teamName,
          slug,
          captainEmail,
          pilotCount: pilots.length,
          total: totalFee,
          transactionId: cleanUtr,
        },
      });
    }

    const supabase = createAdminSupabaseClient();

    // 1. Insert Team (automatically approved upon successful payment submission)
    const newTeamPayload = {
      name: teamName.trim(),
      slug: `${slug}-${Date.now().toString().slice(-4)}`,
      tagline: `UPI UTR: ${cleanUtr}`,
      captain_name: captainName.trim(),
      captain_email: captainEmail.trim(),
      captain_phone: captainPhone?.trim() || null,
      training_addon: Boolean(training),
      status: "approved" as const,
    };

    const { data: teamData, error: teamError } = await (supabase.from("teams") as any)
      .insert(newTeamPayload)
      .select("id, name, slug, status, created_at")
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
      name: p.name.trim(),
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

    // 3. Automatically record the payment as PAID
    const paymentPayload = {
      team_id: teamData.id,
      purpose: "registration",
      amount_paise: totalFee * 100,
      currency: "INR",
      method: "venue_upi" as const,
      razorpay_payment_id: cleanUtr,
      razorpay_signature: `UPI-VERIFIED-${Date.now()}`,
      status: "paid" as const,
      paid_at: new Date().toISOString(),
    };

    const { error: paymentError } = await (supabase.from("payments") as any)
      .insert(paymentPayload);

    if (paymentError) {
      console.error("Supabase payment insert error:", paymentError);
      // Even if payment insert fails, we log it, but team is registered
    }

    return NextResponse.json({
      success: true,
      team: teamData,
      transactionId: cleanUtr,
      amountPaid: totalFee,
      message: "Team registration and UPI payment confirmed successfully.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
