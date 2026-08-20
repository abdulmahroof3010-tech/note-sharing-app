"use client";

import { FormEvent, useState } from "react";
import { createNote } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function NewNotePage() {
  const router = useRouter();

  const [form, setForm] = useState({
    title: "",
    content: "",
    shareType: "one-time" as "one-time" | "time-based",
    accessType: "public" as "public" | "password-protected",
    expiresAt: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setError("");
      setLoading(true);

      const data = await createNote({
        title: form.title,
        content: form.content,
        shareType: form.shareType,
        accessType: form.accessType,
        ...(form.shareType === "time-based"
          ? { expiresAt: form.expiresAt }
          : {}),
      });

      sessionStorage.setItem(
        "createdNote",
        JSON.stringify({
          shareUrl: data.shareUrl,
          accessKey: data.accessKey,
        })
      );

      router.push("/notes");
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "Failed to create note"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="mx-auto max-w-2xl rounded-2xl bg-white p-8">
        <h1 className="text-3xl font-bold text-slate-900">
          Create Note
        </h1>

        <p className="mt-2 text-slate-500">
          Create a note and generate a secure share link.
        </p>

        {error && (
          <div className="mt-5 rounded-lg bg-red-50 p-4 text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* Title */}
          <div>
            <label className="mb-2 block font-medium text-slate-700">
              Title
            </label>

            <input
              type="text"
              value={form.title}
              onChange={(e) =>
                setForm({
                  ...form,
                  title: e.target.value,
                })
              }
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-blue-500"
              placeholder="My private note"
            />
          </div>

          {/* Content */}
          <div>
            <label className="mb-2 block font-medium text-slate-700">
              Content
            </label>

            <textarea
              value={form.content}
              onChange={(e) =>
                setForm({
                  ...form,
                  content: e.target.value,
                })
              }
              required
              rows={7}
              className="w-full resize-none rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-blue-500"
              placeholder="Write your note here..."
            />
          </div>

          {/* Share Type */}
          <div>
            <label className="mb-2 block font-medium text-slate-700">
              Share Type
            </label>

            <select
              value={form.shareType}
              onChange={(e) =>
                setForm({
                  ...form,
                  shareType: e.target.value as
                    | "one-time"
                    | "time-based",
                })
              }
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-blue-500"
            >
              <option value="one-time">
                One-time link
              </option>

              <option value="time-based">
                Time-based link
              </option>
            </select>
          </div>

          {/* Expiry */}
          {form.shareType === "time-based" && (
            <div>
              <label className="mb-2 block font-medium text-slate-700">
                Expiry Date & Time
              </label>

              <input
                type="datetime-local"
                value={form.expiresAt}
                onChange={(e) =>
                  setForm({
                    ...form,
                    expiresAt: e.target.value,
                  })
                }
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-blue-500"
              />
            </div>
          )}

          {/* Access Type */}
          <div>
            <label className="mb-2 block font-medium text-slate-700">
              Access Type
            </label>

            <select
              value={form.accessType}
              onChange={(e) =>
                setForm({
                  ...form,
                  accessType: e.target.value as
                    | "public"
                    | "password-protected",
                })
              }
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-blue-500"
            >
              <option value="public">
                Public
              </option>

              <option value="password-protected">
                Password Protected
              </option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Note"}
          </button>
        </form>
      </div>
    </main>
  );
}