import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isAdminEmail } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresh auth token
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const userEmail = user?.email || null;
  const isAdmin = isAdminEmail(userEmail);

  // 1. Guarding /admin and /api/admin
  if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
    // API routes return JSON 401/403
    if (pathname.startsWith("/api/admin")) {
      if (!user) {
        return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
      }
      if (!isAdmin) {
        return NextResponse.json({ error: "Forbidden. Admin access required." }, { status: 403 });
      }
      return response;
    }

    // Web /admin pages
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (!isAdmin) {
      // Logged in, but not an admin -> redirect to team dashboard
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // 2. Guarding /dashboard (Team Portal)
  if (pathname.startsWith("/dashboard")) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. If logged in and visiting /login, redirect directly to their dashboard
  if (pathname === "/login" && user) {
    if (isAdmin) {
      return NextResponse.redirect(new URL("/admin/registrations", request.url));
    } else {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
    "/dashboard/:path*",
    "/login",
  ],
};
