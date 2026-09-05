"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export function Navbar() {
  const pathname = usePathname();
  const [navShown, setNavShown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setNavShown(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <header
      style={{
        position: "fixed",
        top: 16,
        left: 16,
        right: 16,
        zIndex: 900,
        opacity: navShown ? 1 : 0,
        transform: navShown ? "translateY(0)" : "translateY(-24px)",
        transition: "opacity 0.8s var(--ease), transform 0.8s var(--ease)",
      }}
    >
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 28px",
          background: "rgba(28,32,22,0.72)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid var(--border)",
          borderRadius: 999,
          maxWidth: 1521,
          margin: "0 auto",
        }}
      >
        <Link
          href="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontFamily: "var(--font-heading)",
            fontWeight: 900,
            textTransform: "uppercase",
            fontSize: 18,
            letterSpacing: "0.04em",
          }}
        >
          <span>
            Drone Soccer{" "}
            <span style={{ color: "var(--muted)", fontWeight: 500 }}>/ SRM AP</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div
          className="desktop-links"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 28,
          }}
        >
          <Link
            href="/#rules"
            style={{
              fontFamily: "var(--font-heading)",
              textTransform: "uppercase",
              fontSize: 13,
              letterSpacing: "0.08em",
            }}
          >
            Rules
          </Link>
          <Link
            href="/fixtures"
            style={{
              fontFamily: "var(--font-heading)",
              textTransform: "uppercase",
              fontSize: 13,
              letterSpacing: "0.08em",
              color: pathname === "/fixtures" ? "var(--white)" : "var(--muted)",
            }}
          >
            Fixtures
          </Link>
          <Link
            href="/standings"
            style={{
              fontFamily: "var(--font-heading)",
              textTransform: "uppercase",
              fontSize: 13,
              letterSpacing: "0.08em",
              color: pathname === "/standings" ? "var(--white)" : "var(--muted)",
            }}
          >
            Standings
          </Link>
          <Link
            href="/teams"
            style={{
              fontFamily: "var(--font-heading)",
              textTransform: "uppercase",
              fontSize: 13,
              letterSpacing: "0.08em",
              color: pathname === "/teams" ? "var(--white)" : "var(--muted)",
            }}
          >
            Teams
          </Link>
          <Link
            href="/login"
            style={{
              fontFamily: "var(--font-heading)",
              textTransform: "uppercase",
              fontSize: 13,
              letterSpacing: "0.08em",
              color: pathname === "/login" || pathname?.startsWith("/dashboard") ? "var(--white)" : "var(--muted)",
            }}
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="btn btn-primary"
            style={{ borderRadius: 999, textDecoration: "none" }}
          >
            Register your team
          </Link>
        </div>

        {/* Mobile Hamburger toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="mobile-toggle"
          style={{
            display: "none",
            background: "none",
            border: "none",
            color: "var(--white)",
            fontSize: 20,
            cursor: "pointer",
            padding: "4px 8px",
          }}
          aria-label="Toggle mobile menu"
        >
          ☰
        </button>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          style={{
            marginTop: 8,
            padding: 20,
            background: "rgba(28,32,22,0.95)",
            backdropFilter: "blur(16px)",
            border: "1px solid var(--border)",
            borderRadius: 20,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <Link
            href="/#rules"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              fontFamily: "var(--font-heading)",
              textTransform: "uppercase",
              fontSize: 15,
              letterSpacing: "0.08em",
            }}
          >
            Rules
          </Link>
          <Link
            href="/fixtures"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              fontFamily: "var(--font-heading)",
              textTransform: "uppercase",
              fontSize: 15,
              letterSpacing: "0.08em",
            }}
          >
            Fixtures
          </Link>
          <Link
            href="/standings"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              fontFamily: "var(--font-heading)",
              textTransform: "uppercase",
              fontSize: 15,
              letterSpacing: "0.08em",
            }}
          >
            Standings
          </Link>
          <Link
            href="/teams"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              fontFamily: "var(--font-heading)",
              textTransform: "uppercase",
              fontSize: 15,
              letterSpacing: "0.08em",
            }}
          >
            Teams
          </Link>
          <Link
            href="/login"
            onClick={() => setMobileMenuOpen(false)}
            style={{
              fontFamily: "var(--font-heading)",
              textTransform: "uppercase",
              fontSize: 15,
              letterSpacing: "0.08em",
              color: "var(--accent)",
            }}
          >
            Sign In
          </Link>
          <Link
            href="/register"
            onClick={() => setMobileMenuOpen(false)}
            className="btn btn-primary"
            style={{
              borderRadius: 999,
              textAlign: "center",
              textDecoration: "none",
            }}
          >
            Register your team
          </Link>
        </div>
      )}

      <style jsx>{`
        @media (max-width: 768px) {
          .desktop-links {
            display: none !important;
          }
          .mobile-toggle {
            display: block !important;
          }
        }
      `}</style>
    </header>
  );
}
