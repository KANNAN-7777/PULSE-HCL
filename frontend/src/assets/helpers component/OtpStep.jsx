import { useEffect, useState } from "react";
import { Mail, RefreshCw, ShieldCheck } from "lucide-react";
import { AuthButton } from "./UIElements.jsx";

export default function OtpStep({
  email,
  onSubmit,
  onResend,
  submitText = "Verify",
}) {
  const [otp, setOtp] = useState("");
  const [left, setLeft] = useState(60);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (left <= 0) {
      return;
    }

    const timer = setTimeout(() => {
      setLeft((current) => current - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [left]);

  const submit = async (event) => {
    event.preventDefault();

    setError("");
    setBusy(true);

    try {
      await onSubmit(otp);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Invalid or expired OTP"
      );
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setError("");
    setResending(true);

    try {
      await onResend();

      setOtp("");
      setLeft(60);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          error.response?.data?.error ||
          "Could not resend the code."
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="group relative overflow-hidden rounded-2xl border border-[#292929] bg-[#111111] p-4 transition-all duration-300 hover:border-[#FFD21F]/25 hover:bg-[#151515]">
        <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#FFD21F]/5 blur-2xl transition-all duration-500 group-hover:bg-[#FFD21F]/10" />

        <div className="relative flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#FFD21F]/20 bg-[#FFD21F]/10 text-[#FFD21F] transition-all duration-300 group-hover:scale-105 group-hover:border-[#FFD21F]/40 group-hover:shadow-[0_0_18px_rgba(255,210,31,0.12)]">
            <Mail size={15} />
          </span>

          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
              Code sent to
            </p>

            <p className="mt-1 truncate text-sm font-semibold text-white">
              {email}
            </p>
          </div>

          <div className="ml-auto hidden shrink-0 items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-emerald-400 sm:flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            Secure
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400 animate-[otpError_0.3s_ease-out]">
          <ShieldCheck
            size={17}
            className="mt-0.5 shrink-0 rotate-180"
          />

          <span className="leading-5">
            {error}
          </span>
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
          Verification code
        </label>

        <div className="relative">
          <input
            className="w-full rounded-2xl border border-[#292929] bg-[#090909] px-4 py-4 text-center text-2xl font-black tracking-[0.45em] text-white outline-none transition-all duration-300 placeholder:text-[#444444] hover:border-[#3A3A3A] focus:border-[#FFD21F]/60 focus:ring-4 focus:ring-[#FFD21F]/5 focus:shadow-[0_0_25px_rgba(255,210,31,0.07)]"
            inputMode="numeric"
            maxLength={6}
            pattern="[0-9]{6}"
            placeholder="······"
            value={otp}
            onChange={(event) =>
              setOtp(
                event.target.value
                  .replace(/\D/g, "")
                  .slice(0, 6)
              )
            }
            required
          />

          {otp.length === 6 && (
            <div className="pointer-events-none absolute right-4 top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full bg-[#FFD21F]/10 p-1.5 text-[#FFD21F] animate-[otpSuccess_0.3s_ease-out]">
              <ShieldCheck size={16} />
            </div>
          )}
        </div>

        <div className="flex justify-center gap-2 pt-2">
          {Array.from({ length: 6 }).map(
            (_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-all duration-300 ${
                  index < otp.length
                    ? "scale-125 bg-[#FFD21F] shadow-[0_0_10px_rgba(255,210,31,0.5)]"
                    : "bg-[#292929]"
                }`}
              />
            )
          )}
        </div>
      </div>

      <div className="text-center">
        {left > 0 ? (
          <p className="text-xs text-[#9CA3AF]">
            Resend code{" "}
            <span className="font-bold tabular-nums text-[#FFD21F]">
              in {left}s
            </span>
          </p>
        ) : (
          <button
            type="button"
            onClick={resend}
            disabled={resending}
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold text-[#FFD21F] transition-all duration-200 hover:bg-[#FFD21F]/5 hover:text-[#FFE66D] disabled:opacity-50"
          >
            <RefreshCw
              size={13}
              className={
                resending
                  ? "animate-spin"
                  : "transition-transform duration-300 group-hover:rotate-180"
              }
            />

            {resending
              ? "Sending..."
              : "Resend code"}
          </button>
        )}
      </div>

      <AuthButton
        type="submit"
        disabled={
          busy || otp.length !== 6
        }
      >
        {busy ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
            Verifying...
          </>
        ) : (
          <>
            <ShieldCheck
              size={16}
              className="transition-transform duration-300"
            />
            {submitText}
          </>
        )}
      </AuthButton>

      <style>{`
        @keyframes otpError {
          0% {
            opacity: 0;
            transform: translateY(-6px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes otpSuccess {
          0% {
            opacity: 0;
            transform: translateY(-50%) scale(0.6);
          }
          70% {
            transform: translateY(-50%) scale(1.15);
          }
          100% {
            opacity: 1;
            transform: translateY(-50%) scale(1);
          }
        }
      `}</style>
    </form>
  );
}