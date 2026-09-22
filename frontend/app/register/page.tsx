"use client";

/**
 * /register — Create account page
 *
 * Form fields : email, password, confirm password
 * On submit   : POST /api/auth/register/ via lib/api.ts
 * On success  : placeholder for token storage + redirect (handled when BE1
 *               session/token management is wired up)
 * Google CTA  : GET /api/auth/google/ → redirect browser to returned auth_url
 *               Placed post-registration as part of the onboarding flow.
 */

import { useState, useRef } from "react";
import Link from "next/link";
import AuthLayout from "@/components/auth/AuthLayout";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import FormError from "@/components/ui/FormError";
import Divider from "@/components/ui/Divider";
import { register, getGoogleOAuthUrl, extractErrorMessage } from "@/lib/api";
import { useRouter } from "next/navigation";
// ─── Field-level validation ──────────────────────────────────────────────────

interface FieldErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
}

function validate(
  email: string,
  password: string,
  confirmPassword: string
): FieldErrors {
  const errors: FieldErrors = {};

  if (!email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!password) {
    errors.password = "Password is required.";
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }

  if (!confirmPassword) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (password !== confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [registered, setRegistered] = useState(false);

  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);

  // ── Register handler ───────────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setApiError(null);

    const errors = validate(email, password, confirmPassword);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      if (errors.email) emailRef.current?.focus();
      else if (errors.password) passwordRef.current?.focus();
      else if (errors.confirmPassword) confirmRef.current?.focus();
      return;
    }

    setSubmitting(true);
    try {
      const _response = await register({
        email: email.trim(),
        password,
        confirm_password: confirmPassword,
      });
      localStorage.setItem("access_token", _response.tokens.access);
      localStorage.setItem("refresh_token", _response.tokens.refresh);
      console.info("Registration successful", _response.user.email);
      setRegistered(true);
    } catch (err) {
      setApiError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  // ── Connect Google Workspace handler ───────────────────────────────────────
  async function handleConnectGoogle() {
    setGoogleLoading(true);
    setApiError(null);
    try {
      const { auth_url } = await getGoogleOAuthUrl();
      // Hand off to the backend-controlled OAuth flow — no OAuth logic here.
      window.location.href = auth_url;
    } catch (err) {
      setApiError(extractErrorMessage(err));
      setGoogleLoading(false);
    }
  }

  // ── Post-registration state: prompt to connect Google ─────────────────────
  if (registered) {
    return (
      <AuthLayout
        title="Account created"
        subtitle="Next step: connect your Google Workspace"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-stone-600 leading-relaxed">
            To use Command Center, connect your Google Workspace account. This
            allows access to Gmail, Calendar, Drive, and other services.
          </p>

          <Button
            type="button"
            loading={googleLoading}
            onClick={handleConnectGoogle}
            aria-label="Connect Google Workspace account"
          >
            {!googleLoading && (
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#fff"
                  opacity=".9"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#fff"
                  opacity=".9"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  fill="#fff"
                  opacity=".9"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#fff"
                  opacity=".9"
                />
              </svg>
            )}
            Connect Google Workspace
          </Button>

          <FormError message={apiError} />

          <p className="text-center text-xs text-stone-500">
            You can also do this later from the dashboard.
          </p>

          <Divider />

          <p className="text-center text-sm text-stone-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-stone-900 underline underline-offset-2 hover:text-stone-600 transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </AuthLayout>
    );
  }

  // ── Registration form ──────────────────────────────────────────────────────
  return (
    <AuthLayout title="Create account" subtitle="Get started with Command Center">
      {/* Top-level API error */}
      <FormError message={apiError} />

      <form
        onSubmit={handleSubmit}
        noValidate
        className="mt-4 flex flex-col gap-4"
      >
        <Input
          ref={emailRef}
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: undefined }));
          }}
          error={fieldErrors.email}
          disabled={submitting}
        />

        <Input
          ref={passwordRef}
          id="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          placeholder="Min. 8 characters"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined }));
          }}
          error={fieldErrors.password}
          disabled={submitting}
        />

        <Input
          ref={confirmRef}
          id="confirmPassword"
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (fieldErrors.confirmPassword)
              setFieldErrors((p) => ({ ...p, confirmPassword: undefined }));
          }}
          error={fieldErrors.confirmPassword}
          disabled={submitting}
        />

        <Button type="submit" loading={submitting} className="mt-1">
          Create account
        </Button>
      </form>

      {/* ── Optional: connect Google during registration ─────────────────── */}
      <div className="mt-6 flex flex-col gap-3">
        <Divider label="or sign up with" />

        <Button
          type="button"
          variant="secondary"
          loading={googleLoading}
          disabled={submitting}
          onClick={handleConnectGoogle}
          aria-label="Connect Google Workspace account"
        >
          {!googleLoading && (
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              aria-hidden="true"
              focusable="false"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
          )}
          Connect Google Workspace
        </Button>
      </div>

      {/* ── Login link ───────────────────────────────────────────────────── */}
      <p className="mt-6 text-center text-sm text-stone-500">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-stone-900 underline underline-offset-2 hover:text-stone-600 transition-colors"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
