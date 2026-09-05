import { createServerSupabaseClient, createAdminSupabaseClient } from "@/lib/supabase/server";

export function getAdminEmails(): string[] {
  const raw = process.env.ADMIN_EMAILS || "karrichanikya@gmail.com,saisankar778@gmail.com,admin@srmap.edu.in";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  const adminList = getAdminEmails();
  return adminList.includes(email.trim().toLowerCase());
}

export async function getCurrentAuthUser() {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) return null;

    const email = user.email || "";
    const isAdmin = isAdminEmail(email);

    return {
      id: user.id,
      email,
      isAdmin,
      userMetadata: user.user_metadata,
    };
  } catch {
    return null;
  }
}
