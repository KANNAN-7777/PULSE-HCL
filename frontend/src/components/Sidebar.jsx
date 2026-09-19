import {
  LayoutGrid,
  PlusSquare,
  PenLine,
  CheckCircle2,
  Bookmark,
  LogOut,
  TrendingUp,
  User,
  ChevronRight,
} from "lucide-react";

import { NavLink, useNavigate } from "react-router-dom";

const NAV = [
  {
    to: "/dashboard",
    label: "Dashboard",
    Icon: LayoutGrid,
  },
  {
    to: "/create-poll",
    label: "Create Poll",
    Icon: PlusSquare,
  },
  {
    to: "/my-polls",
    label: "My Polls",
    Icon: PenLine,
  },
  {
    to: "/voted-polls",
    label: "Voted Polls",
    Icon: CheckCircle2,
  },
  {
    to: "/bookmarked-polls",
    label: "Saved Polls",
    Icon: Bookmark,
  },
];

function getBackendUrl() {
  const apiUrl =
    import.meta.env.VITE_API_URL ||
    "http://localhost:8080/api";

  return apiUrl.replace(/\/api\/?$/, "");
}

function getProfileImage(user) {
  const image =
    user?.profile_picture ||
    user?.profileImage ||
    user?.profilePicture ||
    "";

  if (!image) {
    return "";
  }

  const value = String(image).trim();

  if (!value) {
    return "";
  }

  // Base64 image
  if (value.startsWith("data:image/")) {
    return value;
  }

  // Full URL
  if (
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return value;
  }

  // Relative backend path
  return `${getBackendUrl()}${
    value.startsWith("/") ? "" : "/"
  }${value}`;
}

function Sidebar({ user = {} }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    window.dispatchEvent(
      new Event("authChanged")
    );

    navigate("/login", {
      replace: true,
    });
  };

  const profileImage =
    getProfileImage(user);

  const displayName =
    user?.name ||
    user?.username ||
    "Creator";

  const email =
    user?.email ||
    "Creator account";

  const profileInitial =
    displayName
      .charAt(0)
      .toUpperCase();

  return (
    <aside className="sticky top-20 space-y-4 py-6">
      {/* PROFILE CARD */}
      <div className="group/profile relative overflow-hidden rounded-2xl border border-[#292929] bg-[#111111] p-5 shadow-[0_12px_35px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#FFD21F]/25 hover:bg-[#141414] hover:shadow-[0_18px_45px_rgba(0,0,0,0.22)]">
        <div className="pointer-events-none absolute -left-12 -top-12 h-28 w-28 rounded-full bg-[#FFD21F]/10 blur-3xl transition-all duration-700 group-hover/profile:bg-[#FFD21F]/15" />

        <div className="pointer-events-none absolute -bottom-14 -right-14 h-24 w-24 rounded-full bg-[#4090F0]/5 blur-3xl transition-all duration-700 group-hover/profile:bg-[#4090F0]/10" />

        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FFD21F]/40 to-transparent opacity-0 transition-opacity duration-500 group-hover/profile:opacity-100" />

        <div className="relative flex flex-col items-center text-center">
          {/* AVATAR */}
          <div className="relative">
            <div className="absolute -inset-2 rounded-full bg-[#FFD21F]/10 blur-md transition-all duration-500 group-hover/profile:bg-[#FFD21F]/20 group-hover/profile:blur-lg" />

            <div className="relative flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-2 border-[#292929] bg-[#090909] text-xl font-bold text-[#FFD21F] transition-all duration-300 group-hover/profile:scale-105 group-hover/profile:border-[#FFD21F]/50 group-hover/profile:shadow-[0_0_25px_rgba(255,210,31,0.12)]">
              {profileImage ? (
                <img
                  key={profileImage}
                  src={profileImage}
                  alt={`${displayName} profile`}
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    console.error(
                      "SIDEBAR PROFILE IMAGE FAILED:",
                      profileImage
                    );

                    event.currentTarget.style.display =
                      "none";
                  }}
                />
              ) : displayName ? (
                <span>
                  {profileInitial}
                </span>
              ) : (
                <User size={22} />
              )}
            </div>

            <span className="absolute bottom-0 right-0 h-3.5 w-3.5 animate-pulse rounded-full border-2 border-[#111111] bg-emerald-400 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
          </div>

          {/* NAME */}
          <button
            type="button"
            onClick={() =>
              navigate("/profile")
            }
            className="mt-3 max-w-full truncate text-sm font-semibold text-zinc-200 transition-all duration-200 hover:-translate-y-0.5 hover:text-[#FFD21F]"
          >
            {displayName}
          </button>

          {/* EMAIL */}
          <p className="mt-1 max-w-full truncate text-xs text-zinc-600">
            {email}
          </p>

          {/* PROFILE BUTTON */}
          <button
            type="button"
            onClick={() =>
              navigate("/profile")
            }
            className="group/profileButton mt-4 inline-flex items-center gap-1.5 rounded-full border border-[#FFD21F]/15 bg-[#FFD21F]/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[#FFD21F] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#FFD21F]/40 hover:bg-[#FFD21F]/10 hover:shadow-[0_0_15px_rgba(255,210,31,0.08)]"
          >
            Creator Profile

            <ChevronRight
              size={11}
              className="transition-transform duration-300 group-hover/profileButton:translate-x-0.5"
            />
          </button>
        </div>
      </div>

      {/* WORKSPACE */}
      <div>
        <div className="mb-2 flex items-center justify-between px-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-700">
            Workspace
          </p>

          <span className="text-[9px] font-semibold uppercase tracking-widest text-zinc-800">
            PULSE
          </span>
        </div>

        <nav className="space-y-1">
          {NAV.map(
            ({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `group relative flex items-center gap-3 overflow-hidden rounded-xl border px-3 py-3 text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? "border-[#FFD21F]/20 bg-[#FFD21F]/10 text-[#FFD21F] shadow-[0_8px_25px_rgba(255,210,31,0.05)]"
                      : "border-transparent text-zinc-500 hover:translate-x-0.5 hover:border-[#292929] hover:bg-[#111111] hover:text-zinc-100"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <>
                        <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-[#FFD21F] shadow-[0_0_10px_rgba(255,210,31,0.55)]" />

                        <span className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#FFD21F]/5 to-transparent" />
                      </>
                    )}

                    <Icon
                      size={17}
                      className={`shrink-0 transition-all duration-300 group-hover:scale-110 ${
                        isActive
                          ? "text-[#FFD21F]"
                          : "text-zinc-600 group-hover:text-zinc-300"
                      }`}
                    />

                    <span className="flex-1">
                      {label}
                    </span>

                    {isActive && (
                      <ChevronRight
                        size={14}
                        className="text-[#FFD21F]/60 transition-transform duration-300 group-hover:translate-x-0.5"
                      />
                    )}
                  </>
                )}
              </NavLink>
            )
          )}
        </nav>
      </div>

      {/* LIVE STATUS */}
      <div className="group/live relative overflow-hidden rounded-2xl border border-[#292929] bg-[#111111] p-4 shadow-[0_12px_35px_rgba(0,0,0,0.10)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#FFD21F]/20 hover:bg-[#141414]">
        <div className="pointer-events-none absolute right-[-30px] top-[-30px] h-24 w-24 rounded-full bg-[#FFD21F]/5 blur-3xl transition-all duration-500 group-hover/live:bg-[#FFD21F]/10" />

        <div className="pointer-events-none absolute bottom-[-30px] left-[-30px] h-20 w-20 rounded-full bg-[#4090F0]/5 blur-3xl opacity-0 transition-opacity duration-500 group-hover/live:opacity-100" />

        <div className="relative">
          <div className="mb-4 flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg border border-[#FFD21F]/10 bg-[#FFD21F]/10 transition-all duration-300 group-hover/live:scale-105 group-hover/live:border-[#FFD21F]/20">
              <TrendingUp
                size={14}
                className="text-[#FFD21F]"
              />
            </div>

            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                PULSE Live
              </p>

              <p className="mt-0.5 text-[10px] text-zinc-700">
                Real-time activity
              </p>
            </div>

            <span className="ml-auto h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
          </div>

          <div className="space-y-4">
            <div>
              <div className="mb-1.5 flex items-center justify-between text-[11px]">
                <span className="text-zinc-500">
                  Real-time votes
                </span>

                <span className="font-semibold text-emerald-400">
                  LIVE
                </span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-[#292929]">
                <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-[#FFD21F] via-[#FFE66D] to-[#FFD21F] shadow-[0_0_10px_rgba(255,210,31,0.25)] [background-size:200%_100%] animate-[liveBar_2.5s_ease-in-out_infinite]" />
              </div>
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between text-[11px]">
                <span className="text-zinc-500">
                  Poll activity
                </span>

                <span className="font-medium text-[#4090F0]">
                  Active
                </span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-[#292929]">
                <div className="h-full w-[58%] rounded-full bg-gradient-to-r from-[#4090F0]/50 to-[#4090F0]/80 shadow-[0_0_8px_rgba(64,144,240,0.15)] transition-all duration-700 group-hover/live:w-[64%]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* LOGOUT */}
      <button
        type="button"
        onClick={logout}
        className="group flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-3 text-sm font-medium text-rose-400 transition-all duration-300 hover:translate-x-0.5 hover:border-rose-500/10 hover:bg-rose-500/5"
      >
        <LogOut
          size={17}
          className="transition-transform duration-300 group-hover:-translate-x-0.5"
        />

        <span className="flex-1 text-left">
          Logout
        </span>

        <ChevronRight
          size={13}
          className="text-rose-500/0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-rose-500/50"
        />
      </button>

      <style>{`
        @keyframes liveBar {
          0%,
          100% {
            background-position: 0% 50%;
          }

          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
    </aside>
  );
}

export default Sidebar;