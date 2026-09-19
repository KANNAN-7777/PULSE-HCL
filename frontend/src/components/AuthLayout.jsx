
import {
  Radio,
  Users,
  BarChart3,
  Zap,
  Check,
  PieChart,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

function PulseLogo() {
  return (
    <div className="flex items-center gap-3 group cursor-pointer">
      <img
        src="/pulse-logo.png"
        alt="PULSE"
        className="h-16 w-auto object-contain transition-transform duration-500 group-hover:scale-105 sm:h-20"
      />
      <div>
        <p className="text-[9px] font-bold uppercase tracking-[0.22em] text-gray-400 transition-colors duration-300 group-hover:text-[#FFD21F] sm:text-[10px] sm:tracking-[0.28em]">
          LIVE POLLING PLATFORM
        </p>
      </div>
    </div>
  );
}

function FloatingCard({
  type,
  className = "",
  delay = 1.2,
  enterFrom = "enterFromTop",
}) {
  const enterDuration = 4;
  const pulseDelay = delay + enterDuration;
  const floatSpeed = type === "live" ? "5s" : "6s";

  const animStyle = `${enterFrom} ${enterDuration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s forwards, pulseFloat ${floatSpeed} ease-in-out infinite ${pulseDelay}s`;

  if (type === "live") {
    return (
      <div
        className={`absolute z-20 cursor-pointer rounded-2xl border border-[#FFD21F]/30 bg-[#111111]/90 px-3 py-2.5 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:scale-110 hover:border-[#FFD21F]/60 sm:px-4 sm:py-3 opacity-0 ${className}`}
        style={{ animation: animStyle }}
      >
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FFD21F]/15 transition-transform duration-300 hover:rotate-12 sm:h-10 sm:w-10">
            <Users className="h-4 w-4 text-[#FFD21F] sm:h-5 sm:w-5" />
          </div>

          <div>
            <p className="text-xs font-bold text-white sm:text-sm">
              Live Voting
            </p>
            <p className="text-[9px] text-gray-400 sm:text-[11px]">
              Real-time results
            </p>
          </div>

          <span className="ml-1 h-2 w-2 animate-pulse rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]" />
        </div>
      </div>
    );
  }

  return (
    <div
      className={`absolute z-20 cursor-pointer rounded-2xl border border-[#FFD21F]/30 bg-[#111111]/90 px-3 py-2.5 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:scale-110 hover:border-[#FFD21F]/60 sm:px-4 sm:py-3 opacity-0 ${className}`}
      style={{ animation: animStyle }}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FFD21F]/15 transition-transform duration-300 hover:-rotate-12 sm:h-10 sm:w-10">
          <BarChart3 className="h-4 w-4 text-[#FFD21F] sm:h-5 sm:w-5" />
        </div>

        <div>
          <p className="text-xs font-bold text-white sm:text-sm">
            Instant Insights
          </p>
          <p className="text-[9px] text-gray-400 sm:text-[11px]">
            Data that matters
          </p>
        </div>
      </div>
    </div>
  );
}

function PollPhone() {
  return (
    <div
      className="group relative h-[330px] w-[180px] sm:h-[370px] sm:w-[205px] lg:h-[390px] lg:w-[215px]"
      style={{
        animation: "phoneFloat 5s ease-in-out infinite",
      }}
    >
      <div className="absolute inset-0 rounded-[40px] bg-gradient-to-tr from-[#FFD21F]/10 via-[#FFD21F]/30 to-transparent opacity-70 blur-3xl transition-opacity duration-500 group-hover:opacity-100" />

      <div className="absolute inset-0 rotate-[7deg] rounded-[38px] border-[5px] border-[#FFD21F]/80 bg-[#080808] p-2.5 shadow-2xl shadow-[#FFD21F]/30 transition-transform duration-500 group-hover:rotate-[5deg] group-hover:scale-[1.02] sm:p-3">
        <div className="relative h-full overflow-hidden rounded-[28px] border border-white/10 bg-[#101010]">
          <div className="pointer-events-none absolute inset-0 animate-gradient-shift bg-[linear-gradient(45deg,transparent_25%,rgba(255,210,31,0.1)_50%,transparent_75%)] bg-[length:250%_250%] opacity-20" />

          <div className="relative z-10 flex items-center justify-between border-b border-white/10 px-3 py-3 sm:px-4 sm:py-4">
            <div className="flex items-center gap-2">
              <Radio className="h-3.5 w-3.5 animate-pulse text-[#FFD21F] sm:h-4 sm:w-4" />
              <span className="text-xs font-black text-white sm:text-sm">
                PULSE
              </span>
            </div>

            <span className="h-2 w-2 animate-pulse rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.8)]" />
          </div>

          <div className="relative z-10 p-4 sm:p-5">
            <p
              className="text-[8px] font-bold uppercase tracking-wider text-gray-500 opacity-0 sm:text-[9px]"
              style={{
                animation: "slideInRight 0.4s ease-out 0.8s forwards",
              }}
            >
              LIVE POLL
            </p>

            <h3
              className="mt-2 text-sm font-bold leading-tight text-white opacity-0 sm:text-base"
              style={{
                animation: "slideInRight 0.5s ease-out 0.9s forwards",
              }}
            >
              Which feature do you like the most?
            </h3>

            <div className="mt-5 space-y-3 sm:mt-6 sm:space-y-4">
              <PollOption
                name="Design"
                value="42%"
                width="75%"
                delay="1.1s"
              />

              <PollOption
                name="Performance"
                value="28%"
                width="55%"
                delay="1.2s"
              />

              <PollOption
                name="Price"
                value="18%"
                width="38%"
                delay="1.3s"
              />

              <PollOption
                name="Other"
                value="12%"
                width="25%"
                delay="1.4s"
              />
            </div>

            <div
              className="mt-5 flex items-center gap-2 border-t border-white/10 pt-3 opacity-0 sm:mt-6 sm:pt-4"
              style={{
                animation: "authFadeIn 0.5s ease-out 1.6s forwards",
              }}
            >
              <Users className="h-3.5 w-3.5 text-gray-500 sm:h-4 sm:w-4" />

              <span className="text-[10px] text-gray-400 sm:text-xs">
                1,248 votes
              </span>
            </div>
          </div>
        </div>
      </div>

      <div
        className="absolute -right-5 top-[42%] z-30 flex h-12 w-12 cursor-pointer items-center justify-center rounded-2xl border border-[#FFD21F]/50 bg-[#FFD21F] shadow-xl shadow-[#FFD21F]/30 transition-transform hover:scale-110 sm:-right-6 sm:h-14 sm:w-14"
        style={{
          animation: "checkFloat 4s ease-in-out infinite",
        }}
      >
        <div className="absolute inset-0 animate-ping rounded-2xl border border-[#FFD21F] opacity-20" />

        <Check
          className="h-6 w-6 text-black sm:h-7 sm:w-7"
          strokeWidth={3}
        />
      </div>
    </div>
  );
}

function PollOption({ name, value, width, delay }) {
  return (
    <div
      className="group/option cursor-pointer opacity-0 transition-transform duration-300 hover:translate-x-1"
      style={{
        animation: `slideInRight 0.4s ease-out ${delay} forwards`,
      }}
    >
      <div className="mb-1 flex items-center justify-between">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="h-2 w-2 rounded-full border border-[#FFD21F] transition-colors duration-300 group-hover/option:bg-[#FFD21F] sm:h-2.5 sm:w-2.5" />

          <span className="text-[9px] text-gray-300 transition-colors duration-300 group-hover/option:text-white sm:text-[11px]">
            {name}
          </span>
        </div>

        <span className="text-[9px] font-bold text-gray-300 transition-colors duration-300 group-hover/option:text-white sm:text-[11px]">
          {value}
        </span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-gray-800">
        <div
          className="relative h-full origin-left overflow-hidden rounded-full bg-[#FFD21F]"
          style={{
            width,
            animation: `barGrow 1s cubic-bezier(0.16, 1, 0.3, 1) ${delay} both`,
          }}
        >
          <div
            className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
            style={{
              animation: "shimmer 2s infinite",
            }}
          />
        </div>
      </div>
    </div>
  );
}

function Feature({ icon, title, description, delay }) {
  return (
    <div
      className="group flex cursor-default items-center gap-3 rounded-xl p-2 opacity-0 transition-all duration-300 hover:-translate-y-2 hover:bg-white/5"
      style={{
        animation: `authFadeIn 0.6s ease-out ${delay} forwards`,
      }}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#FFD21F]/40 bg-[#FFD21F]/5 shadow-[0_0_15px_rgba(255,210,31,0.1)] transition-colors duration-300 group-hover:border-[#FFD21F] group-hover:bg-[#FFD21F]/20 sm:h-10 sm:w-10">
        {icon}
      </div>

      <div>
        <p className="text-[11px] font-bold text-white transition-colors duration-300 group-hover:text-[#FFD21F] sm:text-xs">
          {title}
        </p>

        <p className="mt-0.5 text-[9px] leading-4 text-gray-500 sm:text-[10px]">
          {description}
        </p>
      </div>
    </div>
  );
}

function TypewriterHeading() {
  const text = "Real Opinions.";
  const [displayText, setDisplayText] = useState("");
  const [index, setIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let timeout;

    if (!isDeleting && index < text.length) {
      timeout = setTimeout(() => {
        setDisplayText(text.substring(0, index + 1));
        setIndex(index + 1);
      }, 120);
    } else if (!isDeleting && index === text.length) {
      timeout = setTimeout(() => {
        setIsDeleting(true);
      }, 1800);
    } else if (isDeleting && index > 0) {
      timeout = setTimeout(() => {
        setDisplayText(text.substring(0, index - 1));
        setIndex(index - 1);
      }, 70);
    } else if (isDeleting && index === 0) {
      timeout = setTimeout(() => {
        setIsDeleting(false);
      }, 500);
    }

    return () => clearTimeout(timeout);
  }, [index, isDeleting]);

  return (
    <h1 className="text-3xl font-black leading-[1.05] tracking-tight sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl">
      <span className="block">Real People.</span>

      <span className="relative inline-block text-[#FFD21F]">
        <span className="whitespace-nowrap">
          {displayText}

          <span className="ml-1 inline-block h-[0.85em] w-[3px] translate-y-[2px] animate-cursor bg-[#FFD21F]" />
        </span>

        <div className="absolute -bottom-1 left-0 h-[4px] w-full overflow-hidden rounded-full bg-[#FFD21F]/30">
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
        </div>
      </span>
    </h1>
  );
}

function LeftContent() {
  return (
    <section className="relative overflow-hidden border-b border-white/5 bg-[#05070a] lg:min-h-screen lg:border-b-0 lg:border-r">
      <div className="pointer-events-none absolute inset-0 animate-bg-pan bg-[radial-gradient(circle_at_50%_50%,#111_0%,#05070a_100%)] bg-[length:200%_200%] opacity-50" />

      <div
        className="absolute -left-32 -top-32 h-[400px] w-[400px] rounded-full bg-[#FFD21F]/10 blur-[120px] sm:h-[450px] sm:w-[450px]"
        style={{
          animation: "glowPulse 5s ease-in-out infinite",
        }}
      />

      <div
        className="absolute -bottom-40 -left-20 h-[400px] w-[400px] rounded-full bg-[#FFD21F]/10 blur-[120px] sm:h-[450px] sm:w-[450px]"
        style={{
          animation: "glowPulse 6s ease-in-out infinite 1.5s",
        }}
      />

      <div className="absolute right-0 top-1/3 h-[300px] w-[300px] rounded-full bg-[#FFD21F]/5 blur-[100px]" />

      <div className="relative z-10 flex min-h-screen flex-col px-5 py-7 sm:px-8 sm:py-9 md:px-10 lg:px-10 lg:py-10 xl:px-14">
        <div
          style={{
            animation: "slideInDown 0.7s ease-out",
          }}
        >
          <PulseLogo />
        </div>

        <div
          className="mt-8 max-w-[440px] opacity-0 sm:mt-10 md:mt-12 lg:mt-16"
          style={{
            animation: "slideInRight 0.8s ease-out 0.2s forwards",
          }}
        >
          <TypewriterHeading />

          <p className="mt-4 max-w-[400px] text-xs leading-6 text-gray-400 sm:mt-5 sm:text-sm sm:leading-7 md:text-base lg:mt-6">
            Create polls, gather instant feedback and make smarter decisions
            with PULSE — the live polling platform.
          </p>
        </div>

        <div className="relative mt-12 flex min-h-[400px] flex-1 items-center justify-center lg:mt-4">
          <FloatingCard
            type="live"
            delay={1.0}
            enterFrom="enterFromTop"
            className="absolute left-0 top-0 sm:left-[10%] lg:left-[5%] xl:left-[15%]"
          />

          <FloatingCard
            type="insights"
            delay={1.3}
            enterFrom="enterFromRight"
            className="absolute right-0 top-12 sm:right-[10%] lg:right-[5%] lg:top-10 xl:right-[15%]"
          />

          <div
            className="relative z-10 opacity-0"
            style={{
              animation: "authFadeIn 0.6s ease-out 0.2s forwards",
            }}
          >
            <PollPhone />
          </div>

          <div
            className="absolute bottom-5 left-0 cursor-pointer rounded-2xl border border-[#FFD21F]/30 bg-[#111111]/90 px-3 py-2.5 backdrop-blur-xl transition-transform duration-300 hover:scale-110 opacity-0 sm:bottom-8 sm:left-[10%] sm:px-4 sm:py-3 lg:bottom-10 lg:left-[5%] xl:left-[15%]"
            style={{
              animation:
                "enterFromLeft 4s cubic-bezier(0.16, 1, 0.3, 1) 1.6s forwards, pulseFloat 5s ease-in-out infinite 5.6s",
            }}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#FFD21F] transition-transform duration-300 hover:rotate-180 sm:h-10 sm:w-10">
                <PieChart className="h-4 w-4 text-black sm:h-5 sm:w-5" />
              </div>

              <div>
                <p className="text-[10px] font-bold text-white sm:text-xs">
                  Your Voice Matters
                </p>

                <p className="text-[8px] text-gray-500 sm:text-[10px]">
                  Every vote counts
                </p>
              </div>
            </div>
          </div>

          <div
            className="absolute bottom-5 right-0 cursor-pointer rounded-2xl border border-[#FFD21F]/30 bg-[#111111]/90 px-3 py-2.5 backdrop-blur-xl transition-transform duration-300 hover:scale-110 opacity-0 sm:bottom-8 sm:right-[10%] lg:bottom-16 lg:right-[0%] xl:right-[10%]"
            style={{
              animation:
                "enterFromBottom 4s cubic-bezier(0.16, 1, 0.3, 1) 1.9s forwards, pulseFloat 6s ease-in-out infinite 5.9s",
            }}
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <Users className="h-4 w-4 animate-pulse text-[#FFD21F] sm:h-5 sm:w-5" />

              <div>
                <p className="text-base font-black text-white sm:text-lg">
                  1.2K+
                </p>

                <p className="text-[8px] text-gray-500 sm:text-[9px]">
                  Active Users
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 pb-2 sm:grid-cols-3 sm:gap-5 lg:mt-auto">
          <Feature
            icon={<Zap className="h-4 w-4 text-[#FFD21F] sm:h-5 sm:w-5" />}
            title="Live Polls"
            description="Real-time responses."
            delay="1.2s"
          />

          <Feature
            icon={<Users className="h-4 w-4 text-[#FFD21F] sm:h-5 sm:w-5" />}
            title="Better Engagement"
            description="Every voice counts."
            delay="1.3s"
          />

          <Feature
            icon={
              <BarChart3 className="h-4 w-4 text-[#FFD21F] sm:h-5 sm:w-5" />
            }
            title="Instant Results"
            description="Clear live analytics."
            delay="1.4s"
          />
        </div>
      </div>
    </section>
  );
}

export default function AuthLayout({ children }) {
  const location = useLocation();

  const isLoginPage = location.pathname === "/login";
  const isRegisterPage = location.pathname === "/register";

  return (
    <>
      {isLoginPage && (
        <div className="fixed right-4 top-4 z-[100] sm:right-6 sm:top-6 lg:hidden">
          <Link
            to="/register"
            className="group flex items-center gap-2 rounded-xl border border-[#FFD21F]/30 bg-[#111111]/90 px-4 py-2.5 text-xs font-bold text-white shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-[#FFD21F]/70 hover:bg-[#FFD21F]/10 hover:text-[#FFD21F] hover:shadow-[0_0_20px_rgba(255,210,31,0.15)]"
          >
            Sign Up
            <span className="text-[#FFD21F] transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      )}

      {isRegisterPage && (
        <div className="fixed right-4 top-4 z-[100] sm:right-6 sm:top-6 lg:hidden">
          <Link
            to="/login"
            className="group flex items-center gap-2 rounded-xl border border-[#FFD21F]/30 bg-[#111111]/90 px-4 py-2.5 text-xs font-bold text-white shadow-xl backdrop-blur-xl transition-all duration-300 hover:border-[#FFD21F]/70 hover:bg-[#FFD21F]/10 hover:text-[#FFD21F] hover:shadow-[0_0_20px_rgba(255,210,31,0.15)]"
          >
            Login
            <span className="text-[#FFD21F] transition-transform duration-300 group-hover:-translate-x-1">
              ←
            </span>
          </Link>
        </div>
      )}

      <style>
        {`
          @keyframes enterFromTop {
            from {
              opacity: 0;
              transform: translateY(-180px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes enterFromBottom {
            from {
              opacity: 0;
              transform: translateY(180px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes enterFromLeft {
            from {
              opacity: 0;
              transform: translateX(-180px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes enterFromRight {
            from {
              opacity: 0;
              transform: translateX(180px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes phoneFloat {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-14px);
            }
          }

          @keyframes pulseFloat {
            0%, 100% {
              transform: translateY(0px) rotate(0deg);
            }
            50% {
              transform: translateY(-12px) rotate(2deg);
            }
          }

          @keyframes checkFloat {
            0%, 100% {
              transform: translateY(0px) rotate(7deg);
            }
            50% {
              transform: translateY(-10px) rotate(7deg);
            }
          }

          @keyframes barGrow {
            from {
              transform: scaleX(0);
            }
            to {
              transform: scaleX(1);
            }
          }

          @keyframes glowPulse {
            0%, 100% {
              opacity: 0.25;
              transform: scale(1);
            }
            50% {
              opacity: 0.55;
              transform: scale(1.08);
            }
          }

          @keyframes authFadeIn {
            from {
              opacity: 0;
              transform: translateY(12px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes slideInRight {
            from {
              opacity: 0;
              transform: translateX(-20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes slideInLeft {
            from {
              opacity: 0;
              transform: translateX(30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          @keyframes slideInDown {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes scaleUp {
            from {
              opacity: 0;
              transform: scale(0.85);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes shimmer {
            100% {
              transform: translateX(100%);
            }
          }

          @keyframes typing {
            from {
              width: 0ch;
            }
            to {
              width: 14ch;
            }
          }

          @keyframes blinkCursor {
            0%, 100% {
              border-color: #FFD21F;
            }
            50% {
              border-color: transparent;
            }
          }

          .animate-gradient-shift {
            animation: gradientShift 6s ease infinite;
          }

          @keyframes gradientShift {
            0% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
            100% {
              background-position: 0% 50%;
            }
          }

          .animate-bg-pan {
            animation: bgPan 20s linear infinite;
          }

          @keyframes bgPan {
            0% {
              background-position: 0% 0%;
            }
            50% {
              background-position: 100% 100%;
            }
            100% {
              background-position: 0% 0%;
            }
          }

          @media (prefers-reduced-motion: reduce) {
            *,
            *::before,
            *::after {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }
        `}
      </style>

      <div className="min-h-screen overflow-x-hidden overflow-y-auto bg-[#05070a] text-white">
        <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
          <LeftContent />

          <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#070b10] px-5 py-8 sm:px-8">
            <div
              className="pointer-events-none absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-[#FFD21F]/5 blur-[120px]"
              style={{
                animation: "glowPulse 8s ease-in-out infinite",
              }}
            />

            <div
              className="relative z-10 w-full max-w-md opacity-0"
              style={{
                animation:
                  "slideInLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards",
              }}
            >
              {children}
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
