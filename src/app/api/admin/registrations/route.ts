import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminSupabaseClient();
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.toLowerCase() || "";
    const statusFilter = searchParams.get("status") || "all";
    const paymentFilter = searchParams.get("payment") || "all";

    // 1. Fetch Teams with pilots and payments
    const { data: teamsData, error: teamsError } = await (supabase.from("teams") as any)
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
          currency,
          status,
          method,
          razorpay_payment_id,
          razorpay_order_id,
          razorpay_signature,
          paid_at,
          created_at
        )
      `)
      .order("created_at", { ascending: false });

    if (teamsError) {
      console.error("Error fetching teams for admin:", teamsError);
      return NextResponse.json({ error: teamsError.message }, { status: 500 });
    }

    const allTeams = teamsData || [];

    // 2. Compute Real Financial & Registration Metrics
    let totalExpectedRevenue = 0;
    let totalReceivedRevenue = 0;
    let totalRefundedRevenue = 0;
    let confirmedCount = 0;
    let pendingCount = 0;
    let rejectedCount = 0;
    let cancelledCount = 0;
    let autoVerifiedCount = 0;
    let pendingPaymentCount = 0;
    let failedPaymentsCount = 0;

    const enrichedTeams = allTeams.map((team: any, index: number) => {
      const regNumber = `REG-${(index + 1).toString().padStart(4, "0")}`;
      // Expected fee: ₹100 base + ₹100 training if selected
      const expectedAmount = 100 + (team.training_addon ? 100 : 0);
      if (team.status !== "cancelled" && team.status !== "rejected") {
        totalExpectedRevenue += expectedAmount;
      }

      if (team.status === "approved") confirmedCount++;
      else if (team.status === "pending") pendingCount++;
      else if (team.status === "rejected") rejectedCount++;
      else if (team.status === "cancelled") cancelledCount++;

      const payments = (team.payments || []).map((p: any) => ({
        ...p,
        transaction_id: p.transaction_id || p.razorpay_payment_id || null,
        notes: p.admin_notes || p.razorpay_signature || null,
      }));

      const paidPayments = payments.filter((p: any) => p.status === "paid");
      const paidAmount = paidPayments.reduce((acc: number, p: any) => acc + (p.amount_paise / 100), 0);
      totalReceivedRevenue += paidAmount;

      const refundedPayments = payments.filter((p: any) => p.status === "refunded");
      const refundedAmount = refundedPayments.reduce((acc: number, p: any) => acc + (p.amount_paise / 100), 0);
      totalRefundedRevenue += refundedAmount;

      const hasFailed = payments.some((p: any) => p.status === "failed");
      if (hasFailed) failedPaymentsCount++;

      // Primary payment status summary for the team
      let derivedPaymentStatus: "paid" | "pending" | "failed" | "refunded" = "pending";
      let isAutoVerified = false;

      if (paidAmount >= expectedAmount || team.status === "approved") {
        derivedPaymentStatus = "paid";
        isAutoVerified = true;
        autoVerifiedCount++;
      } else if (refundedAmount > 0) {
        derivedPaymentStatus = "refunded";
      } else if (hasFailed) {
        derivedPaymentStatus = "failed";
      } else {
        derivedPaymentStatus = "pending";
        pendingPaymentCount++;
      }

      return {
        ...team,
        regNumber,
        expectedAmount,
        paidAmount,
        derivedPaymentStatus,
        isAutoVerified,
        payments,
        admin_notes: team.admin_notes || team.tagline || null,
      };
    });

    // Net received revenue
    const netReceived = Math.max(0, totalReceivedRevenue - totalRefundedRevenue);
    const pendingPaymentAmount = Math.max(0, totalExpectedRevenue - netReceived);

    // 3. Apply Filters
    let filteredTeams = enrichedTeams;

    if (search) {
      filteredTeams = filteredTeams.filter((t: any) => {
        const teamMatch = t.name.toLowerCase().includes(search);
        const captainMatch = t.captain_name.toLowerCase().includes(search);
        const emailMatch = t.captain_email.toLowerCase().includes(search);
        const regMatch = t.regNumber.toLowerCase().includes(search);
        const txMatch = t.payments?.some((p: any) => p.transaction_id?.toLowerCase().includes(search));
        const utrMatch = t.admin_notes?.toLowerCase().includes(search);
        return teamMatch || captainMatch || emailMatch || regMatch || txMatch || utrMatch;
      });
    }

    if (statusFilter !== "all") {
      filteredTeams = filteredTeams.filter((t: any) => t.status === statusFilter);
    }

    if (paymentFilter !== "all") {
      filteredTeams = filteredTeams.filter((t: any) => t.derivedPaymentStatus === paymentFilter);
    }

    return NextResponse.json({
      teams: filteredTeams,
      stats: {
        totalRegistrations: allTeams.length,
        confirmedCount,
        pendingCount,
        rejectedCount,
        cancelledCount,
        autoVerifiedCount,
        pendingPaymentCount,
        expectedRevenue: totalExpectedRevenue,
        receivedRevenue: netReceived,
        pendingRevenue: pendingPaymentAmount,
        refundedRevenue: totalRefundedRevenue,
        failedPaymentsCount,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { teamId, status, adminNotes, rejectionReason } = body;

    if (!teamId || !status) {
      return NextResponse.json({ error: "teamId and status are required." }, { status: 400 });
    }

    const supabase = createAdminSupabaseClient();

    // Perform Update (writing to status, and storing notes/reason in tagline if admin_notes column not present)
    const updatePayload: Record<string, any> = { status };
    if (adminNotes || rejectionReason) {
      updatePayload.tagline = adminNotes || rejectionReason;
    }

    const { data: updatedTeam, error: updateErr } = await (supabase.from("teams") as any)
      .update(updatePayload)
      .eq("id", teamId)
      .select("*")
      .single();

    if (updateErr) {
      return NextResponse.json({ error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      team: updatedTeam,
      message: `Registration status updated to ${status}.`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}