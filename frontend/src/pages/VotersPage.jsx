import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  RefreshCw,
  Users,
  Mail,
  CheckCircle2,
} from "lucide-react";

import Layout from "../components/Layout";
import api from "../utils/api";

function formatDate(value) {
  if (!value) {
    return "Recently";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getInitials(name) {
  if (!name) {
    return "U";
  }

  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((item) => item.charAt(0))
    .join("")
    .toUpperCase();
}

export default function VotersPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [poll, setPoll] = useState(null);
  const [voters, setVoters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadVoters = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/polls/${id}/voters`
      );

      const data = response.data;

      setPoll(
        data?.poll ||
          data?.data?.poll ||
          null
      );

      setVoters(
        Array.isArray(data?.voters)
          ? data.voters
          : Array.isArray(data?.data?.voters)
            ? data.data.voters
            : []
      );
    } catch (err) {
      console.error("Load voters error:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Unable to load voters."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadVoters();
    }
  }, [id]);

  return (
    <Layout>
      <div className="relative mx-auto max-w-5xl space-y-6 pb-10">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(255,210,31,0.08),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(64,144,240,0.05),transparent_32%)]" />

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="group inline-flex items-center gap-2 text-sm font-semibold text-[#9CA3AF] transition hover:text-[#FFD21F]"
        >
          <ArrowLeft
            size={16}
            className="transition-transform duration-300 group-hover:-translate-x-1"
          />
          Back
        </button>

        <div className="relative overflow-hidden rounded-3xl border border-[#292929] bg-[#111111] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)] sm:p-8">
          <div className="pointer-events-none absolute right-0 top-0 h-40 w-40 rounded-full bg-[#FFD21F]/5 blur-3xl" />

          <div className="relative">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#FFD21F]/20 bg-[#FFD21F]/10 text-[#FFD21F]">
                    <Users size={20} />
                  </div>

                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFD21F]">
                      Audience
                    </p>

                    <h1 className="mt-1 text-2xl font-black text-white">
                      Voters
                    </h1>
                  </div>
                </div>

                {poll?.question && (
                  <p className="mt-4 max-w-3xl text-sm leading-6 text-[#9CA3AF]">
                    {poll.question}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={loadVoters}
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#292929] bg-[#090909] px-4 py-2.5 text-xs font-bold text-[#D1D5DB] transition hover:border-[#FFD21F]/35 hover:text-[#FFD21F] disabled:opacity-50"
              >
                <RefreshCw
                  size={14}
                  className={
                    loading
                      ? "animate-spin"
                      : ""
                  }
                />
                Refresh
              </button>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-[#292929] bg-[#090909] p-4">
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#6B7280]">
                  Total Voters
                </p>

                <p className="mt-2 text-2xl font-black text-[#FFD21F]">
                  {voters.length}
                </p>
              </div>

              <div className="rounded-2xl border border-[#292929] bg-[#090909] p-4">
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#6B7280]">
                  Poll
                </p>

                <p className="mt-2 truncate text-sm font-bold text-white">
                  {poll?.question ||
                    "Poll"}
                </p>
              </div>

              <div className="rounded-2xl border border-green-500/10 bg-[#090909] p-4">
                <p className="text-[9px] font-bold uppercase tracking-wider text-[#6B7280]">
                  Status
                </p>

                <p className="mt-2 inline-flex items-center gap-2 text-sm font-black text-green-400">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                  LIVE
                </p>
              </div>
            </div>
          </div>
        </div>

        {loading && (
          <div className="flex min-h-[300px] items-center justify-center rounded-3xl border border-[#292929] bg-[#111111]">
            <div className="text-center">
              <Loader2
                size={28}
                className="mx-auto animate-spin text-[#FFD21F]"
              />

              <p className="mt-4 text-sm font-bold text-white">
                Loading voters
              </p>

              <p className="mt-1 text-xs text-[#6B7280]">
                Fetching voter profiles...
              </p>
            </div>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-3xl border border-red-500/20 bg-[#111111] p-6">
            <p className="text-sm font-semibold text-red-400">
              {error}
            </p>

            <button
              type="button"
              onClick={loadVoters}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#FFD21F] px-4 py-2.5 text-xs font-black text-black"
            >
              <RefreshCw size={14} />
              Try Again
            </button>
          </div>
        )}

        {!loading &&
          !error &&
          voters.length === 0 && (
            <div className="rounded-3xl border border-[#292929] bg-[#111111] px-6 py-14 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#FFD21F]/20 bg-[#FFD21F]/10 text-[#FFD21F]">
                <Users size={25} />
              </div>

              <h2 className="mt-5 text-lg font-black text-white">
                No voters yet
              </h2>

              <p className="mt-2 text-sm text-[#9CA3AF]">
                Voter profiles will appear here after people submit their votes.
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          voters.length > 0 && (
            <div className="space-y-3">
              {voters.map((voter, index) => {
                const profileImage =
                  voter?.profile_picture ||
                  voter?.profileImage ||
                  voter?.profilePicture ||
                  "";

                return (
                  <div
                    key={
                      voter?.id ||
                      voter?._id ||
                      index
                    }
                    className="group relative overflow-hidden rounded-2xl border border-[#292929] bg-[#111111] p-4 shadow-[0_15px_40px_rgba(0,0,0,0.18)] transition duration-300 hover:-translate-y-0.5 hover:border-[#FFD21F]/25"
                    style={{
                      animation: `fadeInUp 0.4s ease-out ${
                        index * 50
                      }ms both`,
                    }}
                  >
                    <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 rounded-full bg-[#FFD21F]/5 blur-3xl" />

                    <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="flex min-w-0 flex-1 items-center gap-4">
                        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full border border-[#FFD21F]/20 bg-[#090909]">
                          {profileImage ? (
                            <img
                              src={profileImage}
                              alt={
                                voter?.name ||
                                "Voter"
                              }
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-[#FFD21F]/10 text-sm font-black text-[#FFD21F]">
                              {getInitials(
                                voter?.name
                              )}
                            </div>
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="truncate text-sm font-black text-white">
                              {voter?.name ||
                                "Unknown User"}
                            </h3>

                            <span className="inline-flex items-center gap-1 rounded-full border border-green-500/20 bg-green-500/10 px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-green-400">
                              <CheckCircle2 size={10} />
                              Voted
                            </span>
                          </div>

                          {voter?.username && (
                            <p className="mt-1 text-xs text-[#6B7280]">
                              @{voter.username}
                            </p>
                          )}

                          {voter?.email && (
                            <p className="mt-2 inline-flex max-w-full items-center gap-1.5 truncate text-xs text-[#9CA3AF]">
                              <Mail size={12} />
                              {voter.email}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="rounded-xl border border-[#FFD21F]/10 bg-[#FFD21F]/5 px-4 py-3 sm:min-w-[180px]">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-[#6B7280]">
                          Selected
                        </p>

                        <p className="mt-1 text-sm font-black text-[#FFD21F]">
                          {voter?.option_text ||
                            voter?.option ||
                            "Option"}
                        </p>

                        <p className="mt-1 text-[10px] text-[#6B7280]">
                          {formatDate(
                            voter?.voted_at ||
                              voter?.created_at
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            to={`/analytics/${id}`}
            className="flex-1 rounded-xl border border-[#292929] bg-[#111111] px-4 py-3 text-center text-xs font-bold text-[#D1D5DB] transition hover:border-[#4090F0]/35 hover:text-[#4090F0]"
          >
            View Live Results
          </Link>

          <Link
            to="/my-polls"
            className="flex-1 rounded-xl bg-[#FFD21F] px-4 py-3 text-center text-xs font-black text-black transition hover:bg-[#FFE66D]"
          >
            Back to My Polls
          </Link>
        </div>
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