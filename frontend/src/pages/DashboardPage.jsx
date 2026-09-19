import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  BarChart3,
  Clipboard,
  Copy,
  Filter,
  Plus,
  Search,
  Share2,
  Sparkles,
  Target,
  ThumbsUp,
  Trophy,
  Vote,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

import Layout from "../components/Layout";
import api from "../utils/api";

export default function DashboardPage() {
  const navigate = useNavigate();

  const [polls, setPolls] = useState([]);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [selectedType, setSelectedType] = useState("all");
  const [filterOpen, setFilterOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    const updateUser = () => {
      try {
        setUser(
          JSON.parse(localStorage.getItem("user")) || {}
        );
      } catch {
        setUser({});
      }
    };

    window.addEventListener(
      "profileImageUpdated",
      updateUser
    );

    window.addEventListener("storage", updateUser);

    return () => {
      window.removeEventListener(
        "profileImageUpdated",
        updateUser
      );

      window.removeEventListener("storage", updateUser);
    };
  }, []);

  useEffect(() => {
    const fetchMyPolls = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login", { replace: true });
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await api.get("/polls/my");

        setPolls(response.data?.polls || []);
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");

          window.dispatchEvent(
            new Event("authChanged")
          );

          navigate("/login", { replace: true });
          return;
        }

        setError(
          err.response?.data?.message ||
            "Unable to load your polls."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMyPolls();
  }, [navigate]);

  const getTotalVotes = (poll) => {
    if (!Array.isArray(poll?.options)) {
      return 0;
    }

    return poll.options.reduce(
      (total, option) =>
        total + Number(option?.votes || 0),
      0
    );
  };

  const getPollType = (poll) => {
    return poll?.category || poll?.type || "General";
  };

  const formatDate = (value) => {
    if (!value) {
      return "Recently";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Recently";
    }

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getPercentage = (votes, total) => {
    if (!total) {
      return 0;
    }

    return Math.round((votes / total) * 100);
  };

  const getInitials = () => {
    const name = user?.name || "Creator";

    return name
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const totalVotes = useMemo(() => {
    return polls.reduce(
      (total, poll) =>
        total + getTotalVotes(poll),
      0
    );
  }, [polls]);

  const totalOptions = useMemo(() => {
    return polls.reduce(
      (total, poll) =>
        total + (poll?.options?.length || 0),
      0
    );
  }, [polls]);

  const averageVotes = polls.length
    ? Math.round(totalVotes / polls.length)
    : 0;

  const pollTypes = useMemo(() => {
    const types = new Set();

    polls.forEach((poll) => {
      types.add(getPollType(poll));
    });

    return Array.from(types);
  }, [polls]);

  const filteredPolls = useMemo(() => {
    const result = polls.filter((poll) => {
      const question =
        String(poll?.question || "").toLowerCase();

      const query = search.trim().toLowerCase();

      const questionMatch =
        !query || question.includes(query);

      const typeMatch =
        selectedType === "all" ||
        getPollType(poll) === selectedType;

      return questionMatch && typeMatch;
    });

    result.sort((a, b) => {
      const dateA = new Date(
        a?.created_at ||
          a?.createdAt ||
          0
      ).getTime();

      const dateB = new Date(
        b?.created_at ||
          b?.createdAt ||
          0
      ).getTime();

      return sortOrder === "newest"
        ? dateB - dateA
        : dateA - dateB;
    });

    return result;
  }, [
    polls,
    search,
    selectedType,
    sortOrder,
  ]);

  const trendingTypes = useMemo(() => {
    const counts = {};

    polls.forEach((poll) => {
      const type = getPollType(poll);

      counts[type] = (counts[type] || 0) + 1;
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [polls]);

  const copyPollLink = async (pollId) => {
    try {
      const link = `${window.location.origin}/poll/${pollId}`;

      await navigator.clipboard.writeText(link);

      setCopiedId(pollId);

      setTimeout(() => {
        setCopiedId(null);
      }, 1600);
    } catch {
      setError("Unable to copy the poll link.");
    }
  };

  const profileImagePath =
  user?.profileImage ||
  user?.profile_picture ||
  user?.profilePicture ||
  "";

const profileImage = profileImagePath
  ? profileImagePath.startsWith("http")
    ? profileImagePath
    : `http://localhost:8080${profileImagePath}`
  : "";

  const displayName =
    user?.name ||
    user?.username ||
    "Creator";

  if (loading) {
    return (
      <Layout wide>
        <div className="flex min-h-[650px] items-center justify-center">
          <div className="relative text-center animate-[dashboardFadeIn_0.45s_ease-out]">
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#FFD21F]/5 blur-3xl" />

            <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-[#FFD21F]/20 bg-[#FFD21F]/5 shadow-[0_0_25px_rgba(255,210,31,0.06)]">
              <div className="h-7 w-7 animate-spin rounded-full border-4 border-[#292929] border-t-[#FFD21F]" />
            </div>

            <h2 className="mt-5 text-lg font-bold text-white">
              Loading your dashboard
            </h2>

            <p className="mt-1 text-sm text-zinc-600">
              Preparing your polls...
            </p>

            <div className="mx-auto mt-5 h-1 w-24 overflow-hidden rounded-full bg-[#292929]">
              <div className="h-full w-1/2 rounded-full bg-[#FFD21F] animate-[loadingBar_1.2s_ease-in-out_infinite]" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout wide>
      <div className="relative min-h-[calc(100vh-120px)] overflow-hidden">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[-180px] top-[-140px] h-[420px] w-[420px] rounded-full bg-[#FFD21F]/5 blur-[140px]" />

          <div className="absolute right-[-150px] top-[320px] h-[400px] w-[400px] rounded-full bg-[#4090F0]/5 blur-[140px]" />

          <div className="absolute bottom-[-180px] left-[35%] h-[380px] w-[380px] rounded-full bg-[#FFD21F]/3 blur-[150px]" />

          <div
            className="absolute inset-0 opacity-[0.018]"
            style={{
              backgroundImage:
                "linear-gradient(#FFD21F 1px, transparent 1px), linear-gradient(90deg, #FFD21F 1px, transparent 1px)",
              backgroundSize: "68px 68px",
            }}
          />
        </div>

        <div className="relative z-10 space-y-6">
          {error && (
            <div className="flex items-center justify-between rounded-2xl border border-rose-500/20 bg-rose-500/5 px-5 py-4 text-sm text-rose-400 shadow-[0_10px_30px_rgba(244,63,94,0.04)] animate-[dashboardFadeIn_0.25s_ease-out]">
              <span>{error}</span>

              <button
                type="button"
                onClick={() => setError("")}
                className="rounded-lg px-2 py-1 font-bold transition-all duration-200 hover:bg-rose-500/10 hover:text-rose-300"
              >
                ×
              </button>
            </div>
          )}

          <section className="group relative overflow-hidden rounded-[30px] border border-[#292929] bg-[#111111] shadow-[0_25px_80px_rgba(0,0,0,0.28)] transition-all duration-500 hover:border-[#FFD21F]/20 hover:shadow-[0_28px_90px_rgba(0,0,0,0.34)]">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#FFD21F]/[0.025] via-transparent to-[#4090F0]/[0.02]" />

            <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-[#FFD21F]/5 blur-3xl transition-all duration-700 group-hover:bg-[#FFD21F]/8" />

            <div className="absolute bottom-[-100px] left-[-80px] h-48 w-48 rounded-full bg-[#4090F0]/5 blur-3xl" />

            <div className="relative p-6 sm:p-8">
              <div className="relative flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400 transition-all duration-300 hover:border-emerald-500/30 hover:bg-emerald-500/10">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.55)]" />
                    Live workspace
                  </div>

                  <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl animate-[dashboardTitle_0.45s_ease-out]">
                    Welcome back,{" "}
                    <span className="text-[#FFD21F] drop-shadow-[0_0_18px_rgba(255,210,31,0.08)]">
                      {displayName.split(" ")[0]}
                    </span>
                  </h1>

                  <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-500">
                    Create polls, collect opinions and
                    watch your audience respond in real
                    time.
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <Link
                    to="/create-poll"
                    className="group/button relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-[#FFD21F] px-5 py-3 text-sm font-bold text-black shadow-lg shadow-[#FFD21F]/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#FFE66D] hover:shadow-[0_0_25px_rgba(255,210,31,0.18)] active:translate-y-0 active:scale-95"
                  >
                    <span className="pointer-events-none absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-700 group-hover/button:translate-x-full" />

                    <Plus
                      size={17}
                      className="relative transition-transform duration-300 group-hover/button:rotate-90"
                    />

                    <span className="relative">
                      Create Poll
                    </span>
                  </Link>

                  <Link
                    to="/profile"
                    className="hidden overflow-hidden rounded-full border border-[#292929] transition-all duration-300 hover:border-[#FFD21F]/40 hover:scale-105 hover:shadow-[0_0_20px_rgba(255,210,31,0.08)] sm:block"
                  >
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt={displayName}
                        className="h-11 w-11 object-cover transition-transform duration-500 hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center bg-[#090909] text-sm font-black text-[#FFD21F]">
                        {getInitials()}
                      </div>
                    )}
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <StatCard
              icon={<Clipboard size={19} />}
              label="Total Polls"
              value={polls.length}
              accent="yellow"
            />

            <StatCard
              icon={<ThumbsUp size={19} />}
              label="Total Votes"
              value={totalVotes}
              accent="blue"
            />

            <StatCard
              icon={<Target size={19} />}
              label="Total Options"
              value={totalOptions}
              accent="violet"
            />

            <StatCard
              icon={<BarChart3 size={19} />}
              label="Average Votes"
              value={averageVotes}
              accent="orange"
            />
          </section>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <section>
              <div className="group mb-4 rounded-2xl border border-[#292929] bg-[#111111] p-4 transition-all duration-300 hover:border-[#FFD21F]/15 hover:bg-[#141414]">
                <div className="flex flex-col gap-3 lg:flex-row">
                  <div className="relative flex-1">
                    <Search
                      size={17}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-700 transition-colors duration-300"
                    />

                    <input
                      type="text"
                      value={search}
                      onChange={(event) =>
                        setSearch(event.target.value)
                      }
                      placeholder="Search your polls..."
                      className="w-full rounded-xl border border-[#292929] bg-[#090909] py-3 pl-11 pr-4 text-sm text-zinc-300 outline-none transition-all duration-300 placeholder:text-zinc-700 hover:border-[#3A3A3A] focus:border-[#FFD21F]/50 focus:ring-4 focus:ring-[#FFD21F]/5 focus:shadow-[0_0_20px_rgba(255,210,31,0.05)]"
                    />
                  </div>

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setFilterOpen(
                          (value) => !value
                        )
                      }
                      className={`flex w-full items-center justify-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold transition-all duration-300 lg:w-auto ${
                        filterOpen
                          ? "border-[#FFD21F]/30 bg-[#FFD21F]/10 text-[#FFD21F] shadow-[0_0_15px_rgba(255,210,31,0.06)]"
                          : "border-[#292929] bg-[#090909] text-zinc-500 hover:border-[#FFD21F]/30 hover:bg-[#FFD21F]/5 hover:text-[#FFD21F]"
                      }`}
                    >
                      <Filter
                        size={16}
                        className={`transition-transform duration-300 ${
                          filterOpen
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                      Filter
                    </button>

                    {filterOpen && (
                      <div className="absolute right-0 top-14 z-30 w-60 origin-top-right rounded-2xl border border-[#292929] bg-[#111111]/95 p-3 shadow-[0_25px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl animate-[dropdownIn_0.2s_ease-out]">
                        <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-700">
                          Poll Type
                        </p>

                        <button
                          type="button"
                          onClick={() => {
                            setSelectedType("all");
                            setFilterOpen(false);
                          }}
                          className={`w-full rounded-xl px-3 py-2.5 text-left text-sm transition-all duration-200 ${
                            selectedType === "all"
                              ? "bg-[#FFD21F]/10 font-semibold text-[#FFD21F]"
                              : "text-zinc-500 hover:bg-[#090909] hover:text-zinc-200"
                          }`}
                        >
                          All Polls
                        </button>

                        {pollTypes.map((type) => (
                          <button
                            type="button"
                            key={type}
                            onClick={() => {
                              setSelectedType(type);
                              setFilterOpen(false);
                            }}
                            className={`w-full rounded-xl px-3 py-2.5 text-left text-sm transition-all duration-200 ${
                              selectedType === type
                                ? "bg-[#FFD21F]/10 font-semibold text-[#FFD21F]"
                                : "text-zinc-500 hover:bg-[#090909] hover:text-zinc-200"
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <select
                    value={sortOrder}
                    onChange={(event) =>
                      setSortOrder(event.target.value)
                    }
                    className="rounded-xl border border-[#292929] bg-[#090909] px-4 py-3 text-sm font-semibold text-zinc-500 outline-none transition-all duration-300 hover:border-[#3A3A3A] focus:border-[#FFD21F]/50 focus:ring-2 focus:ring-[#FFD21F]/5"
                  >
                    <option value="newest">
                      Newest First
                    </option>
                    <option value="oldest">
                      Oldest First
                    </option>
                  </select>
                </div>
              </div>

              <div className="mb-4 flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FFD21F]">
                    Creator activity
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-white">
                    My Polls
                  </h2>

                  <p className="mt-1 text-xs text-zinc-700">
                    {filteredPolls.length}{" "}
                    {filteredPolls.length === 1
                      ? "poll"
                      : "polls"}{" "}
                    displayed
                  </p>
                </div>

                <Link
                  to="/my-polls"
                  className="group inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-zinc-600 transition-all duration-200 hover:bg-[#111111] hover:text-[#FFD21F]"
                >
                  View all
                  <ChevronRight
                    size={14}
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                </Link>
              </div>

              {polls.length === 0 ? (
                <EmptyState />
              ) : filteredPolls.length === 0 ? (
                <div className="rounded-[26px] border border-dashed border-[#292929] bg-[#111111] p-14 text-center animate-[dashboardFadeIn_0.3s_ease-out]">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FFD21F]/10 text-[#FFD21F] shadow-[0_0_18px_rgba(255,210,31,0.06)]">
                    <Search size={24} />
                  </div>

                  <h3 className="mt-5 font-bold text-zinc-200">
                    No matching polls
                  </h3>

                  <p className="mt-1 text-sm text-zinc-600">
                    Try a different search or filter.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPolls.map((poll, index) => {
                    const pollId = poll?.id;
                    const total = getTotalVotes(poll);

                    const topOptions = [
                      ...(poll?.options || []),
                    ]
                      .sort(
                        (a, b) =>
                          Number(b?.votes || 0) -
                          Number(a?.votes || 0)
                      )
                      .slice(0, 3);

                    return (
                      <article
                        key={pollId || index}
                        className="group relative overflow-hidden rounded-[26px] border border-[#292929] bg-[#111111] shadow-[0_12px_35px_rgba(0,0,0,0.12)] transition-all duration-400 hover:-translate-y-1 hover:border-[#FFD21F]/25 hover:bg-[#141414] hover:shadow-[0_20px_45px_rgba(0,0,0,0.25)] animate-[pollCardIn_0.4s_ease-out_both]"
                        style={{
                          animationDelay: `${index * 70}ms`,
                        }}
                      >
                        <div className="pointer-events-none absolute right-[-70px] top-[-70px] h-40 w-40 rounded-full bg-[#FFD21F]/0 blur-3xl transition-all duration-700 group-hover:bg-[#FFD21F]/5" />

                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FFD21F]/0 to-transparent transition-all duration-700 group-hover:via-[#FFD21F]/35" />

                        <div className="relative px-5 py-5 sm:px-6">
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/15 bg-emerald-500/5 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-emerald-400">
                                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_7px_rgba(52,211,153,0.6)]" />
                                Live
                              </span>

                              <span className="rounded-full border border-[#FFD21F]/15 bg-[#FFD21F]/5 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-[#FFD21F] transition-all duration-300 group-hover:border-[#FFD21F]/30">
                                {getPollType(poll)}
                              </span>

                              <span className="text-xs text-zinc-700">
                                {formatDate(
                                  poll?.created_at ||
                                    poll?.createdAt
                                )}
                              </span>
                            </div>

                            <div className="inline-flex items-center gap-2 rounded-full border border-[#292929] bg-[#090909] px-3 py-1.5 text-xs font-medium text-zinc-600 transition-all duration-300 group-hover:border-[#FFD21F]/15 group-hover:text-zinc-400">
                              <Trophy
                                size={14}
                                className="text-[#FFD21F]"
                              />
                              {total} votes
                            </div>
                          </div>

                          <h3 className="mt-4 text-lg font-bold leading-7 text-zinc-100 transition-colors duration-300 group-hover:text-white sm:text-xl">
                            {poll?.question ||
                              "Untitled Poll"}
                          </h3>

                          <div className="mt-5 space-y-3">
                            {topOptions.length > 0 ? (
                              topOptions.map(
                                (option, optionIndex) => {
                                  const votes = Number(
                                    option?.votes || 0
                                  );

                                  const percentage =
                                    getPercentage(
                                      votes,
                                      total
                                    );

                                  return (
                                    <div
                                      key={
                                        option?.id ||
                                        `${option?.text}-${optionIndex}`
                                      }
                                      className="animate-[optionIn_0.45s_ease-out_both]"
                                      style={{
                                        animationDelay: `${index * 70 + optionIndex * 80}ms`,
                                      }}
                                    >
                                      <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                                        <span className="min-w-0 truncate font-medium text-zinc-500 transition-colors duration-300 group-hover:text-zinc-400">
                                          {option?.text ||
                                            `Option ${
                                              optionIndex +
                                              1
                                            }`}
                                        </span>

                                        <span className="shrink-0 rounded-md bg-[#090909] px-1.5 py-0.5 font-bold tabular-nums text-zinc-600">
                                          {percentage}%
                                        </span>
                                      </div>

                                      <div className="h-2 overflow-hidden rounded-full bg-[#292929]">
                                        <div
                                          className="relative h-full rounded-full bg-gradient-to-r from-[#FFD21F] via-[#FFE66D] to-[#FFD21F] shadow-[0_0_12px_rgba(255,210,31,0.16)] transition-all duration-1000 ease-out [background-size:200%_100%] animate-[dashboardBar_3s_ease-in-out_infinite]"
                                          style={{
                                            width: `${percentage}%`,
                                          }}
                                        >
                                          <span className="absolute inset-y-0 left-0 w-1/3 rounded-full bg-white/15 animate-[barShine_2.5s_ease-in-out_infinite]" />
                                        </div>
                                      </div>
                                    </div>
                                  );
                                }
                              )
                            ) : (
                              <div className="rounded-xl border border-dashed border-[#292929] bg-[#090909] px-4 py-4 text-xs text-zinc-700">
                                No responses yet
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="relative flex flex-wrap items-center gap-2 border-t border-[#292929] bg-[#090909]/70 px-5 py-4 sm:px-6">
                          <Link
                            to={`/analytics/${pollId}`}
                            className="group/action inline-flex items-center gap-2 rounded-xl bg-[#FFD21F] px-4 py-2.5 text-xs font-bold text-black transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#FFE66D] hover:shadow-[0_0_18px_rgba(255,210,31,0.16)] active:scale-95"
                          >
                            <BarChart3
                              size={15}
                              className="transition-transform duration-300 group-hover/action:scale-110"
                            />
                            Live Results
                          </Link>

                          <Link
                            to={`/share/${pollId}`}
                            className="inline-flex items-center gap-2 rounded-xl border border-[#292929] bg-[#111111] px-4 py-2.5 text-xs font-bold text-zinc-500 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#FFD21F]/30 hover:bg-[#FFD21F]/5 hover:text-[#FFD21F]"
                          >
                            <Share2 size={15} />
                            Share
                          </Link>

                          <Link
                            to={`/poll/${pollId}`}
                            className="inline-flex items-center gap-2 rounded-xl border border-[#292929] bg-[#111111] px-4 py-2.5 text-xs font-bold text-zinc-500 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#FFD21F]/30 hover:bg-[#FFD21F]/5 hover:text-[#FFD21F]"
                          >
                            <Vote size={15} />
                            Open Poll
                          </Link>

                          <button
                            type="button"
                            onClick={() =>
                              copyPollLink(pollId)
                            }
                            className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-bold transition-all duration-200 active:scale-95 ${
                              copiedId === pollId
                                ? "border-emerald-500/25 bg-emerald-500/5 text-emerald-400"
                                : "border-[#292929] bg-[#111111] text-zinc-500 hover:-translate-y-0.5 hover:border-[#FFD21F]/30 hover:bg-[#FFD21F]/5 hover:text-[#FFD21F]"
                            }`}
                          >
                            {copiedId === pollId ? (
                              <>
                                <CheckCircle2
                                  size={15}
                                  className="animate-[checkPop_0.25s_ease-out]"
                                />
                                Copied
                              </>
                            ) : (
                              <>
                                <Copy size={15} />
                                Copy Link
                              </>
                            )}
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            <aside className="space-y-5">
              <div className="group overflow-hidden rounded-[26px] border border-[#292929] bg-[#111111] shadow-[0_12px_35px_rgba(0,0,0,0.12)] transition-all duration-400 hover:-translate-y-1 hover:border-[#FFD21F]/20 hover:shadow-[0_18px_45px_rgba(0,0,0,0.24)]">
                <div className="relative h-24 bg-gradient-to-r from-[#FFD21F]/20 via-[#111111] to-[#4090F0]/15">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111111] to-transparent" />
                </div>

                <div className="px-5 pb-6">
                  <div className="-mt-8 flex items-end justify-between">
                    <Link
                      to="/profile"
                      className="group/avatar overflow-hidden rounded-2xl border-4 border-[#111111] transition-all duration-300 hover:scale-105 hover:border-[#FFD21F]/20 hover:shadow-[0_0_20px_rgba(255,210,31,0.08)]"
                    >
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt={displayName}
                          className="h-16 w-16 object-cover transition-transform duration-500 group-hover/avatar:scale-105"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center bg-[#FFD21F] text-lg font-black text-black">
                          {getInitials()}
                        </div>
                      )}
                    </Link>

                    <Link
                      to="/profile"
                      className="mb-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-[#FFD21F] transition-all duration-200 hover:bg-[#FFD21F]/5 hover:-translate-y-0.5"
                    >
                      View Profile
                    </Link>
                  </div>

                  <h3 className="mt-4 font-bold text-white">
                    {displayName}
                  </h3>

                  <p className="mt-1 text-xs text-zinc-700">
                    @{user?.username || "creator"}
                  </p>

                  <div className="mt-5 grid grid-cols-3 divide-x divide-[#292929] rounded-2xl bg-[#090909] py-4">
                    <MiniStat
                      label="Polls"
                      value={polls.length}
                    />

                    <MiniStat
                      label="Votes"
                      value={totalVotes}
                    />

                    <MiniStat
                      label="Options"
                      value={totalOptions}
                    />
                  </div>
                </div>
              </div>

              <div className="group rounded-[26px] border border-[#292929] bg-[#111111] p-5 shadow-[0_12px_35px_rgba(0,0,0,0.12)] transition-all duration-400 hover:-translate-y-1 hover:border-[#FFD21F]/15 hover:bg-[#141414]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#FFD21F]">
                      Poll insights
                    </p>

                    <h3 className="mt-1 text-sm font-bold text-white">
                      Most used types
                    </h3>
                  </div>

                  <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#FFD21F]/10 text-[#FFD21F] transition-all duration-300 group-hover:scale-110 group-hover:bg-[#FFD21F]/15 group-hover:shadow-[0_0_15px_rgba(255,210,31,0.07)]">
                    <Sparkles
                      size={16}
                      className="animate-pulse"
                    />
                  </div>
                </div>

                <div className="mt-5 space-y-4">
                  {trendingTypes.length === 0 ? (
                    <p className="rounded-xl bg-[#090909] px-4 py-3 text-xs text-zinc-700">
                      Create a poll to see insights.
                    </p>
                  ) : (
                    trendingTypes.map(
                      ([type, count], index) => (
                        <div
                          key={type}
                          className="group/rank flex items-center justify-between rounded-xl px-2 py-2 transition-all duration-200 hover:bg-[#090909]"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold transition-transform duration-200 group-hover/rank:scale-110 ${
                                index === 0
                                  ? "bg-[#FFD21F]/10 text-[#FFD21F]"
                                  : index === 1
                                    ? "bg-[#4090F0]/10 text-[#4090F0]"
                                    : "bg-[#292929] text-zinc-500"
                              }`}
                            >
                              {index + 1}
                            </span>

                            <span className="text-sm font-medium text-zinc-500 transition-colors duration-200 group-hover/rank:text-zinc-300">
                              {type}
                            </span>
                          </div>

                          <span className="text-sm font-bold text-zinc-500">
                            {count}
                          </span>
                        </div>
                      )
                    )
                  )}
                </div>
              </div>

              <div className="group relative overflow-hidden rounded-[26px] bg-gradient-to-br from-[#FFD21F] to-[#FFE66D] p-6 text-black shadow-xl shadow-[#FFD21F]/10 transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(255,210,31,0.16)]">
                <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/20 blur-3xl transition-transform duration-700 group-hover:scale-125" />

                <div className="relative grid h-10 w-10 place-items-center rounded-xl bg-black/10 transition-transform duration-300 group-hover:scale-110">
                  <Sparkles size={18} />
                </div>

                <p className="relative mt-5 text-[10px] font-black uppercase tracking-[0.2em] text-black/50">
                  PULSE Creator
                </p>

                <h3 className="relative mt-2 text-lg font-black">
                  Make your next poll live.
                </h3>

                <p className="relative mt-2 text-sm leading-6 text-black/60">
                  Create a question, share it instantly and
                  watch responses arrive in real time.
                </p>

                <Link
                  to="/create-poll"
                  className="group/create relative mt-5 inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-xs font-bold text-white transition-all duration-300 hover:bg-zinc-900 hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
                >
                  Create Poll
                  <Plus
                    size={15}
                    className="transition-transform duration-300 group-hover/create:rotate-90"
                  />
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes dashboardFadeIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes dashboardTitle {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pollCardIn {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes optionIn {
          from {
            opacity: 0;
            transform: translateX(-6px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes dashboardBar {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes barShine {
          0% {
            opacity: 0;
            transform: translateX(-30px);
          }
          35% {
            opacity: 0.6;
          }
          65%,
          100% {
            opacity: 0;
            transform: translateX(230px);
          }
        }

        @keyframes dropdownIn {
          from {
            opacity: 0;
            transform: translateY(-5px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes checkPop {
          0% {
            opacity: 0;
            transform: scale(0.6) rotate(-15deg);
          }
          70% {
            transform: scale(1.15) rotate(4deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0);
          }
        }

        @keyframes loadingBar {
          0% {
            transform: translateX(-130%);
          }
          50% {
            transform: translateX(80%);
          }
          100% {
            transform: translateX(230%);
          }
        }
      `}</style>
    </Layout>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
}) {
  const styles = {
    yellow: {
      box: "bg-[#FFD21F]/10",
      icon: "text-[#FFD21F]",
    },
    blue: {
      box: "bg-[#4090F0]/10",
      icon: "text-[#4090F0]",
    },
    violet: {
      box: "bg-violet-500/10",
      icon: "text-violet-400",
    },
    orange: {
      box: "bg-orange-500/10",
      icon: "text-orange-400",
    },
  };

  const style =
    styles[accent] || styles.yellow;

  return (
    <div className="group rounded-2xl border border-[#292929] bg-[#111111] p-4 shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-[#FFD21F]/20 hover:bg-[#141414] hover:shadow-[0_16px_35px_rgba(0,0,0,0.2)]">
      <div className="flex items-center justify-between gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${style.box} ${style.icon} transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(255,210,31,0.05)]`}
        >
          {icon}
        </div>

        <Sparkles
          size={14}
          className="text-zinc-800 transition-all duration-300 group-hover:text-[#FFD21F]/50 group-hover:rotate-12"
        />
      </div>

      <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-zinc-700">
        {label}
      </p>

      <p className="mt-1 text-2xl font-black text-white transition-colors duration-300 group-hover:text-[#FFE66D]">
        {value}
      </p>
    </div>
  );
}

function MiniStat({ label, value }) {
  return (
    <div className="group/ministat text-center">
      <p className="text-lg font-black text-white transition-colors duration-200 group-hover/ministat:text-[#FFD21F]">
        {value}
      </p>

      <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-700">
        {label}
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="group rounded-[26px] border border-dashed border-[#292929] bg-[#111111] p-10 text-center shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 hover:border-[#FFD21F]/20 hover:bg-[#141414] sm:p-14 animate-[dashboardFadeIn_0.35s_ease-out]">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FFD21F]/10 text-[#FFD21F] shadow-[0_0_20px_rgba(255,210,31,0.06)] transition-all duration-300 group-hover:scale-105 group-hover:bg-[#FFD21F]/15">
        <Plus
          size={28}
          className="transition-transform duration-300 group-hover:rotate-90"
        />
      </div>

      <h2 className="mt-5 text-xl font-bold text-white">
        No polls yet
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-600">
        Create your first live poll and start collecting
        responses in real time.
      </p>

      <Link
        to="/create-poll"
        className="group/create mt-6 inline-flex items-center gap-2 rounded-xl bg-[#FFD21F] px-5 py-3 text-sm font-bold text-black shadow-lg shadow-[#FFD21F]/10 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#FFE66D] hover:shadow-[0_0_22px_rgba(255,210,31,0.16)] active:scale-95"
      >
        <Plus
          size={17}
          className="transition-transform duration-300 group-hover/create:rotate-90"
        />
        Create Poll
      </Link>
    </div>
  );
}