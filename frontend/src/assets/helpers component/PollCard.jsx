import { useState } from "react";
import {
  ArrowBigUp,
  Bookmark,
  MessageCircle,
  BarChart2,
  Lock,
  Pencil,
  RotateCcw,
} from "lucide-react";
import { Link } from "react-router-dom";

import PollVote from "./PollVote.jsx";
import Comments from "./Comments.jsx";
import {
  Avatar,
  inputCls,
} from "./UIElements.jsx";

const CATEGORIES = [
  "General",
  "Technology",
  "Food",
  "Sports",
  "Entertainment",
  "Travel",
  "Education",
  "Health",
  "Lifestyle",
  "Business",
  "Politics",
  "Other",
];

const ago = (date) => {
  if (!date) {
    return "just now";
  }

  const seconds = Math.floor(
    (Date.now() - new Date(date).getTime()) /
      1000
  );

  for (const [unit, value] of [
    ["d", 86400],
    ["h", 3600],
    ["m", 60],
  ]) {
    const amount = Math.floor(
      seconds / value
    );

    if (amount >= 1) {
      return `${amount}${unit} ago`;
    }
  }

  return "just now";
};

const ACCENTS = [
  {
    bar: "bg-[#FFD21F]",
    tag: "border-[#FFD21F]/20 bg-[#FFD21F]/10 text-[#FFD21F]",
  },
  {
    bar: "bg-[#4090F0]",
    tag: "border-[#4090F0]/20 bg-[#4090F0]/10 text-[#4090F0]",
  },
  {
    bar: "bg-[#FFD21F]",
    tag: "border-[#FFD21F]/20 bg-[#FFD21F]/10 text-[#FFD21F]",
  },
  {
    bar: "bg-[#4090F0]",
    tag: "border-[#4090F0]/20 bg-[#4090F0]/10 text-[#4090F0]",
  },
];

const accentOf = (category = "") =>
  ACCENTS[
    [...category].reduce(
      (total, character) =>
        total + character.charCodeAt(0),
      0
    ) % ACCENTS.length
  ];

export default function PollCard({
  poll,
  vote,
  bookmark,
  edit,
  close,
  remove,
  owner = false,
}) {
  const [showComments, setShowComments] =
    useState(false);

  const [editing, setEditing] =
    useState(false);

  const [question, setQuestion] =
    useState(poll?.question || "");

  const [category, setCategory] =
    useState(poll?.category || "General");

  const pollId =
    poll?.id || poll?._id;

  const creator =
    poll?.creator || {};

  const accent =
    accentOf(poll?.category);

  const startEdit = () => {
    setQuestion(
      poll?.question || ""
    );

    setCategory(
      poll?.category || "General"
    );

    setEditing(true);
  };

  const saveEdit = async () => {
    if (!edit || !pollId) {
      return;
    }

    await edit(pollId, {
      question: question.trim(),
      category,
    });

    setEditing(false);
  };

  const handleVote = async (result) => {
    if (!vote || !pollId) {
      return;
    }

    await vote(pollId, result);
  };

  const handleBookmark = async () => {
    if (!bookmark || !pollId) {
      return;
    }

    await bookmark(pollId);
  };

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-[#292929] bg-[#111111] shadow-[0_15px_45px_rgba(0,0,0,0.22)] transition-all duration-500 hover:-translate-y-1.5 hover:border-[#FFD21F]/30 hover:bg-[#151515] hover:shadow-[0_22px_55px_rgba(0,0,0,0.32)]">
      <div
        className={`h-1 ${accent.bar} transition-all duration-500 group-hover:h-1.5`}
      />

      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#FFD21F]/0 blur-3xl transition-all duration-700 group-hover:bg-[#FFD21F]/5" />

      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className="relative shrink-0">
            <div className="absolute -inset-1 rounded-full bg-[#FFD21F]/0 blur-md transition-all duration-500 group-hover:bg-[#FFD21F]/10" />

            <Avatar
              user={creator}
              className="relative h-10 w-10 shrink-0 rounded-full object-cover ring-2 ring-[#FFD21F]/10 transition-all duration-300 group-hover:ring-[#FFD21F]/25 group-hover:scale-105"
            />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-white transition-colors duration-300 group-hover:text-[#FFE66D]">
                {creator.name ||
                  "Creator"}
              </span>

              {creator.username && (
                <>
                  <span className="text-[#4B4B4B]">
                    ·
                  </span>

                  <span className="text-xs text-[#FFD21F] transition-colors duration-300 hover:text-[#FFE66D]">
                    @{creator.username}
                  </span>
                </>
              )}

              <span className="text-[#4B4B4B]">
                ·
              </span>

              <span className="text-[10px] text-[#666666]">
                {ago(poll?.createdAt)}
              </span>
            </div>
          </div>

          {poll?.closed && (
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-red-400 transition-all duration-300 hover:border-red-500/40 hover:bg-red-500/15">
              <Lock size={9} />
              Closed
            </span>
          )}

          <span
            className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider transition-all duration-300 ${accent.tag}`}
          >
            {poll?.category ||
              "General"}
          </span>
        </div>

        {owner && !editing && (
          <div className="mt-4 flex flex-wrap items-center gap-2 border-b border-[#202020] pb-4 animate-[cardFadeIn_0.3s_ease-out]">
            {edit && (
              <button
                type="button"
                onClick={startEdit}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#292929] bg-[#090909] px-3 py-1.5 text-[11px] font-bold text-[#9CA3AF] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#FFD21F]/40 hover:bg-[#FFD21F]/5 hover:text-[#FFD21F]"
              >
                <Pencil size={11} />
                Edit
              </button>
            )}

            <Link
              to={`/analytics/${pollId}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#4090F0]/20 bg-[#4090F0]/5 px-3 py-1.5 text-[11px] font-bold text-[#4090F0] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#4090F0]/10 hover:border-[#4090F0]/40 hover:shadow-[0_0_14px_rgba(64,144,240,0.08)]"
            >
              <BarChart2 size={11} />
              Analytics
            </Link>

            {close && (
              <button
                type="button"
                onClick={() =>
                  close(pollId)
                }
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#292929] bg-[#090909] px-3 py-1.5 text-[11px] font-bold text-[#9CA3AF] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#FFD21F]/30 hover:bg-[#FFD21F]/5 hover:text-[#FFD21F]"
              >
                {poll?.closed ? (
                  <>
                    <RotateCcw size={11} />
                    Reopen
                  </>
                ) : (
                  <>
                    <Lock size={11} />
                    Close
                  </>
                )}
              </button>
            )}

            {remove && (
              <button
                type="button"
                onClick={() =>
                  remove(pollId)
                }
                className="rounded-lg border border-red-500/20 bg-red-500/5 px-3 py-1.5 text-[11px] font-bold text-red-400 transition-all duration-200 hover:-translate-y-0.5 hover:border-red-500/40 hover:bg-red-500/10"
              >
                Delete
              </button>
            )}
          </div>
        )}

        {editing ? (
          <div className="mb-4 mt-4 space-y-3 animate-[cardFadeIn_0.25s_ease-out]">
            <textarea
              value={question}
              onChange={(event) =>
                setQuestion(
                  event.target.value
                )
              }
              className={`${inputCls} min-h-[110px] resize-none`}
            />

            <select
              value={category}
              onChange={(event) =>
                setCategory(
                  event.target.value
                )
              }
              className={inputCls}
            >
              {CATEGORIES.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                    className="bg-[#111111]"
                  >
                    {item}
                  </option>
                )
              )}
            </select>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={saveEdit}
                className="rounded-xl bg-[#FFD21F] px-4 py-2 text-xs font-bold text-black transition-all duration-200 hover:bg-[#FFE66D] hover:-translate-y-0.5 hover:shadow-[0_0_18px_rgba(255,210,31,0.18)] active:scale-95"
              >
                Save
              </button>

              <button
                type="button"
                onClick={() =>
                  setEditing(false)
                }
                className="rounded-xl border border-[#292929] bg-[#090909] px-4 py-2 text-xs font-bold text-[#9CA3AF] transition-all duration-200 hover:border-[#3A3A3A] hover:bg-[#111111] hover:text-white active:scale-95"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <h2 className="mt-5 break-words text-lg font-bold leading-7 text-white transition-colors duration-300 group-hover:text-[#F5F5F5]">
            {poll?.question}
          </h2>
        )}

        <div className="mt-5">
          <PollVote
            poll={poll}
            onVoted={handleVote}
          />
        </div>

        <div className="mt-5 flex items-center gap-5 border-t border-[#292929] pt-4">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FFD21F] transition-all duration-300 hover:scale-105">
            <ArrowBigUp
              size={14}
              className="transition-transform duration-300 group-hover:-translate-y-0.5"
            />
            {poll?.totalVotes ?? 0}
          </span>

          <button
            type="button"
            title="Comments"
            onClick={() =>
              setShowComments(
                (current) => !current
              )
            }
            className={`inline-flex items-center gap-1.5 text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 ${
              showComments
                ? "text-[#FFD21F]"
                : "text-[#9CA3AF] hover:text-[#FFD21F]"
            }`}
          >
            <MessageCircle
              size={14}
              className="transition-transform duration-300"
            />
            {poll?.comments ?? 0}
          </button>

          <button
            type="button"
            title={
              poll?.isBookmarked
                ? "Saved"
                : "Save"
            }
            onClick={handleBookmark}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 ${
              poll?.isBookmarked
                ? "text-[#FFD21F]"
                : "text-[#9CA3AF] hover:text-[#FFD21F]"
            }`}
          >
            <Bookmark
              size={14}
              className={`transition-transform duration-300 ${
                poll?.isBookmarked
                  ? "fill-current"
                  : ""
              }`}
            />

            {poll?.saves ?? 0}
          </button>
        </div>

        {showComments && (
          <div className="mt-5 border-t border-[#292929] pt-5 animate-[cardFadeIn_0.3s_ease-out]">
            <Comments
              pollId={pollId}
              comments={
                poll?.commentsList || []
              }
              currentUser={
                poll?.currentUser
              }
            />
          </div>
        )}
      </div>

      <style>{`
        @keyframes cardFadeIn {
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