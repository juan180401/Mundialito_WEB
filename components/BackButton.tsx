"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BackButton() {
  const pathname = usePathname();

  if (pathname === "/") return null;

  return (
    <nav style={{ marginBottom: "25px" }}>
      <Link
        href="/"
        style={{
          padding: "6px 12px",
          backgroundColor: "#222",
          color: "white",
          border: "1px solid #555",
          textDecoration: "none",
          display: "inline-block",
        }}
      >
        ← Inicio
      </Link>
    </nav>
  );
}