"use client";
import React, { useState, lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ColorProvider } from "@/components/ColorContext";
import AppWrapper from "@/components/AppWrapper";
import StartPage from "@/pages-legacy/start/StartPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { clearAuthSession } from "@/lib/auth";

// Lazy load the large dashboard components
const Student = lazy(() => import("@/pages-legacy/student/Student"));
const Admin = lazy(() => import("@/pages-legacy/admin/Admin"));
const Teacher = lazy(() => import("@/pages-legacy/teacher/Teacher"));

interface ErrorBoundaryState {
  hasError: boolean;
}

class GlobalErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidMount() {
    if (this.state.hasError) {
      try {
        clearAuthSession();
        if (typeof window !== 'undefined' && window.location.pathname !== '/') {
          window.location.replace('/');
        }
      } catch (e) {
        console.error(e);
      }
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Global React error caught:", error, errorInfo);
    try {
      clearAuthSession();
      if (typeof window !== 'undefined' && window.location.pathname !== '/') {
        window.location.replace('/');
      }
    } catch (e) {
      console.error(e);
    }
  }

  render() {
    if (this.state.hasError) {
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
            გთხოვთ გაიაროთ ავტორიზაცია ხელახლა.
          </p>
          <button
            onClick={() => {
              clearAuthSession();
              if (typeof window !== 'undefined') {
                window.location.href = '/';
              }
            }}
            style={{
              padding: '12px 24px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)'
            }}
          >
            მთავარ გვერდზე გადასვლა
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function ClientApp() {
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const originalFetch = window.fetch;
    window.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      if (url.includes('/api/')) {
        const token = localStorage.getItem('authToken');
        if (token) {
          init = init || {};
          const headers = new Headers(init.headers || {});
          if (!headers.has('Authorization')) {
            headers.set('Authorization', `Bearer ${token}`);
          }
          init.headers = headers;
        }
      }
      const response = await originalFetch(input, init);
      if ((response.status === 401 || response.status === 403) && url.includes('/api/')) {
        const isAuthLoginEndpoint = url.includes('/api/student/login') ||
                                    url.includes('/api/teacher/login') ||
                                    url.includes('/api/admin/login') ||
                                    url.includes('/api/login');
        if (!isAuthLoginEndpoint) {
          clearAuthSession();
          if (typeof window !== 'undefined' && window.location.pathname !== '/') {
            const now = Date.now();
            const lastRedirect = parseInt(sessionStorage.getItem('last_auth_redirect') || '0', 10);
            if (now - lastRedirect > 1000) {
              sessionStorage.setItem('last_auth_redirect', now.toString());
              window.location.replace('/');
            }
          }
        }
      }
      return response;
    };
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
    <GlobalErrorBoundary>
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
    </GlobalErrorBoundary>
  );
}
