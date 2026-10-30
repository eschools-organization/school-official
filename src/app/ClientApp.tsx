"use client";
import "@/lib/polyfills";
import React, { useState, Suspense, Component, ErrorInfo } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ColorProvider } from "@/components/ColorContext";
import AppWrapper from "@/components/AppWrapper";
import StartPage from "@/pages-legacy/start/StartPage";
import Student from "@/pages-legacy/student/Student";
import Admin from "@/pages-legacy/admin/Admin";
import Teacher from "@/pages-legacy/teacher/Teacher";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// App build version - incrementing this forces mobile and desktop browsers to purge stale caches
const APP_VERSION = "2026.10.30.1";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class AppErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("AppErrorBoundary caught an error:", error, errorInfo);
  }

  handleReload = () => {
    try {
      if ("caches" in window) {
        caches.keys().then((keys) => {
          keys.forEach((k) => caches.delete(k));
        });
      }
      localStorage.removeItem("eschools_app_version");
    } catch {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            backgroundColor: "#0f172a",
            color: "#ffffff",
            textAlign: "center",
            fontFamily: "system-ui, -apple-system, sans-serif",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              maxWidth: "400px",
              width: "100%",
              background: "#1e293b",
              padding: "28px 20px",
              borderRadius: "20px",
              boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
              border: "1px solid #334155",
            }}
          >
            <div style={{ fontSize: "40px", marginBottom: "16px" }}>⚠️</div>
            <h2 style={{ fontSize: "19px", fontWeight: 700, marginBottom: "12px", color: "#f8fafc" }}>
              დაფიქსირდა შეცდომა
            </h2>
            <p style={{ fontSize: "14px", color: "#94a3b8", marginBottom: "20px", lineHeight: "1.5" }}>
              გვერდის ჩატვირთვა ვერ მოხერხდა. სცადეთ გვერდის განახლება ან ქეშის გასუფთავება.
            </p>
            <button
              onClick={this.handleReload}
              style={{
                width: "100%",
                padding: "14px",
                backgroundColor: "#2563eb",
                color: "#ffffff",
                border: "none",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(37,99,235,0.4)",
              }}
            >
              🔄 ხელახლა ჩატვირთვა
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function ClientApp() {
  React.useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const storedVersion = localStorage.getItem("eschools_app_version");
      if (storedVersion !== APP_VERSION) {
        if ("caches" in window) {
          caches.keys().then((names) => {
            names.forEach((name) => caches.delete(name));
          });
        }
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

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes stale time
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <ColorProvider>
            <AppWrapper>
              <Suspense
                fallback={
                  <div
                    style={{
                      minHeight: "100vh",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "18px",
                      fontWeight: 600,
                      fontFamily: "inherit",
                    }}
                  >
                    იტვირთება...
                  </div>
                }
              >
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
    </AppErrorBoundary>
  );
}
