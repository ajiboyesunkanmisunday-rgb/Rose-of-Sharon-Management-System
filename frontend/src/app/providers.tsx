"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/context/ThemeContext";
import { SidebarProvider } from "@/context/SidebarContext";

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <SidebarProvider>
        <QueryClientProvider client={queryClient}>
          <Toaster
            position="top-center"
            richColors
            toastOptions={{
              style: {
                background: "#000080",
                color: "#ffffff",
                border: "1px solid #000066",
              },
            }}
          />
          {children}
        </QueryClientProvider>
      </SidebarProvider>
    </ThemeProvider>
  );
}
