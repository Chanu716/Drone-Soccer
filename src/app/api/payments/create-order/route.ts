import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { createRazorpayOrder, getRazorpayKeyId } from "@/lib/razorpay";

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

    // 1. Calculate amount server-side (Never trust client amount)
    const baseFeePaise = 10000; // ₹100
    const trainingFeePaise = training ? 10000 : 0; // +₹100
    const totalAmountPaise = baseFeePaise + trainingFeePaise;

    // 2. Slugify team name
    const slugBase = teamName
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const slug = `${slugBase}-${Date.now().toString().slice(-4)}`;

    const supabase = createAdminSupabaseClient();

    // 3. Insert Team in 'pending' status
    const newTeamPayload = {
      name: teamName,
      slug,
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

    // 4. Insert Pilot Roster
    const membersToInsert = pilots.map((p: { name: string; role?: string }, idx: number) => ({
      team_id: teamData.id,
      name: p.name,
      role: (p.role === "Striker" ? "Striker" : p.role === "Keeper" ? "Keeper" : "Defender") as "Striker" | "Defender" | "Keeper",
      jersey_no: idx + 1,
    }));

    const { error: membersError } = await (supabase.from("team_members") as any)
      .insert(membersToInsert);

    if (membersError) {
      console.error("Supabase pilots insert error:", membersError);
    }

    // 5. Create Razorpay Order
    const receipt = `rcpt_${teamData.id.slice(0, 8)}_${Date.now()}`;
    const order = await createRazorpayOrder({
      amountPaise: totalAmountPaise,
      currency: "INR",
      receipt,
      notes: {
        team_id: teamData.id,
        team_name: teamData.name,
        captain_email: captainEmail,
        training_included: String(Boolean(training)),
      },
    });

    // 6. Record Initial Payment in 'created' status
    const paymentRecord = {
      team_id: teamData.id,
      purpose: "registration" as const,
      amount_paise: totalAmountPaise,
      currency: "INR",
      method: "razorpay" as const,
      razorpay_order_id: order.id,
      status: "created" as const,
    };

    const { error: paymentError } = await (supabase.from("payments") as any)
      .insert(paymentRecord);

    if (paymentError) {
      console.warn("Supabase initial payment record warning:", paymentError);
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: getRazorpayKeyId(),
      teamId: teamData.id,
      teamName: teamData.name,
      isSimulated: order.isSimulated || false,
    });
  } catch (err: unknown) {
    console.error("Create order handler error:", err);
    const message = err instanceof Error ? err.message : "Failed to create payment order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
