import { useState } from "react";
import {
  CheckCircle2,
  Send,
  Sparkles,
} from "lucide-react";

import api from "../../utils/api.js";

export default function PollVote({
  poll,
  onVoted,
}) {
  const [selected, setSelected] =
    useState("");

  const [text, setText] =
    useState("");

  const [voting, setVoting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState(false);

  if (!poll) {
    return (
      <div className="group relative overflow-hidden rounded-2xl border border-[#292929] bg-[#111111] p-6 text-center transition-all duration-300 hover:border-[#FFD21F]/20 hover:bg-[#151515]">
        <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-[#FFD21F]/5 blur-3xl" />

        <p className="relative text-sm text-[#9CA3AF]">
          Poll not available.
        </p>
      </div>
    );
  }

  const pollId =
    poll.id || poll._id;

  const submitVote = async () => {
    setError("");

    if (
      poll.type === "open"
        ? !text.trim()
        : !selected
    ) {
      setError(
        poll.type === "open"
          ? "Please enter your response."
          : "Please select an option."
      );
      return;
    }

    setVoting(true);

    try {
      const response = await api.post(
        `/polls/${pollId}/vote`,
        {
          option_id:
            poll.type === "open"
              ? ""
              : selected,
          value: text,
        }
      );

      setSuccess(true);

      if (onVoted) {
        onVoted(response.data);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          "Could not submit vote."
      );
    } finally {
      setVoting(false);
    }
  };

  if (success) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-[#111111] px-6 py-10 text-center shadow-[0_15px_45px_rgba(0,0,0,0.22)] animate-[voteSuccess_0.4s_ease-out]">
        <div className="pointer-events-none absolute left-1/2 top-0 h-32 w-32 -translate-x-1/2 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-emerald-500/25 bg-emerald-500/10 text-emerald-400 shadow-[0_0_25px_rgba(34,197,94,0.12)] animate-[voteIcon_0.5s_ease-out]">
          <CheckCircle2 size={28} />
        </div>

        <h2 className="relative mt-5 text-xl font-black text-white">
          Vote submitted
        </h2>

        <p className="relative mt-2 text-sm text-[#9CA3AF]">
          Your response has been recorded.
        </p>

        <div className="relative mx-auto mt-5 flex w-fit items-center gap-1.5 rounded-full border border-emerald-500/15 bg-emerald-500/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
          <Sparkles size={11} />
          Response saved
        </div>
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400 animate-[voteError_0.3s_ease-out]">
          {error}
        </div>
      )}

      {poll.type === "yesno" && (
        <div className="grid grid-cols-2 gap-3">
          {poll.options?.map(
            (option) => {
              const optionId =
                option.id ||
                option._id;

              return (
                <button
                  key={optionId}
                  type="button"
                  onClick={() =>
                    setSelected(
                      optionId
                    )
                  }
                  className={`group relative overflow-hidden rounded-xl border p-4 text-sm font-bold transition-all duration-300 ${
                    selected === optionId
                      ? "border-[#FFD21F]/60 bg-[#FFD21F]/10 text-[#FFD21F] shadow-[0_0_20px_rgba(255,210,31,0.08)] -translate-y-0.5"
                      : "border-[#292929] bg-[#090909] text-[#9CA3AF] hover:-translate-y-0.5 hover:border-[#FFD21F]/30 hover:bg-[#FFD21F]/5 hover:text-white"
                  }`}
                >
                  {selected === optionId && (
                    <span className="absolute inset-0 bg-gradient-to-r from-[#FFD21F]/0 via-[#FFD21F]/5 to-[#FFD21F]/0 animate-[voteShine_2s_ease-in-out_infinite]" />
                  )}

                  <span className="relative">
                    {option.text}
                  </span>
                </button>
              );
            }
          )}
        </div>
      )}

      {poll.type === "single" && (
        <div className="space-y-2">
          {poll.options?.map(
            (option) => {
              const optionId =
                option.id ||
                option._id;

              return (
                <button
                  key={optionId}
                  type="button"
                  onClick={() =>
                    setSelected(
                      optionId
                    )
                  }
                  className={`group flex w-full items-center rounded-xl border p-4 text-left text-sm font-semibold transition-all duration-300 ${
                    selected === optionId
                      ? "border-[#FFD21F]/60 bg-[#FFD21F]/10 text-[#FFD21F] shadow-[0_0_15px_rgba(255,210,31,0.06)] translate-x-0.5"
                      : "border-[#292929] bg-[#090909] text-[#9CA3AF] hover:border-[#FFD21F]/30 hover:bg-[#FFD21F]/5 hover:text-white hover:translate-x-0.5"
                  }`}
                >
                  <span
                    className={`mr-3 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-all duration-300 ${
                      selected === optionId
                        ? "border-[#FFD21F] bg-[#FFD21F] shadow-[0_0_10px_rgba(255,210,31,0.25)]"
                        : "border-[#444444] group-hover:border-[#FFD21F]/50"
                    }`}
                  >
                    {selected === optionId && (
                      <span className="h-2 w-2 rounded-full bg-black animate-[voteDot_0.2s_ease-out]" />
                    )}
                  </span>

                  {option.text}
                </button>
              );
            }
          )}
        </div>
      )}

      {poll.type === "rating" && (
        <div className="flex justify-center gap-2">
          {poll.options?.map(
            (option) => {
              const optionId =
                option.id ||
                option._id;

              return (
                <button
                  key={optionId}
                  type="button"
                  onClick={() =>
                    setSelected(
                      optionId
                    )
                  }
                  className={`flex h-12 w-12 items-center justify-center rounded-xl border text-sm font-bold transition-all duration-300 ${
                    selected === optionId
                      ? "border-[#FFD21F]/60 bg-[#FFD21F]/10 text-[#FFD21F] shadow-[0_0_18px_rgba(255,210,31,0.1)] scale-105"
                      : "border-[#292929] bg-[#090909] text-[#9CA3AF] hover:border-[#FFD21F]/30 hover:bg-[#FFD21F]/5 hover:text-white hover:-translate-y-1"
                  }`}
                >
                  <span
                    className={
                      selected === optionId
                        ? "animate-[votePop_0.25s_ease-out]"
                        : ""
                    }
                  >
                    {option.text}
                  </span>
                </button>
              );
            }
          )}
        </div>
      )}

      {poll.type === "open" && (
        <div className="relative">
          <textarea
            value={text}
            onChange={(event) =>
              setText(event.target.value)
            }
            maxLength={280}
            placeholder="Type your response..."
            className="min-h-[130px] w-full resize-none rounded-xl border border-[#292929] bg-[#090909] p-4 text-sm text-white outline-none placeholder:text-[#4B4B4B] transition-all duration-300 hover:border-[#3A3A3A] focus:border-[#FFD21F]/50 focus:ring-4 focus:ring-[#FFD21F]/5 focus:shadow-[0_0_20px_rgba(255,210,31,0.05)]"
          />

          <span className="pointer-events-none absolute bottom-3 right-3 rounded-lg bg-[#111111] px-2 py-1 text-[10px] tabular-nums text-zinc-600">
            {text.length}/280
          </span>
        </div>
      )}

      <button
        type="button"
        onClick={submitVote}
        disabled={voting}
        className="group relative mt-6 flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-[#FFD21F] px-4 py-3 text-sm font-black text-black transition-all duration-300 hover:bg-[#FFE66D] hover:-translate-y-0.5 hover:shadow-[0_0_28px_rgba(255,210,31,0.2)] active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
      >
        <span className="pointer-events-none absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-700 group-hover:translate-x-full" />

        <span className="relative flex items-center gap-2">
          <Send
            size={15}
            className={`transition-transform duration-300 ${
              voting
                ? "animate-pulse"
                : "group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            }`}
          />

          {voting
            ? "Submitting..."
            : "Submit Vote"}
        </span>
      </button>

      <style>{`
        @keyframes voteSuccess {
          from {
            opacity: 0;
            transform: translateY(8px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes voteIcon {
          0% {
            opacity: 0;
            transform: scale(0.5) rotate(-12deg);
          }
          70% {
            transform: scale(1.1) rotate(4deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0);
          }
        }

        @keyframes voteError {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes votePop {
          0% {
            transform: scale(0.7);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }

        @keyframes voteDot {
          from {
            transform: scale(0);
          }
          to {
            transform: scale(1);
          }
        }

        @keyframes voteShine {
          0% {
            transform: translateX(-120%);
          }
          60%,
          100% {
            transform: translateX(120%);
          }
        }
      `}</style>
    </div>
  );
}