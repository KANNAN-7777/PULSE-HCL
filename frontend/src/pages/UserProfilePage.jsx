
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  Camera,
  CheckCircle2,
  ChevronRight,
  FileText,
  LogOut,
  Mail,
  PenLine,
  Settings,
  Sparkles,
  User,
  Zap,
} from "lucide-react";

import Layout from "../components/Layout";
import api from "../utils/api";

export default function UserProfilePage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  });

  const [polls, setPolls] = useState([]);
  const [pollCount, setPollCount] = useState(0);
  const [totalVotes, setTotalVotes] = useState(0);
  const [loadingPolls, setLoadingPolls] = useState(true);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageMessage, setImageMessage] = useState("");
  const [imageMessageType, setImageMessageType] = useState("");

  useEffect(() => {
    const loadPolls = async () => {
      try {
        setLoadingPolls(true);

        const response = await api.get("/polls/my");

        const data =
          response.data?.polls ||
          response.data?.data ||
          [];

        setPolls(data);
        setPollCount(data.length);

        const votes = data.reduce((total, poll) => {
          return (
            total +
            (poll.options || []).reduce(
              (sum, option) =>
                sum + Number(option.votes || 0),
              0
            )
          );
        }, 0);

        setTotalVotes(votes);
      } catch {
        setPolls([]);
        setPollCount(0);
        setTotalVotes(0);
      } finally {
        setLoadingPolls(false);
      }
    };

    loadPolls();
  }, []);

  useEffect(() => {
    const handleAuthChanged = () => {
      try {
        const storedUser =
          JSON.parse(localStorage.getItem("user")) || {};

        setUser(storedUser);
      } catch {
        setUser({});
      }
    };

    window.addEventListener(
      "authChanged",
      handleAuthChanged
    );

    window.addEventListener(
      "profileImageUpdated",
      handleAuthChanged
    );

    window.addEventListener(
      "storage",
      handleAuthChanged
    );

    return () => {
      window.removeEventListener(
        "authChanged",
        handleAuthChanged
      );

      window.removeEventListener(
        "profileImageUpdated",
        handleAuthChanged
      );

      window.removeEventListener(
        "storage",
        handleAuthChanged
      );
    };
  }, []);

  const handleProfileImage = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setImageMessageType("error");
      setImageMessage("Please select a valid image.");
      setTimeout(() => {
        setImageMessage("");
      }, 4000);

      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setImageMessageType("error");
      setImageMessage(
        "Image must be smaller than 5 MB."
      );

      setTimeout(() => {
        setImageMessage("");
      }, 4000);

      event.target.value = "";
      return;
    }

    setUploadingImage(true);
    setImageMessage("");
    setImageMessageType("");

    const reader = new FileReader();

    reader.onload = async () => {
      try {
        const image = reader.result;

        
const response = await api.patch(
  "/auth/profile",
  {
    name: user?.name || "",
    username: user?.username || "",
    profile_picture: image,
  }
);



        const updatedUser = response.data?.user;

        if (!updatedUser) {
          throw new Error(
            "User data was not returned by the server."
          );
        }

        setUser(updatedUser);

        localStorage.setItem(
          "user",
          JSON.stringify(updatedUser)
        );

        window.dispatchEvent(
          new Event("authChanged")
        );

        window.dispatchEvent(
          new Event("profileImageUpdated")
        );

        setImageMessageType("success");
        setImageMessage(
          "Profile picture updated successfully."
        );

        setTimeout(() => {
          setImageMessage("");
        }, 3000);
      } catch (err) {
        console.error(
          "PROFILE IMAGE UPDATE ERROR:",
          err
        );

        const backendMessage =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Failed to update profile picture.";

        setImageMessageType("error");
        setImageMessage(backendMessage);

        setTimeout(() => {
          setImageMessage("");
        }, 4000);
      } finally {
        setUploadingImage(false);
      }
    };

    reader.onerror = () => {
      setUploadingImage(false);
      setImageMessageType("error");
      setImageMessage(
        "Failed to read the selected image."
      );

      setTimeout(() => {
        setImageMessage("");
      }, 4000);
    };

    reader.readAsDataURL(file);

    event.target.value = "";
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", { replace: true });
  };

  const displayName = user?.name || "Creator";

  const email =
    user?.email || "No email available";

  const username = user?.username || "";


const profileImagePath =
  user?.profile_picture ||
  user?.profilePicture ||
  user?.profileImage ||
  "";

const profileImage = profileImagePath
  ? profileImagePath.startsWith("http") ||
    profileImagePath.startsWith("data:image/")
    ? profileImagePath
    : `http://localhost:8080${profileImagePath}`
  : "";



  const recentPolls = [...polls]
    .sort((a, b) => {
      const first = new Date(
        a.created_at ||
          a.createdAt ||
          0
      ).getTime();

      const second = new Date(
        b.created_at ||
          b.createdAt ||
          0
      ).getTime();

      return second - first;
    })
    .slice(0, 4);

  const formatNumber = (value) => {
    return new Intl.NumberFormat("en-IN").format(
      value
    );
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

  return (
    <Layout wide>
      <div className="relative min-h-[calc(100vh-120px)] overflow-hidden">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-[-160px] top-[-120px] h-[400px] w-[400px] rounded-full bg-[#FFD21F]/5 blur-[130px]" />

          <div className="absolute right-[-140px] top-[260px] h-[360px] w-[360px] rounded-full bg-[#4090F0]/5 blur-[120px]" />

          <div className="absolute bottom-[-120px] left-[30%] h-[300px] w-[300px] rounded-full bg-[#FFD21F]/[0.025] blur-[110px]" />

          <div
            className="absolute inset-0 opacity-[0.018]"
            style={{
              backgroundImage:
                "linear-gradient(#FFD21F 1px, transparent 1px), linear-gradient(90deg, #FFD21F 1px, transparent 1px)",
              backgroundSize: "64px 64px",
            }}
          />
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex items-center justify-between animate-[fadeIn_0.45s_ease-out]">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="group flex items-center gap-2 text-sm font-medium text-[#9CA3AF] transition duration-300 hover:-translate-x-0.5 hover:text-[#FFD21F]"
            >
              <ArrowLeft
                size={16}
                className="transition-transform duration-300 group-hover:-translate-x-1"
              />
              Back
            </button>

            <Link
              to="/settings"
              className="group inline-flex items-center gap-2 rounded-xl border border-[#292929] bg-[#111111] px-4 py-2.5 text-sm font-semibold text-[#9CA3AF] shadow-[0_8px_25px_rgba(0,0,0,0.15)] transition duration-300 hover:-translate-y-0.5 hover:border-[#FFD21F]/40 hover:bg-[#151515] hover:text-[#FFD21F]"
            >
              <Settings
                size={16}
                className="transition-transform duration-300 group-hover:rotate-45"
              />
              Settings
            </Link>
          </div>

          <section className="relative overflow-hidden rounded-[30px] border border-[#292929] bg-[#111111] shadow-[0_25px_80px_rgba(0,0,0,0.30)] animate-[fadeInUp_0.5s_ease-out]">
            <div className="relative h-36 overflow-hidden border-b border-[#292929] bg-[#090909] sm:h-48">
              <div className="absolute inset-0 bg-gradient-to-r from-[#FFD21F]/8 via-transparent to-[#4090F0]/8" />

              <div className="absolute left-[18%] top-[-60px] h-40 w-40 rounded-full bg-[#FFD21F]/5 blur-3xl" />

              <div className="absolute right-[15%] bottom-[-70px] h-44 w-44 rounded-full bg-[#4090F0]/5 blur-3xl" />

              <div
                className="absolute inset-0 opacity-[0.05]"
                style={{
                  backgroundImage:
                    "linear-gradient(#FFD21F 1px, transparent 1px), linear-gradient(90deg, #FFD21F 1px, transparent 1px)",
                  backgroundSize: "36px 36px",
                }}
              />

              <div className="absolute right-5 top-5 flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/5 px-3 py-1.5 backdrop-blur-sm sm:right-8 sm:top-7">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />

                <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-green-400">
                  Live Creator
                </span>
              </div>
            </div>

            <div className="relative px-5 pb-6 sm:px-8 sm:pb-8">
              <div className="-mt-14 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
                  <div className="relative shrink-0">
                    <div className="absolute -inset-3 rounded-full bg-[#FFD21F]/10 blur-2xl" />

                    <div className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-[#111111] bg-[#090909] text-4xl font-black text-[#FFD21F] ring-1 ring-[#FFD21F]/30 shadow-[0_15px_45px_rgba(0,0,0,0.35)] sm:h-32 sm:w-32">
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt={displayName}
                          className="h-full w-full object-cover"
                          onError={(event) => {
                            event.currentTarget.style.display =
                              "none";
                          }}
                        />
                      ) : (
                        displayName
                          .charAt(0)
                          .toUpperCase()
                      )}
                    </div>

                    <label
                      htmlFor="profile-image"
                      className={`group absolute bottom-1 right-1 grid h-9 w-9 place-items-center rounded-full border-2 border-[#111111] bg-[#FFD21F] text-black shadow-[0_8px_25px_rgba(255,210,31,0.20)] transition duration-300 ${
                        uploadingImage
                          ? "cursor-not-allowed opacity-70"
                          : "cursor-pointer hover:scale-105 hover:bg-[#FFE66D]"
                      }`}
                      title={
                        uploadingImage
                          ? "Uploading..."
                          : "Change profile picture"
                      }
                    >
                      {uploadingImage ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                      ) : (
                        <Camera
                          size={16}
                          className="transition-transform duration-300 group-hover:rotate-6"
                        />
                      )}
                    </label>

                    <input
                      id="profile-image"
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      onChange={handleProfileImage}
                      disabled={uploadingImage}
                      className="hidden"
                    />

                    {imageMessage && (
                      <div
                        className={`absolute left-1/2 top-full z-20 mt-3 -translate-x-1/2 whitespace-nowrap rounded-lg border px-3 py-2 text-xs font-semibold shadow-lg ${
                          imageMessageType === "success"
                            ? "border-green-500/20 bg-green-500/10 text-green-400"
                            : "border-rose-500/20 bg-rose-500/10 text-rose-400"
                        }`}
                      >
                        {imageMessage}
                      </div>
                    )}
                  </div>

                  <div className="pb-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                        {displayName}
                      </h1>

                      <span className="inline-flex items-center gap-1 rounded-full border border-[#FFD21F]/20 bg-[#FFD21F]/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#FFD21F]">
                        <CheckCircle2 size={11} />
                        Creator
                      </span>
                    </div>

                    {username && (
                      <p className="mt-1 text-sm text-[#6B7280]">
                        @{username}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-[#9CA3AF]">
                      <span className="inline-flex items-center gap-2">
                        <Mail
                          size={14}
                          className="text-[#4090F0]"
                        />
                        {email}
                      </span>

                      <span className="hidden h-1 w-1 rounded-full bg-[#292929] sm:block" />

                      <span className="inline-flex items-center gap-2">
                        <Zap
                          size={14}
                          className="text-[#FFD21F]"
                        />
                        Real-time polling
                      </span>
                    </div>

                    <label
                      htmlFor="profile-image"
                      className={`mt-3 inline-block text-xs font-semibold text-[#FFD21F] transition ${
                        uploadingImage
                          ? "cursor-not-allowed opacity-50"
                          : "cursor-pointer hover:text-[#FFE66D]"
                      }`}
                    >
                      {uploadingImage
                        ? "Uploading profile picture..."
                        : "Change profile picture"}
                    </label>

                    <p className="mt-1 text-[10px] text-[#4B4B4B]">
                      PNG, JPG or WEBP • Max 5 MB
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <Link
                    to="/my-polls"
                    className="group inline-flex items-center justify-center gap-2 rounded-xl border border-[#292929] bg-[#090909] px-4 py-2.5 text-sm font-semibold text-[#9CA3AF] transition duration-300 hover:-translate-y-0.5 hover:border-[#FFD21F]/30 hover:text-[#FFD21F]"
                  >
                    <FileText
                      size={15}
                      className="transition-transform duration-300 group-hover:scale-110"
                    />
                    My Polls
                  </Link>

                  <Link
                    to="/create-poll"
                    className="group inline-flex items-center justify-center gap-2 rounded-xl bg-[#FFD21F] px-4 py-2.5 text-sm font-bold text-black shadow-[0_10px_30px_rgba(255,210,31,0.10)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#FFE66D] hover:shadow-[0_14px_35px_rgba(255,210,31,0.18)] active:scale-95"
                  >
                    <PlusIcon />
                    Create Poll
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="group relative overflow-hidden rounded-2xl border border-[#292929] bg-[#111111] p-5 shadow-[0_15px_40px_rgba(0,0,0,0.18)] transition duration-300 hover:-translate-y-1 hover:border-[#FFD21F]/25">
              <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-[#FFD21F]/5 blur-2xl transition group-hover:bg-[#FFD21F]/10" />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#FFD21F]/10">
                    <PenLine
                      size={18}
                      className="text-[#FFD21F]"
                    />
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#4B4B4B]">
                    Created
                  </span>
                </div>

                <p className="mt-5 text-3xl font-black text-white">
                  {formatNumber(pollCount)}
                </p>

                <p className="mt-1 text-xs text-[#6B7280]">
                  Polls created
                </p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-[#292929] bg-[#111111] p-5 shadow-[0_15px_40px_rgba(0,0,0,0.18)] transition duration-300 hover:-translate-y-1 hover:border-[#4090F0]/25">
              <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-[#4090F0]/5 blur-2xl transition group-hover:bg-[#4090F0]/10" />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#4090F0]/10">
                    <BarChart3
                      size={18}
                      className="text-[#4090F0]"
                    />
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#4B4B4B]">
                    Reach
                  </span>
                </div>

                <p className="mt-5 text-3xl font-black text-white">
                  {formatNumber(totalVotes)}
                </p>

                <p className="mt-1 text-xs text-[#6B7280]">
                  Total votes received
                </p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-[#292929] bg-[#111111] p-5 shadow-[0_15px_40px_rgba(0,0,0,0.18)] transition duration-300 hover:-translate-y-1 hover:border-green-500/20">
              <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-green-500/5 blur-2xl" />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-green-500/10">
                    <Zap
                      size={18}
                      className="text-green-400"
                    />
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#4B4B4B]">
                    Status
                  </span>
                </div>

                <p className="mt-5 text-2xl font-black text-green-400">
                  ACTIVE
                </p>

                <p className="mt-1 text-xs text-[#6B7280]">
                  Creator account
                </p>
              </div>
            </div>

            <div className="group relative overflow-hidden rounded-2xl border border-[#292929] bg-[#111111] p-5 shadow-[0_15px_40px_rgba(0,0,0,0.18)] transition duration-300 hover:-translate-y-1 hover:border-[#FFD21F]/25">
              <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-[#FFD21F]/5 blur-2xl" />

              <div className="relative">
                <div className="flex items-center justify-between">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#FFD21F]/10">
                    <Sparkles
                      size={18}
                      className="text-[#FFD21F]"
                    />
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#4B4B4B]">
                    Activity
                  </span>
                </div>

                <p className="mt-5 text-2xl font-black text-white">
                  {pollCount > 0
                    ? "ACTIVE"
                    : "READY"}
                </p>

                <p className="mt-1 text-xs text-[#6B7280]">
                  Polling workspace
                </p>
              </div>
            </div>
          </section>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="rounded-[26px] border border-[#292929] bg-[#111111] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)] sm:p-7">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#FFD21F]">
                    Creator activity
                  </p>

                  <h2 className="mt-1 text-lg font-black text-white">
                    Recent Polls
                  </h2>
                </div>

                <Link
                  to="/my-polls"
                  className="group inline-flex items-center gap-1 text-xs font-semibold text-[#6B7280] transition hover:text-[#FFD21F]"
                >
                  View all
                  <ChevronRight
                    size={14}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
              </div>

              {loadingPolls ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((item) => (
                    <div
                      key={item}
                      className="animate-pulse rounded-2xl border border-[#292929] bg-[#090909] p-4"
                    >
                      <div className="h-3 w-24 rounded bg-[#292929]" />
                      <div className="mt-3 h-5 w-3/4 rounded bg-[#292929]" />
                      <div className="mt-4 h-2 w-1/3 rounded bg-[#292929]" />
                    </div>
                  ))}
                </div>
              ) : recentPolls.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#292929] bg-[#090909] px-6 py-12 text-center">
                  <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#FFD21F]/10 text-[#FFD21F]">
                    <PenLine size={20} />
                  </div>

                  <h3 className="mt-4 text-sm font-bold text-[#D1D5DB]">
                    No polls created yet
                  </h3>

                  <p className="mt-1 text-xs text-[#6B7280]">
                    Create your first poll and start collecting opinions.
                  </p>

                  <Link
                    to="/create-poll"
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#FFD21F] px-4 py-2.5 text-xs font-bold text-black transition duration-300 hover:-translate-y-0.5 hover:bg-[#FFE66D]"
                  >
                    Create your first poll
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentPolls.map((poll, index) => {
                    const voteCount =
                      (poll.options || []).reduce(
                        (sum, option) =>
                          sum +
                          Number(
                            option.votes || 0
                          ),
                        0
                      );

                    return (
                      <div
                        key={poll.id}
                        className="group relative overflow-hidden rounded-2xl border border-[#292929] bg-[#090909] p-4 transition duration-300 hover:-translate-y-0.5 hover:border-[#FFD21F]/30 hover:bg-[#0C0C0C]"
                        style={{
                          animation: `fadeInUp 0.4s ease-out ${
                            index * 60
                          }ms both`,
                        }}
                      >
                        <div className="pointer-events-none absolute right-0 top-0 h-20 w-20 rounded-full bg-[#FFD21F]/5 blur-2xl" />

                        <div className="relative flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              <span className="rounded-lg border border-[#FFD21F]/15 bg-[#FFD21F]/5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#FFD21F]">
                                {poll.category ||
                                  "General"}
                              </span>

                              <span className="text-[10px] text-[#4B4B4B]">
                                {poll.type ||
                                  "poll"}
                              </span>
                            </div>

                            <h3 className="line-clamp-2 text-sm font-bold leading-6 text-[#D1D5DB] transition group-hover:text-white">
                              {poll.question ||
                                "Untitled poll"}
                            </h3>
                          </div>

                          <Link
                            to={`/poll/${poll.id}`}
                            className="group/open shrink-0 rounded-xl border border-[#292929] bg-[#111111] p-2 text-[#6B7280] transition duration-300 hover:border-[#FFD21F]/30 hover:text-[#FFD21F]"
                          >
                            <ChevronRight
                              size={16}
                              className="transition-transform duration-300 group-hover/open:translate-x-0.5"
                            />
                          </Link>
                        </div>

                        <div className="relative mt-4 flex flex-wrap items-center gap-4 text-[11px] text-[#6B7280]">
                          <span className="inline-flex items-center gap-1.5">
                            <BarChart3
                              size={13}
                              className="text-[#4090F0]"
                            />
                            {formatNumber(
                              voteCount
                            )}{" "}
                            votes
                          </span>

                          <span className="inline-flex items-center gap-1.5">
                            <FileText size={13} />
                            {formatDate(
                              poll.created_at ||
                                poll.createdAt
                            )}
                          </span>

                          <Link
                            to={`/analytics/${poll.id}`}
                            className="ml-auto font-semibold text-[#6B7280] transition hover:text-[#FFD21F]"
                          >
                            Analytics
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="rounded-[26px] border border-[#292929] bg-[#111111] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.20)]">
                <div className="mb-5 flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#FFD21F]/10">
                    <User
                      size={18}
                      className="text-[#FFD21F]"
                    />
                  </div>

                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#4B4B4B]">
                      Account
                    </p>

                    <h2 className="mt-1 text-sm font-bold text-white">
                      Profile details
                    </h2>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="rounded-xl border border-[#292929] bg-[#090909] px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#4B4B4B]">
                      Name
                    </p>

                    <p className="mt-1 truncate text-sm text-[#D1D5DB]">
                      {displayName}
                    </p>
                  </div>

                  <div className="rounded-xl border border-[#292929] bg-[#090909] px-4 py-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#4B4B4B]">
                      Email
                    </p>

                    <p className="mt-1 truncate text-sm text-[#D1D5DB]">
                      {email}
                    </p>
                  </div>

                  {username && (
                    <div className="rounded-xl border border-[#292929] bg-[#090909] px-4 py-3">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#4B4B4B]">
                        Username
                      </p>

                      <p className="mt-1 truncate text-sm text-[#D1D5DB]">
                        @{username}
                      </p>
                    </div>
                  )}
                </div>

                <Link
                  to="/settings"
                  className="group mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#292929] bg-[#090909] px-4 py-2.5 text-xs font-semibold text-[#9CA3AF] transition duration-300 hover:-translate-y-0.5 hover:border-[#FFD21F]/30 hover:text-[#FFD21F]"
                >
                  <Settings
                    size={14}
                    className="transition-transform duration-300 group-hover:rotate-45"
                  />
                  Manage Settings
                </Link>
              </div>

              <div className="group relative overflow-hidden rounded-[26px] bg-gradient-to-br from-[#FFD21F] to-[#FFE66D] p-6 text-black shadow-[0_20px_50px_rgba(255,210,31,0.08)]">
                <div className="absolute right-[-20px] top-[-20px] h-32 w-32 rounded-full bg-white/20 blur-3xl" />

                <div className="relative">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-black/10">
                    <Sparkles size={18} />
                  </div>

                  <p className="mt-5 text-[10px] font-black uppercase tracking-[0.2em] text-black/50">
                    PULSE Creator
                  </p>

                  <h3 className="mt-2 text-lg font-black">
                    Your audience is waiting.
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-black/60">
                    Turn your next idea into a live conversation.
                  </p>

                  <Link
                    to="/create-poll"
                    className="group/create mt-5 inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-xs font-bold text-white transition duration-300 hover:bg-zinc-900"
                  >
                    Create Poll

                    <ChevronRight
                      size={14}
                      className="transition-transform duration-300 group-hover/create:translate-x-1"
                    />
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <button
            type="button"
            onClick={logout}
            className="group flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/5 px-5 py-3.5 text-sm font-semibold text-rose-400 transition duration-300 hover:-translate-y-0.5 hover:bg-rose-500/10"
          >
            <LogOut
              size={16}
              className="transition-transform duration-300 group-hover:-translate-x-0.5"
            />
            Logout
          </button>
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

function PlusIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

