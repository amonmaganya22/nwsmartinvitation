"use client";

import { useEffect } from "react";
import { apiFetch } from "./api-client";

export function useCsrfBootstrap() {
  useEffect(() => {
    apiFetch("/api/auth/me").catch(() => {});
  }, []);
}
