import { Radio } from "lucide-react";

export default function PollResults({
  poll,
  showHeader = true,
}) {
  const totalVotes =
    poll?.options?.reduce(
      (total, option) =>
        total +
        (Number(option.votes) || 0),
      0
    ) || 0;

  if (!poll) {
    return (
      <div className="group relative overflow-hidden rounded-3xl border border-[#292929] bg-[#111111] p-8 text-center shadow-[0_15px_45px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-1 hover:border-[#FFD21F]/25 hover:bg-[#151515]">
        <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-[#FFD21F]/5 blur-3xl transition-all duration-500 group-hover:bg-[#FFD21F]/10" />

        <div className="relative mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[#FFD21F]/20 bg-[#090909] text-[#FFD21F] shadow-[0_0_20px_rgba(255,210,31,0.05)] transition-all duration-300 group-hover:scale-105 group-hover:border-[#FFD21F]/40">
          <Radio className="h-5 w-5 animate-pulse" />
        </div>

        <p className="relative mt-4 text-sm text-[#9CA3AF]">
          No poll results available.
        </p>
      </div>
    );
  }

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-[#292929] bg-[#111111] shadow-[0_15px_45px_rgba(0,0,0,0.22)] transition-all duration-500 hover:-translate-y-1 hover:border-[#FFD21F]/25 hover:bg-[#151515] hover:shadow-[0_22px_55px_rgba(0,0,0,0.3)]">
      <div className="h-1 bg-gradient-to-r from-[#FFD21F] via-[#FFE66D] to-[#4090F0] transition-all duration-500 group-hover:h-1.5" />

      <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-[#FFD21F]/0 blur-3xl transition-all duration-700 group-hover:bg-[#FFD21F]/5" />

      <div className="relative p-6">
        {showHeader && (
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.65)]" />

              <Radio
                size={16}
                className="text-emerald-400"
              />

              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                Live Results
              </span>
            </div>

            <span className="rounded-full border border-[#292929] bg-[#090909] px-3 py-1.5 text-xs font-semibold tabular-nums text-[#9CA3AF]">
              {totalVotes} votes
            </span>
          </div>
        )}

        <h2 className="mt-5 text-xl font-bold leading-8 text-white transition-colors duration-300 group-hover:text-[#FFE66D]">
          {poll.question}
        </h2>

        <div className="mt-7 space-y-5">
          {poll.options?.map(
            (option, index) => {
              const votes =
                Number(option.votes) ||
                0;

              const percentage =
                totalVotes === 0
                  ? 0
                  : Math.round(
                      (votes /
                        totalVotes) *
                        100
                    );

              return (
                <div
                  key={
                    option.id ||
                    option._id ||
                    option.text
                  }
                  className="animate-[pollResultIn_0.45s_ease-out_both]"
                  style={{
                    animationDelay: `${index * 80}ms`,
                  }}
                >
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <span className="min-w-0 truncate text-sm font-semibold text-[#D1D5DB] transition-colors duration-200 group-hover:text-zinc-200">
                      {option.text}
                    </span>

                    <span className="shrink-0 rounded-lg bg-[#FFD21F]/10 px-2 py-1 text-xs font-bold tabular-nums text-[#FFD21F]">
                      {percentage}%
                    </span>
                  </div>

                  <div className="relative h-3 overflow-hidden rounded-full bg-[#292929]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#FFD21F] via-[#FFE66D] to-[#FFD21F] shadow-[0_0_15px_rgba(255,210,31,0.18)] transition-all duration-700 ease-out"
                      style={{
                        width: `${percentage}%`,
                        backgroundSize: "200% 100%",
                        animation:
                          percentage > 0
                            ? "pollBarGlow 2.5s ease-in-out infinite"
                            : undefined,
                      }}
                    />

                    {percentage > 0 && (
                      <div
                        className="pointer-events-none absolute inset-y-0 left-0 rounded-full bg-white/20"
                        style={{
                          width: `${Math.min(
                            percentage,
                            35
                          )}%`,
                          animation:
                            "pollBarShine 2s ease-in-out infinite",
                        }}
                      />
                    )}
                  </div>

                  <p className="mt-1.5 text-[10px] text-[#666666] tabular-nums transition-colors duration-200 group-hover:text-[#777777]">
                    {votes} votes
                  </p>
                </div>
              );
            }
          )}
        </div>
      </div>

      <style>{`
        @keyframes pollResultIn {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pollBarGlow {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes pollBarShine {
          0% {
            opacity: 0;
            transform: translateX(-20px);
          }
          35% {
            opacity: 0.7;
          }
          70% {
            opacity: 0;
            transform: translateX(220px);
          }
          100% {
            opacity: 0;
            transform: translateX(220px);
          }
        }
      `}</style>
    </div>
  );
}