"use client";
import React, { useState, lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ColorProvider } from "@/components/ColorContext";
import AppWrapper from "@/components/AppWrapper";
import StartPage from "@/pages-legacy/start/StartPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// App build version - incrementing this forces mobile and desktop browsers to purge stale caches
const APP_VERSION = "2026.10.22.1";

// Resilient dynamic importer: handles stale cached JS chunks when a new build is deployed
function safeLazy<T extends React.ComponentType<any>>(
  importer: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    try {
      return await importer();
    } catch (error) {
      console.warn("Dynamic import failed, purging cache...", error);
      if (typeof window !== "undefined") {
        const lastReload = sessionStorage.getItem("chunk_reload_time");
        const now = Date.now();
        if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
          sessionStorage.setItem("chunk_reload_time", String(now));
          if ("caches" in window) {
            try {
              const keys = await caches.keys();
              await Promise.all(keys.map((k) => caches.delete(k)));
            } catch {}
          }
          window.location.reload();
        }
      }
      throw error;
    }
  });
}

// Lazy load dashboard components with cache-safe wrapper
const Student = safeLazy(() => import("@/pages-legacy/student/Student"));
const Admin = safeLazy(() => import("@/pages-legacy/admin/Admin"));
const Teacher = safeLazy(() => import("@/pages-legacy/teacher/Teacher"));

export default function ClientApp() {
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const storedVersion = localStorage.getItem("eschools_app_version");
      if (storedVersion !== APP_VERSION) {
        // Clear browser CacheStorage (cached HTML/JS bundles)
        if ("caches" in window) {
          caches.keys().then((names) => {
            names.forEach((name) => caches.delete(name));
          });
        }
        // Unregister any active service workers
        if ("serviceWorker" in navigator) {
          navigator.serviceWorker.getRegistrations().then((registrations) => {
            for (const registration of registrations) {
              registration.unregister();
            }
          });
        }
        localStorage.setItem("eschools_app_version", APP_VERSION);
      }
    } catch (e) {
      console.error("Cache purge check failed:", e);
    }
  }, []);

  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes stale time
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <ColorProvider>
          <AppWrapper>
            <Suspense fallback={
              <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '18px',
                fontWeight: 600,
                fontFamily: 'inherit'
              }}>
                იტვირთება...
              </div>
            }>
              <Routes>
                <Route path="/" element={<StartPage />} />
                <Route path="/student" element={<Student />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/teacher/*" element={<Teacher />} />
              </Routes>
            </Suspense>
          </AppWrapper>
        </ColorProvider>
      </Router>
    </QueryClientProvider>
  );
}
