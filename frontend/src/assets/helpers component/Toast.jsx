import {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";
import {
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

const ToastCtx =
  createContext(() => {});

export const useToast = () =>
  useContext(ToastCtx);

export function ToastProvider({
  children,
}) {
  const [toasts, setToasts] =
    useState([]);

  const toast = useCallback(
    (
      message,
      type = "success"
    ) => {
      const id = `${Date.now()}-${Math.random()}`;

      setToasts((current) => [
        ...current,
        {
          id,
          message,
          type,
        },
      ]);

      setTimeout(() => {
        setToasts((current) =>
          current.filter(
            (item) => item.id !== id
          )
        );
      }, 2600);
    },
    []
  );

  return (
    <ToastCtx.Provider value={toast}>
      {children}

      <div className="fixed right-4 top-4 z-[100] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3">
        {toasts.map((item) => (
          <div
            key={item.id}
            className={`relative flex items-center gap-3 overflow-hidden rounded-2xl border px-4 py-3 text-sm font-semibold shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl animate-[toastIn_0.35s_ease-out] transition-all duration-300 hover:-translate-x-1 ${
              item.type === "error"
                ? "border-red-500/25 bg-[#111111]/95 text-red-400 hover:border-red-500/40"
                : "border-[#FFD21F]/25 bg-[#111111]/95 text-[#FFD21F] hover:border-[#FFD21F]/40"
            }`}
          >
            <div
              className={`absolute left-0 top-0 h-full w-1 ${
                item.type === "error"
                  ? "bg-red-500"
                  : "bg-[#FFD21F]"
              }`}
            />

            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                item.type === "error"
                  ? "bg-red-500/10 text-red-400"
                  : "bg-[#FFD21F]/10 text-[#FFD21F]"
              }`}
            >
              {item.type === "error" ? (
                <AlertCircle
                  size={17}
                  className="animate-pulse"
                />
              ) : (
                <CheckCircle2
                  size={17}
                  className="animate-[toastIcon_0.4s_ease-out]"
                />
              )}
            </div>

            <span className="leading-5 text-zinc-200">
              {item.message}
            </span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes toastIn {
          from {
            opacity: 0;
            transform: translateX(30px) scale(0.96);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }

        @keyframes toastIcon {
          0% {
            opacity: 0;
            transform: scale(0.5) rotate(-20deg);
          }
          70% {
            transform: scale(1.15) rotate(4deg);
          }
          100% {
            opacity: 1;
            transform: scale(1) rotate(0);
          }
        }
      `}</style>
    </ToastCtx.Provider>
  );
}