import { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Radio,
  RefreshCw,
  Vote,
  BarChart3,
} from "lucide-react";
import Layout from "../components/Layout";
import api from "../utils/api";

export default function VotedPollsPage() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const location = useLocation();

  const loadVotedPolls = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/polls/voted");

      const data = response.data?.polls;

      if (!Array.isArray(data)) {
        setPolls([]);
        return;
      }

      setPolls(data);
    } catch (err) {
      console.error("Voted polls error:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load voted polls."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVotedPolls();
  }, [loadVotedPolls, location.pathname]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadVotedPolls();
      }
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, [loadVotedPolls]);

  return (
    <Layout>
      <div className="relative mx-auto max-w-4xl overflow-hidden px-4 py-6 pb-8">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(255,210,31,0.08),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(64,144,240,0.05),transparent_32%)]" />

        <div className="pointer-events-none absolute right-[5%] top-[5%] h-40 w-40 rounded-full bg-[#FFD21F]/5 blur-3xl" />

        <div className="pointer-events-none absolute bottom-[15%] left-[3%] h-36 w-36 rounded-full bg-[#4090F0]/5 blur-3xl" />

        <Link
          to="/dashboard"
          className="group inline-flex items-center gap-2 text-sm font-medium text-[#9CA3AF] transition duration-300 hover:-translate-x-0.5 hover:text-[#FFD21F]"
        >
          <ArrowLeft
            className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5"
          />
          Back to Dashboard
        </Link>

        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="animate-[fadeInUp_0.45s_ease-out]">
            <div className="flex items-center gap-3">
              <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-[#FFD21F]/20 bg-[#FFD21F]/10 shadow-[0_0_25px_rgba(255,210,31,0.08)]">
                <div className="absolute inset-0 animate-pulse rounded-2xl bg-[#FFD21F]/5" />

                <Vote className="relative h-6 w-6 text-[#FFD21F]" />
              </div>

              <div>
                <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                  Voted Polls
                </h1>

                <p className="mt-1 text-sm text-[#9CA3AF]">
                  Polls you have already voted in.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={loadVotedPolls}
            disabled={loading}
            className="group inline-flex items-center justify-center gap-2 rounded-xl border border-[#292929] bg-[#111111] px-4 py-2.5 text-sm font-semibold text-[#9CA3AF] shadow-[0_10px_30px_rgba(0,0,0,0.18)] transition duration-300 hover:-translate-y-0.5 hover:border-[#FFD21F]/40 hover:bg-[#151515] hover:text-[#FFD21F] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 transition ${
                loading ? "animate-spin" : "group-hover:rotate-45"
              }`}
            />
            Refresh
          </button>
        </div>

        {loading && (
          <div className="flex min-h-[350px] items-center justify-center">
            <div className="flex flex-col items-center gap-4 animate-[fadeIn_0.4s_ease-out]">
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-[#FFD21F]/20 bg-[#FFD21F]/10">
                <div className="absolute inset-0 animate-ping rounded-2xl bg-[#FFD21F]/5" />

                <Loader2 className="relative h-6 w-6 animate-spin text-[#FFD21F]" />
              </div>

              <div className="text-center">
                <p className="text-sm font-bold text-white">
                  Loading voted polls
                </p>

                <p className="mt-1 text-xs text-[#6B7280]">
                  Fetching your voting history...
                </p>
              </div>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="mt-6 overflow-hidden rounded-3xl border border-red-500/20 bg-[#111111] shadow-[0_20px_60px_rgba(0,0,0,0.30)] animate-[fadeInUp_0.4s_ease-out]">
            <div className="h-1 bg-red-500/70" />

            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10">
                  <BarChart3 className="h-5 w-5 text-red-400" />
                </div>

                <div>
                  <p className="text-sm font-bold text-red-400">
                    Unable to load voted polls
                  </p>

                  <p className="mt-1 text-sm leading-6 text-[#9CA3AF]">
                    {error}
                  </p>
                </div>
              </div>

              <button
                onClick={loadVotedPolls}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#FFD21F] px-4 py-2.5 text-sm font-bold text-black transition duration-300 hover:-translate-y-0.5 hover:bg-[#FFE66D]"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
            </div>
          </div>
        )}

        {!loading && !error && polls.length === 0 && (
          <div className="relative mt-6 overflow-hidden rounded-3xl border border-[#292929] bg-[#111111] p-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.25)] animate-[fadeInUp_0.45s_ease-out]">
            <div className="absolute left-1/2 top-0 h-44 w-44 -translate-x-1/2 rounded-full bg-[#FFD21F]/5 blur-3xl" />

            <div className="relative">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#FFD21F]/20 bg-[#FFD21F]/10">
                <CheckCircle2 className="h-8 w-8 text-[#FFD21F]" />
              </div>

              <h2 className="mt-5 text-lg font-black text-white">
                No voted polls yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#9CA3AF]">
                Polls you vote in will appear here automatically.
              </p>

              <Link
                to="/dashboard"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#FFD21F] px-5 py-3 text-sm font-bold text-black shadow-[0_10px_30px_rgba(255,210,31,0.10)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#FFE66D] hover:shadow-[0_14px_35px_rgba(255,210,31,0.18)]"
              >
                Go to Dashboard
              </Link>
            </div>
          </div>
        )}

        {!loading && !error && polls.length > 0 && (
          <div className="mt-6 space-y-4">
            {polls.map((item, index) => {
              const poll = item?.poll;

              if (!poll) {
                return null;
              }

              const pollId = poll.id || poll._id;

              const totalVotes = Number(
                item?.total_votes || 0
              );

              const selectedPercentage = Number(
                item?.selected_percentage || 0
              );

              const options = Array.isArray(item?.options)
                ? item.options
                : [];

              return (
                <div
                  key={`${pollId}-${index}`}
                  className="group relative overflow-hidden rounded-3xl border border-[#292929] bg-[#111111] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.22)] transition duration-500 hover:-translate-y-1 hover:border-[#FFD21F]/20 sm:p-6"
                  style={{
                    animation: `fadeInUp 0.45s ease-out ${
                      index * 70
                    }ms both`,
                  }}
                >
                  <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-[#FFD21F]/5 blur-3xl transition duration-500 group-hover:bg-[#FFD21F]/10" />

                  <div className="relative">
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-green-400">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />

                        <Radio className="h-3.5 w-3.5" />

                        LIVE
                      </span>

                      <span className="rounded-full border border-[#292929] bg-[#090909] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                        {poll.category || "General"}
                      </span>
                    </div>

                    <h2 className="text-base font-black leading-7 text-white sm:text-lg">
                      {poll.question}
                    </h2>

                    <div className="mt-5 rounded-2xl border border-[#292929] bg-[#090909] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-[#6B7280]">
                          Your Vote
                        </p>

                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-500/10">
                          <CheckCircle2 className="h-4 w-4 text-green-400" />
                        </div>
                      </div>

                      <p className="mt-2 text-sm font-black text-[#FFD21F]">
                        {item.selected_option ||
                          "Selected option"}
                      </p>

                      <p className="mt-2 text-xs text-[#9CA3AF]">
                        {selectedPercentage.toFixed(1)}% of votes
                      </p>

                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#292929]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#FFD21F] to-[#FFE66D] shadow-[0_0_15px_rgba(255,210,31,0.20)] transition-all duration-700"
                          style={{
                            width: `${Math.min(
                              Math.max(
                                selectedPercentage,
                                0
                              ),
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    {options.length > 0 && (
                      <div className="mt-5">
                        <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
                          <BarChart3 className="h-3.5 w-3.5 text-[#4090F0]" />
                          Current Results
                        </p>

                        <div className="space-y-3">
                          {options.map((option) => {
                            const percentage = Number(
                              option?.percentage || 0
                            );

                            const isSelected =
                              option.text ===
                              item.selected_option;

                            return (
                              <div
                                key={option.id}
                                className={`rounded-2xl border p-3 transition duration-300 ${
                                  isSelected
                                    ? "border-[#FFD21F]/20 bg-[#FFD21F]/5"
                                    : "border-[#292929] bg-[#090909] hover:border-[#3A3A3A]"
                                }`}
                              >
                                <div className="mb-2 flex items-center justify-between gap-3">
                                  <span
                                    className={`min-w-0 text-sm ${
                                      isSelected
                                        ? "font-bold text-[#FFD21F]"
                                        : "text-[#D1D5DB]"
                                    }`}
                                  >
                                    <span className="truncate">
                                      {option.text}
                                    </span>

                                    {isSelected && (
                                      <span className="ml-2 inline-flex rounded-full border border-[#FFD21F]/20 bg-[#FFD21F]/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#FFD21F]">
                                        Your choice
                                      </span>
                                    )}
                                  </span>

                                  <span className="shrink-0 text-xs text-[#9CA3AF]">
                                    {option.votes} votes
                                  </span>
                                </div>

                                <div className="h-2 overflow-hidden rounded-full bg-[#292929]">
                                  <div
                                    className={`h-full rounded-full transition-all duration-700 ${
                                      isSelected
                                        ? "bg-gradient-to-r from-[#FFD21F] to-[#FFE66D] shadow-[0_0_15px_rgba(255,210,31,0.20)]"
                                        : "bg-[#4090F0]/70"
                                    }`}
                                    style={{
                                      width: `${Math.min(
                                        Math.max(
                                          percentage,
                                          0
                                        ),
                                        100
                                      )}%`,
                                    }}
                                  />
                                </div>

                                <p className="mt-1.5 text-xs text-[#6B7280]">
                                  {percentage.toFixed(1)}%
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="mt-5 flex flex-col gap-3 border-t border-[#292929] pt-4 sm:flex-row sm:items-center sm:justify-between">
                      <span className="text-xs font-medium text-[#9CA3AF]">
                        Total votes:{" "}
                        <span className="font-bold text-white">
                          {totalVotes}
                        </span>
                      </span>

                      {pollId && (
                        <Link
                          to={`/poll/${pollId}`}
                          className="group/link inline-flex items-center justify-center gap-1 text-sm font-bold text-[#FFD21F] transition hover:text-[#FFE66D]"
                        >
                          View Poll
                          <span className="transition-transform duration-300 group-hover/link:translate-x-1">
                            →
                          </span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(8px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(14px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </Layout>
  );
}