import { useEffect, useState } from "react";
import { Avatar } from "./UIElements.jsx";

export default function Connections({
  username,
  initialTab = "followers",
}) {
  const [tab, setTab] = useState(initialTab);

  const [data, setData] = useState({
    followers: [],
    following: [],
  });

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const list =
    tab === "followers"
      ? data.followers
      : data.following;

  const TABS = [
    [
      "followers",
      "Followers",
      data.followers.length,
    ],
    [
      "following",
      "Following",
      data.following.length,
    ],
  ];

  return (
    <div className="rounded-2xl border border-[#292929] bg-[#111111] p-4">
      <div className="mb-5 flex border-b border-[#292929]">
        {TABS.map(
          ([key, label, count]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`relative px-4 py-3 text-xs font-bold transition ${
                tab === key
                  ? "text-[#FFD21F]"
                  : "text-[#9CA3AF] hover:text-white"
              }`}
            >
              {label} {count}

              {tab === key && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FFD21F]" />
              )}
            </button>
          )
        )}
      </div>

      {list.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#292929] bg-[#090909] px-5 py-8 text-center">
          <p className="text-xs text-[#666666]">
            {tab === "followers"
              ? "No followers yet."
              : "You're not following anyone yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {list.map((user) => (
            <div
              key={
                user._id ||
                user.id ||
                user.username
              }
              className="flex items-center gap-3 rounded-xl border border-transparent px-3 py-3 transition hover:border-[#292929] hover:bg-[#090909]"
            >
              <Avatar
                user={user}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-[#FFD21F]/10"
              />

              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-white">
                  {user.name || "User"}
                </p>

                {user.username && (
                  <p className="mt-0.5 truncate text-xs text-[#FFD21F]">
                    @{user.username}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}