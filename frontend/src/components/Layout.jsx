import {
  Search,
  Plus,
  LayoutGrid,
  PlusSquare,
  PenLine,
  CheckCircle2,
  Bookmark,
  LogOut,
  Menu,
  X,
  User,
} from "lucide-react";

import {
  NavLink,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";

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

function getStoredUser() {
  try {
    return (
      JSON.parse(
        localStorage.getItem("user")
      ) || {}
    );
  } catch {
    return {};
  }
}

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

  // Backend uploaded image
  return `${getBackendUrl()}${
    value.startsWith("/") ? "" : "/"
  }${value}`;
}

function Layout({ children, wide = false }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenu, setMobileMenu] =
    useState(false);

  const [user, setUser] = useState(
    getStoredUser
  );

  /*
   * Reload the latest user from localStorage
   * whenever authentication/profile information changes.
   */
  useEffect(() => {
    const updateUser = () => {
      setUser(getStoredUser());
    };

    window.addEventListener(
      "profileImageUpdated",
      updateUser
    );

    window.addEventListener(
      "authChanged",
      updateUser
    );

    window.addEventListener(
      "storage",
      updateUser
    );

    return () => {
      window.removeEventListener(
        "profileImageUpdated",
        updateUser
      );

      window.removeEventListener(
        "authChanged",
        updateUser
      );

      window.removeEventListener(
        "storage",
        updateUser
      );
    };
  }, []);

  useEffect(() => {
    setMobileMenu(false);
  }, [location.pathname]);

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

  const isCreatePoll =
    location.pathname === "/create-poll";

  const isWide =
    wide || isCreatePoll;

  const ProfileAvatar = ({
    size = "h-9 w-9",
  }) => {
    const [imageError, setImageError] =
      useState(false);

    useEffect(() => {
      setImageError(false);
    }, [profileImage]);

    return (
      <div
        className={`group/avatar relative grid ${size} shrink-0 place-items-center overflow-hidden rounded-full border border-[#292929] bg-[#111111] text-sm font-bold text-[#FFD21F] shadow-[0_0_0_rgba(255,210,31,0)] transition-all duration-300 hover:scale-105 hover:border-[#FFD21F]/50 hover:shadow-[0_0_18px_rgba(255,210,31,0.12)]`}
      >
        <span className="pointer-events-none absolute inset-0 rounded-full bg-[#FFD21F]/0 transition-all duration-300 group-hover/avatar:bg-[#FFD21F]/5" />

        {profileImage && !imageError ? (
          <img
            key={profileImage}
            src={profileImage}
            alt={`${displayName} profile`}
            className="relative h-full w-full object-cover"
            onError={() => {
              console.error(
                "PROFILE IMAGE FAILED:",
                profileImage
              );

              setImageError(true);
            }}
          />
        ) : displayName ? (
          <span className="relative">
            {displayName
              .charAt(0)
              .toUpperCase()}
          </span>
        ) : (
          <User
            size={16}
            className="relative"
          />
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-[#050505] text-white">
      <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.018]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(#FFD21F 1px, transparent 1px), linear-gradient(90deg, #FFD21F 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <header className="sticky top-0 z-50 w-full border-b border-[#292929] bg-[#050505]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center gap-4 px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() =>
              setMobileMenu(true)
            }
            className="grid h-10 w-10 place-items-center rounded-xl text-zinc-400 transition hover:bg-[#111111] hover:text-[#FFD21F] lg:hidden"
          >
            <Menu size={20} />
          </button>

          <button
            type="button"
            onClick={() =>
              navigate("/dashboard")
            }
            className="flex items-center"
          >
            <img
              src="/pulse-logo.png"
              alt="PULSE"
              className="h-15 w-auto object-contain"
            />
          </button>

          <div className="relative mx-auto hidden w-full max-w-xl md:block">
            <Search
              size={16}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-700"
            />

            <input
              type="text"
              placeholder="Search polls..."
              className="w-full rounded-xl border border-[#292929] bg-[#111111] py-2.5 pl-9 pr-4 text-sm text-zinc-300 outline-none placeholder:text-zinc-700 focus:border-[#FFD21F]/50 focus:ring-2 focus:ring-[#FFD21F]/10"
            />
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() =>
                navigate("/create-poll")
              }
              className="hidden items-center gap-2 rounded-xl bg-[#FFD21F] px-4 py-2.5 text-sm font-bold text-black transition hover:bg-[#FFE66D] sm:flex"
            >
              <Plus size={16} />
              Create
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/profile")
              }
              className="rounded-full"
              title={displayName}
            >
              <ProfileAvatar />
            </button>
          </div>
        </div>
      </header>

      {mobileMenu && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() =>
              setMobileMenu(false)
            }
          />

          <aside className="absolute left-0 top-0 h-full w-[280px] overflow-y-auto border-r border-[#292929] bg-[#050505] p-5 shadow-2xl">
            <div className="mb-8 flex items-center justify-between">
              <button
                type="button"
                onClick={() =>
                  navigate("/dashboard")
                }
                className="flex items-center gap-2"
              >
                <img
                  src="/pulse-logo.png"
                  alt="PULSE"
                  className="h-9 w-auto object-contain"
                />
              </button>

              <button
                type="button"
                onClick={() =>
                  setMobileMenu(false)
                }
                className="grid h-9 w-9 place-items-center rounded-xl text-zinc-500 hover:bg-[#111111] hover:text-[#FFD21F]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mb-6 flex items-center gap-3 rounded-xl border border-[#292929] bg-[#111111] p-3">
              <ProfileAvatar size="h-10 w-10" />

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-zinc-200">
                  {displayName}
                </p>

                <p className="text-xs text-zinc-600">
                  Creator
                </p>
              </div>
            </div>

            <nav className="space-y-1">
              {NAV.map(
                ({
                  to,
                  label,
                  Icon,
                }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({
                      isActive,
                    }) =>
                      `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                        isActive
                          ? "bg-[#FFD21F]/10 text-[#FFD21F]"
                          : "text-zinc-500 hover:bg-[#111111] hover:text-white"
                      }`
                    }
                  >
                    <Icon size={17} />
                    {label}
                  </NavLink>
                )
              )}
            </nav>

            <button
              type="button"
              onClick={logout}
              className="mt-8 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-rose-400 hover:bg-rose-500/10"
            >
              <LogOut size={17} />
              Logout
            </button>
          </aside>
        </div>
      )}

      <div className="relative z-10 mx-auto flex w-full max-w-[1600px] gap-6 px-4 sm:px-6 lg:px-8">
        <div className="hidden w-52 shrink-0 lg:block">
          <Sidebar user={user} />
        </div>

        <main className="min-w-0 flex-1 py-6 pb-24 lg:pb-8">
          <div
            className={
              isWide
                ? "w-full max-w-none"
                : "mx-auto w-full max-w-4xl"
            }
          >
            <div className="animate-[pageIn_0.35s_ease-out]">
              {children}
            </div>
          </div>
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-[#292929] bg-[#050505]/95 px-2 py-1 backdrop-blur-xl lg:hidden">
        {NAV.slice(0, 4).map(
          ({
            to,
            label,
            Icon,
          }) => (
            <NavLink
              key={to}
              to={to}
              className={({
                isActive,
              }) =>
                `flex flex-1 flex-col items-center gap-1 py-2 text-[10px] font-semibold ${
                  isActive
                    ? "text-[#FFD21F]"
                    : "text-zinc-700"
                }`
              }
            >
              <Icon size={18} />
              {label.replace(
                " Poll",
                ""
              )}
            </NavLink>
          )
        )}
      </nav>

      <style>{`
        @keyframes pageIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

export default Layout;