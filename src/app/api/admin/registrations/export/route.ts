import { NextRequest, NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = createAdminSupabaseClient();
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get("status") || "all";

    const { data: teamsData, error } = await (supabase.from("teams") as any)
      .select(`
        id,
        name,
        slug,
        captain_name,
        captain_email,
        captain_phone,
        training_addon,
        status,
        created_at,
        team_members (id),
        payments (
          amount_paise,
          status,
          method,
          razorpay_payment_id,
          paid_at
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let teams = teamsData || [];

    // Filter by status if provided
    if (statusFilter !== "all") {
      teams = teams.filter((t: any) => t.status === statusFilter);
    }

    // Build CSV header
    const headers = [
      "Registration ID",
      "Team Name",
      "Captain Name",
      "Captain Email",
      "Captain Phone",
      "Pilots Count",
      "Training Addon",
      "Registration Status",
      "Expected Fee (INR)",
      "Paid Amount (INR)",
      "Payment Status",
      "Payment Method",
      "Transaction ID",
      "Registration Date",
    ];

    const escapeCsv = (str: any) => {
      if (str === null || str === undefined) return "";
      const val = String(str).replace(/"/g, '""');
      return `"${val}"`;
    };

    const rows = teams.map((team: any, index: number) => {
      const regId = `REG-${(index + 1).toString().padStart(4, "0")}`;
      const pilotsCount = team.team_members?.length || 0;
      const expectedAmount = 100 + (team.training_addon ? 100 : 0);

      const payments = team.payments || [];
      const paidPayments = payments.filter((p: any) => p.status === "paid");
      const paidAmount = paidPayments.reduce((acc: number, p: any) => acc + p.amount_paise / 100, 0);

      const latestPayment = payments[0] || {};
      const payStatus = paidAmount >= expectedAmount ? "PAID" : latestPayment.status ? latestPayment.status.toUpperCase() : "PENDING";
      const txId = latestPayment.razorpay_payment_id || latestPayment.transaction_id || "N/A";

      return [
        escapeCsv(regId),
        escapeCsv(team.name),
        escapeCsv(team.captain_name),
        escapeCsv(team.captain_email),
        escapeCsv(team.captain_phone || "N/A"),
        pilotsCount,
        team.training_addon ? "YES (+₹100)" : "NO",
        escapeCsv(team.status.toUpperCase()),
        expectedAmount,
        paidAmount,
        escapeCsv(payStatus),
        escapeCsv(latestPayment.method || "N/A"),
        escapeCsv(txId),
        escapeCsv(new Date(team.created_at).toLocaleDateString("en-IN")),
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\r\n");
    const filename = `drone-soccer-registrations-${new Date().toISOString().split("T")[0]}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
