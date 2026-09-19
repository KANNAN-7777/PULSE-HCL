import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  Check,
  Loader2,
  Radio,
  Send,
  BarChart3,
  Sparkles,
} from "lucide-react";

import Layout from "../components/Layout";
import api from "../utils/api";

/* ==================================================
   POLL TYPE HELPERS
================================================== */

const normalizePollType = (type) => {
  return String(type || "")
    .trim()
    .toLowerCase()
    .replace(/[-_\s]/g, "");
};

const isOpenPollType = (type) => {
  const normalized =
    normalizePollType(type);

  return (
    normalized === "open" ||
    normalized === "openpoll" ||
    normalized === "openquestion" ||
    normalized === "openended" ||
    normalized === "text"
  );
};

/* ==================================================
   DATE
================================================== */

function formatDate(dateValue) {
  if (!dateValue) {
    return "Recently";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

/* ==================================================
   BACKEND URL
================================================== */

function getBackendUrl() {
  const apiUrl =
    import.meta.env.VITE_API_URL ||
    "http://localhost:8080/api";

  return apiUrl.replace(
    /\/api\/?$/,
    ""
  );
}

/* ==================================================
   IMAGE URL
================================================== */

function getImageUrl(image) {
  if (!image) {
    return "";
  }

  const value = String(image).trim();

  if (!value) {
    return "";
  }

  // Base64 image
  if (
    value.startsWith("data:image/")
  ) {
    return value;
  }

  // Full URL
  if (
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    /*
     * Convert old localhost URLs to
     * the current backend URL.
     */
    if (
      value.startsWith(
        "http://localhost:8080"
      )
    ) {
      return `${getBackendUrl()}${value.replace(
        "http://localhost:8080",
        ""
      )}`;
    }

    return value;
  }

  // Relative backend path
  return `${getBackendUrl()}${
    value.startsWith("/") ? "" : "/"
  }${value}`;
}

/* ==================================================
   TOTAL VOTES
================================================== */

function getTotalVotes(poll) {
  if (
    !poll?.options ||
    !Array.isArray(poll.options)
  ) {
    return 0;
  }

  return poll.options.reduce(
    (total, option) =>
      total +
      Number(option?.votes || 0),
    0
  );
}

/* ==================================================
   NORMALIZE POLL
================================================== */

function normalizePoll(responseData) {
  const pollData =
    responseData?.poll ||
    responseData?.data ||
    responseData;

  if (
    !pollData ||
    typeof pollData !== "object"
  ) {
    return null;
  }

  return {
    ...pollData,

    options: Array.isArray(
      pollData.options
    )
      ? pollData.options.map(
          (option) => ({
            ...option,
            votes: Number(
              option?.votes || 0
            ),
          })
        )
      : [],
  };
}

/* ==================================================
   SERVER VOTE STATUS
================================================== */

function getServerVoteStatus(
  responseData
) {
  const pollData =
    responseData?.poll ||
    responseData?.data ||
    responseData;

  return (
    responseData?.has_voted === true ||
    responseData?.hasVoted === true ||
    pollData?.has_voted === true ||
    pollData?.hasVoted === true
  );
}

/* ==================================================
   SINGLE POLL PAGE
================================================== */

export default function SinglePollPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const voteInProgressRef =
    useRef(false);

  const [poll, setPoll] =
    useState(null);

  const [totalResponses, setTotalResponses] =
    useState(0);

  const [selectedOption, setSelectedOption] =
    useState("");

  const [openAnswer, setOpenAnswer] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [voting, setVoting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [hasVoted, setHasVoted] =
    useState(false);

  /* ==================================================
     LOAD POLL
  ================================================== */

  useEffect(() => {
    let active = true;

    const loadPoll = async () => {
      if (!id) {
        return;
      }

      setLoading(true);
      setPoll(null);
      setSelectedOption("");
      setOpenAnswer("");
      setError("");
      setSuccess("");
      setHasVoted(false);
      setTotalResponses(0);

      try {
        const response =
          await api.get(
            `/polls/${id}`,
            {
              params: {
                refresh: Date.now(),
              },
            }
          );

        if (!active) {
          return;
        }

        const pollData =
          normalizePoll(
            response.data
          );

        if (!pollData) {
          throw new Error(
            "Invalid poll response"
          );
        }

        setPoll(pollData);

        const open =
          isOpenPollType(
            pollData.type
          );

        const serverTotal =
          Number(
            response.data
              ?.total_responses ??
              response.data
                ?.total_votes ??
              0
          );

        if (open) {
          setHasVoted(false);

          setTotalResponses(
            serverTotal
          );
        } else {
          setHasVoted(
            getServerVoteStatus(
              response.data
            )
          );

          setTotalResponses(
            serverTotal ||
              getTotalVotes(
                pollData
              )
          );
        }
      } catch (err) {
        if (!active) {
          return;
        }

        console.error(
          "LOAD POLL ERROR:",
          err
        );

        setError(
          err.response?.data
            ?.message ||
            "Unable to load this poll."
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadPoll();

    return () => {
      active = false;
    };
  }, [id]);

  /* ==================================================
     HANDLE VOTE
  ================================================== */

  const handleVote = async () => {
    if (!poll) {
      return;
    }

    const open =
      isOpenPollType(
        poll.type
      );

    if (!open && hasVoted) {
      setSuccess(
        "You have already voted in this poll."
      );

      setError("");

      return;
    }

    if (voteInProgressRef.current) {
      return;
    }

    /* VALIDATION */

    if (open) {
      if (!openAnswer.trim()) {
        setError(
          "Please enter your response."
        );

        setSuccess("");

        return;
      }
    } else {
      if (!selectedOption) {
        setError(
          "Please select an option."
        );

        setSuccess("");

        return;
      }
    }

    voteInProgressRef.current =
      true;

    setVoting(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        option_id: open
          ? ""
          : String(selectedOption),
      };

      if (open) {
        payload.answer =
          openAnswer.trim();
      }

      /* SAVE VOTE */

      const voteResponse =
        await api.post(
          `/polls/${id}/vote`,
          payload
        );

      console.log(
        "VOTE RESPONSE:",
        voteResponse.data
      );

      /* OPEN POLL COUNT */

      if (open) {
        const serverCount =
          Number(
            voteResponse.data
              ?.total_responses ??
              voteResponse.data
                ?.total_votes ??
              0
          );

        if (
          Number.isFinite(
            serverCount
          ) &&
          serverCount >= 0
        ) {
          setTotalResponses(
            serverCount
          );
        }
      }

      /* REFRESH FROM MONGODB */

      try {
        const refreshedResponse =
          await api.get(
            `/polls/${id}`,
            {
              params: {
                refresh: Date.now(),
              },
            }
          );

        const refreshedPoll =
          normalizePoll(
            refreshedResponse.data
          );

        if (refreshedPoll) {
          setPoll(
            refreshedPoll
          );

          if (!open) {
            setTotalResponses(
              getTotalVotes(
                refreshedPoll
              )
            );
          }
        }

        const refreshedCount =
          Number(
            refreshedResponse.data
              ?.total_responses ??
              refreshedResponse.data
                ?.total_votes ??
              0
          );

        if (
          Number.isFinite(
            refreshedCount
          ) &&
          refreshedCount >= 0
        ) {
          setTotalResponses(
            refreshedCount
          );
        }
      } catch (
        refreshError
      ) {
        console.error(
          "POLL REFRESH ERROR:",
          refreshError
        );
      }

      /* OPEN POLL */

      if (open) {
        setHasVoted(false);
        setSelectedOption("");
        setOpenAnswer("");

        setSuccess(
          "Response recorded. You can submit another response."
        );

        setError("");

        return;
      }

      /* NORMAL POLL */

      setHasVoted(true);
      setSelectedOption("");
      setOpenAnswer("");

      setSuccess(
        "Your vote has been recorded successfully."
      );

      setError("");
    } catch (err) {
      console.error(
        "VOTE ERROR:",
        err
      );

      if (
        err.response?.status === 409
      ) {
        if (open) {
          setHasVoted(false);

          setError(
            "The backend is still preventing multiple responses for this open poll."
          );

          setSuccess("");

          return;
        }

        setHasVoted(true);
        setSelectedOption("");
        setOpenAnswer("");

        setSuccess(
          "You have already voted in this poll."
        );

        setError("");

        return;
      }

      if (
        err.response?.status === 401
      ) {
        setError(
          "Your session has expired. Please login again."
        );

        setSuccess("");

        return;
      }

      setError(
        err.response?.data
          ?.message ||
          "Unable to record your response."
      );

      setSuccess("");
    } finally {
      setVoting(false);

      voteInProgressRef.current =
        false;
    }
  };

  /* ==================================================
     COUNTS
  ================================================== */

  const isOpenPoll =
    isOpenPollType(
      poll?.type
    );

  const totalVotes =
    isOpenPoll
      ? totalResponses
      : getTotalVotes(poll);

  const showResults =
    hasVoted &&
    !isOpenPoll;

  /* ==================================================
     LOADING
  ================================================== */

  if (loading) {
    return (
      <Layout>
        <div className="relative flex min-h-[65vh] items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,210,31,0.10),transparent_38%)]" />

          <div className="relative flex flex-col items-center gap-4">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-[#FFD21F]/25 bg-[#FFD21F]/10">
              <Loader2
                size={28}
                className="relative animate-spin text-[#FFD21F]"
              />
            </div>

            <div className="text-center">
              <p className="text-sm font-bold text-white">
                Loading poll
              </p>

              <p className="mt-1 text-xs text-[#9CA3AF]">
                Fetching the latest poll data...
              </p>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  /* ==================================================
     LOAD ERROR
  ================================================== */

  if (error && !poll) {
    return (
      <Layout>
        <div className="mx-auto max-w-2xl px-4 py-6">
          <button
            type="button"
            onClick={() =>
              navigate(-1)
            }
            className="group flex items-center gap-2 text-sm font-medium text-[#9CA3AF] transition hover:text-[#FFD21F]"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <div className="mt-5 overflow-hidden rounded-3xl border border-red-500/20 bg-[#111111]">
            <div className="h-1 bg-red-500/70" />

            <div className="p-6">
              <p className="text-sm font-bold text-red-400">
                Unable to load poll
              </p>

              <p className="mt-2 text-sm leading-6 text-[#9CA3AF]">
                {error}
              </p>

              <button
                type="button"
                onClick={() =>
                  window.location.reload()
                }
                className="mt-5 rounded-xl bg-[#FFD21F] px-5 py-3 text-xs font-bold text-black"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!poll) {
    return (
      <Layout>
        <div className="mx-auto max-w-2xl px-4 py-6">
          <div className="rounded-3xl border border-[#292929] bg-[#111111] p-10 text-center">
            <BarChart3 className="mx-auto h-6 w-6 text-[#FFD21F]" />

            <p className="mt-4 text-sm text-[#9CA3AF]">
              Poll not found.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  /* ==================================================
     POLL TYPE
  ================================================== */

  const pollType =
    normalizePollType(
      poll.type
    );

  /* ==================================================
     PAGE
  ================================================== */

  return (
    <Layout>
      <div className="relative mx-auto max-w-3xl overflow-hidden px-4 py-6 pb-8">

        {/* BACK */}

        <button
          type="button"
          onClick={() =>
            navigate(-1)
          }
          className="group flex items-center gap-2 text-sm font-medium text-[#9CA3AF] transition hover:text-[#FFD21F]"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* POLL CARD */}

        <div className="mt-5 overflow-hidden rounded-3xl border border-[#292929] bg-[#111111] shadow-[0_25px_70px_rgba(0,0,0,0.35)]">

          <div className="h-1 bg-gradient-to-r from-[#FFD21F] via-[#FFE66D] to-[#FFD21F]" />

          <div className="p-5 sm:p-7">

            {/* HEADER */}

            <div className="flex items-start gap-4">
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-green-500/20 bg-green-500/10">
                <Radio
                  size={19}
                  className="text-green-400"
                />
              </div>

              <div className="min-w-0 flex-1">

                <div className="mb-3 flex flex-wrap items-center gap-2">

                  <span className="inline-flex items-center gap-1.5 rounded-full border border-green-500/20 bg-green-500/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-green-400">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-green-400" />
                    LIVE
                  </span>

                  {poll.category && (
                    <span className="rounded-full border border-[#292929] bg-[#090909] px-3 py-1.5 text-[9px] font-bold uppercase tracking-wider text-[#9CA3AF]">
                      {poll.category}
                    </span>
                  )}

                  {isOpenPoll && (
                    <span className="rounded-full border border-[#FFD21F]/20 bg-[#FFD21F]/10 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-[#FFD21F]">
                      Open Response
                    </span>
                  )}

                </div>

                <h1 className="text-xl font-black leading-8 tracking-tight text-white sm:text-2xl">
                  {poll.question}
                </h1>

                <div className="mt-3 flex flex-wrap gap-4 text-[10px] font-semibold text-[#6B7280]">
                  <span>
                    {formatDate(
                      poll.created_at ||
                        poll.createdAt
                    )}
                  </span>

                  <span>
                    {totalVotes}{" "}
                    {isOpenPoll
                      ? "responses"
                      : "votes"}
                  </span>
                </div>

              </div>
            </div>

            {/* ERROR */}

            {error && (
              <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs leading-5 text-red-400">
                {error}
              </div>
            )}

            {/* SUCCESS */}

            {success && (
              <div className="mt-5 flex items-start gap-3 rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-xs leading-5 text-green-400">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500/10">
                  <Check size={14} />
                </div>

                <span>
                  {success}
                </span>
              </div>
            )}

            {/* RESULTS */}

            {showResults ? (
              <div className="mt-6">
                <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-6 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-green-500/20 bg-green-500/10 text-green-400">
                    <Check size={23} />
                  </div>

                  <h2 className="mt-4 text-sm font-black text-white">
                    Vote Submitted
                  </h2>

                  <p className="mt-1 text-xs text-[#9CA3AF]">
                    Your response has been recorded.
                  </p>

                  <div className="mt-5 rounded-xl border border-[#292929] bg-[#090909] px-4 py-3">
                    <p className="text-[10px] uppercase tracking-wider text-[#6B7280]">
                      Total Votes
                    </p>

                    <p className="mt-1 text-2xl font-black text-[#FFD21F]">
                      {totalVotes}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/analytics/${poll.id}`
                    )
                  }
                  className="group mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#292929] bg-[#090909] px-4 py-3 text-xs font-bold text-[#9CA3AF] transition hover:border-[#FFD21F]/40 hover:text-[#FFD21F]"
                >
                  <BarChart3 size={15} />
                  View Results
                </button>
              </div>
            ) : (
              <div className="mt-6">

                {/* SINGLE CHOICE */}

                {pollType === "single" && (
                  <div className="space-y-3">
                    {poll.options?.map(
                      (
                        option,
                        index
                      ) => {
                        const optionId =
                          String(
                            option.id ??
                              option._id ??
                              ""
                          );

                        const selected =
                          selectedOption ===
                          optionId;

                        return (
                          <button
                            key={
                              option.id ||
                              option._id ||
                              index
                            }
                            type="button"
                            onClick={() =>
                              setSelectedOption(
                                optionId
                              )
                            }
                            className={`group flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition ${
                              selected
                                ? "border-[#FFD21F]/60 bg-[#FFD21F]/10"
                                : "border-[#292929] bg-[#090909] hover:border-[#FFD21F]/25"
                            }`}
                          >
                            <div
                              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                                selected
                                  ? "border-[#FFD21F] bg-[#FFD21F]"
                                  : "border-[#4B4B4B]"
                              }`}
                            >
                              {selected && (
                                <div className="h-2 w-2 rounded-full bg-black" />
                              )}
                            </div>

                            <span
                              className={`text-sm font-semibold ${
                                selected
                                  ? "text-[#FFD21F]"
                                  : "text-[#D1D5DB]"
                              }`}
                            >
                              {option.text}
                            </span>
                          </button>
                        );
                      }
                    )}
                  </div>
                )}

                {/* YES / NO */}

                {pollType === "yesno" && (
                  <div className="grid grid-cols-2 gap-3">
                    {poll.options?.map(
                      (
                        option,
                        index
                      ) => {
                        const optionId =
                          String(
                            option.id ??
                              option._id ??
                              ""
                          );

                        const selected =
                          selectedOption ===
                          optionId;

                        return (
                          <button
                            key={
                              option.id ||
                              option._id ||
                              index
                            }
                            type="button"
                            onClick={() =>
                              setSelectedOption(
                                optionId
                              )
                            }
                            className={`rounded-2xl border p-5 text-center transition ${
                              selected
                                ? "border-[#FFD21F]/60 bg-[#FFD21F]/10 text-[#FFD21F]"
                                : "border-[#292929] bg-[#090909] text-[#9CA3AF]"
                            }`}
                          >
                            <span className="text-sm font-black">
                              {option.text}
                            </span>
                          </button>
                        );
                      }
                    )}
                  </div>
                )}

                {/* RATING */}

                {pollType === "rating" && (
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5 text-[#FFD21F]" />

                      <p className="text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
                        Select your rating
                      </p>
                    </div>

                    <div className="grid grid-cols-5 gap-2">
                      {poll.options?.map(
                        (
                          option,
                          index
                        ) => {
                          const optionId =
                            String(
                              option.id ??
                                option._id ??
                                ""
                            );

                          const selected =
                            selectedOption ===
                            optionId;

                          return (
                            <button
                              key={
                                option.id ||
                                option._id ||
                                index
                              }
                              type="button"
                              onClick={() =>
                                setSelectedOption(
                                  optionId
                                )
                              }
                              className={`flex h-12 items-center justify-center rounded-xl border text-sm font-black ${
                                selected
                                  ? "border-[#FFD21F]/60 bg-[#FFD21F]/10 text-[#FFD21F]"
                                  : "border-[#292929] bg-[#090909] text-[#9CA3AF]"
                              }`}
                            >
                              {option.text}
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>
                )}

                {/* IMAGE POLL */}

                {pollType === "image" && (
                  <div>
                    <p className="mb-3 text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
                      Choose an image
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      {poll.options?.map(
                        (
                          option,
                          index
                        ) => {
                          const optionId =
                            String(
                              option.id ??
                                option._id ??
                                ""
                            );

                          const selected =
                            selectedOption ===
                            optionId;

                          const rawImageUrl =
                            option.image ||
                            option.image_url ||
                            option.imageUrl ||
                            option.url ||
                            option.src ||
                            "";

                          const imageUrl =
                            getImageUrl(
                              rawImageUrl
                            );

                          return (
                            <button
                              key={
                                option.id ||
                                option._id ||
                                index
                              }
                              type="button"
                              onClick={() =>
                                setSelectedOption(
                                  optionId
                                )
                              }
                              className={`group relative overflow-hidden rounded-2xl border transition ${
                                selected
                                  ? "border-[#FFD21F] ring-1 ring-[#FFD21F]/50"
                                  : "border-[#292929] hover:border-[#FFD21F]/30"
                              }`}
                            >
                              {imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt={
                                    option.text ||
                                    `Option ${
                                      index + 1
                                    }`
                                  }
                                  className="aspect-square w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                                  onLoad={() => {
                                    console.log(
                                      "POLL IMAGE LOADED:",
                                      imageUrl
                                    );
                                  }}
                                  onError={(
                                    event
                                  ) => {
                                    console.error(
                                      "POLL IMAGE FAILED:",
                                      imageUrl
                                    );

                                    event.currentTarget.style.display =
                                      "none";

                                    const parent =
                                      event
                                        .currentTarget
                                        .parentElement;

                                    if (
                                      parent &&
                                      !parent.querySelector(
                                        ".image-error-fallback"
                                      )
                                    ) {
                                      const fallback =
                                        document.createElement(
                                          "div"
                                        );

                                      fallback.className =
                                        "image-error-fallback flex aspect-square items-center justify-center bg-[#090909] px-4 text-center text-xs text-[#6B7280]";

                                      fallback.textContent =
                                        "Image unavailable";

                                      parent.insertBefore(
                                        fallback,
                                        event
                                          .currentTarget
                                          .nextSibling
                                      );
                                    }
                                  }}
                                />
                              ) : (
                                <div className="flex aspect-square items-center justify-center bg-[#090909] px-4 text-center text-xs text-[#6B7280]">
                                  Image unavailable
                                </div>
                              )}

                              {selected && (
                                <div className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#FFD21F] text-black shadow-lg">
                                  <Check
                                    size={15}
                                  />
                                </div>
                              )}

                              {option.text && (
                                <div className="bg-[#090909] px-3 py-2.5 text-left text-xs font-semibold text-[#D1D5DB]">
                                  {option.text}
                                </div>
                              )}
                            </button>
                          );
                        }
                      )}
                    </div>
                  </div>
                )}

                {/* OPEN RESPONSE */}

                {isOpenPoll && (
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-[#9CA3AF]">
                      Your Answer
                    </label>

                    <textarea
                      value={openAnswer}
                      onChange={(event) =>
                        setOpenAnswer(
                          event.target.value
                        )
                      }
                      maxLength={2000}
                      rows={5}
                      placeholder="Type your answer..."
                      className="w-full resize-none rounded-2xl border border-[#292929] bg-[#090909] p-4 text-sm leading-6 text-white outline-none placeholder:text-[#4B4B4B] focus:border-[#FFD21F]/60"
                    />

                    <div className="mt-2 text-right text-[10px] text-[#4B4B4B]">
                      {openAnswer.length}/2000
                    </div>
                  </div>
                )}

                {/* FALLBACK OPTIONS */}

                {![
                  "single",
                  "yesno",
                  "rating",
                  "image",
                  "open",
                ].includes(
                  pollType
                ) && (
                  <div className="space-y-3">
                    {poll.options?.map(
                      (
                        option,
                        index
                      ) => {
                        const optionId =
                          String(
                            option.id ??
                              option._id ??
                              ""
                          );

                        const selected =
                          selectedOption ===
                          optionId;

                        return (
                          <button
                            key={
                              option.id ||
                              option._id ||
                              index
                            }
                            type="button"
                            onClick={() =>
                              setSelectedOption(
                                optionId
                              )
                            }
                            className={`w-full rounded-2xl border p-4 text-left text-sm font-semibold ${
                              selected
                                ? "border-[#FFD21F]/60 bg-[#FFD21F]/10 text-[#FFD21F]"
                                : "border-[#292929] bg-[#090909] text-[#9CA3AF]"
                            }`}
                          >
                            {option.text}
                          </button>
                        );
                      }
                    )}
                  </div>
                )}

                {/* SUBMIT */}

                <button
                  type="button"
                  onClick={
                    handleVote
                  }
                  disabled={voting}
                  className="group mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FFD21F] px-4 py-3.5 text-sm font-black text-black transition hover:-translate-y-0.5 hover:bg-[#FFE66D] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {voting ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send size={17} />

                      {isOpenPoll
                        ? "Submit Response"
                        : "Submit Vote"}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* FOOTER */}

        <div className="mt-4 rounded-2xl border border-[#292929] bg-[#111111]/70 px-4 py-3 text-center">
          <p className="text-[10px] leading-5 text-[#6B7280]">
            {isOpenPoll
              ? "You can submit multiple responses to this open poll."
              : "Your response is recorded in PULSE and the results can update in real time."}
          </p>
        </div>
      </div>
    </Layout>
  );
}