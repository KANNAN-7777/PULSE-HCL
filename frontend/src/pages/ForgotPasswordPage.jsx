import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  Mail,
  ShieldCheck,
  Lock,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

import api from "../utils/api";
const authInputCls =
  "w-full rounded-2xl border border-[#292929] bg-[#090909] px-4 py-3.5 text-sm text-white outline-none transition duration-300 placeholder:text-[#4B4B4B] hover:border-[#3A3A3A] focus:border-[#FFD21F]/60 focus:bg-[#0D0D0D] focus:ring-4 focus:ring-[#FFD21F]/5";

const AuthButton = ({
  children,
  disabled,
}) => {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-[#FFD21F] px-4 py-3.5 text-sm font-black text-black shadow-[0_12px_35px_rgba(255,210,31,0.12)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#FFE66D] hover:shadow-[0_16px_40px_rgba(255,210,31,0.18)] disabled:cursor-not-allowed disabled:opacity-50"
    >
      <span className="pointer-events-none absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-500 group-hover:translate-x-full" />

      <span className="relative">
        {children}
      </span>
    </button>
  );
};

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");

  const [showPw, setShowPw] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [busy, setBusy] = useState(false);

  const titles = [
    "Reset your password",
    "Check your inbox",
    "New password",
  ];

  const subtitles = [
    "Enter your email and we'll send you a reset code.",
    "Enter the 6-digit code we sent to your email.",
    "Choose a strong password for your account.",
  ];

const sendCode = async (e) => {
  e.preventDefault();

  setError("");
  setMessage("");

  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail) {
    setError("Please enter your email");
    return;
  }

  try {
    setBusy(true);

    const response = await api.post(
      "/auth/send-otp",
      {
        email: cleanEmail,
      }
    );

    setEmail(cleanEmail);

    setMessage(
      response.data?.message ||
        "Reset code sent. Enter the 6-digit code."
    );

    setStep(2);
  } catch (err) {
    setError(
      err.response?.data?.message ||
        "Could not send reset code"
    );
  } finally {
    setBusy(false);
  }
};

 const verifyOtp = async (e) => {
  e.preventDefault();

  setError("");
  setMessage("");

  const cleanEmail = email.trim().toLowerCase();
  const cleanOtp = otp.trim();

  if (!/^\d{6}$/.test(cleanOtp)) {
    setError("Please enter a valid 6-digit code");
    return;
  }

  try {
    setBusy(true);

    const response = await api.post(
      "/auth/verify-otp",
      {
        email: cleanEmail,
        otp: cleanOtp,
      }
    );

    setMessage(
      response.data?.message ||
        "Code verified successfully."
    );

    setStep(3);
  } catch (err) {
    setError(
      err.response?.data?.message ||
        "Invalid verification code"
    );
  } finally {
    setBusy(false);
  }
};

  const reset = async (e) => {
  e.preventDefault();

  setError("");
  setMessage("");

  if (pw.length < 8) {
    setError("Password must contain at least 8 characters");
    return;
  }

  if (pw !== pw2) {
    setError("Passwords do not match");
    return;
  }

  try {
    setBusy(true);

    const response = await api.post(
      "/auth/reset-password",
      {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
        new_password: pw,
      }
    );

    setMessage(
      response.data?.message ||
        "Password reset successfully."
    );

    setTimeout(() => {
      navigate("/login");
    }, 1200);
  } catch (err) {
    setError(
      err.response?.data?.message ||
        "Could not reset password"
    );
  } finally {
    setBusy(false);
  }
};
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050505] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-150px] top-[-100px] h-[420px] w-[420px] rounded-full bg-[#FFD21F]/5 blur-[140px]" />

        <div className="absolute right-[-120px] top-[25%] h-[380px] w-[380px] rounded-full bg-[#4090F0]/5 blur-[140px]" />

        <div className="absolute bottom-[-150px] left-[25%] h-[360px] w-[360px] rounded-full bg-[#FFD21F]/[0.025] blur-[130px]" />

        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(#FFD21F 1px, transparent 1px), linear-gradient(90deg, #FFD21F 1px, transparent 1px)",
            backgroundSize: "70px 70px",
          }}
        />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-md">
          <Link
            to="/login"
            className="group mb-5 inline-flex items-center gap-2 text-xs font-semibold text-[#9CA3AF] transition duration-300 hover:-translate-x-0.5 hover:text-[#FFD21F]"
          >
            <ArrowLeft
              size={14}
              className="transition-transform duration-300 group-hover:-translate-x-0.5"
            />
            Back to login
          </Link>

          <div className="overflow-hidden rounded-[30px] border border-[#292929] bg-[#111111]/95 shadow-[0_25px_80px_rgba(0,0,0,0.45)] backdrop-blur-sm animate-[authFadeIn_0.45s_ease-out]">
            <div className="h-1 bg-gradient-to-r from-[#FFD21F] via-[#FFE66D] to-[#FFD21F]" />

            <div className="relative p-6 sm:p-7">
              <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-[#FFD21F]/5 blur-3xl" />

              <div className="relative">
                <div className="mb-6 flex items-center justify-center">
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-[#FFD21F]/20 bg-[#FFD21F]/10 shadow-[0_0_30px_rgba(255,210,31,0.08)]">
                    <div className="absolute inset-0 animate-pulse rounded-2xl bg-[#FFD21F]/5" />

                    {step === 1 && (
                      <Mail
                        size={21}
                        className="relative text-[#FFD21F]"
                      />
                    )}

                    {step === 2 && (
                      <ShieldCheck
                        size={21}
                        className="relative text-[#FFD21F]"
                      />
                    )}

                    {step === 3 && (
                      <Lock
                        size={21}
                        className="relative text-[#FFD21F]"
                      />
                    )}
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#FFD21F]">
                    PULSE Security
                  </p>

                  <h1 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
                    {titles[step - 1]}
                  </h1>

                  <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#9CA3AF]">
                    {subtitles[step - 1]}
                  </p>
                </div>

                <div className="mt-7 flex items-center">
                  {[1, 2, 3].map((sNum) => (
                    <div
                      key={sNum}
                      className={`flex items-center ${
                        sNum < 3
                          ? "flex-1"
                          : ""
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-black transition duration-500 ${
                          sNum < step
                            ? "border-[#FFD21F] bg-[#FFD21F] text-black shadow-[0_0_18px_rgba(255,210,31,0.16)]"
                            : sNum === step
                              ? "border-[#FFD21F] bg-[#FFD21F]/10 text-[#FFD21F] shadow-[0_0_18px_rgba(255,210,31,0.08)]"
                              : "border-[#292929] bg-[#090909] text-[#4B4B4B]"
                        }`}
                      >
                        {sNum < step ? (
                          <CheckCircle2
                            size={14}
                          />
                        ) : (
                          sNum
                        )}
                      </div>

                      {sNum < 3 && (
                        <div
                          className={`mx-2 h-px flex-1 transition duration-500 ${
                            sNum < step
                              ? "bg-[#FFD21F]"
                              : "bg-[#292929]"
                          }`}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {error && (
                  <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs font-medium leading-5 text-red-400 animate-[authMessage_0.3s_ease-out]">
                    {error}
                  </div>
                )}

                {message && (
                  <div className="mt-5 rounded-2xl border border-[#FFD21F]/20 bg-[#FFD21F]/10 px-4 py-3 text-xs font-medium leading-5 text-[#FFD21F] animate-[authMessage_0.3s_ease-out]">
                    {message}
                  </div>
                )}

                {step === 1 && (
                  <form
                    onSubmit={sendCode}
                    className="mt-6 space-y-5 animate-[stepIn_0.35s_ease-out]"
                  >
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
                        Email address
                      </label>

                      <div className="group relative">
                        <Mail
                          size={17}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4B4B4B] transition duration-300 group-focus-within:text-[#FFD21F]"
                        />

                        <input
                          className={`${authInputCls} pl-11`}
                          type="email"
                          required
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) =>
                            setEmail(
                              e.target.value
                            )
                          }
                        />
                      </div>
                    </div>

                    <AuthButton disabled={busy}>
                      {busy ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                          Sending code...
                        </>
                      ) : (
                        <>
                          Send reset code
                          <ArrowRight
                            size={16}
                            className="transition-transform duration-300 group-hover:translate-x-1"
                          />
                        </>
                      )}
                    </AuthButton>
                  </form>
                )}

                {step === 2 && (
                  <form
                    onSubmit={verifyOtp}
                    className="mt-6 space-y-5 animate-[stepIn_0.35s_ease-out]"
                  >
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
                        Verification code
                      </label>

                      <input
                        className={`${authInputCls} text-center text-lg font-black tracking-[0.4em]`}
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        required
                        placeholder="000000"
                        value={otp}
                        onChange={(e) =>
                          setOtp(
                            e.target.value
                              .replace(
                                /\D/g,
                                ""
                              )
                              .slice(0, 6)
                          )
                        }
                      />
                    </div>

                    <p className="rounded-xl border border-[#292929] bg-[#090909] px-4 py-3 text-center text-xs text-[#6B7280]">
                      Verification code sent to{" "}
                      <span className="font-semibold text-[#FFD21F]">
                        {email}
                      </span>
                    </p>

                    <AuthButton disabled={busy}>
                      {busy ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                          Verifying...
                        </>
                      ) : (
                        <>
                          Verify code
                          <ArrowRight
                            size={16}
                            className="transition-transform duration-300 group-hover:translate-x-1"
                          />
                        </>
                      )}
                    </AuthButton>

                    <button
                      type="button"
                      onClick={() => {
                        setStep(1);
                        setOtp("");
                        setError("");
                        setMessage("");
                      }}
                      className="group w-full text-xs font-semibold text-[#9CA3AF] transition duration-300 hover:text-[#FFD21F]"
                    >
                      <span className="inline-flex items-center gap-2">
                        <ArrowLeft
                          size={13}
                          className="transition-transform duration-300 group-hover:-translate-x-0.5"
                        />
                        Use a different email
                      </span>
                    </button>
                  </form>
                )}

                {step === 3 && (
                  <form
                    onSubmit={reset}
                    className="mt-6 space-y-5 animate-[stepIn_0.35s_ease-out]"
                  >
                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
                        New password
                      </label>

                      <div className="group relative">
                        <Lock
                          size={17}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4B4B4B] transition duration-300 group-focus-within:text-[#FFD21F]"
                        />

                        <input
                          className={`${authInputCls} pl-11 pr-11`}
                          type={
                            showPw
                              ? "text"
                              : "password"
                          }
                          minLength={8}
                          required
                          placeholder="Min. 8 characters"
                          value={pw}
                          onChange={(e) =>
                            setPw(
                              e.target.value
                            )
                          }
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPw(!showPw)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] transition duration-300 hover:text-[#FFD21F]"
                        >
                          {showPw ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
                        Confirm password
                      </label>

                      <div className="group relative">
                        <Lock
                          size={17}
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4B4B4B]"
                        />

                        <input
                          className={`${authInputCls} pl-11 pr-11 ${
                            pw2 &&
                            pw2 === pw
                              ? "border-green-500/50"
                              : pw2
                                ? "border-red-500/50"
                                : ""
                          }`}
                          type={
                            showPw
                              ? "text"
                              : "password"
                          }
                          minLength={8}
                          required
                          placeholder="Re-enter password"
                          value={pw2}
                          onChange={(e) =>
                            setPw2(
                              e.target.value
                            )
                          }
                        />

                        {pw2 && (
                          <span
                            className={`absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-sm font-black ${
                              pw2 === pw
                                ? "bg-green-500/10 text-green-400"
                                : "bg-red-500/10 text-red-400"
                            }`}
                          >
                            {pw2 === pw
                              ? "✓"
                              : "✗"}
                          </span>
                        )}
                      </div>
                    </div>

                    <AuthButton
                      disabled={
                        busy ||
                        !pw ||
                        !pw2 ||
                        pw !== pw2
                      }
                    >
                      {busy ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                          Resetting...
                        </>
                      ) : (
                        <>
                          Reset password
                          <ArrowRight
                            size={16}
                            className="transition-transform duration-300 group-hover:translate-x-1"
                          />
                        </>
                      )}
                    </AuthButton>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          @keyframes authFadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes authMessage {
            from {
              opacity: 0;
              transform: translateY(-6px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes stepIn {
            from {
              opacity: 0;
              transform: translateX(10px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}
      </style>
    </div>
  );
}