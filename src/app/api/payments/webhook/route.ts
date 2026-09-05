import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { verifyWebhookSignature } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || "";

    // 1. Verify webhook signature if secret is configured
    if (webhookSecret && !verifyWebhookSignature(rawBody, signature, webhookSecret)) {
      console.error("Razorpay webhook signature verification failed.");
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;

    // Handle payment.captured or order.paid
    if (eventType === "payment.captured" || eventType === "order.paid") {
      const paymentEntity = event.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      const paymentId = paymentEntity?.id;
      const amount = paymentEntity?.amount;
      const notes = paymentEntity?.notes || {};
      const teamId = notes.team_id;

      if (!orderId && !teamId) {
        return NextResponse.json({ received: true, note: "Missing identifiers" });
      }

      const supabase = createAdminSupabaseClient();
      const nowIso = new Date().toISOString();

      // Idempotently update payment record
      if (orderId) {
        await (supabase.from("payments") as any)
          .update({
            status: "paid",
            razorpay_payment_id: paymentId,
            paid_at: nowIso,
          })
          .eq("razorpay_order_id", orderId);
      }

      // Automatically approve team
      if (teamId) {
        await (supabase.from("teams") as any)
          .update({ status: "approved" })
          .eq("id", teamId);
      } else if (orderId) {
        // Find team from payment record
        const { data: pRecord } = await (supabase.from("payments") as any)
          .select("team_id")
          .eq("razorpay_order_id", orderId)
          .single();

        if (pRecord?.team_id) {
          await (supabase.from("teams") as any)
            .update({ status: "approved" })
            .eq("id", pRecord.team_id);
        }
      }

      return NextResponse.json({ received: true, action: "auto_approved" });
    }

    return NextResponse.json({ received: true, event: eventType });
  } catch (err: unknown) {
    console.error("Razorpay webhook error:", err);
    return NextResponse.json({ error: "Webhook handler error" }, { status: 500 });
  }
}
