"use client";
import "@/lib/polyfills";
import dynamic from "next/dynamic";

const ClientApp = dynamic(() => import("../ClientApp"), { ssr: false });

export default function AdminPage() {
  return <ClientApp />;
}
