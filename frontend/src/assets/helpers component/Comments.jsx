import { useState } from "react";
import {
  Send,
  Trash2,
  CornerDownRight,
  MessageCircle,
} from "lucide-react";
import { Avatar } from "./UIElements.jsx";
import { useToast } from "./Toast.jsx";

const ago = (date) => {
  if (!date) {
    return "now";
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
      return `${amount}${unit}`;
    }
  }

  return "now";
};

function CommentItem({
  comment,
  replies,
  meId,
  onReply,
  onDelete,
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const username =
    comment.user?.username || "user";

  const commentId =
    comment._id || comment.id;

  const sendReply = async (event) => {
    event.preventDefault();

    if (!text.trim() || busy) {
      return;
    }

    setBusy(true);

    try {
      await onReply(
        commentId,
        text.trim()
      );

      setText("");
      setOpen(false);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="group flex gap-3 animate-[commentIn_0.35s_ease-out]">
      <div className="relative shrink-0">
        <div className="absolute -inset-1 rounded-full bg-[#FFD21F]/0 blur-md transition-all duration-300 group-hover:bg-[#FFD21F]/8" />

        <Avatar
          user={comment.user}
          className="relative h-8 w-8 shrink-0 rounded-full object-cover ring-1 ring-[#292929] transition-all duration-300 group-hover:ring-[#FFD21F]/30 group-hover:scale-105"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="relative overflow-hidden rounded-2xl border border-[#292929] bg-[#111111] px-4 py-3 transition-all duration-300 hover:border-[#FFD21F]/20 hover:bg-[#151515]">
          <div className="pointer-events-none absolute -right-10 -top-10 h-20 w-20 rounded-full bg-[#FFD21F]/0 blur-2xl transition-all duration-500 group-hover:bg-[#FFD21F]/5" />

          <div className="relative mb-1 flex items-center gap-2">
            <span className="text-xs font-bold text-[#FFD21F] transition-colors duration-200 hover:text-[#FFE66D]">
              @{username}
            </span>

            <span className="text-[10px] text-[#666666]">
              {ago(comment.createdAt)}
            </span>
          </div>

          <p className="relative text-sm leading-6 text-[#D1D5DB]">
            {comment.text}
          </p>
        </div>

        <div className="mt-2 flex items-center gap-4 px-1">
          {onReply && (
            <button
              type="button"
              onClick={() =>
                setOpen((value) => !value)
              }
              className={`text-[11px] font-bold transition-all duration-200 ${
                open
                  ? "text-[#FFD21F]"
                  : "text-[#9CA3AF] hover:-translate-y-0.5 hover:text-[#FFD21F]"
              }`}
            >
              {open ? "Cancel" : "Reply"}
            </button>
          )}

          {String(comment.user?._id) ===
            String(meId) &&
            onDelete && (
              <button
                type="button"
                onClick={() =>
                  onDelete(commentId)
                }
                className="inline-flex items-center gap-1 text-[11px] font-bold text-red-400 transition-all duration-200 hover:-translate-y-0.5 hover:text-red-300"
              >
                <Trash2 size={10} />
                Delete
              </button>
            )}
        </div>

        {open && (
          <form
            onSubmit={sendReply}
            className="mt-3 flex gap-2 animate-[replyIn_0.25s_ease-out]"
          >
            <input
              className="min-w-0 flex-1 rounded-xl border border-[#292929] bg-[#090909] px-3 py-2.5 text-xs text-white outline-none placeholder:text-[#4B4B4B] transition-all duration-300 hover:border-[#3A3A3A] focus:border-[#FFD21F]/50 focus:ring-4 focus:ring-[#FFD21F]/5 focus:shadow-[0_0_18px_rgba(255,210,31,0.05)]"
              value={text}
              onChange={(event) =>
                setText(event.target.value)
              }
              placeholder={`Reply to @${username}`}
              autoFocus
            />

            <button
              type="submit"
              disabled={!text.trim() || busy}
              className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFD21F] text-black transition-all duration-200 hover:bg-[#FFE66D] hover:-translate-y-0.5 hover:shadow-[0_0_18px_rgba(255,210,31,0.18)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send
                size={12}
                className={`transition-transform duration-300 ${
                  busy
                    ? "animate-pulse"
                    : "group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                }`}
              />
            </button>
          </form>
        )}

        {replies.length > 0 && (
          <div className="mt-4 space-y-3 border-l border-[#292929] pl-4">
            {replies.map((reply, index) => {
              const replyId =
                reply._id || reply.id;

              return (
                <div
                  key={replyId}
                  className="group/reply flex gap-2 animate-[replyIn_0.3s_ease-out_both]"
                  style={{
                    animationDelay: `${index * 60}ms`,
                  }}
                >
                  <CornerDownRight
                    size={12}
                    className="mt-2 shrink-0 text-[#FFD21F] transition-transform duration-300 group-hover/reply:translate-x-0.5"
                  />

                  <Avatar
                    user={reply.user}
                    className="h-7 w-7 shrink-0 rounded-full object-cover ring-1 ring-[#292929] transition-all duration-300 group-hover/reply:ring-[#FFD21F]/25"
                  />

                  <div className="relative min-w-0 flex-1 overflow-hidden rounded-2xl border border-[#292929] bg-[#090909] px-3 py-2.5 transition-all duration-300 hover:border-[#FFD21F]/15 hover:bg-[#111111]">
                    <div className="relative mb-1 flex items-center gap-2">
                      <span className="text-[11px] font-bold text-[#FFD21F]">
                        @{reply.user?.username || "user"}
                      </span>

                      <span className="text-[10px] text-[#666666]">
                        {ago(reply.createdAt)}
                      </span>
                    </div>

                    <p className="relative text-xs leading-5 text-[#D1D5DB]">
                      {reply.text}
                    </p>

                    {String(
                      reply.user?._id
                    ) === String(meId) &&
                      onDelete && (
                        <button
                          type="button"
                          onClick={() =>
                            onDelete(replyId)
                          }
                          className="mt-2 inline-flex items-center gap-1 text-[10px] font-bold text-red-400 transition-all duration-200 hover:-translate-y-0.5 hover:text-red-300"
                        >
                          <Trash2 size={9} />
                          Delete
                        </button>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Comments({
  pollId,
  comments = [],
  currentUser,
  onAdd,
  onReply,
  onDelete,
}) {
  const toast = useToast();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  const addComment = async (event) => {
    event.preventDefault();

    if (!text.trim() || busy) {
      return;
    }

    if (!onAdd) {
      toast("Comments are not connected yet.");
      return;
    }

    setBusy(true);

    try {
      await onAdd(
        pollId,
        text.trim()
      );

      setText("");
    } catch (error) {
      toast(
        error?.response?.data?.message ||
          "Could not add comment.",
        "error"
      );
    } finally {
      setBusy(false);
    }
  };

  const topLevelComments =
    comments.filter(
      (comment) => !comment.parent
    );

  const repliesOf = (commentId) =>
    comments
      .filter(
        (comment) =>
          String(comment.parent) ===
          String(commentId)
      )
      .sort(
        (a, b) =>
          new Date(a.createdAt) -
          new Date(b.createdAt)
      );

  return (
    <div className="space-y-5">
      <form
        onSubmit={addComment}
        className="group flex gap-2"
      >
        <div className="relative min-w-0 flex-1">
          <MessageCircle
            size={14}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-700 transition-colors duration-300 group-focus-within:text-[#FFD21F]"
          />

          <input
            value={text}
            onChange={(event) =>
              setText(event.target.value)
            }
            placeholder="Add a comment…"
            className="w-full rounded-xl border border-[#292929] bg-[#090909] py-3 pl-9 pr-4 text-sm text-white outline-none placeholder:text-[#4B4B4B] transition-all duration-300 hover:border-[#3A3A3A] focus:border-[#FFD21F]/50 focus:ring-4 focus:ring-[#FFD21F]/5 focus:shadow-[0_0_18px_rgba(255,210,31,0.05)]"
          />
        </div>

        <button
          type="submit"
          disabled={!text.trim() || busy}
          className="group/button flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFD21F] text-black transition-all duration-200 hover:bg-[#FFE66D] hover:-translate-y-0.5 hover:shadow-[0_0_20px_rgba(255,210,31,0.18)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
        >
          <Send
            size={13}
            className={`transition-transform duration-300 ${
              busy
                ? "animate-pulse"
                : "group-hover/button:translate-x-0.5 group-hover/button:-translate-y-0.5"
            }`}
          />
        </button>
      </form>

      <div className="space-y-5">
        {topLevelComments.map((comment) => {
          const commentId =
            comment._id || comment.id;

          return (
            <CommentItem
              key={commentId}
              comment={comment}
              replies={repliesOf(commentId)}
              meId={
                currentUser?._id ||
                currentUser?.id
              }
              onReply={onReply}
              onDelete={onDelete}
            />
          );
        })}

        {topLevelComments.length === 0 && (
          <div className="group rounded-2xl border border-dashed border-[#292929] bg-[#090909] px-5 py-8 text-center transition-all duration-300 hover:border-[#FFD21F]/20 hover:bg-[#111111]">
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl border border-[#292929] bg-[#111111] text-zinc-700 transition-all duration-300 group-hover:border-[#FFD21F]/20 group-hover:text-[#FFD21F]">
              <MessageCircle size={15} />
            </div>

            <p className="mt-3 text-xs text-[#666666] transition-colors duration-300 group-hover:text-zinc-500">
              No comments yet — start the conversation
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes commentIn {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes replyIn {
          from {
            opacity: 0;
            transform: translateX(-6px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}