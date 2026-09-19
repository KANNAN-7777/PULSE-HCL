import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

function formatDate(dateValue) {
  if (!dateValue) {
    return "Recently";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getTotalVotes(poll) {
  if (!poll?.options || !Array.isArray(poll.options)) {
    return 0;
  }

  return poll.options.reduce(
    (total, option) =>
      total + Number(option?.votes || 0),
    0
  );
}

function normalizePoll(responseData) {
  const pollData =
    responseData?.poll ||
    responseData?.data ||
    responseData;

  if (!pollData || typeof pollData !== "object") {
    return null;
  }

  return {
    ...pollData,
    options: Array.isArray(pollData.options)
      ? pollData.options.map((option) => ({
          ...option,
          votes: Number(option?.votes || 0),
        }))
      : [],
  };
}

/*
 * Get the current logged-in user's ID.
 *
 * This makes the local vote marker specific to the
 * current user, so another user on the same browser
 * will not inherit the previous user's vote state.
 */
function getCurrentUserId() {
  try {
    const user = JSON.parse(
      localStorage.getItem("user") || "null"
    );

    return (
      user?.id ||
      user?._id ||
      user?.user_id ||
      user?.userId ||
      "current-user"
    );
  } catch {
    return "current-user";
  }
}

/*
 * One unique key for:
 *
 *   current user + current poll
 *
 * Example:
 *
 * pulse:voted:USER_ID:POLL_ID
 */
function getVoteStorageKey(pollId) {
  const userId = getCurrentUserId();

  return `pulse:voted:${String(
    userId
  )}:${String(pollId)}`;
}

function hasLocalVote(pollId) {
  try {
    return (
      localStorage.getItem(
        getVoteStorageKey(pollId)
      ) === "true"
    );
  } catch {
    return false;
  }
}

function saveLocalVote(pollId) {
  try {
    localStorage.setItem(
      getVoteStorageKey(pollId),
      "true"
    );
  } catch {
    // Ignore localStorage errors.
  }
}

function getServerVoteStatus(responseData) {
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

function mergePollData(
  currentPoll,
  incomingPoll
) {
  if (!incomingPoll) {
    return currentPoll;
  }

  if (!currentPoll) {
    return incomingPoll;
  }

  /*
   * Never allow a stale GET response to reduce
   * a vote count that is already visible locally.
   */
  const mergedOptions = (
    incomingPoll.options || []
  ).map((incomingOption) => {
    const currentOption =
      (
        currentPoll.options || []
      ).find(
        (option) =>
          String(option.id) ===
          String(incomingOption.id)
      );

    if (!currentOption) {
      return incomingOption;
    }

    const currentVotes = Number(
      currentOption.votes || 0
    );

    const incomingVotes = Number(
      incomingOption.votes || 0
    );

    if (currentVotes > incomingVotes) {
      return {
        ...incomingOption,
        votes: currentVotes,
      };
    }

    return incomingOption;
  });

  return {
    ...incomingPoll,
    options: mergedOptions,
  };
}

export default function SinglePollPage() {
  const voteInProgressRef = useRef(false);
  const { id } = useParams();
  const navigate = useNavigate();

  const [poll, setPoll] = useState(null);

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

  /*
   * --------------------------------------------------
   * LOAD POLL
   * --------------------------------------------------
   *
   * Important logic:
   *
   * 1. Check local vote state first.
   * 2. Ask backend for latest poll.
   * 3. If backend says TRUE -> TRUE.
   * 4. If backend says FALSE but local says TRUE
   *    -> KEEP TRUE.
   *
   * This prevents stale GET data from changing:
   *
   *     true -> false
   */
  const loadPoll = async () => {
    const localVote = hasLocalVote(id);

    /*
     * Restore successful vote immediately.
     */
    if (localVote) {
      setHasVoted(true);
    }

    try {
      setError("");

      const response = await api.get(
        `/polls/${id}`,
        {
          params: {
            refresh: Date.now(),
          },
        }
      );

      const pollData = normalizePoll(
        response.data
      );

      if (!pollData) {
        throw new Error(
          "Invalid poll response"
        );
      }

      /*
       * Keep the newest visible vote count.
       */
      setPoll((currentPoll) =>
        mergePollData(
          currentPoll,
          pollData
        )
      );

      const serverVote =
        getServerVoteStatus(
          response.data
        );

      /*
       * Backend says user voted.
       *
       * Save locally as well.
       */
      if (serverVote) {
        saveLocalVote(id);
        setHasVoted(true);
      } else if (localVote) {
        /*
         * Backend returned stale false.
         *
         * DO NOT reset the successful local state.
         */
        setHasVoted(true);
      }
    } catch (err) {
      console.error(
        "LOAD POLL ERROR:",
        err
      );

      /*
       * If local vote exists, keep the page
       * in voted state even if GET fails.
       */
      if (localVote) {
        setHasVoted(true);
      } else {
        setError(
          err.response?.data?.message ||
            "Unable to load this poll."
        );
      }
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  let active = true;

  const load = async () => {
    if (!id) {
      return;
    }

    setLoading(true);
    setPoll(null);
    setSelectedOption("");
    setOpenAnswer("");
    setError("");
    setSuccess("");

    const localVote = hasLocalVote(id);

    if (localVote) {
      setHasVoted(true);
    } else {
      setHasVoted(false);
    }

    try {
      const response = await api.get(
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

      const pollData = normalizePoll(
        response.data
      );

      if (!pollData) {
        throw new Error(
          "Invalid poll response"
        );
      }

      setPoll(pollData);

      const serverVote =
        getServerVoteStatus(
          response.data
        );

      if (serverVote || localVote) {
        if (serverVote) {
          saveLocalVote(id);
        }

        setHasVoted(true);
      }
    } catch (err) {
      if (!active) {
        return;
      }

      console.error(
        "LOAD POLL ERROR:",
        err
      );

      if (localVote) {
        setHasVoted(true);
      } else {
        setError(
          err.response?.data?.message ||
            "Unable to load this poll."
        );
      }
    } finally {
      if (active) {
        setLoading(false);
      }
    }
  };

  load();

  return () => {
    active = false;
  };
}, [id]);

  /*
   * --------------------------------------------------
   * HANDLE VOTE
   * --------------------------------------------------
   */
const handleVote = async () => {
  if (!poll) {
    return;
  }

  if (hasVoted) {
    return;
  }

  if (voteInProgressRef.current) {
    return;
  }

  const pollType = String(
    poll.type || ""
  ).toLowerCase();

  if (pollType === "open") {
    if (!openAnswer.trim()) {
      setError("Please enter your response.");
      setSuccess("");
      return;
    }
  } else {
    if (!selectedOption) {
      setError("Please select an option.");
      setSuccess("");
      return;
    }
  }

  voteInProgressRef.current = true;
  setVoting(true);
  setError("");
  setSuccess("");

  const votedOptionId = selectedOption;

  try {
    const payload = {
      option_id:
        pollType === "open"
          ? ""
          : String(votedOptionId),
    };

    if (pollType === "open") {
      payload.answer = openAnswer.trim();
    }

    console.log("=================================");
    console.log("SUBMITTING VOTE");
    console.log("Poll ID:", id);
    console.log("Poll Type:", pollType);
    console.log("Payload:", payload);
    console.log("=================================");

    /*
     * -----------------------------------------
     * STEP 1: SAVE VOTE TO BACKEND
     * -----------------------------------------
     */
    let voteResponse;

    try {
      voteResponse = await api.post(
        `/polls/${id}/vote`,
        payload
      );
    } catch (voteError) {
      console.error(
        "VOTE POST ERROR:",
        voteError
      );

      console.error(
        "STATUS:",
        voteError.response?.status
      );

      console.error(
        "DATA:",
        voteError.response?.data
      );

      /*
       * User already voted.
       */
      if (
        voteError.response?.status === 409
      ) {
        saveLocalVote(id);

        setHasVoted(true);
        setSelectedOption("");
        setOpenAnswer("");

        setError("");

        setSuccess(
          "You have already voted in this poll."
        );

        return;
      }

      /*
       * Authentication problem.
       */
      if (
        voteError.response?.status === 401
      ) {
        setError(
          "Your session has expired. Please login again."
        );

        return;
      }

      /*
       * Bad request.
       */
      if (
        voteError.response?.status === 400
      ) {
        setError(
          voteError.response?.data?.message ||
            "Please select a valid option."
        );

        return;
      }

      /*
       * Server error.
       */
      setError(
        voteError.response?.data?.message ||
          "Unable to record your vote."
      );

      return;
    }

    console.log(
      "VOTE SUCCESS:",
      voteResponse?.data
    );

    /*
     * -----------------------------------------
     * STEP 2: POST SUCCESS
     * -----------------------------------------
     *
     * From this point onward the vote has
     * successfully reached the backend.
     */
    saveLocalVote(id);

    setHasVoted(true);

    setSelectedOption("");
    setOpenAnswer("");

    setSuccess(
      "Your response has been recorded successfully."
    );

    setError("");

    /*
     * -----------------------------------------
     * STEP 3: UPDATE LOCAL COUNT IMMEDIATELY
     * -----------------------------------------
     */
    if (
      pollType !== "open" &&
      votedOptionId
    ) {
      setPoll((currentPoll) => {
        if (!currentPoll) {
          return currentPoll;
        }

        return {
          ...currentPoll,

          options: (
            currentPoll.options || []
          ).map((option) => {
            if (
              String(
                option.id ??
                  option._id ??
                  ""
              ) ===
              String(votedOptionId)
            ) {
              return {
                ...option,
                votes:
                  Number(
                    option.votes || 0
                  ) + 1,
              };
            }

            return option;
          }),
        };
      });
    }

    /*
     * -----------------------------------------
     * STEP 4: REFRESH FROM BACKEND
     * -----------------------------------------
     *
     * This is intentionally separate from
     * the POST error handling.
     *
     * If this GET fails, the vote is still
     * considered successful.
     */
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
        setPoll((currentPoll) =>
          mergePollData(
            currentPoll,
            refreshedPoll
          )
        );
      }

      /*
       * Never turn true back into false.
       */
      if (
        getServerVoteStatus(
          refreshedResponse.data
        )
      ) {
        saveLocalVote(id);
      }

      setHasVoted(true);
    } catch (refreshError) {
      console.error(
        "REFRESH AFTER VOTE FAILED:",
        refreshError
      );

      /*
       * POST already succeeded.
       *
       * Therefore the user MUST remain in
       * voted state.
       */
      saveLocalVote(id);
      setHasVoted(true);
    }
  } finally {
    setVoting(false);

    /*
     * Release the synchronous duplicate-click
     * lock only after everything is finished.
     */
    voteInProgressRef.current = false;
  }
};

  const totalVotes =
    getTotalVotes(poll);

  /*
   * --------------------------------------------------
   * LOADING
   * --------------------------------------------------
   */
  if (loading) {
    return (
      <Layout>
        <div className="relative flex min-h-[65vh] items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,210,31,0.10),transparent_38%)]" />

          <div className="absolute left-[15%] top-[20%] h-32 w-32 animate-pulse rounded-full bg-[#FFD21F]/5 blur-3xl" />

          <div className="absolute bottom-[15%] right-[15%] h-40 w-40 animate-pulse rounded-full bg-[#4090F0]/5 blur-3xl" />

          <div className="relative flex flex-col items-center gap-4">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-[#FFD21F]/25 bg-[#FFD21F]/10">
              <div className="absolute inset-0 animate-ping rounded-2xl bg-[#FFD21F]/5" />

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

  /*
   * --------------------------------------------------
   * LOAD ERROR
   * --------------------------------------------------
   */
  if (error && !poll) {
    return (
      <Layout>
        <div className="mx-auto max-w-2xl px-4 py-6">
          <button
            type="button"
            onClick={() =>
              navigate(-1)
            }
            className="group flex items-center gap-2 text-sm font-medium text-[#9CA3AF] transition hover:-translate-x-0.5 hover:text-[#FFD21F]"
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
                onClick={loadPoll}
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

  /*
   * --------------------------------------------------
   * NO POLL
   * --------------------------------------------------
   */
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

  /*
   * --------------------------------------------------
   * PAGE
   * --------------------------------------------------
   */
  return (
    <Layout>
      <div className="relative mx-auto max-w-3xl overflow-hidden px-4 py-6 pb-8">
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

        <div className="mt-5 overflow-hidden rounded-3xl border border-[#292929] bg-[#111111] shadow-[0_25px_70px_rgba(0,0,0,0.35)]">
          <div className="h-1 bg-gradient-to-r from-[#FFD21F] via-[#FFE66D] to-[#FFD21F]" />

          <div className="p-5 sm:p-7">
            <div className="flex items-start gap-4">
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-green-500/20 bg-green-500/10">
                <Radio
                  size={19}
                  className="relative text-green-400"
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
                    {totalVotes} votes
                  </span>
                </div>
              </div>
            </div>

            {error && (
              <div className="mt-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs leading-5 text-red-400">
                {error}
              </div>
            )}

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

            {hasVoted ? (
              /*
               * ----------------------------------------
               * VOTED STATE
               * ----------------------------------------
               */
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
              /*
               * ----------------------------------------
               * VOTE FORM
               * ----------------------------------------
               */
              <div className="mt-6">
                {poll.type === "single" && (
                  <div className="space-y-3">
                    {poll.options?.map(
                      (
                        option,
                        index
                      ) => {
                       const selected =
  selectedOption ===
  String(
    option.id ??
      option._id ??
      ""
  );

                        return (
                          <button
                            key={
                              option.id ||
                              index
                            }
                            type="button"
                            onClick={() =>
                              setSelectedOption(
                                option.id
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

                {poll.type === "yesno" && (
                  <div className="grid grid-cols-2 gap-3">
                    {poll.options?.map(
                      (
                        option,
                        index
                      ) => {
                        const selected =
                          selectedOption ===
                          option.id;

                        return (
                          <button
                            key={
                              option.id ||
                              index
                            }
                            type="button"
                            onClick={() =>
                              setSelectedOption(
                                option.id
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

                {poll.type === "rating" && (
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
                          const selected =
                            selectedOption ===
                            option.id;

                          return (
                            <button
                              key={
                                option.id ||
                                index
                              }
                              type="button"
                              onClick={() =>
                                setSelectedOption(
                                  option.id
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

                {poll.type === "image" && (
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
                          const selected =
                            selectedOption ===
                            option.id;

                          const imageUrl =
                            option.image ||
                            option.image_url ||
                            option.url;

                          return (
                            <button
                              key={
                                option.id ||
                                index
                              }
                              type="button"
                              onClick={() =>
                                setSelectedOption(
                                  option.id
                                )
                              }
                              className={`group relative overflow-hidden rounded-2xl border ${
                                selected
                                  ? "border-[#FFD21F] ring-1 ring-[#FFD21F]/50"
                                  : "border-[#292929]"
                              }`}
                            >
                              {imageUrl ? (
                                <img
                                  src={imageUrl}
                                  alt={
                                    option.text ||
                                    `Option ${
                                      index +
                                      1
                                    }`
                                  }
                                  className="aspect-square w-full object-cover"
                                />
                              ) : (
                                <div className="flex aspect-square items-center justify-center bg-[#090909] text-xs text-[#6B7280]">
                                  Image unavailable
                                </div>
                              )}

                              {selected && (
                                <div className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#FFD21F] text-black">
                                  <Check size={15} />
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

                {poll.type === "open" && (
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
                      rows={5}
                      placeholder="Type your answer..."
                      className="w-full resize-none rounded-2xl border border-[#292929] bg-[#090909] p-4 text-sm leading-6 text-white outline-none placeholder:text-[#4B4B4B] focus:border-[#FFD21F]/60"
                    />
                  </div>
                )}

                {![
                  "single",
                  "yesno",
                  "rating",
                  "image",
                  "open",
                ].includes(poll.type) && (
                  <div className="space-y-3">
                    {poll.options?.map(
                      (
                        option,
                        index
                      ) => {
                        const selected =
                          selectedOption ===
                          option.id;

                        return (
                          <button
                            key={
                              option.id ||
                              index
                            }
                            type="button"
                            onClick={() =>
                              setSelectedOption(
                                option.id
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

                <button
                  type="button"
                  onClick={handleVote}
                  disabled={voting}
                  className="group mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FFD21F] px-4 py-3.5 text-sm font-black text-black transition hover:-translate-y-0.5 hover:bg-[#FFE66D] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {voting ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                      Submitting Vote...
                    </>
                  ) : (
                    <>
                      <Send size={17} />
                      Submit Vote
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-[#292929] bg-[#111111]/70 px-4 py-3 text-center">
          <p className="text-[10px] leading-5 text-[#6B7280]">
            Your response is recorded in PULSE
            and the results can update in real
            time.
          </p>
        </div>
      </div>
    </Layout>
  );
}
