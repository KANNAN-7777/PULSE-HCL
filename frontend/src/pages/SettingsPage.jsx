import { useState } from "react";
import {
  User,
  Mail,
  Lock,
  LogOut,
  Save,
  ArrowLeft,
  Check,
  X,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import Layout from "../components/Layout";
import api from "../utils/api";

function getPasswordStrength(password) {
  let score = 0;

  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (password.length >= 12) score++;

  if (score <= 2) {
    return {
      label: "Weak",
      width: "20%",
      className: "bg-red-500",
      textClass: "text-red-400",
    };
  }

  if (score === 3) {
    return {
      label: "Fair",
      width: "40%",
      className: "bg-orange-500",
      textClass: "text-orange-400",
    };
  }

  if (score === 4) {
    return {
      label: "Good",
      width: "70%",
      className: "bg-yellow-500",
      textClass: "text-yellow-400",
    };
  }

  return {
    label: "Strong",
    width: "100%",
    className: "bg-emerald-500",
    textClass: "text-emerald-400",
  };
}

function PasswordRequirement({
  valid,
  children,
}) {
  return (
    <div
      className={`flex items-center gap-2 text-xs transition-colors duration-300 ${
        valid
          ? "text-emerald-400"
          : "text-[#6B7280]"
      }`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
          valid
            ? "bg-emerald-500/10"
            : "bg-[#292929]"
        }`}
      >
        {valid ? (
          <Check size={12} />
        ) : (
          <X size={12} />
        )}
      </span>

      <span>{children}</span>
    </div>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();

  const storedUser = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const [name, setName] = useState(
    storedUser.name || ""
  );

  const [email] = useState(
    storedUser.email || ""
  );

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] =
    useState(false);

  const passwordStrength =
    getPasswordStrength(newPassword);

  const passwordChecks = {
    length: newPassword.length >= 8,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    number: /[0-9]/.test(newPassword),
    special: /[^A-Za-z0-9]/.test(newPassword),
  };

const handleProfileUpdate = async (e) => {
  e.preventDefault();

  setMessage("");
  setError("");

  if (!name.trim()) {
    setError("Name cannot be empty.");
    return;
  }

  try {
    setSaving(true);

    const response = await api.patch("/auth/profile", {
      name: name.trim(),
    });

    const updatedUser = response.data?.user;

    if (updatedUser) {
      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      window.dispatchEvent(
        new Event("profileImageUpdated")
      );

      window.dispatchEvent(
        new Event("authChanged")
      );
    }

    setMessage(
      response.data?.message ||
        "Profile information updated."
    );
  } catch (err) {
  console.log("PROFILE UPDATE ERROR:", err);

  console.log("STATUS:", err.response?.status);
  console.log("DATA:", err.response?.data);

  setError(
    err.response?.data?.message ||
      `Profile update failed: ${
        err.message || "Unknown error"
      }`
  );
}  finally {
    setSaving(false);
  }
};

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!currentPassword || !newPassword) {
      setError(
        "Please enter both passwords."
      );
      return;
    }

    if (newPassword.length < 8) {
      setError(
        "Password must contain at least 8 characters."
      );
      return;
    }

    if (
      !passwordChecks.uppercase ||
      !passwordChecks.lowercase ||
      !passwordChecks.number ||
      !passwordChecks.special
    ) {
      setError(
        "Please create a stronger password using uppercase, lowercase, number, and special character."
      );
      return;
    }

    try {
      setSaving(true);

      await api.patch("/auth/password", {
        current_password: currentPassword,
        new_password: newPassword,
      });

      setCurrentPassword("");
      setNewPassword("");

      setMessage(
        "Password updated successfully."
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Password update is not available yet."
      );
    } finally {
      setSaving(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", {
      replace: true,
    });
  };

  return (
    <Layout>
      <div className="relative mx-auto max-w-5xl overflow-hidden space-y-5 pb-8">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(255,210,31,0.08),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(64,144,240,0.05),transparent_32%)]" />

        <div className="pointer-events-none absolute right-[-80px] top-[-80px] h-64 w-64 rounded-full bg-[#FFD21F]/5 blur-3xl" />

        <div className="pointer-events-none absolute bottom-[-100px] left-[-80px] h-60 w-60 rounded-full bg-[#4090F0]/5 blur-3xl" />

        <div className="relative animate-[fadeInUp_0.45s_ease-out]">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="group mb-4 inline-flex items-center gap-2 text-xs font-bold text-[#9CA3AF] transition duration-300 hover:-translate-x-0.5 hover:text-[#FFD21F]"
          >
            <ArrowLeft
              size={15}
              className="transition-transform duration-300 group-hover:-translate-x-0.5"
            />
            Back
          </button>

          <div className="flex items-start gap-3">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#FFD21F]/20 bg-[#FFD21F]/10">
              <div className="absolute inset-0 animate-pulse rounded-2xl bg-[#FFD21F]/5" />

              <Sparkles
                className="relative h-6 w-6 text-[#FFD21F]"
              />
            </div>

            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFD21F]">
                PULSE Account
              </p>

              <h1 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl">
                Settings
              </h1>

              <p className="mt-1 text-sm text-[#9CA3AF]">
                Manage your account settings.
              </p>
            </div>
          </div>
        </div>

        {message && (
          <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-[#111111] shadow-[0_10px_30px_rgba(0,0,0,0.18)] animate-[fadeInUp_0.35s_ease-out]">
            <div className="absolute left-0 top-0 h-full w-1 bg-emerald-500" />

            <div className="flex items-center gap-3 px-5 py-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10">
                <Check className="h-4 w-4 text-emerald-400" />
              </div>

              <p className="text-sm font-medium text-emerald-400">
                {message}
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="relative overflow-hidden rounded-2xl border border-red-500/20 bg-[#111111] shadow-[0_10px_30px_rgba(0,0,0,0.18)] animate-[fadeInUp_0.35s_ease-out]">
            <div className="absolute left-0 top-0 h-full w-1 bg-red-500" />

            <div className="flex items-start gap-3 px-5 py-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-500/10">
                <X className="h-4 w-4 text-red-400" />
              </div>

              <p className="text-sm leading-6 text-red-400">
                {error}
              </p>
            </div>
          </div>
        )}

        <div className="grid gap-5 lg:grid-cols-2">
          <form
            onSubmit={handleProfileUpdate}
            className="group relative overflow-hidden rounded-3xl border border-[#292929] bg-[#111111] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)] transition duration-500 hover:border-[#FFD21F]/20 sm:p-7"
          >
            <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-[#FFD21F]/5 blur-3xl transition duration-500 group-hover:bg-[#FFD21F]/10" />

            <div className="relative">
              <div className="mb-7 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#FFD21F]/20 bg-[#FFD21F]/10">
                  <User
                    size={19}
                    className="text-[#FFD21F]"
                  />
                </div>

                <div>
                  <h2 className="text-sm font-black text-white">
                    Profile
                  </h2>

                  <p className="mt-0.5 text-xs text-[#6B7280]">
                    Update your basic information.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
                    Name
                  </label>

                  <div className="relative">
                    <User
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4B4B4B]"
                    />

                    <input
                      value={name}
                      onChange={(e) =>
                        setName(e.target.value)
                      }
                      className="w-full rounded-2xl border border-[#292929] bg-[#090909] px-11 py-3.5 text-sm text-white outline-none transition duration-300 placeholder:text-[#4B4B4B] hover:border-[#3A3A3A] focus:border-[#FFD21F]/60 focus:bg-[#0D0D0D] focus:shadow-[0_0_25px_rgba(255,210,31,0.05)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
                    Email
                  </label>

                  <div className="relative">
                    <Mail
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4B4B4B]"
                    />

                    <input
                      value={email}
                      readOnly
                      className="w-full rounded-2xl border border-[#292929] bg-[#090909] px-11 py-3.5 text-sm text-[#6B7280] outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="group/button flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FFD21F] px-5 py-3.5 text-sm font-black text-black shadow-[0_10px_30px_rgba(255,210,31,0.08)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#FFE66D] hover:shadow-[0_14px_35px_rgba(255,210,31,0.16)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Save
                    size={16}
                    className="transition-transform duration-300 group-hover/button:scale-110"
                  />

                  {saving
                    ? "Saving..."
                    : "Save Profile"}
                </button>
              </div>
            </div>
          </form>

          <form
            onSubmit={handlePasswordUpdate}
            className="group relative overflow-hidden rounded-3xl border border-[#292929] bg-[#111111] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)] transition duration-500 hover:border-[#4090F0]/20 sm:p-7"
          >
            <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-[#4090F0]/5 blur-3xl transition duration-500 group-hover:bg-[#4090F0]/10" />

            <div className="relative">
              <div className="mb-7 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#4090F0]/20 bg-[#4090F0]/10">
                  <Lock
                    size={19}
                    className="text-[#4090F0]"
                  />
                </div>

                <div>
                  <h2 className="text-sm font-black text-white">
                    Password
                  </h2>

                  <p className="mt-0.5 text-xs text-[#6B7280]">
                    Change your account password.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
                    Current Password
                  </label>

                  <div className="relative">
                    <Lock
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4B4B4B]"
                    />

                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) =>
                        setCurrentPassword(
                          e.target.value
                        )
                      }
                      className="w-full rounded-2xl border border-[#292929] bg-[#090909] px-11 py-3.5 text-sm text-white outline-none transition duration-300 hover:border-[#3A3A3A] focus:border-[#4090F0]/60 focus:bg-[#0D0D0D] focus:shadow-[0_0_25px_rgba(64,144,240,0.05)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
                    New Password
                  </label>

                  <div className="relative">
                    <Lock
                      size={17}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4B4B4B]"
                    />

                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) =>
                        setNewPassword(
                          e.target.value
                        )
                      }
                      className="w-full rounded-2xl border border-[#292929] bg-[#090909] px-11 py-3.5 text-sm text-white outline-none transition duration-300 hover:border-[#3A3A3A] focus:border-[#4090F0]/60 focus:bg-[#0D0D0D]"
                    />
                  </div>
                </div>

                {newPassword && (
                  <div className="rounded-2xl border border-[#292929] bg-[#090909] p-4 animate-[fadeInUp_0.3s_ease-out]">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
                        Password Strength
                      </span>

                      <span
                        className={`text-xs font-black ${passwordStrength.textClass}`}
                      >
                        {passwordStrength.label}
                      </span>
                    </div>

                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#292929]">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${passwordStrength.className}`}
                        style={{
                          width:
                            passwordStrength.width,
                        }}
                      />
                    </div>

                    <div className="mt-4 grid gap-2 sm:grid-cols-2">
                      <PasswordRequirement
                        valid={
                          passwordChecks.length
                        }
                      >
                        At least 8 characters
                      </PasswordRequirement>

                      <PasswordRequirement
                        valid={
                          passwordChecks.uppercase
                        }
                      >
                        Uppercase letter
                      </PasswordRequirement>

                      <PasswordRequirement
                        valid={
                          passwordChecks.lowercase
                        }
                      >
                        Lowercase letter
                      </PasswordRequirement>

                      <PasswordRequirement
                        valid={
                          passwordChecks.number
                        }
                      >
                        Number
                      </PasswordRequirement>

                      <PasswordRequirement
                        valid={
                          passwordChecks.special
                        }
                      >
                        Special character
                      </PasswordRequirement>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={saving}
                  className="group/button flex w-full items-center justify-center gap-2 rounded-2xl border border-[#292929] bg-[#090909] px-5 py-3.5 text-sm font-black text-[#D1D5DB] transition duration-300 hover:-translate-y-0.5 hover:border-[#4090F0]/40 hover:bg-[#0D0D0D] hover:text-[#4090F0] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Lock
                    size={16}
                    className="transition-transform duration-300 group-hover/button:scale-110"
                  />

                  {saving
                    ? "Updating..."
                    : "Change Password"}
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-rose-500/10 bg-[#111111] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.20)]">
          <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-rose-500/5 blur-3xl" />

          <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10">
                  <ShieldCheck className="h-4 w-4 text-rose-400" />
                </div>

                <h2 className="text-sm font-black text-white">
                  Sign out
                </h2>
              </div>

              <p className="mt-2 text-xs leading-5 text-[#6B7280]">
                Remove your current PULSE session from this browser.
              </p>
            </div>

            <button
              onClick={logout}
              className="group flex items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/5 px-5 py-3 text-sm font-black text-rose-400 transition duration-300 hover:-translate-y-0.5 hover:bg-rose-500/10"
            >
              <LogOut
                size={16}
                className="transition-transform duration-300 group-hover:-translate-x-0.5"
              />
              Logout
            </button>
          </div>
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