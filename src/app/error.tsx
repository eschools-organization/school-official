"use client";

import { useEffect } from "react";
import { clearAuthSession } from "@/lib/auth";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Next.js page error caught:", error);
    try {
      clearAuthSession();
      if (typeof window !== 'undefined' && window.location.pathname !== '/') {
        window.location.replace('/');
      }
    } catch (e) {
      console.error(e);
    }
  }, [error]);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0f172a',
      color: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      textAlign: 'center',
      fontFamily: 'system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
      <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>
        სესიას ვადა გაუვიდა ან მოხდა ხარვეზი
      </h2>
      <p style={{ color: '#94a3b8', fontSize: '14px', maxWidth: '400px', marginBottom: '24px' }}>
        გთხოვთ ხელახლა გაიაროთ ავტორიზაცია.
      </p>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button
          onClick={() => reset()}
          style={{
            padding: '12px 20px',
            backgroundColor: 'rgba(255,255,255,0.1)',
            color: '#ffffff',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          ხელახლა ცდა
        </button>
        <button
          onClick={() => {
            clearAuthSession();
            if (typeof window !== 'undefined') {
              window.location.href = '/';
            }
          }}
          style={{
            padding: '12px 20px',
            backgroundColor: '#2563eb',
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)'
          }}
        >
          მთავარ გვერდზე გადასვლა
        </button>
      </div>
    </div>
  );
}
