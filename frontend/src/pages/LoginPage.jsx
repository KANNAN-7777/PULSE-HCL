import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  Sparkles,
} from "lucide-react";

import api from "../utils/api";
import AuthLayout from "../components/AuthLayout";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });

      localStorage.setItem("token", response.data.token);

      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      window.dispatchEvent(new Event("authChanged"));

      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAccount = () => {
    navigate("/register");
  };

  return (
    <AuthLayout>
      <div className="w-full max-w-md animate-[authFadeIn_0.45s_ease-out]">
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#FFD21F]/20 bg-[#FFD21F]/10">
              <Sparkles className="h-4 w-4 text-[#FFD21F]" />
            </div>

            <div className="flex justify-center">
              <img
                src="/pulse-logo.png"
                alt="PULSE"
                className="h-16 w-auto object-contain"
              />
            </div>
          </div>

          <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
            Welcome back
          </h1>

          <p className="mt-2 text-sm leading-6 text-[#9CA3AF]">
            Login to continue to your PULSE account.
          </p>
        </div>

        <form
          onSubmit={handleLogin}
          className="relative space-y-5 overflow-hidden rounded-3xl border border-[#292929] bg-[#111111]/95 p-6 shadow-[0_25px_70px_rgba(0,0,0,0.40)] backdrop-blur-sm sm:p-7"
        >
          <div className="pointer-events-none absolute right-0 top-0 h-32 w-32 rounded-full bg-[#FFD21F]/5 blur-3xl" />

          {error && (
            <div className="relative rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm leading-5 text-red-400 animate-[authMessage_0.3s_ease-out]">
              {error}
            </div>
          )}

          {message && (
            <div className="relative rounded-2xl border border-[#FFD21F]/20 bg-[#FFD21F]/10 px-4 py-3 text-sm leading-5 text-[#FFD21F] animate-[authMessage_0.3s_ease-out]">
              {message}
            </div>
          )}

          <AuthInput
            label="Email"
            icon={<Mail size={18} />}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />

          <AuthInput
            label="Password"
            icon={<Lock size={18} />}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
          />

          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-xs font-bold text-[#FFD21F] transition duration-300 hover:text-[#FFE66D]"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-[#FFD21F] px-4 py-3.5 text-sm font-black text-black shadow-[0_12px_35px_rgba(255,210,31,0.12)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#FFE66D] hover:shadow-[0_16px_40px_rgba(255,210,31,0.18)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2
                  size={17}
                  className="animate-spin"
                />
                Logging in...
              </>
            ) : (
              <>
                Login
                <ArrowRight
                  size={17}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </>
            )}
          </button>

          <div className="relative mt-6 border-t border-[#292929] pt-6 text-center">
            <p className="text-sm text-[#9CA3AF]">
              Don't have an account?
            </p>

            <button
              type="button"
              onClick={handleCreateAccount}
              className="mt-3 w-full rounded-2xl border border-[#FFD21F]/30 bg-[#FFD21F]/5 px-4 py-3 text-sm font-bold text-[#FFD21F] transition duration-300 hover:-translate-y-0.5 hover:border-[#FFD21F]/50 hover:bg-[#FFD21F]/10"
            >
              Create an account
            </button>
          </div>
        </form>
      </div>

      <style>
        {`
          @keyframes authFadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes authMessage {
            from {
              opacity: 0;
              transform: translateY(-6px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </AuthLayout>
  );
}

function AuthInput({
  label,
  icon,
  type = "text",
  value,
  onChange,
  placeholder,
}) {
  return (
    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
        {label}
      </label>

      <div className="group relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#4B4B4B] transition duration-300 group-focus-within:text-[#FFD21F]">
          {icon}
        </div>

        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-[#292929] bg-[#090909] px-11 py-3.5 text-sm text-white outline-none transition duration-300 placeholder:text-[#4B4B4B] hover:border-[#3A3A3A] focus:border-[#FFD21F]/50 focus:bg-[#0D0D0D] focus:ring-4 focus:ring-[#FFD21F]/5"
        />
      </div>
    </div>
  );
}