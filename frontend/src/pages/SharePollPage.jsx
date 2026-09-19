import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  Radio,
  Share2,
  QrCode,
  BarChart3,
  Plus,
  Loader2,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

import Layout from "../components/Layout";
import api from "../utils/api";

export default function SharePollPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    loadPoll();
  }, [id]);

  async function loadPoll() {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/polls/${id}`);

      const data = response.data;

      setPoll(
        data?.poll ||
          data?.data ||
          data ||
          null
      );
    } catch (err) {
      console.error("Share poll error:", err);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Failed to load poll."
      );
    } finally {
      setLoading(false);
    }
  }

  const shareLink = `${window.location.origin}/poll/${id}`;

  const shareCode = id
    ? id
        .replace(/[^a-zA-Z0-9]/g, "")
        .slice(-8)
        .toUpperCase()
    : "";

  async function copyText(text, type) {
    try {
      await navigator.clipboard.writeText(text);

      if (type === "link") {
        setCopiedLink(true);

        setTimeout(() => {
          setCopiedLink(false);
        }, 2000);
      }

      if (type === "code") {
        setCopiedCode(true);

        setTimeout(() => {
          setCopiedCode(false);
        }, 2000);
      }
    } catch (err) {
      console.error("Copy failed:", err);
    }
  }

  async function handleShare() {
    const shareData = {
      title: poll?.question || "PULSE Poll",
      text: `Vote on this poll: ${poll?.question || ""}`,
      url: shareLink,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await copyText(shareLink, "link");
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Share failed:", err);
      }
    }
  }

  if (loading) {
    return (
      <Layout>
        <div className="relative flex min-h-[65vh] items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,210,31,0.10),transparent_38%)]" />

          <div className="relative flex flex-col items-center gap-4">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-[#FFD21F]/25 bg-[#FFD21F]/10">
              <div className="absolute inset-0 animate-ping rounded-2xl bg-[#FFD21F]/5" />

              <Loader2
                className="relative h-7 w-7 animate-spin text-[#FFD21F]"
              />
            </div>

            <div className="text-center">
              <p className="text-sm font-bold text-white">
                Loading poll
              </p>

              <p className="mt-1 text-xs text-[#9CA3AF]">
                Preparing sharing options...
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error || !poll) {
    return (
      <Layout>
        <div className="mx-auto max-w-3xl px-4 py-6">
          <Link
            to="/my-polls"
            className="group inline-flex items-center gap-2 text-sm font-medium text-[#9CA3AF] transition hover:-translate-x-0.5 hover:text-[#FFD21F]"
          >
            <ArrowLeft
              className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
            />
            Back to My Polls
          </Link>

          <div className="mt-6 overflow-hidden rounded-3xl border border-red-500/20 bg-[#111111]">
            <div className="h-1 bg-red-500/70" />

            <div className="p-8 text-center">
              <p className="text-sm font-semibold text-red-400">
                {error || "Poll not found."}
              </p>

              <button
                type="button"
                onClick={loadPoll}
                className="mt-5 rounded-xl bg-[#FFD21F] px-5 py-3 text-xs font-bold text-black transition hover:bg-[#FFE66D]"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="relative mx-auto max-w-4xl overflow-hidden px-4 py-6 pb-8">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(255,210,31,0.08),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(64,144,240,0.05),transparent_32%)]" />

        <div className="pointer-events-none absolute right-[5%] top-[8%] h-40 w-40 rounded-full bg-[#FFD21F]/5 blur-3xl" />

        <Link
          to="/my-polls"
          className="group inline-flex items-center gap-2 text-sm font-medium text-[#9CA3AF] transition hover:-translate-x-0.5 hover:text-[#FFD21F]"
        >
          <ArrowLeft
            className="h-4 w-4 transition-transform group-hover:-translate-x-0.5"
          />
          Back to My Polls
        </Link>

        <div className="mt-6">
          <div className="flex items-start gap-3">
            <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#FFD21F]/20 bg-[#FFD21F]/10">
              <div className="absolute inset-0 animate-pulse rounded-2xl bg-[#FFD21F]/5" />

              <Share2 className="relative h-6 w-6 text-[#FFD21F]" />
            </div>

            <div>
              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                Share Poll
              </h1>

              <p className="mt-1 text-sm leading-6 text-[#9CA3AF]">
                Share this poll using the link, QR code, or poll code.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 overflow-hidden rounded-3xl border border-[#292929] bg-[#111111] shadow-[0_20px_60px_rgba(0,0,0,0.30)]">
          <div className="h-1 bg-gradient-to-r from-[#FFD21F] via-[#FFE66D] to-[#FFD21F]" />

          <div className="p-6 sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-green-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
                <Radio className="h-3.5 w-3.5" />
                LIVE
              </span>

              <span className="rounded-full border border-[#292929] bg-[#090909] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                {poll.category || "General"}
              </span>
            </div>

            <h2 className="mt-5 text-xl font-black leading-8 text-white">
              {poll.question}
            </h2>
          </div>
        </div>

        <div className="mt-5 rounded-3xl border border-[#292929] bg-[#111111] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-[#FFD21F]" />

            <div>
              <h2 className="text-base font-black text-white">
                Scan to Vote
              </h2>

              <p className="mt-0.5 text-xs text-[#6B7280]">
                Scan this QR code to open the poll.
              </p>
            </div>
          </div>

          <div className="mt-6 flex justify-center">
            <div className="rounded-3xl bg-white p-5 shadow-[0_15px_50px_rgba(0,0,0,0.25)]">
              <QRCodeSVG
                value={shareLink}
                size={220}
                level="H"
                includeMargin={true}
              />
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-3xl border border-[#292929] bg-[#111111] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.20)]">
          <div className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-[#FFD21F]" />

            <div>
              <h2 className="text-base font-black text-white">
                Poll Code
              </h2>

              <p className="mt-0.5 text-xs text-[#6B7280]">
                Use this code to identify the poll.
              </p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <div className="min-w-0 flex-1 rounded-2xl border border-[#292929] bg-[#090909] px-4 py-3">
              <p className="text-xs text-[#6B7280]">
                Share Code
              </p>

              <p className="mt-1 truncate text-xl font-black tracking-[0.3em] text-[#FFD21F]">
                {shareCode}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                copyText(shareCode, "code")
              }
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#292929] bg-[#111111] text-[#9CA3AF] transition hover:border-[#FFD21F]/40 hover:text-[#FFD21F]"
            >
              {copiedCode ? (
                <Check className="h-5 w-5 text-green-400" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
            </button>
          </div>

          {copiedCode && (
            <p className="mt-3 text-xs font-semibold text-green-400">
              Poll code copied.
            </p>
          )}
        </div>

        <div className="mt-5 rounded-3xl border border-[#292929] bg-[#111111] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.20)]">
          <h2 className="text-base font-black text-white">
            Poll Link
          </h2>

          <div className="mt-4 flex gap-2">
            <div className="min-w-0 flex-1 rounded-2xl border border-[#292929] bg-[#090909] px-4 py-3">
              <p className="truncate text-sm text-[#9CA3AF]">
                {shareLink}
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                copyText(shareLink, "link")
              }
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#292929] bg-[#111111] text-[#9CA3AF] transition hover:border-[#FFD21F]/40 hover:text-[#FFD21F]"
            >
              {copiedLink ? (
                <Check className="h-5 w-5 text-green-400" />
              ) : (
                <Copy className="h-5 w-5" />
              )}
            </button>
          </div>

          {copiedLink && (
            <p className="mt-3 text-xs font-semibold text-green-400">
              Poll link copied.
            </p>
          )}
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={handleShare}
            className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-[#FFD21F] px-4 py-3.5 text-sm font-black text-black transition hover:-translate-y-0.5 hover:bg-[#FFE66D]"
          >
            <Share2 className="h-4 w-4 transition group-hover:scale-110" />
            Share Poll
          </button>

          <button
            type="button"
            onClick={() =>
              copyText(shareLink, "link")
            }
            className="group inline-flex items-center justify-center gap-2 rounded-2xl border border-[#292929] bg-[#111111] px-4 py-3.5 text-sm font-bold text-[#9CA3AF] transition hover:-translate-y-0.5 hover:border-[#FFD21F]/40 hover:text-[#FFD21F]"
          >
            {copiedLink ? (
              <Check className="h-4 w-4 text-green-400" />
            ) : (
              <Copy className="h-4 w-4" />
            )}

            {copiedLink ? "Copied" : "Copy Link"}
          </button>

          <Link
            to={`/poll/${id}`}
            className="group inline-flex items-center justify-center gap-2 rounded-2xl border border-[#292929] bg-[#111111] px-4 py-3.5 text-sm font-bold text-[#9CA3AF] transition hover:-translate-y-0.5 hover:border-[#4090F0]/40 hover:text-[#4090F0]"
          >
            <ExternalLink className="h-4 w-4 transition group-hover:scale-110" />
            Open Vote Page
          </Link>

          <Link
            to={`/analytics/${id}`}
            className="group inline-flex items-center justify-center gap-2 rounded-2xl border border-[#292929] bg-[#111111] px-4 py-3.5 text-sm font-bold text-[#9CA3AF] transition hover:-translate-y-0.5 hover:border-green-500/30 hover:text-green-400"
          >
            <BarChart3 className="h-4 w-4 transition group-hover:scale-110" />
            View Live Results
          </Link>
        </div>

        <div className="mt-3">
          <Link
            to="/create-poll"
            className="group flex w-full items-center justify-center gap-2 rounded-2xl border border-[#FFD21F]/20 bg-[#FFD21F]/5 px-4 py-3.5 text-sm font-bold text-[#FFD21F] transition hover:-translate-y-0.5 hover:border-[#FFD21F]/40 hover:bg-[#FFD21F]/10"
          >
            <Plus className="h-4 w-4 transition group-hover:rotate-90" />
            Create Another Poll
          </Link>
        </div>

        <div className="mt-4 rounded-2xl border border-[#292929] bg-[#111111]/70 px-4 py-3 text-center">
          <p className="text-[10px] leading-5 text-[#6B7280]">
            Share the QR code, poll code, or link with participants so they can open this poll.
          </p>
        </div>
      </div>
    </Layout>
  );
}