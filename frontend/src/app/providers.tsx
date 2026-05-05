"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { Toaster } from "sonner";

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  return (
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
  );
}
