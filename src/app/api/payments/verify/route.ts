import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { verifyRazorpaySignature } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, paymentId, signature, teamId } = body;

    if (!orderId || !paymentId || !teamId) {
      return NextResponse.json(
        { error: "orderId, paymentId, and teamId are required for verification." },
        { status: 400 }
      );
    }

    // 1. Verify cryptographic HMAC signature
    const isValid = verifyRazorpaySignature(orderId, paymentId, signature || "");
    if (!isValid) {
      // Mark payment failed in database
      const supabase = createAdminSupabaseClient();
      await (supabase.from("payments") as any)
        .update({
          status: "failed",
          razorpay_payment_id: paymentId,
          razorpay_signature: signature || null,
        })
        .eq("razorpay_order_id", orderId);

      return NextResponse.json(
        { error: "Invalid payment signature. Verification failed." },
        { status: 400 }
      );
    }

    const supabase = createAdminSupabaseClient();
    const nowIso = new Date().toISOString();

    // 2. Update Payment record to 'paid'
    const { data: updatedPayment, error: paymentUpdateError } = await (supabase.from("payments") as any)
      .update({
        status: "paid",
        razorpay_payment_id: paymentId,
        razorpay_signature: signature || `auto_verified_${nowIso}`,
        paid_at: nowIso,
      })
      .or(`razorpay_order_id.eq.${orderId},team_id.eq.${teamId}`)
      .select()
      .order("created_at", { ascending: false })
      .limit(1);

    if (paymentUpdateError) {
      console.warn("Payment update warning:", paymentUpdateError);
      // If order row didn't exist yet, insert a paid record directly
      await (supabase.from("payments") as any).insert({
        team_id: teamId,
        purpose: "registration",
        amount_paise: 10000,
        currency: "INR",
        method: "razorpay",
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
        status: "paid",
        paid_at: nowIso,
      });
    }

    // 3. AUTOMATIC APPROVAL: Update Team status to 'approved'
    const { data: teamData, error: teamUpdateError } = await (supabase.from("teams") as any)
      .update({
        status: "approved",
      })
      .eq("id", teamId)
      .select("id, name, slug, status, captain_name, captain_email")
      .single();

    if (teamUpdateError) {
      console.error("Team auto-approval error:", teamUpdateError);
      return NextResponse.json(
        { error: `Payment verified but failed to update team status: ${teamUpdateError.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Payment successfully verified via Razorpay. Team registration accepted and approved automatically!",
      team: teamData,
      payment: {
        orderId,
        paymentId,
        status: "paid",
        verifiedAt: nowIso,
        verifiedBy: "Razorpay Automated Signature Verification",
      },
    });
  } catch (err: unknown) {
    console.error("Payment verification route error:", err);
    const message = err instanceof Error ? err.message : "Payment verification failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
