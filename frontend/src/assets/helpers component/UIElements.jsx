const btnStyles = {
  primary:
    "bg-[#FFD21F] text-black border border-[#FFD21F] hover:bg-[#FFE66D] hover:border-[#FFE66D] hover:shadow-[0_0_25px_rgba(255,210,31,0.18)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",

  ghost:
    "border border-[#292929] bg-[#111111] text-[#9CA3AF] hover:border-[#FFD21F]/40 hover:bg-[#FFD21F]/5 hover:text-[#FFD21F] hover:-translate-y-0.5 active:scale-[0.98]",

  danger:
    "border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 hover:border-red-500/30 hover:-translate-y-0.5 active:scale-[0.98]",
};

export const inputCls =
  "w-full rounded-xl border border-[#292929] bg-[#090909] px-4 py-3 text-sm text-white outline-none transition-all duration-300 placeholder:text-[#4B4B4B] focus:border-[#FFD21F]/50 focus:ring-4 focus:ring-[#FFD21F]/5 focus:shadow-[0_0_18px_rgba(255,210,31,0.05)] hover:border-[#3A3A3A]";

export const authInputCls =
  inputCls;

export function Button({
  variant = "primary",
  className = "",
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none ${
        btnStyles[variant] || btnStyles.primary
      } ${className}`}
      {...props}
    />
  );
}

export function AuthButton({
  className = "",
  ...props
}) {
  return (
    <button
      className={`group flex w-full items-center justify-center gap-2 rounded-xl border border-[#FFD21F] bg-[#FFD21F] px-4 py-3 text-sm font-black text-black transition-all duration-300 hover:border-[#FFE66D] hover:bg-[#FFE66D] hover:-translate-y-0.5 hover:shadow-[0_0_28px_rgba(255,210,31,0.2)] active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none ${className}`}
      {...props}
    />
  );
}

export function Field({
  label,
  className = "",
  ...props
}) {
  return (
    <label className="block">
      {label && (
        <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
          {label}
        </span>
      )}

      <input
        className={`${inputCls} ${className}`}
        {...props}
      />
    </label>
  );
}

export function Avatar({
  user = {},
  className = "h-10 w-10",
}) {
  const profileImage =
    user?.profileImage ||
    user?.profile_picture ||
    user?.avatar ||
    "";

  const displayName =
    user?.name || "User";

  if (profileImage) {
    return (
      <img
        src={profileImage}
        alt={displayName}
        className={`${className} rounded-full object-cover ring-1 ring-[#292929] transition-all duration-300 hover:scale-105 hover:ring-[#FFD21F]/50`}
      />
    );
  }

  return (
    <div
      className={`${className} flex shrink-0 items-center justify-center rounded-full border border-[#FFD21F]/20 bg-[#FFD21F]/10 text-sm font-black text-[#FFD21F] shadow-[0_0_12px_rgba(255,210,31,0.05)] transition-all duration-300 hover:scale-105 hover:border-[#FFD21F]/40 hover:bg-[#FFD21F]/15`}
    >
      {displayName?.[0]?.toUpperCase() ||
        "?"}
    </div>
  );
}

export function PollSkeleton({
  count = 3,
}) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map(
        (_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-3xl border border-[#292929] bg-[#111111] p-5 transition-all duration-300"
          >
            <div className="flex animate-pulse items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#292929]" />

              <div className="flex-1">
                <div className="h-3 w-32 rounded bg-[#292929]" />

                <div className="mt-2 h-2 w-20 rounded bg-[#202020]" />
              </div>

              <div className="h-6 w-20 rounded-full bg-[#202020]" />
            </div>

            <div className="mt-5 animate-pulse">
              <div className="h-5 w-4/5 rounded bg-[#292929]" />

              <div className="mt-4 h-3 w-full rounded bg-[#202020]" />

              <div className="mt-2 h-3 w-3/4 rounded bg-[#202020]" />
            </div>

            <div className="mt-5 flex animate-pulse gap-2">
              <div className="h-9 flex-1 rounded-xl bg-[#202020]" />
              <div className="h-9 flex-1 rounded-xl bg-[#202020]" />
              <div className="h-9 flex-1 rounded-xl bg-[#202020]" />
            </div>
          </div>
        )
      )}
    </div>
  );
}