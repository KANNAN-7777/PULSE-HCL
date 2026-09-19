
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Share2,
  BarChart3,
  ExternalLink,
  Radio,
  Loader2,
  RefreshCw,
  FileText,
  MessageCircle,
  Bookmark,
  Activity,
  Users,
} from "lucide-react";

import Layout from "../components/Layout";
import api from "../utils/api";

function formatDate(dateValue) {
  if (!dateValue) {
    return "Recently";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getTotalVotes(poll) {
  if (
    poll?.total_votes !== undefined &&
    poll?.total_votes !== null
  ) {
    return Number(poll.total_votes || 0);
  }

  if (!poll?.options) {
    return 0;
  }

  return poll.options.reduce(
    (total, option) =>
      total + Number(option?.votes || 0),
    0
  );
}

function isOpenPoll(poll) {
  const type = String(
    poll?.type || ""
  )
    .trim()
    .toLowerCase()
    .replace(/[-_\s]/g, "");

  return (
    type === "open" ||
    type === "openpoll" ||
    type === "openquestion" ||
    type === "openended" ||
    type === "text"
  );
}

function PollCard({ poll }) {
  const navigate = useNavigate();

  const totalVotes =
    getTotalVotes(poll);

  const optionCount =
    poll?.options?.length || 0;

  const pollId =
    poll?.id || poll?._id;

  const [saved, setSaved] = useState(
    Boolean(poll?.isBookmarked)
  );

  const [saving, setSaving] =
    useState(false);

  const openPoll =
    isOpenPoll(poll);

  const handleBookmark =
    async () => {
      if (!pollId || saving) {
        return;
      }

      try {
        setSaving(true);

        if (saved) {
          await api.delete(
            `/polls/${pollId}/bookmark`
          );

          setSaved(false);
        } else {
          await api.post(
            `/polls/${pollId}/bookmark`
          );

          setSaved(true);
        }
      } catch (err) {
        console.error(
          "Bookmark error:",
          err
        );
      } finally {
        setSaving(false);
      }
    };

  const handleOpenPoll = () => {
    if (!pollId) {
      return;
    }

    navigate(`/poll/${pollId}`);
  };

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-[#292929] bg-[#111111] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.22)] transition duration-500 hover:-translate-y-1 hover:border-[#FFD21F]/20 hover:shadow-[0_25px_65px_rgba(0,0,0,0.32)] sm:p-6">
      <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-[#FFD21F]/5 blur-3xl transition duration-500 group-hover:bg-[#FFD21F]/10" />

      <div className="pointer-events-none absolute bottom-0 left-0 h-24 w-24 rounded-full bg-[#4090F0]/5 blur-3xl" />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-green-500/20 bg-green-500/10 text-green-400">
              <div className="absolute inset-0 animate-pulse rounded-2xl bg-green-500/5" />

              <Radio
                size={18}
                className="relative"
              />
            </div>

            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-green-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
                  LIVE
                </span>

                {openPoll && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-[#FFD21F]/20 bg-[#FFD21F]/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-[#FFD21F]">
                    Open Response
                  </span>
                )}

                {poll?.category && (
                  <span className="rounded-full border border-[#292929] bg-[#090909] px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                    {poll.category}
                  </span>
                )}
              </div>

              <h2 className="break-words text-base font-black leading-7 text-white sm:text-lg">
                {poll?.question ||
                  "Untitled Poll"}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={handleBookmark}
            disabled={saving}
            title={
              saved
                ? "Remove from Saved Polls"
                : "Save Poll"
            }
            className={`group/bookmark flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition duration-300 ${
              saved
                ? "border-[#FFD21F]/30 bg-[#FFD21F]/10 text-[#FFD21F]"
                : "border-[#292929] bg-[#090909] text-[#6B7280] hover:border-[#FFD21F]/30 hover:bg-[#FFD21F]/5 hover:text-[#FFD21F]"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <Bookmark
              size={16}
              className={`transition-transform duration-300 ${
                saved
                  ? "fill-current"
                  : "group-hover/bookmark:scale-110"
              }`}
            />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#292929] bg-[#090909] px-3 py-3 transition duration-300 hover:border-[#3A3A3A]">
            <div className="flex items-center gap-2">
              <Activity className="h-3.5 w-3.5 text-[#4090F0]" />

              <p className="text-[9px] font-bold uppercase tracking-wider text-[#6B7280]">
                Created
              </p>
            </div>

            <p className="mt-2 text-xs font-semibold text-[#D1D5DB]">
              {formatDate(
                poll?.created_at
              )}
            </p>
          </div>

          <div className="rounded-2xl border border-[#292929] bg-[#090909] px-3 py-3 transition duration-300 hover:border-[#3A3A3A]">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-3.5 w-3.5 text-[#4090F0]" />

              <p className="text-[9px] font-bold uppercase tracking-wider text-[#6B7280]">
                Options
              </p>
            </div>

            <p className="mt-2 text-xs font-semibold text-[#D1D5DB]">
              {openPoll
                ? "Text response"
                : optionCount}
            </p>
          </div>

          <div className="rounded-2xl border border-[#FFD21F]/10 bg-[#FFD21F]/5 px-3 py-3 transition duration-300 hover:border-[#FFD21F]/25">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-3.5 w-3.5 text-[#FFD21F]" />

              <p className="text-[9px] font-bold uppercase tracking-wider text-[#6B7280]">
                {openPoll
                  ? "Responses"
                  : "Votes"}
              </p>
            </div>

            <p className="mt-2 text-xs font-black text-[#FFD21F]">
              {totalVotes}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <button
            type="button"
            onClick={() =>
              navigate(`/share/${pollId}`)
            }
            className="group/share flex items-center justify-center gap-2 rounded-xl border border-[#292929] bg-[#090909] px-3 py-2.5 text-xs font-bold text-[#9CA3AF] transition duration-300 hover:-translate-y-0.5 hover:border-[#FFD21F]/35 hover:bg-[#FFD21F]/5 hover:text-[#FFD21F]"
          >
            <Share2
              size={14}
              className="transition-transform duration-300 group-hover/share:scale-110"
            />
            Share
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                `/analytics/${pollId}`
              )
            }
            className="group/results flex items-center justify-center gap-2 rounded-xl border border-[#292929] bg-[#090909] px-3 py-2.5 text-xs font-bold text-[#9CA3AF] transition duration-300 hover:-translate-y-0.5 hover:border-[#4090F0]/35 hover:bg-[#4090F0]/5 hover:text-[#4090F0]"
          >
            <BarChart3
              size={14}
              className="transition-transform duration-300 group-hover/results:scale-110"
            />
            Live Results
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(
                `/poll/${pollId}/voters`
              )
            }
            className="group/voters flex items-center justify-center gap-2 rounded-xl border border-[#292929] bg-[#090909] px-3 py-2.5 text-xs font-bold text-[#9CA3AF] transition duration-300 hover:-translate-y-0.5 hover:border-[#FFD21F]/35 hover:text-[#FFD21F]"
          >
            <Users
              size={14}
              className="transition-transform duration-300 group-hover/voters:scale-110"
            />
            Voters
          </button>

          <button
            type="button"
            onClick={handleOpenPoll}
            className="group/open flex items-center justify-center gap-2 rounded-xl bg-[#FFD21F] px-3 py-2.5 text-xs font-black text-black shadow-[0_8px_25px_rgba(255,210,31,0.08)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#FFE66D] hover:shadow-[0_12px_30px_rgba(255,210,31,0.16)]"
          >
            <ExternalLink
              size={14}
              className="transition-transform duration-300 group-hover/open:scale-110"
            />

            {openPoll
              ? "Answer Poll"
              : "Open Poll"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MyPollsPage() {
  const navigate = useNavigate();

  const [polls, setPolls] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadPolls = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get("/polls/my");

      const data = response.data;

      if (Array.isArray(data)) {
        setPolls(data);
      } else if (
        Array.isArray(data?.polls)
      ) {
        setPolls(data.polls);
      } else if (
        Array.isArray(data?.data)
      ) {
        setPolls(data.data);
      } else {
        setPolls([]);
      }
    } catch (err) {
      console.error(
        "My polls error:",
        err
      );

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to load your polls."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPolls();
  }, []);

  const totalVotes = polls.reduce(
    (total, poll) =>
      total + getTotalVotes(poll),
    0
  );

  return (
    <Layout>
      <div className="relative mx-auto max-w-4xl space-y-5 overflow-hidden pb-8">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(255,210,31,0.08),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(64,144,240,0.05),transparent_32%)]" />

        <div className="relative flex flex-col gap-4 animate-[fadeInUp_0.45s_ease-out] sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFD21F]">
              PULSE Creator
            </p>

            <h1 className="mt-2 text-2xl font-black tracking-tight text-white sm:text-3xl">
              My Polls
            </h1>

            <p className="mt-1 max-w-xl text-sm leading-6 text-[#9CA3AF]">
              Manage your polls and monitor responses in real time.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/create-poll")
            }
            className="group flex items-center justify-center gap-2 rounded-xl bg-[#FFD21F] px-5 py-3 text-xs font-black text-black shadow-[0_10px_30px_rgba(255,210,31,0.10)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#FFE66D]"
          >
            <Plus
              size={16}
              className="transition-transform duration-300 group-hover:rotate-90"
            />
            Create Poll
          </button>
        </div>

        {!loading &&
          !error &&
          polls.length > 0 && (
            <div
              className="grid grid-cols-1 gap-3 sm:grid-cols-3"
              style={{
                animation:
                  "fadeInUp 0.45s ease-out 80ms both",
              }}
            >
              <div className="rounded-2xl border border-[#292929] bg-[#111111] p-4">
                <div className="flex items-center gap-2 text-[#6B7280]">
                  <FileText className="h-4 w-4 text-[#FFD21F]" />

                  <span className="text-[9px] font-bold uppercase tracking-wider">
                    Total Polls
                  </span>
                </div>

                <p className="mt-3 text-2xl font-black text-white">
                  {polls.length}
                </p>
              </div>

              <div className="rounded-2xl border border-green-500/10 bg-[#111111] p-4">
                <div className="flex items-center gap-2 text-[#6B7280]">
                  <Radio className="h-4 w-4 text-green-400" />

                  <span className="text-[9px] font-bold uppercase tracking-wider">
                    Live Polls
                  </span>
                </div>

                <p className="mt-3 text-2xl font-black text-green-400">
                  {polls.length}
                </p>
              </div>

              <div className="rounded-2xl border border-[#4090F0]/10 bg-[#111111] p-4">
                <div className="flex items-center gap-2 text-[#6B7280]">
                  <MessageCircle className="h-4 w-4 text-[#4090F0]" />

                  <span className="text-[9px] font-bold uppercase tracking-wider">
                    Total Responses
                  </span>
                </div>

                <p className="mt-3 text-2xl font-black text-white">
                  {totalVotes}
                </p>
              </div>
            </div>
          )}

        {loading && (
          <div className="flex min-h-[300px] items-center justify-center overflow-hidden rounded-3xl border border-[#292929] bg-[#111111]">
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#FFD21F]/20 bg-[#FFD21F]/10">
                <Loader2
                  size={25}
                  className="animate-spin text-[#FFD21F]"
                />
              </div>

              <div className="text-center">
                <p className="text-sm font-bold text-white">
                  Loading your polls
                </p>

                <p className="mt-1 text-xs text-[#6B7280]">
                  Fetching poll data...
                </p>
              </div>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="overflow-hidden rounded-3xl border border-red-500/20 bg-[#111111]">
            <div className="h-1 bg-red-500/70" />

            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10">
                  <RefreshCw className="h-5 w-5 text-red-400" />
                </div>

                <div>
                  <p className="text-sm font-bold text-red-400">
                    Unable to load your polls
                  </p>

                  <p className="mt-1 text-sm leading-6 text-[#9CA3AF]">
                    {error}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={loadPolls}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#FFD21F] px-4 py-2.5 text-xs font-black text-black"
              >
                <RefreshCw size={14} />
                Try Again
              </button>
            </div>
          </div>
        )}

        {!loading &&
          !error &&
          polls.length === 0 && (
            <div className="flex min-h-[340px] flex-col items-center justify-center rounded-3xl border border-[#292929] bg-[#111111] px-5 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#FFD21F]/20 bg-[#FFD21F]/10 text-[#FFD21F]">
                <Radio size={25} />
              </div>

              <h2 className="mt-5 text-lg font-black text-white">
                No polls yet
              </h2>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#9CA3AF]">
                Create your first poll and start collecting opinions in real time.
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate("/create-poll")
                }
                className="group mt-6 inline-flex items-center gap-2 rounded-xl bg-[#FFD21F] px-5 py-3 text-xs font-black text-black"
              >
                <Plus size={15} />
                Create Your First Poll
              </button>
            </div>
          )}

        {!loading &&
          !error &&
          polls.length > 0 && (
            <div className="space-y-4">
              {polls.map(
                (poll, index) => (
                  <div
                    key={
                      poll.id ||
                      poll._id
                    }
                    style={{
                      animation: `fadeInUp 0.45s ease-out ${
                        index * 70
                      }ms both`,
                    }}
                  >
                    <PollCard
                      poll={poll}
                    />
                  </div>
                )
              )}
            </div>
          )}
      </div>

      <style>
        {`
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