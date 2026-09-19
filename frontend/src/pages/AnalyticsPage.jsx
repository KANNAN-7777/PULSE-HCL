import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  Loader2,
  Radio,
  RefreshCw,
  Users,
  Activity,
} from "lucide-react";

import Layout from "../components/Layout";
import api from "../utils/api";

function getPollFromResponse(data) {
  return data?.poll || data?.data || data;
}

function getTotalVotes(poll) {
  return (poll?.options || []).reduce(
    (total, option) => total + Number(option.votes || 0),
    0
  );
}

function formatDate(date) {
  if (!date) return "Unknown date";

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getPercentage(votes, total) {
  if (!total) return 0;
  return Math.round((Number(votes || 0) / total) * 100);
}

export default function AnalyticsPage() {
  const { id } = useParams();

  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadPoll = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const response = await api.get(`/polls/${id}`);

      const pollData = getPollFromResponse(response.data);

      setPoll(pollData);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load poll results."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadPoll();
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="relative mx-auto flex min-h-[65vh] max-w-5xl items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,210,31,0.10),transparent_38%)]" />

          <div className="absolute left-[15%] top-[20%] h-32 w-32 animate-pulse rounded-full bg-[#FFD21F]/5 blur-3xl" />
          <div className="absolute bottom-[15%] right-[15%] h-40 w-40 animate-pulse rounded-full bg-[#4090F0]/5 blur-3xl" />

          <div className="relative flex animate-[fadeIn_0.5s_ease-out] flex-col items-center gap-4">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-[#FFD21F]/30 bg-[#FFD21F]/10 shadow-[0_0_35px_rgba(255,210,31,0.12)]">
              <div className="absolute inset-0 animate-ping rounded-2xl bg-[#FFD21F]/5" />
              <Loader2 className="relative h-7 w-7 animate-spin text-[#FFD21F]" />
            </div>

            <div className="text-center">
              <p className="text-sm font-semibold text-white">
                Loading live results
              </p>

              <p className="mt-1 text-xs text-[#9CA3AF]">
                Fetching the latest response data...
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="mx-auto max-w-4xl animate-[fadeIn_0.45s_ease-out]">
          <div className="overflow-hidden rounded-3xl border border-red-500/20 bg-[#111111] shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <div className="h-1 bg-gradient-to-r from-red-500 to-red-400" />

            <div className="relative p-6 sm:p-8">
              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-red-500/5 blur-3xl" />

              <div className="relative flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10">
                  <BarChart3 className="h-5 w-5 text-red-400" />
                </div>

                <div>
                  <p className="text-sm font-bold text-red-400">
                    Unable to load results
                  </p>

                  <p className="mt-1 text-sm leading-6 text-[#9CA3AF]">
                    {error}
                  </p>
                </div>
              </div>

              <button
                onClick={() => loadPoll()}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#FFD21F] px-5 py-3 text-sm font-bold text-black shadow-[0_10px_30px_rgba(255,210,31,0.12)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#FFE66D] hover:shadow-[0_14px_35px_rgba(255,210,31,0.18)] active:translate-y-0"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!poll) {
    return (
      <Layout>
        <div className="mx-auto max-w-4xl animate-[fadeIn_0.45s_ease-out]">
          <div className="relative overflow-hidden rounded-3xl border border-[#292929] bg-[#111111] p-10 text-center shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
            <div className="absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 rounded-full bg-[#FFD21F]/5 blur-3xl" />

            <div className="relative">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#FFD21F]/20 bg-[#FFD21F]/10">
                <BarChart3 className="h-7 w-7 text-[#FFD21F]" />
              </div>

              <h2 className="mt-5 text-xl font-bold text-white">
                Poll not found
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#9CA3AF]">
                The requested poll could not be found or is no longer available.
              </p>

              <Link
                to="/my-polls"
                className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#FFD21F] px-5 py-3 text-sm font-bold text-black transition duration-300 hover:-translate-y-0.5 hover:bg-[#FFE66D]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to My Polls
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  const totalVotes = getTotalVotes(poll);

  return (
    <Layout>
      <div className="relative mx-auto max-w-5xl space-y-5 overflow-hidden pb-6">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(255,210,31,0.08),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(64,144,240,0.06),transparent_32%)]" />

        <div className="pointer-events-none absolute right-[5%] top-[8%] h-40 w-40 rounded-full bg-[#FFD21F]/5 blur-3xl" />
        <div className="pointer-events-none absolute bottom-[15%] left-[8%] h-44 w-44 rounded-full bg-[#4090F0]/5 blur-3xl" />

        <div className="animate-[fadeIn_0.45s_ease-out]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Link
                to="/my-polls"
                className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-[#9CA3AF] transition duration-300 hover:translate-x-[-2px] hover:text-[#FFD21F]"
              >
                <ArrowLeft className="h-4 w-4" />
                My Polls
              </Link>

              <div className="flex items-center gap-3">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-[#FFD21F]/20 bg-[#FFD21F]/10 shadow-[0_0_25px_rgba(255,210,31,0.08)]">
                  <div className="absolute inset-0 rounded-2xl bg-[#FFD21F]/5 animate-pulse" />
                  <BarChart3 className="relative h-6 w-6 text-[#FFD21F]" />
                </div>

                <div>
                  <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                    Live Results
                  </h1>

                  <p className="mt-1 text-sm text-[#9CA3AF]">
                    Real-time response overview
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => loadPoll(true)}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#292929] bg-[#111111] px-4 py-2.5 text-sm font-semibold text-[#9CA3AF] shadow-[0_10px_30px_rgba(0,0,0,0.18)] transition duration-300 hover:-translate-y-0.5 hover:border-[#FFD21F]/40 hover:bg-[#151515] hover:text-[#FFD21F] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-3xl border border-[#292929] bg-[#111111] shadow-[0_20px_60px_rgba(0,0,0,0.30)] transition duration-500 hover:border-[#FFD21F]/20">
          <div className="h-1 bg-gradient-to-r from-[#FFD21F] via-[#FFE66D] to-[#FFD21F]" />

          <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-[#FFD21F]/5 blur-3xl" />

          <div className="relative p-6 sm:p-7">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-green-400">
                <span className="h-2 w-2 animate-pulse rounded-full bg-green-400 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                <Radio className="h-3.5 w-3.5" />
                LIVE
              </span>

              {poll.category && (
                <span className="rounded-full border border-[#292929] bg-[#090909] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#9CA3AF]">
                  {poll.category}
                </span>
              )}
            </div>

            <h2 className="mt-5 max-w-4xl text-xl font-black leading-8 text-white sm:text-2xl">
              {poll.question}
            </h2>

            <div className="mt-3 flex items-center gap-2 text-xs text-[#9CA3AF]">
              <Activity className="h-3.5 w-3.5 text-[#4090F0]" />
              Created {formatDate(poll.created_at)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="group relative overflow-hidden rounded-2xl border border-[#292929] bg-[#111111] p-5 shadow-[0_15px_40px_rgba(0,0,0,0.18)] transition duration-300 hover:-translate-y-1 hover:border-[#FFD21F]/30">
            <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-[#FFD21F]/5 blur-2xl transition duration-300 group-hover:bg-[#FFD21F]/10" />

            <div className="relative flex items-center gap-3 text-[#9CA3AF]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#FFD21F]/20 bg-[#FFD21F]/10">
                <Users className="h-4 w-4 text-[#FFD21F]" />
              </div>

              <span className="text-xs font-bold uppercase tracking-wider">
                Total Votes
              </span>
            </div>

            <p className="relative mt-4 text-3xl font-black tracking-tight text-white">
              {totalVotes}
            </p>

            <p className="relative mt-1 text-xs text-[#6B7280]">
              Responses collected
            </p>
          </div>

          <div className="group relative overflow-hidden rounded-2xl border border-[#292929] bg-[#111111] p-5 shadow-[0_15px_40px_rgba(0,0,0,0.18)] transition duration-300 hover:-translate-y-1 hover:border-[#4090F0]/30">
            <div className="absolute right-0 top-0 h-20 w-20 rounded-full bg-[#4090F0]/5 blur-2xl transition duration-300 group-hover:bg-[#4090F0]/10" />

            <div className="relative flex items-center gap-3 text-[#9CA3AF]">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#4090F0]/20 bg-[#4090F0]/10">
                <BarChart3 className="h-4 w-4 text-[#4090F0]" />
              </div>

              <span className="text-xs font-bold uppercase tracking-wider">
                Options
              </span>
            </div>

            <p className="relative mt-4 text-3xl font-black tracking-tight text-white">
              {poll.options?.length || 0}
            </p>

            <p className="relative mt-1 text-xs text-[#6B7280]">
              Available choices
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-[#292929] bg-[#111111] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.25)] sm:p-6">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-black text-white sm:text-xl">
                Response Breakdown
              </h3>

              <p className="mt-1 text-xs text-[#9CA3AF]">
                Votes received for each option
              </p>
            </div>

            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1.5 text-xs font-bold text-green-400">
              <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
              Live
            </span>
          </div>

          {!poll.options?.length ? (
            <div className="rounded-2xl border border-dashed border-[#292929] bg-[#090909] p-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-[#292929] bg-[#111111]">
                <BarChart3 className="h-6 w-6 text-[#4B4B4B]" />
              </div>

              <p className="mt-3 text-sm text-[#9CA3AF]">
                No option-based results available for this poll type.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {poll.options.map((option, index) => {
                const votes = Number(option.votes || 0);

                const percentage = getPercentage(
                  votes,
                  totalVotes
                );

                return (
                  <div
                    key={option.id || index}
                    className="group rounded-2xl border border-[#292929] bg-[#090909] p-4 transition duration-300 hover:-translate-y-0.5 hover:border-[#FFD21F]/20 hover:bg-[#0D0D0D]"
                    style={{
                      animation: `fadeInUp 0.45s ease-out ${index * 70}ms both`,
                    }}
                  >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#FFD21F]/15 bg-[#FFD21F]/5 text-xs font-bold text-[#FFD21F]">
                          {index + 1}
                        </div>

                        <span className="min-w-0 truncate text-sm font-semibold text-white">
                          {option.text}
                        </span>
                      </div>

                      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                        <span className="hidden text-xs text-[#9CA3AF] sm:block">
                          {votes} vote{votes !== 1 ? "s" : ""}
                        </span>

                        <span className="w-12 text-right text-sm font-black text-[#FFD21F]">
                          {percentage}%
                        </span>
                      </div>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-[#292929]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-[#FFD21F] via-[#FFE66D] to-[#FFD21F] shadow-[0_0_20px_rgba(255,210,31,0.25)] transition-all duration-1000 ease-out"
                        style={{
                          width: `${percentage}%`,
                        }}
                      />
                    </div>

                    <div className="mt-2 text-xs text-[#6B7280] sm:hidden">
                      {votes} vote{votes !== 1 ? "s" : ""}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            to={`/poll/${poll.id}`}
            className="flex flex-1 items-center justify-center rounded-xl border border-[#292929] bg-[#111111] px-4 py-3 text-sm font-bold text-[#9CA3AF] shadow-[0_10px_30px_rgba(0,0,0,0.18)] transition duration-300 hover:-translate-y-0.5 hover:border-[#FFD21F]/40 hover:bg-[#151515] hover:text-[#FFD21F]"
          >
            Open Poll
          </Link>

          <Link
            to="/my-polls"
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#FFD21F] px-4 py-3 text-sm font-bold text-black shadow-[0_10px_30px_rgba(255,210,31,0.10)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#FFE66D] hover:shadow-[0_14px_35px_rgba(255,210,31,0.18)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to My Polls
          </Link>
        </div>
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
              transform: translateY(12px);
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