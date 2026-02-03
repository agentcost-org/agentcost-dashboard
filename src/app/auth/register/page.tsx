"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Check,
  X,
  ExternalLink,
} from "lucide-react";
import { parseApiError } from "@/lib/utils";
import { Checkbox } from "@/components/auth/AuthComponents";

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
  { label: "At least 8 characters", test: (p) => p.length >= 8 },
  { label: "One uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "One lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "One number", test: (p) => /[0-9]/.test(p) },
];

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Policy consent state
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [policyVersions, setPolicyVersions] = useState({
    terms: "1.0",
    privacy: "1.0",
  });

  // Fetch current policy versions on mount
  useEffect(() => {
    const fetchPolicyVersions = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/policies/current`,
        );
        if (response.ok) {
          const data = await response.json();
          setPolicyVersions({
            terms: data.terms_version,
            privacy: data.privacy_version,
          });
        }
      } catch {
        // Use default versions if fetch fails
        console.error("Failed to fetch policy versions, using defaults");
      }
    };
    fetchPolicyVersions();
  }, []);

  const allRequirementsMet = passwordRequirements.every((req) =>
    req.test(password),
  );
  const passwordsMatch = password === confirmPassword && password.length > 0;
  const consentGiven = acceptTerms && acceptPrivacy;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!allRequirementsMet) {
      setError("Please meet all password requirements");
      return;
    }

    if (!passwordsMatch) {
      setError("Passwords do not match");
      return;
    }

    if (!consentGiven) {
      setError(
        "You must accept both the Terms of Service and Privacy Policy to create an account",
      );
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
            name: name || undefined,
            accept_terms: acceptTerms,
            accept_privacy: acceptPrivacy,
            terms_version: policyVersions.terms,
            privacy_version: policyVersions.privacy,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Registration failed");
      }

      setSuccess(true);
    } catch (err) {
      setError(parseApiError(err));
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-sm px-4 py-8 text-center">
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8 ring-4 ring-green-500/20">
          <Check className="w-10 h-10 text-green-500" />
        </div>
        <h1 className="text-2xl font-semibold text-white mb-3">
          Check your email
        </h1>
        <p className="text-gray-400 mb-8 leading-relaxed">
          We have sent a verification link to{" "}
          <span className="text-white font-medium">{email}</span>. Please check
          your inbox and click the link to verify your account.
        </p>
        <Link
          href="/auth/login"
          className="inline-flex items-center justify-center bg-white hover:bg-gray-100 text-slate-900 font-medium py-3 px-8 rounded-xl transition-colors shadow-lg shadow-white/10"
        >
          Go to Login
        </Link>
        <p className="mt-6 text-sm text-gray-500">
          Didn&apos;t receive the email? Check your spam folder.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm px-4 py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="mt-45 text-2xl font-semibold text-white mb-2">
          Create your account
        </h1>
        <p className="text-gray-400 text-sm">
          Start tracking your AI costs today
        </p>
      </div>

      {/* Google Sign Up Button */}
      <button
        type="button"
        className="w-full flex items-center justify-center gap-3 bg-transparent border border-gray-700 hover:border-gray-600 text-white font-medium py-3 rounded-xl transition-colors mb-6"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="currentColor"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="currentColor"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="currentColor"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Continue with Google
      </button>

      {/* Divider */}
      <div className="mb-6 flex items-center">
        <div className="flex-1 border-t border-gray-800"></div>
        <span className="px-4 text-sm text-gray-500">or</span>
        <div className="flex-1 border-t border-gray-800"></div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span className="text-sm leading-relaxed">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Name <span className="text-gray-500">(optional)</span>
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#0a0a0b] border border-gray-700/80 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 transition-colors"
              placeholder="Your name"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#0a0a0b] border border-gray-700/80 rounded-xl pl-11 pr-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 transition-colors"
              placeholder="you@example.com"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#0a0a0b] border border-gray-700/80 rounded-xl pl-11 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-500 transition-colors"
              placeholder="Create a secure password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Password Requirements */}
          {password.length > 0 && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {passwordRequirements.map((req, index) => {
                const met = req.test(password);
                return (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    {met ? (
                      <Check className="w-3.5 h-3.5 text-green-500" />
                    ) : (
                      <X className="w-3.5 h-3.5 text-gray-500" />
                    )}
                    <span className={met ? "text-green-500" : "text-gray-500"}>
                      {req.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-300 mb-2"
          >
            Confirm password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full bg-[#0a0a0b] border rounded-xl pl-11 pr-12 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-1 transition-colors ${
                confirmPassword.length > 0
                  ? passwordsMatch
                    ? "border-green-500/50 focus:border-green-500 focus:ring-green-500"
                    : "border-red-500/50 focus:border-red-500 focus:ring-red-500"
                  : "border-gray-700/80 focus:border-gray-500 focus:ring-gray-500"
              }`}
              placeholder="Confirm your password"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400 transition-colors"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          {confirmPassword.length > 0 && !passwordsMatch && (
            <p className="mt-2 text-xs text-red-400">Passwords do not match</p>
          )}
        </div>

        {/* Legal Consent - Terms of Service Checkbox */}
        <div className="space-y-3 pt-2">
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="mt-0.5">
              <Checkbox
                id="acceptTerms"
                checked={acceptTerms}
                onChange={setAcceptTerms}
              />
            </div>
            <span className="text-sm text-gray-300 leading-relaxed">
              I agree to the{" "}
              <Link
                href="/terms"
                target="_blank"
                className="text-white hover:text-gray-300 inline-flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                Terms of Service
                <ExternalLink className="w-3 h-3" />
              </Link>
            </span>
          </label>

          {/* Privacy Policy Checkbox */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <div className="mt-0.5">
              <Checkbox
                id="acceptPrivacy"
                checked={acceptPrivacy}
                onChange={setAcceptPrivacy}
              />
            </div>
            <span className="text-sm text-gray-300 leading-relaxed">
              I agree to the{" "}
              <Link
                href="/privacy"
                target="_blank"
                className="text-white hover:text-gray-300 inline-flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                Privacy Policy
                <ExternalLink className="w-3 h-3" />
              </Link>
            </span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={
            isLoading || !allRequirementsMet || !passwordsMatch || !consentGiven
          }
          className="w-full bg-white hover:bg-gray-100 disabled:bg-white/40 disabled:cursor-not-allowed text-slate-900 font-medium py-3 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-white/10"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create account"
          )}
        </button>
      </form>

      {/* Login Link */}
      <p className="text-center text-gray-400 mt-8">
        Already have an account?{" "}
        <Link
          href="/auth/login"
          className="text-white hover:text-gray-300 font-medium transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
