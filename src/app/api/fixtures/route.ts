import { NextResponse } from "next/server";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createAdminSupabaseClient();
    const { data: slots, error } = await supabase
      .from("slots")
      .select("*")
      .order("match_date", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message, slots: [] }, { status: 500 });
    }

    return NextResponse.json({ slots: slots || [], source: "supabase" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message, slots: [] }, { status: 500 });
  }
}
