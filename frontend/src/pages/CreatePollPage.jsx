
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Send,
  Loader2,
  Sparkles,
  Zap,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";

import Layout from "../components/Layout";
import api from "../utils/api";

const TYPES = [
  {
    id: "yesno",
    name: "Yes / No",
    description: "Simple yes or no question",
  },
  {
    id: "single",
    name: "Single Choice",
    description: "Choose one option",
  },
  {
    id: "rating",
    name: "Rating",
    description: "Rate from 1 to 5",
  },
  {
    id: "image",
    name: "Image Poll",
    description: "Choose between images",
  },
  {
    id: "open",
    name: "Open Answer",
    description: "Let users type an answer",
  },
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export default function CreatePollPage() {
  const navigate = useNavigate();

  const [question, setQuestion] = useState("");
  const [type, setType] = useState("single");
  const [category, setCategory] = useState("General");

  const [options, setOptions] = useState(["", ""]);

  const [images, setImages] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleTypeChange = (newType) => {
    setType(newType);
    setError("");
    setSuccess("");

    if (newType === "yesno") {
      setOptions(["Yes", "No"]);
      setImages([]);
    } else if (newType === "rating") {
      setOptions(["1", "2", "3", "4", "5"]);
      setImages([]);
    } else if (newType === "open") {
      setOptions([]);
      setImages([]);
    } else if (newType === "image") {
      setOptions([]);
    } else {
      setOptions(["", ""]);
      setImages([]);
    }
  };

  const addOption = () => {
    if (options.length >= 6) {
      setError("You can add a maximum of 6 options.");
      return;
    }

    setOptions([...options, ""]);
    setError("");
  };

  const updateOption = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
    setError("");
  };

  const removeOption = (index) => {
    if (options.length <= 2) {
      setError("A poll needs at least 2 options.");
      return;
    }

    setOptions(options.filter((_, i) => i !== index));
    setError("");
  };

  const handleImages = (event) => {
    const selectedFiles = Array.from(event.target.files || []);

    setError("");
    setSuccess("");

    if (selectedFiles.length < 2) {
      setError("Please select at least 2 images.");
      event.target.value = "";
      return;
    }

    if (selectedFiles.length > 4) {
      setError("You can upload a maximum of 4 images.");
      event.target.value = "";
      return;
    }

    const invalidType = selectedFiles.find(
      (file) => !file.type.startsWith("image/")
    );

    if (invalidType) {
      setError("Only image files are allowed.");
      event.target.value = "";
      return;
    }

    const oversized = selectedFiles.find(
      (file) => file.size > MAX_IMAGE_SIZE
    );

    if (oversized) {
      setError(
        `${oversized.name} is larger than 5 MB.`
      );
      event.target.value = "";
      return;
    }

    setImages(selectedFiles);
    event.target.value = "";
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const cleanQuestion = question.trim();

    if (!cleanQuestion) {
      return "Please enter a poll question.";
    }

    if (cleanQuestion.length < 3) {
      return "Question must contain at least 3 characters.";
    }

    if (cleanQuestion.length > 300) {
      return "Question cannot exceed 300 characters.";
    }

    if (type === "single") {
      const cleanOptions = options
        .map((option) => option.trim())
        .filter(Boolean);

      if (cleanOptions.length < 2) {
        return "Please provide at least 2 options.";
      }

      if (cleanOptions.length > 6) {
        return "You can have a maximum of 6 options.";
      }

      const duplicates = cleanOptions.map((value) =>
        value.toLowerCase()
      );

      if (new Set(duplicates).size !== duplicates.length) {
        return "Options must be unique.";
      }
    }

    if (type === "image") {
      if (images.length < 2) {
        return "Please upload at least 2 images.";
      }

      if (images.length > 4) {
        return "You can upload a maximum of 4 images.";
      }
    }

    return "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append(
        "question",
        question.trim()
      );

      formData.append(
        "type",
        type
      );

      formData.append(
        "category",
        category.trim() || "General"
      );

      if (
        type === "single" ||
        type === "yesno" ||
        type === "rating"
      ) {
        const cleanOptions = options
          .map((option) => option.trim())
          .filter(Boolean);

        formData.append(
          "options",
          JSON.stringify(cleanOptions)
        );
      }

      if (type === "image") {
        images.forEach((image) => {
          formData.append("images", image);
        });
      }

      console.log(
        "========== CREATE POLL =========="
      );

      for (const [key, value] of formData.entries()) {
        if (value instanceof File) {
          console.log(
            key,
            "FILE:",
            value.name,
            value.type,
            value.size
          );
        } else {
          console.log(key, value);
        }
      }

      console.log(
        "================================="
      );

      const response = await api.post(
        "/polls",
        formData
      );

      console.log(
        "CREATE POLL SUCCESS:",
        response.data
      );

      setSuccess(
        response.data?.message ||
          "Poll created successfully."
      );

      const createdPoll =
        response.data?.poll;

      setTimeout(() => {
        if (createdPoll?.id) {
          navigate(
            `/poll/${createdPoll.id}`
          );
        } else {
          navigate("/my-polls");
        }
      }, 700);
    } catch (err) {
      console.error(
        "CREATE POLL ERROR:",
        err
      );

      console.error(
        "STATUS:",
        err.response?.status
      );

      console.error(
        "RESPONSE DATA:",
        err.response?.data
      );

      console.error(
        "RESPONSE MESSAGE:",
        err.response?.data?.message
      );

      setError(
        err.response?.data?.message ||
          "Could not create poll. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout wide>
      <div className="min-h-[calc(100vh-120px)] px-2 pb-10">
        <div className="mx-auto max-w-5xl">

          <div className="mb-6 flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="group flex items-center gap-2 text-sm font-medium text-gray-400 transition hover:text-[#FFD21F]"
            >
              <ArrowLeft
                size={17}
                className="transition-transform group-hover:-translate-x-1"
              />
              Back
            </button>

            <div className="flex items-center gap-2 text-xs text-gray-500">
              <Sparkles
                size={14}
                className="text-[#FFD21F]"
              />
              Create Live Poll
            </div>
          </div>

          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#FFD21F]">
              Creator Studio
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Create a Poll
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500">
              Ask a question, choose a poll type and
              collect real-time responses.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-5 flex items-center gap-2 rounded-2xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
              <CheckCircle2 size={17} />
              {success}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="space-y-6"
          >

            <section className="rounded-3xl border border-[#292929] bg-[#111111] p-5 shadow-xl sm:p-7">

              <div className="mb-6">
                <label className="text-sm font-bold text-white">
                  Question
                </label>

                <p className="mt-1 text-xs text-gray-500">
                  What do you want to ask your audience?
                </p>
              </div>

              <textarea
                value={question}
                onChange={(event) =>
                  setQuestion(event.target.value)
                }
                placeholder="Example: Which programming language do you prefer?"
                maxLength={300}
                rows={4}
                className="w-full resize-none rounded-2xl border border-[#292929] bg-[#090909] px-4 py-4 text-sm text-white outline-none transition focus:border-[#FFD21F]/60 focus:ring-2 focus:ring-[#FFD21F]/10"
              />

              <div className="mt-2 text-right text-[11px] text-gray-600">
                {question.length}/300
              </div>
            </section>

            <section className="rounded-3xl border border-[#292929] bg-[#111111] p-5 shadow-xl sm:p-7">

              <div className="mb-6">
                <p className="text-sm font-bold text-white">
                  Poll Type
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Choose how people will respond.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {TYPES.map((item) => {
                  const selected =
                    type === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() =>
                        handleTypeChange(item.id)
                      }
                      className={`rounded-2xl border p-4 text-left transition duration-300 ${
                        selected
                          ? "border-[#FFD21F]/60 bg-[#FFD21F]/10"
                          : "border-[#292929] bg-[#090909] hover:border-[#FFD21F]/30"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-sm font-bold ${
                            selected
                              ? "text-[#FFD21F]"
                              : "text-gray-300"
                          }`}
                        >
                          {item.name}
                        </span>

                        {selected && (
                          <CheckCircle2
                            size={16}
                            className="text-[#FFD21F]"
                          />
                        )}
                      </div>

                      <p className="mt-2 text-[11px] leading-5 text-gray-600">
                        {item.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            {type !== "open" && (
              <section className="rounded-3xl border border-[#292929] bg-[#111111] p-5 shadow-xl sm:p-7">

                {type === "image" ? (
                  <>
                    <div className="mb-6">
                      <p className="text-sm font-bold text-white">
                        Poll Images
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Upload 2 to 4 images for voters
                        to choose from.
                      </p>
                    </div>

                    <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[#3A3A3A] bg-[#090909] px-5 py-10 transition hover:border-[#FFD21F]/50 hover:bg-[#0D0D0D]">
                      <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#FFD21F]/10 text-[#FFD21F]">
                        <ImageIcon size={22} />
                      </div>

                      <p className="mt-4 text-sm font-bold text-white">
                        Choose images
                      </p>

                      <p className="mt-1 text-xs text-gray-600">
                        PNG, JPG, JPEG or WEBP · Max 5 MB each
                      </p>

                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/jpg,image/webp"
                        multiple
                        onChange={handleImages}
                        className="hidden"
                      />
                    </label>

                    {images.length > 0 && (
                      <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
                        {images.map((image, index) => (
                          <div
                            key={`${image.name}-${index}`}
                            className="group relative overflow-hidden rounded-2xl border border-[#292929] bg-[#090909]"
                          >
                            <img
                              src={URL.createObjectURL(image)}
                              alt={image.name}
                              className="aspect-square w-full object-cover"
                            />

                            <button
                              type="button"
                              onClick={() =>
                                removeImage(index)
                              }
                              className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-lg bg-black/70 text-red-400 backdrop-blur transition hover:bg-red-500 hover:text-white"
                            >
                              <Trash2 size={14} />
                            </button>

                            <div className="truncate px-3 py-2 text-[10px] text-gray-500">
                              {image.name}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="mb-6 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-white">
                          {type === "rating"
                            ? "Rating Options"
                            : type === "yesno"
                            ? "Yes / No Options"
                            : "Answer Options"}
                        </p>

                        <p className="mt-1 text-xs text-gray-500">
                          {type === "rating"
                            ? "Voters can select a rating from 1 to 5."
                            : "Add the choices voters can select."}
                        </p>
                      </div>

                      {type === "single" && (
                        <button
                          type="button"
                          onClick={addOption}
                          disabled={options.length >= 6}
                          className="inline-flex items-center gap-2 rounded-xl border border-[#292929] bg-[#090909] px-3 py-2 text-xs font-bold text-gray-300 transition hover:border-[#FFD21F]/40 hover:text-[#FFD21F] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Plus size={15} />
                          Add
                        </button>
                      )}
                    </div>

                    <div className="space-y-3">
                      {options.map(
                        (option, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-3"
                          >
                            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#FFD21F]/10 text-xs font-black text-[#FFD21F]">
                              {index + 1}
                            </div>

                            <input
                              value={option}
                              disabled={
                                type === "yesno" ||
                                type === "rating"
                              }
                              onChange={(event) =>
                                updateOption(
                                  index,
                                  event.target.value
                                )
                              }
                              placeholder={`Option ${
                                index + 1
                              }`}
                              className="min-w-0 flex-1 rounded-xl border border-[#292929] bg-[#090909] px-4 py-3 text-sm text-white outline-none transition focus:border-[#FFD21F]/60 disabled:cursor-not-allowed disabled:opacity-70"
                            />

                            {type === "single" && (
                              <button
                                type="button"
                                onClick={() =>
                                  removeOption(index)
                                }
                                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#292929] text-gray-600 transition hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </>
                )}
              </section>
            )}

            {type === "open" && (
              <section className="rounded-3xl border border-[#292929] bg-[#111111] p-5 shadow-xl sm:p-7">
                <div className="rounded-2xl border border-[#FFD21F]/20 bg-[#FFD21F]/5 p-5">
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#FFD21F]/10 text-[#FFD21F]">
                      <Zap size={18} />
                    </div>

                    <div>
                      <p className="text-sm font-bold text-white">
                        Open Answer
                      </p>

                      <p className="mt-1 text-xs leading-5 text-gray-500">
                        Voters will see a text box and can
                        submit their own answer.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            )}

            <section className="rounded-3xl border border-[#292929] bg-[#111111] p-5 shadow-xl sm:p-7">
              <label className="text-sm font-bold text-white">
                Category
              </label>

              <p className="mt-1 text-xs text-gray-500">
                Help organize your polls.
              </p>

              <input
                value={category}
                onChange={(event) =>
                  setCategory(event.target.value)
                }
                maxLength={50}
                placeholder="General"
                className="mt-4 w-full rounded-xl border border-[#292929] bg-[#090909] px-4 py-3 text-sm text-white outline-none transition focus:border-[#FFD21F]/60"
              />
            </section>

            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FFD21F] px-5 py-4 text-sm font-black text-black shadow-[0_15px_40px_rgba(255,210,31,0.12)] transition duration-300 hover:-translate-y-0.5 hover:bg-[#FFE66D] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                  Creating Poll...
                </>
              ) : (
                <>
                  <Send
                    size={17}
                    className="transition-transform group-hover:translate-x-1"
                  />
                  Create Poll
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}
