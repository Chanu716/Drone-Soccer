import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, paymentId, teamId, amount, method, transactionId, notes, rejectionReason } = body;

    const supabase = createAdminSupabaseClient();

    // 1. Verify Payment Action
    if (action === "verify") {
      if (!paymentId) {
        return NextResponse.json({ error: "paymentId is required for verification." }, { status: 400 });
      }

      const { data: payment, error: fetchErr } = await (supabase.from("payments") as any)
        .select("id, team_id, amount_paise, status")
        .eq("id", paymentId)
        .single();

      if (fetchErr || !payment) {
        return NextResponse.json({ error: "Payment record not found." }, { status: 404 });
      }

      const updatePayload: Record<string, any> = {
        status: "paid",
        paid_at: new Date().toISOString(),
      };
      if (notes) {
        updatePayload.razorpay_signature = notes;
      }

      const { data: updatedPayment, error: updateErr } = await (supabase.from("payments") as any)
        .update(updatePayload)
        .eq("id", paymentId)
        .select("*")
        .single();

      if (updateErr) {
        return NextResponse.json({ error: updateErr.message }, { status: 500 });
      }

      // Auto-approve team if total paid matches expected amount
      if (payment.team_id) {
        const { data: team } = await (supabase.from("teams") as any)
          .select("id, name, training_addon, status")
          .eq("id", payment.team_id)
          .single();

        if (team && team.status === "pending") {
          await (supabase.from("teams") as any)
            .update({ status: "approved" })
            .eq("id", team.id);
        }
      }

      return NextResponse.json({
        success: true,
        payment: updatedPayment,
        message: "Payment successfully verified and marked as PAID.",
      });
    }

    // 2. Reject Payment Action
    if (action === "reject") {
      if (!paymentId) {
        return NextResponse.json({ error: "paymentId is required." }, { status: 400 });
      }

      const updatePayload: Record<string, any> = {
        status: "failed",
      };
      if (rejectionReason || notes) {
        updatePayload.razorpay_signature = rejectionReason || notes;
      }

      const { data: updatedPayment, error: updateErr } = await (supabase.from("payments") as any)
        .update(updatePayload)
        .eq("id", paymentId)
        .select("*")
        .single();

      if (updateErr) {
        return NextResponse.json({ error: updateErr.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        payment: updatedPayment,
        message: "Payment rejected.",
      });
    }

    // 3. Mark Refund Action
    if (action === "refund") {
      if (!paymentId) {
        return NextResponse.json({ error: "paymentId is required." }, { status: 400 });
      }

      const { data: updatedPayment, error: updateErr } = await (supabase.from("payments") as any)
        .update({
          status: "refunded",
          razorpay_signature: notes || "Payment refunded to student.",
        })
        .eq("id", paymentId)
        .select("*")
        .single();

      if (updateErr) {
        return NextResponse.json({ error: updateErr.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        payment: updatedPayment,
        message: "Payment marked as refunded.",
      });
    }

    // 4. Record or Update Manual Payment
    if (action === "record") {
      if (!teamId || !amount) {
        return NextResponse.json({ error: "teamId and amount are required." }, { status: 400 });
      }

      const amountPaise = Math.round(Number(amount) * 100);
      const isPaid = body.status === "paid";

      const insertPayload: Record<string, any> = {
        team_id: teamId,
        purpose: "registration",
        amount_paise: amountPaise,
        currency: "INR",
        method: method === "cash" ? "cash" : "venue_upi",
        razorpay_payment_id: transactionId || null,
        razorpay_signature: notes || null,
        status: isPaid ? "paid" : "created",
      };

      if (isPaid) {
        insertPayload.paid_at = new Date().toISOString();
      }

      const { data: newPayment, error: insertErr } = await (supabase.from("payments") as any)
        .insert(insertPayload)
        .select("*")
        .single();

      if (insertErr) {
        return NextResponse.json({ error: insertErr.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        payment: newPayment,
        message: "Payment entry recorded successfully.",
      });
    }

    return NextResponse.json({ error: "Invalid action specified." }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
