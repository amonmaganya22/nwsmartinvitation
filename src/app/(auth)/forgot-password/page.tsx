"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { AuthShell } from "@/components/ui/Card";
import { Input, Label, FieldError } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { apiFetch } from "@/lib/api-client";

function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiFetch("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setSent(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="We'll send reset instructions to your email."
    >
      {sent ? (
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            If an account exists for <span className="font-medium">{email}</span>, you&apos;ll receive a reset link shortly.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block font-medium text-brand-green"
          >
            Back to login
          </Link>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <FieldError>{error ?? undefined}</FieldError>
          <Button type="submit" fullWidth loading={loading}>
            Send reset link
          </Button>
          <Link
            href="/login"
            className="block text-center text-sm font-medium text-brand-green"
          >
            Back to login
          </Link>
        </form>
      )}
    </AuthShell>
  );
}

export default function ForgotPasswordPage() {
  return (
    <Suspense fallback={<div className="flex justify-center p-8 text-sm text-gray-500">Loading...</div>}>
      <ForgotPasswordForm />
    </Suspense>
  );
}