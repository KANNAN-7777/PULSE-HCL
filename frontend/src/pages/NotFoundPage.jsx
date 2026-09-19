import { Link } from "react-router-dom";
import { ArrowLeft, Radio, Sparkles } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050505] px-5 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,210,31,0.10),transparent_35%)]" />

      <div className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FFD21F]/5 blur-[120px] animate-[notFoundGlow_5s_ease-in-out_infinite]" />

      <div className="relative w-full max-w-lg text-center animate-[notFoundIn_0.5s_ease-out]">
        <div className="group relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-[#FFD21F]/20 bg-[#111111] shadow-[0_0_50px_rgba(255,210,31,0.08)] transition-all duration-500 hover:scale-105 hover:border-[#FFD21F]/40 hover:shadow-[0_0_60px_rgba(255,210,31,0.14)]">
          <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[#FFD21F]/5 opacity-0 blur-xl transition-opacity duration-500 group-hover:opacity-100" />

          <Radio
            className="relative h-8 w-8 text-[#FFD21F] animate-[radioPulse_2.5s_ease-in-out_infinite]"
          />

          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#050505] bg-[#FFD21F] text-black">
            <Sparkles size={9} />
          </span>
        </div>

        <div className="mt-8">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-[#FFD21F]">
            PULSE
          </p>

          <p className="mt-3 text-8xl font-black tracking-[-0.06em] text-[#FFD21F] drop-shadow-[0_0_25px_rgba(255,210,31,0.15)] animate-[numberPulse_3s_ease-in-out_infinite]">
            404
          </p>

          <h1 className="mt-5 text-3xl font-black text-white">
            Page not found
          </h1>

          <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-[#9CA3AF]">
            The page you're looking for doesn't exist or has
            been moved.
          </p>

          <Link
            to="/dashboard"
            className="group mt-8 inline-flex items-center gap-2 rounded-xl bg-[#FFD21F] px-6 py-3 text-sm font-black text-black shadow-[0_0_25px_rgba(255,210,31,0.10)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#FFE66D] hover:shadow-[0_0_30px_rgba(255,210,31,0.16)] active:translate-y-0 active:scale-95"
          >
            <ArrowLeft
              className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1"
            />
            Back to Dashboard
          </Link>

          <div className="mx-auto mt-8 flex w-fit items-center gap-2 rounded-full border border-[#292929] bg-[#111111]/80 px-3 py-1.5 backdrop-blur">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.55)]" />

            <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-600">
              PULSE system online
            </span>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes notFoundIn {
          from {
            opacity: 0;
            transform: translateY(14px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes notFoundGlow {
          0%,
          100% {
            opacity: 0.45;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 0.8;
            transform: translate(-50%, -50%) scale(1.08);
          }
        }

        @keyframes radioPulse {
          0%,
          100% {
            transform: scale(1);
            filter: drop-shadow(0 0 0 rgba(255, 210, 31, 0));
          }
          50% {
            transform: scale(1.08);
            filter: drop-shadow(0 0 8px rgba(255, 210, 31, 0.35));
          }
        }

        @keyframes numberPulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.88;
          }
        }
      `}</style>
    </div>
  );
}