import {
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Bell,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);

  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(
          event.target
        )
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  function toggleNotifications() {
    setOpen((current) => !current);
  }

  function verb(type) {
    switch (type) {
      case "vote":
        return "voted on your poll";

      case "bookmark":
        return "saved your poll";

      case "comment":
        return "commented on your poll";

      case "poll":
        return "created a poll";

      default:
        return "interacted with your poll";
    }
  }

  const unreadCount = items.filter(
    (item) => !item.read
  ).length;

  return (
    <div
      ref={wrapperRef}
      className="relative"
    >
      <button
        type="button"
        onClick={toggleNotifications}
        className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-[#292929] bg-[#111111] text-[#9CA3AF] transition hover:border-[#FFD21F]/40 hover:bg-[#FFD21F]/5 hover:text-[#FFD21F]"
        aria-label="Notifications"
      >
        <Bell size={18} />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#FFD21F] px-1 text-[10px] font-black text-black">
            {unreadCount > 9
              ? "9+"
              : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-2xl border border-[#292929] bg-[#111111] shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <div className="flex items-center justify-between border-b border-[#292929] px-4 py-3">
            <div className="flex items-center gap-2">
              <Bell
                size={15}
                className="text-[#FFD21F]"
              />

              <p className="text-sm font-bold text-white">
                Notifications
              </p>
            </div>

            <span className="text-[10px] font-bold uppercase tracking-wider text-[#666666]">
              PULSE
            </span>
          </div>

          {items.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-[#292929] bg-[#090909]">
                <CheckCircle2
                  size={24}
                  className="text-[#FFD21F]"
                />
              </div>

              <p className="text-sm text-[#9CA3AF]">
                No notifications yet.
              </p>

              <p className="mt-1 text-xs text-[#666666]">
                New activity will appear here.
              </p>
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {items.map(
                (notification) => {
                  const pollId =
                    notification.poll?._id ||
                    notification.poll?.id;

                  return (
                    <Link
                      key={
                        notification._id ||
                        notification.id
                      }
                      to={
                        pollId
                          ? `/poll/${pollId}`
                          : "/dashboard"
                      }
                      onClick={() =>
                        setOpen(false)
                      }
                      className={`block border-b border-[#202020] px-4 py-3 transition hover:bg-[#090909] ${
                        !notification.read
                          ? "bg-[#FFD21F]/5"
                          : ""
                      }`}
                    >
                      <p className="text-xs leading-5 text-[#9CA3AF]">
                        <span className="font-bold text-[#FFD21F]">
                          @
                          {notification
                            .actor
                            ?.username ||
                            "user"}
                        </span>{" "}
                        {verb(
                          notification.type
                        )}
                      </p>

                      {notification.poll
                        ?.question && (
                        <p className="mt-1 truncate text-xs text-[#666666]">
                          "
                          {
                            notification
                              .poll
                              .question
                          }
                          "
                        </p>
                      )}
                    </Link>
                  );
                }
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}