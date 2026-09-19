
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  User,
  UserPlus,
} from "lucide-react";

import AuthLayout from "../components/AuthLayout";
import api from "../utils/api";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState("register");

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /*
  =====================================================
  STEP 1 — CREATE REGISTRATION
  =====================================================
  */

  const handleRegister = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!username.trim()) {
      setError("Please enter a username.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!password) {
      setError("Please enter a password.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must contain at least 6 characters."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        "/auth/register",
        {
          name: name.trim(),
          username: username.trim(),
          email: email.trim().toLowerCase(),
          password,
        }
      );

      console.log(
        "REGISTER RESPONSE:",
        response.data
      );

      const responseOtp =
        response.data?.otp;

      if (!responseOtp) {
        setError(
          "Verification code was not generated."
        );
        return;
      }

      setGeneratedOtp(
        String(responseOtp)
      );

      setStep("verify");

      setSuccess(
        "Account details saved. Enter the verification code."
      );
    } catch (err) {
      console.error(
        "REGISTER ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Unable to create registration."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  =====================================================
  STEP 2 — VERIFY OTP
  =====================================================
  */

  const handleVerifyOTP = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const cleanOtp = otp.trim();

    if (cleanOtp.length !== 6) {
      setError(
        "Please enter the 6-digit verification code."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        "/auth/verify-registration-otp",
        {
          email: email.trim().toLowerCase(),
          otp: cleanOtp,
        }
      );

      console.log(
        "VERIFY RESPONSE:",
        response.data
      );

      if (response.data?.success) {
        setSuccess(
          "Account created successfully. Redirecting to login..."
        );

        setTimeout(() => {
          navigate("/login", {
            replace: true,
          });
        }, 1200);

        return;
      }

      setError(
        response.data?.message ||
          "Verification failed."
      );
    } catch (err) {
      console.error(
        "OTP VERIFY ERROR:",
        err
      );

      setError(
        err.response?.data?.message ||
          "Invalid verification code."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  =====================================================
  BACK TO REGISTRATION
  =====================================================
  */

  const backToRegister = () => {
    setStep("register");
    setOtp("");
    setGeneratedOtp("");
    setError("");
    setSuccess("");
  };

  return (
    <AuthLayout>
      <div className="rounded-3xl border border-white/10 bg-[#0b1016]/90 p-6 shadow-2xl backdrop-blur-xl sm:p-8">

        {step === "register" ? (
          <>
            {/* HEADER */}

            <div className="mb-7">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFD21F]/10 text-[#FFD21F]">
                <UserPlus size={22} />
              </div>

              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FFD21F]">
                PULSE ACCOUNT
              </p>

              <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                Create your account
              </h2>

              <p className="mt-2 text-sm leading-6 text-white/40">
                Join PULSE and start creating live polls.
              </p>
            </div>

            {/* ERROR */}

            {error && (
              <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* SUCCESS */}

            {success && (
              <div className="mb-5 rounded-xl border border-green-500/20 bg-green-500/5 px-4 py-3 text-sm text-green-400">
                {success}
              </div>
            )}

            <form
              onSubmit={handleRegister}
              className="space-y-4"
            >
              {/* NAME */}

              <div>
                <label className="mb-2 block text-xs font-semibold text-white/60">
                  Full Name
                </label>

                <div className="relative">
                  <User
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25"
                  />

                  <input
                    type="text"
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    placeholder="Enter your name"
                    autoComplete="name"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-10 pr-4 text-sm text-white outline-none transition focus:border-[#FFD21F]/50 focus:bg-white/[0.06]"
                  />
                </div>
              </div>

              {/* USERNAME */}

              <div>
                <label className="mb-2 block text-xs font-semibold text-white/60">
                  Username
                </label>

                <div className="relative">
                  <UserPlus
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25"
                  />

                  <input
                    type="text"
                    value={username}
                    onChange={(event) =>
                      setUsername(event.target.value)
                    }
                    placeholder="Choose a username"
                    autoComplete="username"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-10 pr-4 text-sm text-white outline-none transition focus:border-[#FFD21F]/50 focus:bg-white/[0.06]"
                  />
                </div>
              </div>

              {/* EMAIL */}

              <div>
                <label className="mb-2 block text-xs font-semibold text-white/60">
                  Email
                </label>

                <div className="relative">
                  <Mail
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25"
                  />

                  <input
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="Enter your email"
                    autoComplete="email"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-10 pr-4 text-sm text-white outline-none transition focus:border-[#FFD21F]/50 focus:bg-white/[0.06]"
                  />
                </div>
              </div>

              {/* PASSWORD */}

              <div>
                <label className="mb-2 block text-xs font-semibold text-white/60">
                  Password
                </label>

                <div className="relative">
                  <Lock
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25"
                  />

                  <input
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Create a password"
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-10 pr-11 text-sm text-white outline-none transition focus:border-[#FFD21F]/50 focus:bg-white/[0.06]"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword(
                        (current) => !current
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 transition hover:text-white"
                  >
                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>
              </div>

              {/* SUBMIT */}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#FFD21F] px-5 py-3.5 text-sm font-black text-black transition hover:bg-[#FFE66D] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus size={17} />
                    Create Account
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-white/40">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-bold text-[#FFD21F] transition hover:text-[#FFE66D]"
              >
                Login
              </Link>
            </div>
          </>
        ) : (
          <>
            {/* OTP HEADER */}

            <div className="mb-7">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFD21F]/10 text-[#FFD21F]">
                <KeyRound size={22} />
              </div>

              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FFD21F]">
                VERIFY ACCOUNT
              </p>

              <h2 className="mt-2 text-2xl font-black text-white sm:text-3xl">
                Verify your account
              </h2>

              <p className="mt-2 text-sm leading-6 text-white/40">
                Enter the 6-digit code generated for your account.
              </p>
            </div>

            {/* DEMO OTP */}

            <div className="mb-5 rounded-2xl border border-[#FFD21F]/30 bg-[#FFD21F]/5 p-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FFD21F]">
                <KeyRound size={14} />
                Demo Verification Code
              </div>

              <div className="mt-3 text-center text-3xl font-black tracking-[0.35em] text-white">
                {generatedOtp}
              </div>

              <p className="mt-2 text-center text-[10px] text-white/30">
                This code is generated by the backend for the demo.
              </p>
            </div>

            {/* ERROR */}

            {error && (
              <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* SUCCESS */}

            {success && (
              <div className="mb-5 rounded-xl border border-green-500/20 bg-green-500/5 px-4 py-3 text-sm text-green-400">
                {success}
              </div>
            )}

            <form
              onSubmit={handleVerifyOTP}
              className="space-y-5"
            >
              <div>
                <label className="mb-2 block text-xs font-semibold text-white/60">
                  Verification Code
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(event) =>
                    setOtp(
                      event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6)
                    )
                  }
                  placeholder="Enter 6-digit code"
                  autoFocus
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-4 text-center text-xl font-black tracking-[0.4em] text-white outline-none transition focus:border-[#FFD21F]/50 focus:bg-white/[0.06]"
                />
              </div>

              <button
                type="submit"
                disabled={
                  loading ||
                  otp.length !== 6
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FFD21F] px-5 py-3.5 text-sm font-black text-black transition hover:bg-[#FFE66D] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={17} />
                    Verify & Create Account
                  </>
                )}
              </button>
            </form>

            <button
              type="button"
              onClick={backToRegister}
              className="mt-5 flex w-full items-center justify-center gap-2 text-xs font-semibold text-white/40 transition hover:text-white"
            >
              <ArrowLeft size={14} />
              Back to registration
            </button>
          </>
        )}
      </div>
    </AuthLayout>
  );
}
