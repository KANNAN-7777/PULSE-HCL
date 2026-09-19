export const authLayoutStyles = {
  container:
    "min-h-screen lg:grid lg:grid-cols-[1fr_1.1fr] bg-[#050505] text-white",

  leftPanel:
    "hidden lg:flex flex-col justify-between p-14 relative overflow-hidden bg-[#090909] border-r border-[#292929]",

  rightPanel:
    "flex items-center justify-center px-5 py-10 sm:px-10 min-h-screen lg:min-h-0 bg-[#050505]",

  formContainer:
    "w-full max-w-105",

  gridPatternStyle: {
    backgroundImage: `linear-gradient(rgba(255,210,31,0.06) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(255,210,31,0.06) 1px, transparent 1px)`,
    backgroundSize: "48px 48px",
  },

  glowTop:
    "absolute top-0 left-0 w-96 h-96 rounded-full bg-[#FFD21F]/8 blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse",

  glowBottom:
    "absolute bottom-0 right-0 w-80 h-80 rounded-full bg-[#4090F0]/8 blur-3xl translate-x-1/3 translate-y-1/3",

  logoContainer:
    "relative flex items-center gap-3 group",

  logoImg:
    "w-10 h-10 rounded-xl shadow-lg shadow-[#FFD21F]/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_25px_rgba(255,210,31,0.2)]",

  logoText:
    "text-xl font-bold text-white tracking-tight transition-colors duration-300 group-hover:text-[#FFD21F]",

  mainCopyContainer:
    "relative space-y-6",

  mainCopyInner:
    "space-y-3",

  liveBadge:
    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold tracking-wide transition-all duration-300 hover:bg-emerald-500/15 hover:border-emerald-500/30",

  dot:
    "w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.7)]",

  heading:
    "text-4xl font-extrabold text-white leading-[1.15] tracking-tight",

  emeraldText:
    "text-[#FFD21F] drop-shadow-[0_0_18px_rgba(255,210,31,0.15)]",

  description:
    "text-zinc-400 text-base leading-relaxed max-w-xs",

  statsGrid:
    "grid grid-cols-3 gap-3 pt-2",

  statCard:
    "group bg-[#111111] border border-[#292929] rounded-xl p-3 space-y-1.5 transition-all duration-300 hover:-translate-y-1 hover:border-[#FFD21F]/30 hover:bg-[#151515] hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)]",

  statValue:
    "text-white font-bold text-lg leading-none transition-colors duration-300 group-hover:text-[#FFD21F]",

  statLabel:
    "text-zinc-500 text-[11px] leading-tight",

  footer:
    "relative text-zinc-600 text-xs",

  mobileLogoContainer:
    "lg:hidden flex items-center gap-2.5 mb-10",

  mobileLogoImg:
    "w-9 h-9 rounded-xl shadow-md shadow-[#FFD21F]/20 transition-transform duration-300 hover:scale-105",

  mobileLogoText:
    "text-xl font-bold text-white",

  headingWrapper:
    "mb-8",

  pageTitle:
    "text-[28px] font-bold text-white tracking-tight leading-tight",

  subtitle:
    "text-zinc-400 mt-2 text-sm leading-relaxed",
};

export const commentsStyles = {
  commentsContainer:
    "mt-4 pt-4 border-t border-[#292929]",

  mainForm:
    "flex gap-2 mb-4",

  mainInput:
    "flex-1 rounded-xl bg-[#111111] border border-[#292929] px-3 py-2 text-xs text-zinc-300 placeholder:text-zinc-700 outline-none transition-all duration-300 focus:border-[#FFD21F]/60 focus:ring-1 focus:ring-[#FFD21F]/20 focus:shadow-[0_0_15px_rgba(255,210,31,0.05)]",

  mainSubmit:
    "w-8 h-8 grid place-items-center rounded-xl bg-[#FFD21F]/10 border border-[#FFD21F]/20 text-[#FFD21F] disabled:opacity-40 hover:bg-[#FFD21F]/20 hover:border-[#FFD21F]/40 hover:scale-105 active:scale-95 transition-all duration-200 shrink-0",

  commentList:
    "space-y-3",

  emptyText:
    "text-xs text-zinc-700 text-center py-3",

  commentItem:
    "flex gap-2.5 animate-[fadeIn_0.3s_ease-out]",

  avatarSmall:
    "w-6 h-6 text-[10px] shrink-0 mt-0.5 ring-1 ring-[#292929]",

  commentContent:
    "flex-1 min-w-0",

  commentBubble:
    "bg-[#111111] rounded-xl px-3 py-2 border border-transparent transition-all duration-300 hover:border-[#292929] hover:bg-[#151515]",

  commentHeader:
    "flex items-center gap-1.5 mb-0.5",

  usernameLink:
    "text-[11px] font-semibold text-zinc-400 hover:text-[#FFD21F] transition-colors",

  timestamp:
    "text-zinc-700 text-[10px]",

  commentText:
    "text-xs text-zinc-300 leading-relaxed",

  commentActions:
    "flex items-center gap-2 mt-1 ml-2",

  replyButton:
    "text-[10px] font-medium text-zinc-700 hover:text-[#FFD21F] transition-colors",

  deleteButton:
    "text-[10px] font-medium text-zinc-700 hover:text-rose-400 transition-colors inline-flex items-center gap-0.5",

  replyForm:
    "flex gap-2 mt-2",

  replyInput:
    "flex-1 rounded-xl bg-[#111111] border border-[#292929] px-3 py-1.5 text-xs text-zinc-300 placeholder:text-zinc-600 outline-none transition-all duration-300 focus:border-[#FFD21F]/60 focus:ring-1 focus:ring-[#FFD21F]/15",

  replySubmit:
    "w-7 h-7 grid place-items-center rounded-xl bg-[#FFD21F]/10 border border-[#FFD21F]/20 text-[#FFD21F] hover:bg-[#FFD21F]/20 hover:scale-105 active:scale-95 transition-all duration-200 shrink-0",

  repliesContainer:
    "mt-2 space-y-2 border-l border-[#292929] pl-3 ml-1",

  replyItem:
    "flex gap-2",

  replyIndent:
    "text-zinc-700 mt-0.5 shrink-0",

  avatarTiny:
    "w-5 h-5 text-[9px] shrink-0",

  replyBubble:
    "flex-1 min-w-0 bg-[#111111]/70 rounded-xl px-2.5 py-1.5 border border-transparent hover:border-[#292929] transition-all duration-300",

  replyHeader:
    "flex items-center gap-1.5 mb-0.5",

  replyUsername:
    "text-[10px] font-semibold text-zinc-500 hover:text-[#FFD21F]",

  replyTimestamp:
    "text-zinc-700 text-[9px]",

  replyText:
    "text-xs text-zinc-400",

  replyDelete:
    "text-[10px] font-medium text-zinc-700 hover:text-rose-400 transition-colors inline-flex items-center gap-0.5 mt-0.5",
};

export const connectionsStyles = {
  container:
    "space-y-3",

  tabContainer:
    "inline-flex rounded-xl bg-[#111111] border border-[#292929] p-1 text-xs font-semibold",

  tabButtonBase:
    "px-3 py-1.5 rounded-lg transition-all duration-200",

  tabButtonActive:
    "bg-[#FFD21F] text-black shadow-[0_0_15px_rgba(255,210,31,0.12)]",

  tabButtonInactive:
    "text-zinc-500 hover:text-zinc-200 hover:bg-[#151515]",

  emptyText:
    "text-xs text-zinc-600 py-2",

  userList:
    "space-y-1",

  userLink:
    "flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-[#111111] hover:border-[#292929] transition-all duration-200 border border-transparent",

  userAvatar:
    "w-8 h-8 text-xs ring-1 ring-[#292929]",

  userInfo:
    "min-w-0",

  userName:
    "text-xs font-semibold text-zinc-300 truncate transition-colors hover:text-[#FFD21F]",

  userUsername:
    "text-[11px] text-zinc-600 truncate",
};

export const filterBarStyles = {
  container:
    "flex flex-wrap items-center gap-1.5",

  filterButtonBase:
    "inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium transition-all duration-200",

  filterButtonActive:
    "bg-[#FFD21F]/10 text-[#FFD21F] border border-[#FFD21F]/30 shadow-[0_0_12px_rgba(255,210,31,0.06)]",

  filterButtonInactive:
    "text-zinc-600 hover:text-zinc-200 hover:bg-[#111111] hover:border-[#292929] border border-transparent",

  clearButton:
    "inline-flex items-center gap-1 px-2 py-1.5 rounded-xl text-xs font-medium text-zinc-700 hover:text-zinc-400 transition-colors",
};

export const layoutStyles = {
  container:
    "min-h-screen bg-[#050505] text-zinc-300",

  header:
    "sticky top-0 z-40 bg-[#050505]/90 backdrop-blur-xl border-b border-[#292929]",

  headerInner:
    "max-w-7xl mx-auto px-4 h-14 flex items-center gap-3",

  bodyContainer:
    "max-w-7xl mx-auto px-3 sm:px-4 flex gap-5 xl:gap-6",

  logoLink:
    "flex items-center gap-2 shrink-0 group",

  logoImg:
    "w-8 h-8 rounded-lg shadow-lg shadow-[#FFD21F]/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(255,210,31,0.18)]",

  logoSpan:
    "hidden sm:block text-[15px] font-bold text-white tracking-tight transition-colors duration-300 group-hover:text-[#FFD21F]",

  searchDesktop:
    "hidden md:flex flex-1 max-w-md mx-auto relative",

  searchIcon:
    "absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none transition-colors",

  searchInput:
    "w-full rounded-xl bg-[#111111] border border-[#292929] pl-8 pr-4 py-2 text-sm text-zinc-300 placeholder:text-zinc-600 outline-none transition-all duration-300 hover:border-zinc-700 focus:border-[#FFD21F]/60 focus:ring-1 focus:ring-[#FFD21F]/20 focus:shadow-[0_0_18px_rgba(255,210,31,0.05)]",

  rightCluster:
    "flex items-center gap-1.5 ml-auto md:ml-0 shrink-0",

  mobileSearchToggle:
    "md:hidden w-9 h-9 grid place-items-center rounded-xl text-zinc-500 hover:text-[#FFD21F] hover:bg-[#111111] transition-all duration-200",

  createButton:
    "hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-[#FFD21F] text-black px-3.5 py-2 text-sm font-semibold hover:bg-[#FFE66D] hover:shadow-[0_0_22px_rgba(255,210,31,0.18)] active:scale-95 transition-all duration-200 shadow-lg shadow-[#FFD21F]/15",

  avatarWrapper:
    "relative shrink-0",

  avatarClass:
    "w-7 h-7 text-xs ring-1 ring-[#292929] transition-transform duration-200 hover:scale-105",

  mobileSearchContainer:
    "md:hidden px-4 pb-3 border-t border-[#292929]",

  mobileSearchInner:
    "relative mt-3",

  mobileSearchInput:
    "w-full rounded-xl bg-[#111111] border border-[#292929] pl-8 pr-4 py-2.5 text-sm text-zinc-300 placeholder:text-zinc-600 outline-none transition-all duration-300 focus:border-[#FFD21F]/60 focus:ring-1 focus:ring-[#FFD21F]/15",

  leftSidebar:
    "hidden lg:flex flex-col w-52 shrink-0 sticky top-14 self-start h-[calc(100vh-3.5rem)] py-6 pr-1",

  menuLabel:
    "px-3 mb-2 text-[10px] font-bold text-zinc-700 uppercase tracking-widest",

  navContainer:
    "space-y-0.5 flex-1",

  sideLinkBase:
    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",

  sideLinkActive:
    "bg-[#FFD21F]/10 text-[#FFD21F] font-semibold border border-[#FFD21F]/20 shadow-[0_0_15px_rgba(255,210,31,0.05)]",

  sideLinkInactive:
    "text-zinc-500 hover:text-zinc-100 hover:bg-[#111111] hover:translate-x-0.5",

  sidebarBottom:
    "pt-4 border-t border-[#292929] space-y-0.5",

  logoutButton:
    "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-500/8 hover:translate-x-0.5 transition-all duration-200",

  mainContent:
    "flex-1 min-w-0 max-w-7xl mx-auto py-5 pb-24 lg:pb-6",

  rightRail:
    "hidden xl:flex flex-col w-72 shrink-0 py-5 gap-3 sticky top-14 self-start max-h-[calc(100vh-3.5rem)] overflow-y-auto",

  bottomNav:
    "lg:hidden fixed bottom-0 inset-x-0 z-40 bg-[#050505]/95 backdrop-blur-xl border-t border-[#292929] flex justify-around px-2 py-1",

  bottomLinkBase:
    "flex flex-col items-center gap-1 py-2 px-3 text-[10px] font-semibold transition-all duration-200",

  bottomLinkActive:
    "text-[#FFD21F] scale-105",

  bottomLinkInactive:
    "text-zinc-600 hover:text-zinc-300",
};

export const notificationStyles = {
  container:
    "relative shrink-0",

  bellButton:
    "relative grid place-items-center w-8 h-8 rounded-xl text-zinc-500 hover:text-[#FFD21F] hover:bg-[#111111] transition-all duration-200",

  badgeDot:
    "absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FFD21F] ring-2 ring-[#050505] animate-pulse shadow-[0_0_7px_rgba(255,210,31,0.8)]",

  dropdown:
    "fixed sm:absolute left-3 right-3 sm:left-auto sm:right-0 top-14 sm:top-full mt-0 sm:mt-2 w-auto sm:w-80 max-h-[70vh] sm:max-h-95 overflow-y-auto bg-[#111111] border border-[#292929] rounded-2xl shadow-2xl shadow-black/40 z-50 backdrop-blur-xl",

  header:
    "sticky top-0 bg-[#111111] px-4 py-3 border-b border-[#292929]",

  headerText:
    "text-[10px] font-bold text-zinc-700 uppercase tracking-widest",

  emptyText:
    "px-4 py-8 text-sm text-zinc-600 text-center",

  notificationLink:
    "block px-4 py-3 text-xs hover:bg-[#1a1a1a] transition-all duration-200 border-b border-[#292929]/60 last:border-0",

  notificationUnread:
    "bg-[#FFD21F]/4 hover:bg-[#FFD21F]/8",

  notificationText:
    "text-zinc-400",

  actorName:
    "font-semibold text-zinc-200",

  pollPreview:
    "text-zinc-600",
};

export const otpStepStyles = {
  form:
    "space-y-5",

  emailBadge:
    "flex items-center gap-3 rounded-xl bg-[#111111] border border-[#292929] px-4 py-3 transition-all duration-300 hover:border-[#FFD21F]/20",

  emailIconWrapper:
    "w-8 h-8 rounded-lg bg-[#FFD21F]/10 border border-[#FFD21F]/20 text-[#FFD21F] grid place-items-center shrink-0",

  emailLabel:
    "text-xs text-zinc-500 font-medium",

  emailValue:
    "text-sm font-semibold text-white",

  errorBox:
    "rounded-xl bg-rose-500/10 border border-rose-500/20 px-4 py-3 text-rose-300 text-sm",

  otpLabel:
    "block text-xs font-semibold text-zinc-400 uppercase tracking-wider",

  otpInput:
    "w-full rounded-xl border border-[#292929] bg-[#111111] px-4 py-4 text-white placeholder:text-zinc-600 outline-none transition-all duration-300 focus:border-[#FFD21F] focus:ring-2 focus:ring-[#FFD21F]/20 focus:shadow-[0_0_20px_rgba(255,210,31,0.08)] text-center text-3xl tracking-[0.6em] font-bold",

  otpDotsContainer:
    "flex gap-1.5 justify-center pt-1",

  otpDot:
    "w-1.5 h-1.5 rounded-full transition-all duration-200",

  otpDotFilled:
    "bg-[#FFD21F] shadow-[0_0_7px_rgba(255,210,31,0.7)]",

  otpDotEmpty:
    "bg-zinc-700",

  resendText:
    "text-sm text-zinc-500",

  resendTimer:
    "font-semibold text-zinc-300 tabular-nums",

  resendButton:
    "inline-flex items-center gap-1.5 text-sm font-semibold text-[#FFD21F] hover:text-[#FFE66D] transition-colors disabled:opacity-50",

  resendIcon:
    "animate-spin",

  spinner:
    "animate-spin w-4 h-4",

  spinnerCircle:
    "opacity-25",

  spinnerPath:
    "opacity-75",
};

export const pollCardStyles = {
  card:
    "group bg-[#111111] border border-[#292929] rounded-2xl mb-3 overflow-hidden transition-all duration-300 hover:border-[#FFD21F]/30 hover:bg-[#151515] hover:-translate-y-1 hover:shadow-[0_14px_35px_rgba(0,0,0,0.28)]",

  header:
    "flex items-center gap-2 mb-3",

  avatar:
    "w-7 h-7 text-xs shrink-0 ring-1 ring-[#292929] transition-transform duration-200 group-hover:scale-105",

  userInfo:
    "flex-1 min-w-0",

  userInfoInner:
    "flex items-center gap-1.5 flex-wrap",

  userNameLink:
    "text-xs font-semibold text-zinc-300 hover:text-[#FFD21F] transition-colors",

  dot:
    "text-zinc-700 text-xs",

  username:
    "text-xs text-zinc-600",

  timestamp:
    "text-xs text-zinc-700",

  closedBadge:
    "inline-flex items-center gap-1 rounded-lg bg-rose-500/10 border border-rose-500/15 text-rose-500 px-2 py-0.5 text-[10px] font-semibold",

  categoryTagBase:
    "rounded-lg border px-2 py-0.5 text-[10px] font-semibold transition-all duration-200",

  ownerControls:
    "flex flex-wrap gap-1.5 mb-3 pb-3 border-b border-[#292929]/70",

  ownerButton:
    "inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[#090909] border border-[#292929] text-zinc-400 hover:text-zinc-100 hover:border-zinc-600 hover:-translate-y-0.5 transition-all duration-200",

  ownerAnalytics:
    "inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[#FFD21F]/10 border border-[#FFD21F]/20 text-[#FFD21F] hover:bg-[#FFD21F]/15 hover:border-[#FFD21F]/30 hover:shadow-[0_0_14px_rgba(255,210,31,0.08)] transition-all duration-200",

  ownerDelete:
    "inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-[#090909] border border-rose-500/20 text-rose-500 hover:bg-rose-500/8 hover:-translate-y-0.5 transition-all duration-200",

  question:
    "text-[15px] font-semibold text-zinc-100 mb-3 leading-snug",

  editTextarea:
    "min-h-16 resize-y",

  footer:
    "flex items-center gap-0.5 mt-3 pt-3 border-t border-[#292929]/70",

  totalVotes:
    "inline-flex items-center gap-1 rounded-lg bg-[#FFD21F]/10 text-[#FFD21F] px-2.5 py-1.5 text-xs font-semibold mr-1 transition-all duration-200 hover:bg-[#FFD21F]/15",

  action:
    "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-200 hover:bg-[#1a1a1a] transition-all duration-200",

  actionActive:
    "text-[#FFD21F] bg-[#FFD21F]/10 shadow-[0_0_12px_rgba(255,210,31,0.05)]",

  saveIconFill:
    "fill-[#FFD21F]",

  editButton:
    "py-1.5 text-xs",
};

export const pollResultsStyles = {
  resultBarBase:
    "relative h-9 rounded-xl overflow-hidden border transition-all duration-300 group",

  resultBarHighlight:
    "border-[#FFD21F]/30 bg-[#111111] hover:border-rose-500/40 hover:bg-rose-500/5 hover:shadow-[0_0_16px_rgba(239,68,68,0.12)] cursor-pointer",

  resultBarDefault:
    "border-[#292929] bg-[#111111] cursor-default",

  resultBarFill:
    "absolute inset-y-0 left-0 transition-all duration-700 ease-out",

  resultBarFillHighlight:
    "bg-[#FFD21F]/15 group-hover:bg-rose-500/10",

  resultBarFillWinner:
    "bg-[#FFD21F]/10 group-hover:bg-[#FFD21F]/15",

  resultBarFillDefault:
    "bg-zinc-700/25",

  resultBarContent:
    "relative h-full flex justify-between items-center px-3 text-xs select-none",

  resultBarLabelBase:
    "font-medium flex items-center gap-1.5 transition-colors",

  resultBarLabelHighlight:
    "text-[#FFD21F] group-hover:text-rose-400",

  resultBarLabelDefault:
    "text-zinc-400",

  resultBarPercentBase:
    "font-bold tabular-nums flex items-center gap-2 transition-colors",

  resultBarPercentHighlight:
    "text-[#FFD21F] group-hover:text-rose-400",

  resultBarPercentDefault:
    "text-zinc-500",

  resultBarUndoHint:
    "text-[10px] text-rose-400/70 font-normal hidden group-hover:inline",

  resultBarCheck:
    "shrink-0 group-hover:hidden",

  resultBarUndoIcon:
    "shrink-0 hidden group-hover:inline animate-[spin_2s_linear_infinite]",

  versusEmpty:
    "h-10 rounded-xl bg-[#111111] border border-[#292929] grid place-items-center text-xs text-zinc-600",

  versusBarContainer:
    "flex h-10 rounded-xl overflow-hidden border border-[#292929] relative group",

  versusYesBase:
    "transition-all duration-700 ease-out bg-[#FFD21F]/70 flex items-center px-3 text-black font-bold text-xs",

  versusYesHover:
    "hover:bg-[#FFD21F]/55 cursor-pointer",

  versusNoBase:
    "flex-1 bg-rose-500/50 flex items-center justify-end px-3 text-white font-bold text-xs",

  versusNoHover:
    "hover:bg-rose-500/40 cursor-pointer",

  versusLabels:
    "flex justify-between mt-2 text-xs font-medium",

  versusLabelYesBase:
    "inline-flex items-center gap-1 transition-colors select-none",

  versusLabelYesActive:
    "text-[#FFD21F] hover:text-[#FFE66D] cursor-pointer group-hover:text-[#FFE66D]",

  versusLabelYesInactive:
    "text-zinc-600",

  versusLabelNoBase:
    "inline-flex items-center gap-1 transition-colors select-none",

  versusLabelNoActive:
    "text-rose-400 hover:text-rose-300 cursor-pointer",

  versusLabelNoInactive:
    "text-zinc-600",

  versusVoteCount:
    "text-zinc-700 select-none",

  versusUndoHint:
    "text-[10px] font-normal text-zinc-500",

  openContainer:
    "space-y-2",

  openHeader:
    "text-[10px] font-bold text-zinc-700 uppercase tracking-widest",

  openResponse:
    "rounded-xl border border-[#292929] bg-[#111111] px-4 py-2.5 text-xs text-zinc-400 transition-all duration-300 hover:border-[#FFD21F]/15 hover:bg-[#151515]",

  openEmpty:
    "text-xs text-zinc-700",

  imageGrid:
    "grid grid-cols-2 gap-2",

  imageItemBase:
    "relative rounded-xl overflow-hidden border-2 transition-all duration-300",

  imageItemActive:
    "border-[#FFD21F] cursor-pointer hover:border-rose-500/80 hover:shadow-[0_0_18px_rgba(255,210,31,0.18)] group/img",

  imageItemInactive:
    "border-[#292929]",

  imageThumb:
    "w-full h-32 object-cover transition-transform duration-500 group-hover/img:scale-105",

  imageBadge:
    "absolute top-2 right-2 grid place-items-center w-6 h-6 rounded-full bg-[#FFD21F] text-black group-hover/img:bg-rose-500 group-hover/img:text-white transition-all duration-200",

  imageUndoText:
    "absolute bottom-0 inset-x-0 text-center py-1 text-[10px] text-rose-300/90 bg-black/60 backdrop-blur-xs hidden group-hover/img:inline select-none",

  ratingSummary:
    "flex items-center gap-2.5 mb-2 p-3 rounded-xl bg-[#111111] border border-[#292929] transition-all duration-300 hover:border-[#FFD21F]/20",

  ratingAverage:
    "text-xl font-extrabold text-white select-none",

  ratingStars:
    "flex gap-0.5",

  starFilled:
    "text-[#FFD21F] fill-[#FFD21F] transition-transform duration-200 hover:scale-110",

  starEmpty:
    "text-zinc-700",

  ratingCount:
    "text-xs text-zinc-600 select-none",

  totalVotesText:
    "text-[10px] font-bold text-zinc-700 uppercase tracking-widest pt-1 select-none",
};

export const pollVoteStyles = {
  yesNoGrid:
    "grid grid-cols-2 gap-2",

  yesNoButtonBase:
    "flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-semibold transition-all duration-200",

  yesNoButtonYesActive:
    "border-[#FFD21F]/70 bg-[#FFD21F]/15 text-[#FFD21F] shadow-[0_0_16px_rgba(255,210,31,0.15)] scale-[1.01]",

  yesNoButtonYesInactive:
    "border-[#292929] text-zinc-500 hover:border-[#FFD21F]/40 hover:bg-[#FFD21F]/8 hover:text-[#FFD21F] hover:-translate-y-0.5",

  yesNoButtonNoActive:
    "border-rose-500/60 bg-rose-500/15 text-rose-400 shadow-[0_0_16px_rgba(239,68,68,0.15)] scale-[1.01]",

  yesNoButtonNoInactive:
    "border-[#292929] text-zinc-500 hover:border-rose-500/40 hover:bg-rose-500/8 hover:text-rose-400 hover:-translate-y-0.5",

  singleContainer:
    "space-y-1.5",

  singleOptionBase:
    "group w-full flex items-center gap-3 text-left rounded-xl border px-3 py-2.5 text-sm font-medium transition-all duration-200",

  singleOptionActive:
    "border-[#FFD21F]/50 bg-[#FFD21F]/10 text-zinc-200 shadow-[0_0_12px_rgba(255,210,31,0.12)] translate-x-0.5",

  singleOptionInactive:
    "border-[#292929] text-zinc-500 hover:border-[#FFD21F]/30 hover:bg-[#FFD21F]/6 hover:text-zinc-300 hover:translate-x-0.5",

  singleOptionCircleBase:
    "grid place-items-center w-6 h-6 rounded-full text-xs font-bold shrink-0 transition-all duration-200",

  singleOptionCircleActive:
    "bg-[#FFD21F]/20 text-[#FFD21F] shadow-[0_0_10px_rgba(255,210,31,0.1)]",

  singleOptionCircleInactive:
    "bg-[#111111] text-zinc-600 group-hover:bg-[#FFD21F]/15 group-hover:text-[#FFD21F]",

  singleUndoHint:
    "ml-auto text-[10px] text-rose-400/70 font-normal",

  ratingContainer:
    "flex items-center gap-4 py-1",

  ratingStars:
    "flex gap-1",

  ratingStarButton:
    "transition-all duration-200 hover:scale-125 p-0.5",

  ratingStarFilled:
    "text-[#FFD21F] fill-[#FFD21F] drop-shadow-[0_0_7px_rgba(255,210,31,0.45)]",

  ratingStarEmpty:
    "text-zinc-800 hover:text-zinc-600",

  ratingSubmit:
    "rounded-xl bg-[#FFD21F]/10 border border-[#FFD21F]/20 text-[#FFD21F] px-3 py-1.5 text-xs font-semibold hover:bg-[#FFD21F]/20 hover:border-[#FFD21F]/40 transition-all duration-200",

  ratingHint:
    "text-xs text-zinc-700",

  ratingUndoHint:
    "text-xs text-rose-400/60",

  imageGrid:
    "grid grid-cols-2 gap-2",

  imageItemBase:
    "group relative rounded-xl overflow-hidden border-2 transition-all duration-300",

  imageItemActive:
    "border-[#FFD21F] shadow-[0_0_14px_rgba(255,210,31,0.2)]",

  imageItemSelected:
    "border-[#FFD21F]/60 shadow-[0_0_10px_rgba(255,210,31,0.08)]",

  imageItemInactive:
    "border-[#292929] hover:border-zinc-700 hover:-translate-y-0.5",

  imageThumb:
    "w-full h-32 object-cover transition-transform duration-500 group-hover:scale-105",

  imageCheck:
    "absolute top-2 right-2 grid place-items-center w-6 h-6 rounded-full bg-[#FFD21F] text-black shadow-[0_0_10px_rgba(255,210,31,0.3)]",

  imageUndoText:
    "absolute bottom-0 inset-x-0 text-center py-1 text-[10px] text-rose-300/80 bg-black/50 backdrop-blur-sm",

  imageSubmit:
    "mt-3 w-full rounded-xl bg-[#FFD21F]/10 border border-[#FFD21F]/20 text-[#FFD21F] py-2.5 text-sm font-semibold hover:bg-[#FFD21F]/20 hover:border-[#FFD21F]/40 hover:shadow-[0_0_15px_rgba(255,210,31,0.08)] transition-all duration-200",

  openTextarea:
    "min-h-20 resize-y",

  openFooter:
    "flex justify-between items-center mt-2",

  openCharCount:
    "text-xs text-zinc-700 tabular-nums",

  openSubmit:
    "rounded-xl bg-[#FFD21F]/10 border border-[#FFD21F]/20 text-[#FFD21F] px-4 py-1.5 text-xs font-semibold disabled:opacity-40 hover:bg-[#FFD21F]/20 hover:border-[#FFD21F]/40 transition-all duration-200",
};

export const sidebarStyles = {
  profileCard:
    "relative bg-[#111111] border border-[#292929] rounded-2xl p-5 overflow-hidden transition-all duration-300 hover:border-[#FFD21F]/20 hover:shadow-[0_12px_35px_rgba(0,0,0,0.25)]",

  glowBlob:
    "absolute -top-8 left-1/2 -translate-x-1/2 w-44 h-24 bg-[#FFD21F]/10 blur-3xl rounded-full pointer-events-none animate-pulse",

  profileInner:
    "relative flex flex-col items-center text-center",

  avatarWrapper:
    "relative",

  avatarGlow:
    "absolute -inset-1.5 rounded-full bg-[#FFD21F]/20 blur-md animate-pulse",

  avatarClass:
    "relative w-16 h-16 text-lg ring-2 ring-[#292929] transition-transform duration-300 hover:scale-105",

  userNameLink:
    "mt-3 text-sm font-semibold text-zinc-200 hover:text-[#FFD21F] transition-colors",

  usernameText:
    "text-xs text-zinc-600 mt-0.5",

  statsContainer:
    "relative mt-5 pt-4 border-t border-[#292929] grid grid-cols-3 divide-x divide-[#292929]",

  statBox:
    "text-center",

  statNumber:
    "text-base font-bold text-white tabular-nums transition-colors duration-200 hover:text-[#FFD21F]",

  statLabel:
    "text-[10px] text-zinc-600 mt-0.5 uppercase tracking-wide",

  viewProfileLink:
    "relative mt-4 flex items-center justify-center rounded-xl bg-[#111111] hover:bg-[#1a1a1a] border border-[#292929] hover:border-[#FFD21F]/25 text-zinc-400 hover:text-white text-xs font-semibold py-2 transition-all duration-200",

  trendingCard:
    "bg-[#111111] border border-[#292929] rounded-2xl p-4 transition-all duration-300 hover:border-[#4090F0]/20",

  trendingHeading:
    "text-[10px] font-bold text-zinc-700 uppercase tracking-widest mb-4 flex items-center gap-2",

  trendingIcon:
    "text-[#FFD21F]",

  trendingList:
    "space-y-3",

  trendingItem:
    "",

  trendingItemRow:
    "flex justify-between items-center mb-1.5",

  trendingItemLabel:
    "text-xs text-zinc-500 flex items-center gap-1.5",

  trendingItemIcon:
    "text-zinc-700",

  trendingItemCount:
    "text-xs font-semibold text-zinc-600 tabular-nums",

  trendingBarTrack:
    "h-0.5 rounded-full bg-[#292929] overflow-hidden",

  trendingBarFillBase:
    "h-0.5 rounded-full transition-all duration-700 ease-out",
};

export const toastStyles = {
  container:
    "fixed top-4 right-4 z-100 space-y-2",

  toastBase:
    "flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-xl backdrop-blur border transition-all duration-300",

  toastSuccess:
    "bg-[#FFD21F]/15 border-[#FFD21F]/30 text-[#FFE66D] shadow-[0_8px_30px_rgba(255,210,31,0.1)]",

  toastError:
    "bg-rose-500/15 border-rose-500/30 text-rose-300 shadow-[0_8px_30px_rgba(244,63,94,0.08)]",
};

export const uiElementStyles = {
  btnBase:
    "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 disabled:opacity-40 disabled:pointer-events-none",

  btnPrimary:
    "bg-[#FFD21F] text-black hover:bg-[#FFE66D] hover:shadow-[0_0_22px_rgba(255,210,31,0.2)] active:scale-95 shadow-lg shadow-[#FFD21F]/20",

  btnGhost:
    "bg-[#111111] border border-[#292929] text-zinc-200 hover:bg-[#1a1a1a] hover:border-[#3a3a3a] hover:-translate-y-0.5",

  btnDanger:
    "bg-[#111111] border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/50",

  inputCls:
    "w-full rounded-xl border border-[#292929] bg-[#111111] px-4 py-2.5 text-white placeholder:text-zinc-500 outline-none transition-all duration-300 focus:border-[#FFD21F] focus:ring-2 focus:ring-[#FFD21F]/20 focus:shadow-[0_0_18px_rgba(255,210,31,0.06)] text-sm",

  authButton:
    "w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 bg-[#FFD21F] text-black hover:bg-[#FFE66D] hover:shadow-[0_0_25px_rgba(255,210,31,0.2)] active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none shadow-lg shadow-[#FFD21F]/20",

  fieldLabel:
    "block text-sm font-semibold text-zinc-300 mb-1.5",

  avatarImg:
    "rounded-full object-cover transition-transform duration-300 hover:scale-105",

  avatarPlaceholder:
    "rounded-full grid place-items-center bg-[#FFD21F] text-black font-bold",

  skeletonContainer:
    "space-y-3",

  skeletonCard:
    "bg-[#111111] border border-[#292929] rounded-2xl p-4 animate-pulse",

  skeletonAvatar:
    "w-7 h-7 rounded-full bg-[#292929]",

  skeletonName:
    "h-2.5 w-24 bg-[#292929] rounded-lg",

  skeletonUsername:
    "h-2 w-16 bg-zinc-800/60 rounded-lg",

  skeletonCategory:
    "ml-auto h-5 w-14 bg-[#292929] rounded-lg",

  skeletonQuestion:
    "h-4 w-3/4 bg-[#292929] rounded-lg mb-4",

  skeletonOptions:
    "space-y-2",

  skeletonOption1:
    "h-9 bg-[#292929]/80 rounded-xl",

  skeletonOption2:
    "h-9 bg-[#292929]/50 rounded-xl",

  skeletonFooter:
    "flex gap-2 mt-4 pt-3 border-t border-[#292929]",

  skeletonAction1:
    "h-6 w-14 bg-[#292929] rounded-lg",

  skeletonAction2:
    "h-6 w-20 bg-[#292929] rounded-lg",

  skeletonAction3:
    "h-6 w-14 bg-[#292929] rounded-lg",
};

export const analyticsStyles = {
  container:
    "space-y-5",

  backButton:
    "inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-[#FFD21F] transition-colors",

  heading:
    "text-base font-bold text-zinc-200",

  subtitle:
    "text-xs text-zinc-600 mt-1 leading-relaxed",

  statsGrid:
    "grid grid-cols-2 sm:grid-cols-4 gap-3",

  statCard:
    "group bg-[#111111] border border-[#292929] rounded-2xl p-4 transition-all duration-300 hover:-translate-y-1 hover:border-[#FFD21F]/25 hover:bg-[#151515] hover:shadow-[0_12px_30px_rgba(0,0,0,0.25)]",

  statIcon:
    "inline-grid place-items-center w-8 h-8 rounded-xl transition-transform duration-300 group-hover:scale-110",

  statValue:
    "mt-3 text-2xl font-bold text-white tabular-nums transition-colors duration-300 group-hover:text-[#FFD21F]",

  statLabel:
    "text-[10px] font-bold text-zinc-700 uppercase tracking-widest mt-0.5",

  resultsContainer:
    "bg-[#111111] border border-[#292929] rounded-2xl p-5 transition-all duration-300 hover:border-[#FFD21F]/15",

  resultsHeading:
    "text-[10px] font-bold text-zinc-700 uppercase tracking-widest mb-4",

  errorContainer:
    "bg-[#111111] border border-[#292929] rounded-2xl p-12 text-center text-xs text-zinc-600",
};

export const createPollStyles = {
  heading:
    "text-base font-bold text-zinc-200 mb-5",

  form:
    "bg-[#111111] border border-[#292929] rounded-2xl p-5 space-y-5 transition-all duration-300 hover:border-[#FFD21F]/15",

  errorBox:
    "flex items-start gap-3 rounded-xl bg-rose-500/8 border border-rose-500/15 text-rose-400 px-4 py-3 text-xs font-medium",

  label:
    "block text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2",

  textarea:
    "min-h-24 resize-y",

  typeButtonBase:
    "inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-200",

  typeButtonActive:
    "bg-[#FFD21F]/15 border border-[#FFD21F]/30 text-[#FFD21F] shadow-[0_0_12px_rgba(255,210,31,0.06)]",

  typeButtonInactive:
    "bg-[#111111] border border-[#292929] text-zinc-500 hover:text-zinc-200 hover:border-zinc-600 hover:-translate-y-0.5",

  optionsContainer:
    "space-y-2",

  optionInputWrapper:
    "flex gap-2",

  optionDeleteButton:
    "shrink-0 px-3",

  addOptionButton:
    "text-xs py-2",

  imageGrid:
    "flex gap-2 flex-wrap",

  imageItem:
    "relative w-20 h-20",

  imageThumb:
    "w-20 h-20 object-cover rounded-xl border border-[#292929] transition-transform duration-300 hover:scale-105",

  imageRemoveButton:
    "absolute -top-2 -right-2 grid place-items-center w-5 h-5 rounded-full bg-rose-500 text-white shadow-lg hover:bg-rose-400 hover:scale-110 transition-all duration-200",

  imageAddLabel:
    "grid place-items-center w-20 h-20 cursor-pointer bg-[#111111] border border-dashed border-[#292929] hover:border-[#FFD21F]/50 hover:bg-[#FFD21F]/5 hover:scale-[1.02] rounded-xl transition-all duration-200",

  imageAddContent:
    "flex flex-col items-center gap-0.5 text-zinc-600 group-hover:text-[#FFD21F] transition-colors",

  imageHint:
    "text-[11px] text-zinc-600 mt-2",

  submitButton:
    "w-full py-3",
};

export const dashboardStyles = {
  container:
    "space-y-4",

  greetingRow:
    "flex items-center justify-between",

  greetingHeading:
    "text-lg font-bold text-white",

  greetingSub:
    "text-sm text-zinc-600 mt-0.5",

  composer:
    "flex items-center gap-3 bg-[#111111] border border-[#292929] rounded-2xl p-3 transition-all duration-300 hover:border-[#FFD21F]/20 hover:shadow-[0_10px_30px_rgba(0,0,0,0.2)]",

  composerAvatar:
    "w-9 h-9 text-sm shrink-0 ring-1 ring-[#292929]",

  composerInput:
    "flex-1 text-left text-sm text-zinc-600 bg-[#090909] hover:bg-[#151515] hover:text-zinc-300 rounded-xl px-4 py-2.5 transition-all duration-200",

  composerButton:
    "grid place-items-center w-9 h-9 rounded-xl bg-[#FFD21F] text-black hover:bg-[#FFE66D] hover:shadow-[0_0_18px_rgba(255,210,31,0.2)] active:scale-95 transition-all duration-200 shrink-0 shadow-lg shadow-[#FFD21F]/20",

  feedTabs:
    "flex items-center gap-2",

  tabBase:
    "inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200",

  tabActive:
    "bg-[#FFD21F] text-black border border-[#FFD21F] shadow-[0_0_16px_rgba(255,210,31,0.1)]",

  tabInactive:
    "text-zinc-600 hover:text-zinc-300 hover:bg-[#111111]",

  emptyContainer:
    "bg-[#111111] border border-[#292929] rounded-2xl p-14 text-center transition-all duration-300",

  emptyIcon:
    "grid place-items-center w-14 h-14 rounded-2xl bg-[#FFD21F]/10 border border-[#FFD21F]/15 text-[#FFD21F] mx-auto mb-4 animate-pulse",

  emptyTitle:
    "font-semibold text-zinc-300",

  emptyDesc:
    "text-sm text-zinc-600 mt-1",

  emptyButton:
    "mt-5 inline-flex items-center gap-2 rounded-xl bg-[#FFD21F]/10 border border-[#FFD21F]/20 text-[#FFD21F] px-4 py-2 text-sm font-semibold hover:bg-[#FFD21F]/20 hover:border-[#FFD21F]/40 hover:-translate-y-0.5 transition-all duration-200",
};

export const forgotPasswordStyles = {
  stepContainer:
    "flex items-center gap-2 mb-7",

  stepItemWrapper:
    "flex items-center gap-2",

  stepCircleBase:
    "w-6 h-6 rounded-full grid place-items-center text-xs font-bold transition-all duration-300 shrink-0",

  stepCircleDone:
    "bg-[#FFD21F] text-black shadow-[0_0_10px_rgba(255,210,31,0.18)]",

  stepCircleActive:
    "bg-[#FFD21F]/20 border border-[#FFD21F] text-[#FFD21F] shadow-[0_0_12px_rgba(255,210,31,0.08)]",

  stepCircleInactive:
    "bg-[#111111] border border-[#292929] text-zinc-600",

  stepLineBase:
    "flex-1 h-px transition-colors duration-300",

  stepLineDone:
    "bg-[#FFD21F]",

  stepLineInactive:
    "bg-[#292929]",

  errorBox:
    "mb-5 flex items-start gap-3 rounded-xl bg-rose-500/10 border border-rose-500/20 px-4 py-3",

  errorIcon:
    "text-rose-400 mt-0.5 shrink-0",

  errorText:
    "text-rose-300 text-sm",

  label:
    "block text-xs font-semibold text-zinc-400 uppercase tracking-wider",

  emailForm:
    "space-y-4",

  emailInputWrapper:
    "space-y-1.5",

  newPasswordForm:
    "space-y-4",

  passwordInputWrapper:
    "space-y-1.5",

  passwordInputWithToggle:
    "relative",

  passwordInput:
    "pr-11",

  toggleButton:
    "absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-[#FFD21F] transition-colors",

  confirmInputValid:
    "border-emerald-600 focus:border-emerald-500 shadow-[0_0_12px_rgba(52,211,153,0.05)]",

  confirmInputInvalid:
    "border-rose-600/60",

  confirmFeedback:
    "absolute right-4 top-1/2 -translate-y-1/2 text-sm",

  confirmFeedbackValid:
    "text-emerald-400",

  confirmFeedbackInvalid:
    "text-rose-400",

  footerLink:
    "mt-7 text-sm text-center text-zinc-500",

  link:
    "font-semibold text-[#FFD21F] hover:text-[#FFE66D] transition-colors",
};

export const loginStyles = {
  notice:
    "mb-5 flex items-start gap-2.5 rounded-xl bg-[#FFD21F]/8 border border-[#FFD21F]/20 px-3.5 py-3 transition-all duration-300",

  error:
    "mb-5 flex items-start gap-2.5 rounded-xl bg-rose-500/8 border border-rose-500/20 px-3.5 py-3",

  noticeIcon:
    "text-[#FFD21F] mt-0.5 shrink-0",

  errorIcon:
    "text-rose-400 mt-0.5 shrink-0",

  noticeText:
    "text-[#FFE66D] text-xs font-medium",

  errorText:
    "text-rose-300 text-xs font-medium",

  form:
    "space-y-4",

  field:
    "space-y-1.5",

  label:
    "block text-[10px] font-bold text-zinc-500 uppercase tracking-widest",

  inputWrapper:
    "relative",

  input:
    "w-full rounded-xl border border-[#292929] bg-[#111111] px-4 py-3 text-white placeholder:text-zinc-600 outline-none transition-all duration-300 focus:border-[#FFD21F]/60 focus:ring-2 focus:ring-[#FFD21F]/12 focus:shadow-[0_0_18px_rgba(255,210,31,0.05)] text-sm",

  inputWithIcon:
    "pr-11",

  icon:
    "absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none transition-colors",

  passwordRow:
    "flex items-center justify-between",

  forgotLink:
    "text-[11px] font-semibold text-[#FFD21F] hover:text-[#FFE66D] transition-colors",

  toggleButton:
    "absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-[#FFD21F] transition-colors",

  submitButton:
    "w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold bg-[#FFD21F] text-black hover:bg-[#FFE66D] hover:shadow-[0_0_25px_rgba(255,210,31,0.2)] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 shadow-lg shadow-[#FFD21F]/25",

  divider:
    "flex items-center gap-3 mt-5 mb-4",

  dividerLine:
    "flex-1 h-px bg-[#292929]",

  dividerText:
    "text-zinc-700 text-[11px]",

  signupLink:
    "flex items-center justify-center w-full rounded-xl border border-[#292929] bg-[#111111] hover:bg-[#1a1a1a] hover:border-[#FFD21F]/25 text-zinc-400 hover:text-white px-4 py-3 text-sm font-semibold transition-all duration-200",
};

export const pollListPageStyles = {
  heading:
    "text-xl font-bold text-white mb-4",

  emptyContainer:
    "bg-[#111111] border border-[#292929] rounded-2xl p-12 text-center transition-all duration-300 hover:border-[#FFD21F]/15",

  emptyIconWrapper:
    "grid place-items-center w-14 h-14 rounded-full bg-[#FFD21F]/15 text-[#FFD21F] mx-auto mb-3 animate-pulse shadow-[0_0_18px_rgba(255,210,31,0.08)]",

  emptyTitle:
    "font-bold text-white",

  emptyText:
    "text-sm text-zinc-500 mt-1",
};

export const signupStyles = {
  errorBox:
    "mb-5 flex items-start gap-3 rounded-xl bg-rose-500/10 border border-rose-500/20 px-4 py-3",

  errorIcon:
    "text-rose-400 mt-0.5 shrink-0",

  errorText:
    "text-rose-300 text-sm",

  form:
    "space-y-4",

  avatarContainer:
    "flex items-center gap-4",

  avatarLabel:
    "relative cursor-pointer group shrink-0",

  avatarCircle:
    "w-14 h-14 rounded-full overflow-hidden bg-[#111111] border-2 border-[#292929] group-hover:border-[#FFD21F] group-hover:shadow-[0_0_15px_rgba(255,210,31,0.12)] transition-all duration-300 grid place-items-center",

  avatarImage:
    "w-full h-full object-cover transition-transform duration-300 group-hover:scale-105",

  avatarPlaceholder:
    "text-zinc-500 group-hover:text-[#FFD21F] transition-colors",

  avatarCamera:
    "absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-[#FFD21F] border-2 border-[#050505] grid place-items-center transition-transform duration-200 group-hover:scale-110",

  avatarCameraIcon:
    "text-black",

  avatarInfo:
    "",

  avatarInfoTitle:
    "text-sm font-semibold text-zinc-300",

  avatarInfoSub:
    "text-xs text-zinc-500 mt-0.5",

  field:
    "space-y-1.5",

  label:
    "block text-xs font-semibold text-zinc-400 uppercase tracking-wider",

  inputWrapper:
    "relative",

  inputWithPrefix:
    "pl-8",

  inputWithSuffix:
    "pr-11",

  prefix:
    "absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-sm font-medium select-none",

  toggleButton:
    "absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-[#FFD21F] transition-colors",

  strengthContainer:
    "flex gap-1 pt-1",

  strengthBarBase:
    "h-0.5 flex-1 rounded-full transition-all duration-300",

  strengthWeak:
    "bg-rose-500",

  strengthMedium:
    "bg-amber-500",

  strengthStrong:
    "bg-[#FFD21F]",

  strengthVeryStrong:
    "bg-[#FFE66D] shadow-[0_0_6px_rgba(255,230,109,0.35)]",

  strengthInactive:
    "bg-[#292929]",

  footerText:
    "mt-6 text-center text-sm text-zinc-500",

  footerLink:
    "font-semibold text-[#FFD21F] hover:text-[#FFE66D] transition-colors",

  terms:
    "mt-4 text-center text-xs text-zinc-600",
};

export const settingsStyles = {
  container:
    "space-y-4",

  heading:
    "text-base font-bold text-zinc-200",

  section:
    "rounded-2xl border border-[#292929] bg-[#111111] p-5 space-y-4 transition-all duration-300 hover:border-[#FFD21F]/15",

  sectionTitle:
    "text-sm font-semibold text-zinc-300",

  label:
    "block text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2",

  pwWrapper:
    "relative",

  pwInput:
    "pr-11",

  pwToggle:
    "absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-[#FFD21F] transition-colors",

  avatarRow:
    "flex items-center gap-4",

  avatarLabel:
    "relative cursor-pointer group",

  avatarWrapper:
    "relative",

  avatarImage:
    "w-14 h-14 rounded-full object-cover ring-2 ring-[#292929] transition-transform duration-300 group-hover:scale-105",

  avatarPlaceholder:
    "w-14 h-14 ring-2 ring-[#292929] transition-transform duration-300 group-hover:scale-105",

  avatarCameraBadge:
    "absolute -bottom-0.5 -right-0.5 grid place-items-center w-5 h-5 rounded-full bg-[#FFD21F] border-2 border-[#111111] text-black transition-transform duration-200 group-hover:scale-110",

  avatarInfo:
    "",

  avatarInfoTitle:
    "text-xs font-semibold text-zinc-400",

  avatarInfoSub:
    "text-[11px] text-zinc-700 mt-0.5",

  fieldRow:
    "grid grid-cols-2 gap-3",

  fieldGroup:
    "",

  disabledInput:
    "opacity-40 cursor-not-allowed",

  disabledHint:
    "text-[11px] text-zinc-700 mt-1",

  bioRow:
    "flex justify-between items-center mb-2",

  bioCharCount:
    "text-[10px] text-zinc-700 tabular-nums",

  bioTextarea:
    "min-h-18 resize-y",

  saveButton:
    "py-2.5",

  passwordForm:
    "space-y-3",
};

export const singlePollPageStyles = {
  backButton:
    "inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-[#FFD21F] transition-colors mb-5",

  errorContainer:
    "bg-[#111111] border border-[#292929] rounded-2xl p-12 text-center text-xs text-zinc-600",
};

export const userProfileStyles = {
  errorContainer:
    "bg-[#111111] border border-[#292929] rounded-2xl p-12 text-center text-xs text-zinc-600",

  profileCard:
    "bg-[#111111] border border-[#292929] rounded-2xl overflow-hidden mb-5 transition-all duration-300 hover:border-[#FFD21F]/15",

  bannerContainer:
    "h-20 bg-[#111111] relative overflow-hidden",

  bannerGlow:
    "absolute -top-12 left-8 w-48 h-32 bg-[#FFD21F]/10 blur-3xl rounded-full pointer-events-none animate-pulse",

  profileBody:
    "px-5 pb-5 -mt-8",

  avatarRow:
    "flex items-end justify-between",

  avatarClass:
    "w-16 h-16 text-lg ring-4 ring-[#111111] transition-transform duration-300 hover:scale-105",

  followButton:
    "py-1.5 text-xs",

  userInfo:
    "mt-3",

  userName:
    "text-base font-bold text-white",

  userUsername:
    "text-xs text-zinc-600 mt-0.5",

  userBio:
    "text-xs text-zinc-500 mt-2 leading-relaxed",

  statsRow:
    "flex gap-5 mt-4 pt-4 border-t border-[#292929]",

  statNumber:
    "text-sm font-bold text-white transition-colors duration-200 hover:text-[#FFD21F]",

  statLabel:
    "text-xs text-zinc-600",

  statClickable:
    "hover:opacity-80 transition-opacity",

  statLabelHighlight:
    "text-[#FFD21F]",

  connectionsWrapper:
    "mt-4 pt-4 border-t border-[#292929]",

  pollsHeading:
    "text-[10px] font-bold text-zinc-700 uppercase tracking-widest mb-4",

  emptyPolls:
    "text-xs text-zinc-700 text-center py-8",
};

export const verifyOtpStyles = {
  footerText:
    "mt-6 text-sm text-center text-zinc-500",

  link:
    "font-semibold text-[#FFD21F] hover:text-[#FFE66D] transition-colors",
};

export const appStyles = {
  root:
    "min-h-screen bg-[#050505] text-zinc-300",

  rootStyle:
    {
      fontFamily: "Inter, sans-serif",
    },

  loadingContainer:
    "min-h-screen grid place-items-center text-[#FFD21F] bg-[#050505]",

  loadingSpinner:
    "animate-spin drop-shadow-[0_0_8px_rgba(255,210,31,0.45)]",
};