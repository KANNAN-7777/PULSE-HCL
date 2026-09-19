
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Lock,
  User,
  AtSign,
  ShieldCheck,
  RefreshCw,
  Camera,
} from "lucide-react";

import api from "../utils/api";
import AuthLayout from "../components/AuthLayout";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState("");

  const [otp, setOtp] = useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const [resendTimer, setResendTimer] = useState(0);

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (resendTimer <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setResendTimer((previous) => {
        if (previous <= 1) {
          clearInterval(timer);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [resendTimer]);

  const validateBasicDetails = () => {
    if (!name.trim()) {
      setError("Please enter your name.");
      return false;
    }

    if (!username.trim()) {
      setError("Please enter a username.");
      return false;
    }

    if (username.trim().length < 3) {
      setError("Username must be at least 3 characters.");
      return false;
    }

    if (!/^[a-zA-Z0-9_.]+$/.test(username.trim())) {
      setError(
        "Username can contain only letters, numbers, underscore and dot."
      );
      return false;
    }

    if (!email.trim()) {
      setError("Please enter your email.");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return false;
    }

    if (!password) {
      setError("Please enter a password.");
      return false;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return false;
    }

    return true;
  };

  const handleProfileImage = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Profile image must be less than 5 MB.");
      return;
    }

    setError("");

    setProfileImage(file);

    const imageUrl = URL.createObjectURL(file);
    setPreview(imageUrl);
  };

  const handleSendOtp = async () => {
    setError("");
    setMessage("");

    if (!validateBasicDetails()) {
      return;
    }

    if (resendTimer > 0) {
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        "/auth/register/send-otp",
        {
          email: email.trim().toLowerCase(),
        }
      );

      setOtpSent(true);
      setOtpVerified(false);
      setResendTimer(60);

      setMessage(
        response.data?.message ||
          "OTP sent successfully to your email."
      );
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to send OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    setMessage("");

    if (!otp.trim()) {
      setError("Please enter the OTP.");
      return;
    }

    if (!/^\d{6}$/.test(otp.trim())) {
      setError("OTP must contain 6 digits.");
      return;
    }

    if (!validateBasicDetails()) {
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("name", name.trim());
      formData.append("username", username.trim());
      formData.append(
        "email",
        email.trim().toLowerCase()
      );
      formData.append("password", password);
      formData.append("otp", otp.trim());

      if (profileImage) {
        formData.append(
          "profile_picture",
          profileImage
        );
      }

      const response = await api.post(
        "/auth/register/verify-otp",
        formData
      );

      const user = response.data?.user;

      if (!user) {
        throw new Error(
          "Registration completed but user data was not returned."
        );
      }

      if (response.data?.token) {
        localStorage.setItem(
          "token",
          response.data.token
        );
      }

      localStorage.setItem(
        "user",
        JSON.stringify(user)
      );

      window.dispatchEvent(
        new Event("authChanged")
      );

      setOtpVerified(true);
      setMessage(
        response.data?.message ||
          "Account created successfully."
      );

      setTimeout(() => {
        navigate("/profile", {
          replace: true,
        });
      }, 1200);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          err.message ||
          "OTP verification failed."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || loading) {
      return;
    }

    setError("");
    setMessage("");

    try {
      setLoading(true);

      const response = await api.post(
        "/auth/register/send-otp",
        {
          email: email.trim().toLowerCase(),
        }
      );

      setOtp("");
      setOtpSent(true);
      setOtpVerified(false);
      setResendTimer(60);

      setMessage(
        response.data?.message ||
          "A new OTP has been sent."
      );
    } catch (err) {
      setError(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to resend OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = () => {
    if (!password) {
      return {
        label: "",
        width: "0%",
      };
    }

    let score = 0;

    if (password.length >= 8) {
      score++;
    }

    if (/[A-Z]/.test(password)) {
      score++;
    }

    if (/[a-z]/.test(password)) {
      score++;
    }

    if (/\d/.test(password)) {
      score++;
    }

    if (/[^A-Za-z0-9]/.test(password)) {
      score++;
    }

    if (score <= 2) {
      return {
        label: "Weak",
        width: "35%",
      };
    }

    if (score <= 3) {
      return {
        label: "Medium",
        width: "65%",
      };
    }

    return {
      label: "Strong",
      width: "100%",
    };
  };

  const passwordStrength =
    getPasswordStrength();

  return (
    <AuthLayout>
      <div className="rounded-3xl border border-white/10 bg-[#0c1117]/95 p-6 shadow-2xl backdrop-blur-xl sm:p-8">

        <div className="mb-6">
          <Link
            to="/login"
            className="mb-5 inline-flex items-center gap-2 text-xs font-semibold text-gray-500 transition hover:text-[#FFD21F]"
          >
            <ArrowLeft size={14} />
            Back to Login
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FFD21F]/10 text-[#FFD21F]">
              {otpVerified ? (
                <CheckCircle2 size={22} />
              ) : (
                <ShieldCheck size={22} />
              )}
            </div>

            <div>
              <h1 className="text-2xl font-black text-white">
                {otpVerified
                  ? "Account Created"
                  : "Create Account"}
              </h1>

              <p className="mt-1 text-xs text-gray-500">
                {otpVerified
                  ? "Your PULSE account is ready."
                  : "Join PULSE and start creating polls."}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs font-medium leading-5 text-red-400">
            {error}
          </div>
        )}

        {message && !error && (
          <div className="mb-5 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-xs font-medium leading-5 text-green-400">
            {message}
          </div>
        )}

        {otpVerified ? (
          <div className="py-8 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle2
                size={42}
                className="text-green-400"
              />
            </div>

            <h2 className="mt-5 text-lg font-bold text-white">
              Registration Successful
            </h2>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Your email has been verified and your
              account has been created successfully.
            </p>

            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-500">
              <Loader2
                size={14}
                className="animate-spin"
              />
              Opening your profile...
            </div>
          </div>
        ) : (
          <div className="space-y-4">

            <div className="flex justify-center">
              <label
                htmlFor="profile-picture"
                className="group relative cursor-pointer"
              >
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-[#FFD21F]/30 bg-[#FFD21F]/5 text-[#FFD21F] transition group-hover:border-[#FFD21F]/70">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Profile preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <Camera size={24} />
                  )}
                </div>

                <div className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-[#0c1117] bg-[#FFD21F] text-black">
                  <Camera size={12} />
                </div>
              </label>

              <input
                id="profile-picture"
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleProfileImage}
                className="hidden"
              />
            </div>

            <p className="text-center text-[10px] text-gray-600">
              Profile picture optional · Maximum 5 MB
            </p>

            <div>
              <label className="mb-2 block text-xs font-semibold text-gray-400">
                Full Name
              </label>

              <div className="relative">
                <User
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"
                />

                <input
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  disabled={loading}
                  placeholder="Enter your name"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-[#FFD21F]/50 focus:bg-white/[0.06]"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-gray-400">
                Username
              </label>

              <div className="relative">
                <AtSign
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"
                />

                <input
                  type="text"
                  value={username}
                  onChange={(event) =>
                    setUsername(event.target.value)
                  }
                  disabled={loading}
                  placeholder="Choose a username"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-[#FFD21F]/50 focus:bg-white/[0.06]"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-gray-400">
                Email
              </label>

              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  disabled={loading || otpSent}
                  placeholder="Enter your email"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-[#FFD21F]/50 focus:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-gray-400">
                Password
              </label>

              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"
                />

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  disabled={loading}
                  placeholder="Create a password"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-11 pr-11 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-[#FFD21F]/50 focus:bg-white/[0.06]"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (previous) => !previous
                    )
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-600 transition hover:text-gray-300"
                >
                  {showPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>

              {password && (
                <div className="mt-2">
                  <div className="h-1 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-[#FFD21F] transition-all duration-300"
                      style={{
                        width:
                          passwordStrength.width,
                      }}
                    />
                  </div>

                  <p className="mt-1 text-[10px] text-gray-600">
                    Password strength:{" "}
                    <span className="text-gray-400">
                      {passwordStrength.label}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {otpSent && (
              <div className="rounded-2xl border border-[#FFD21F]/20 bg-[#FFD21F]/5 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <ShieldCheck
                    size={17}
                    className="text-[#FFD21F]"
                  />

                  <div>
                    <p className="text-xs font-bold text-white">
                      Verify your email
                    </p>

                    <p className="mt-0.5 text-[10px] text-gray-500">
                      Enter the 6-digit OTP sent to{" "}
                      {email}
                    </p>
                  </div>
                </div>

                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  value={otp}
                  onChange={(event) =>
                    setOtp(
                      event.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6)
                    )
                  }
                  disabled={loading}
                  placeholder="000000"
                  className="w-full rounded-xl border border-white/10 bg-[#080d13] px-4 py-3 text-center text-xl font-black tracking-[0.5em] text-white outline-none transition placeholder:text-gray-700 focus:border-[#FFD21F]/50"
                />

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-[10px] text-gray-600">
                    OTP expires in 10 minutes
                  </span>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={
                      loading ||
                      resendTimer > 0
                    }
                    className="inline-flex items-center gap-1.5 text-[10px] font-bold text-[#FFD21F] transition hover:text-[#FFE66D] disabled:cursor-not-allowed disabled:text-gray-700"
                  >
                    <RefreshCw
                      size={12}
                      className={
                        loading
                          ? "animate-spin"
                          : ""
                      }
                    />

                    {resendTimer > 0
                      ? `Resend in ${resendTimer}s`
                      : "Resend OTP"}
                  </button>
                </div>
              </div>
            )}

            {!otpSent ? (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FFD21F] px-4 py-3.5 text-sm font-black text-black shadow-[0_10px_30px_rgba(255,210,31,0.12)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#FFE66D] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    <Mail size={17} />
                    Send OTP
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={
                  loading ||
                  otp.length !== 6
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FFD21F] px-4 py-3.5 text-sm font-black text-black shadow-[0_10px_30px_rgba(255,210,31,0.12)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#FFE66D] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={17} />
                    Verify & Create Account
                  </>
                )}
              </button>
            )}

            <div className="relative my-5">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5" />
              </div>

              <div className="relative flex justify-center">
                <span className="bg-[#0c1117] px-3 text-[10px] text-gray-600">
                  Already have an account?
                </span>
              </div>
            </div>

            <Link
              to="/login"
              className="flex w-full items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-bold text-gray-300 transition duration-300 hover:-translate-y-0.5 hover:border-[#FFD21F]/30 hover:text-[#FFD21F]"
            >
              Login
            </Link>
          </div>
        )}
      </div>
    </AuthLayout>
  );
}