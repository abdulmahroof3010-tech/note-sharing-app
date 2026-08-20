"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getSpecificNote, revokeNote } from "@/lib/api";

type Note = {
  _id: string;
  title: string;
  content: string;
  shareToken: string;
  shareType: "one-time" | "time-based";
  accessType: "public" | "password-protected";
  revoked: boolean;
  viewCount: number;
  expiresAt?: string;
};

export default function NoteDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const data = await getSpecificNote(id);

        setNote(data.note);
      } catch (error: any) {
        setError(
          error.response?.data?.message ||
            "Failed to load note"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [id]);

  const handleRevoke = async () => {
    if (!note) return;

    try {
      setError("");
      setRevoking(true);

      await revokeNote(note._id);

      setNote({
        ...note,
        revoked: true,
      });
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "Failed to revoke share link"
      );
    } finally {
      setRevoking(false);
    }
  };

  const copyToClipboard = async (value: string) => {
    await navigator.clipboard.writeText(value);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-8">
        <p className="text-white">
          Loading note...
        </p>
      </main>
    );
  }

  if (error && !note) {
    return (
      <main className="min-h-screen bg-slate-950 p-8">
        <div className="mx-auto max-w-2xl rounded-xl bg-white p-8">
          <h1 className="text-xl font-bold text-red-600">
            Unable to load note
          </h1>

          <p className="mt-3 text-slate-600">
            {error}
          </p>
        </div>
      </main>
    );
  }

  if (!note) {
    return null;
  }

  const shareUrl =
    `${window.location.origin}/share/${note.shareToken}`;

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10">
      <div className="mx-auto max-w-3xl">

        {/* Back button */}
        <button
          type="button"
          onClick={() => router.push("/notes")}
          className="mb-6 rounded-lg bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100"
        >
          ← Back to Notes
        </button>

        {/* Note card */}
        <div className="rounded-2xl bg-white p-8 shadow-xl">

          {/* Title */}
          <div>
            <h1 className="text-3xl font-bold text-slate-900">
              {note.title}
            </h1>
          </div>

          {/* Content */}
          <div className="mt-6 rounded-xl bg-slate-50 p-5">
            <p className="whitespace-pre-wrap leading-7 text-slate-700">
              {note.content}
            </p>
          </div>

          {/* Information */}
          <div className="mt-6 border-t border-slate-200 pt-6">

            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Note Information
            </h2>

            <div className="mt-4 flex flex-wrap gap-3">

              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                {note.shareType}
              </span>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                {note.accessType}
              </span>

              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                Views: {note.viewCount}
              </span>

              {note.revoked && (
                <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                  Revoked
                </span>
              )}

            </div>
          </div>

          {/* Share URL */}
          <div className="mt-6 border-t border-slate-200 pt-6">

            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Share Link
            </h2>

            <div className="mt-3 flex gap-2">

              <input
                readOnly
                value={shareUrl}
                className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900"
              />

              <button
                type="button"
                onClick={() =>
                  copyToClipboard(shareUrl)
                }
                className="rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white hover:bg-slate-800"
              >
                Copy
              </button>

            </div>
          </div>

          {/* Revoke */}
          <div className="mt-6 border-t border-slate-200 pt-6">

            {!note.revoked ? (
              <div>
                <h2 className="text-sm font-semibold text-slate-700">
                  Share Link Control
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Revoking this link will prevent anyone
                  from accessing the note through this URL.
                </p>

                {error && (
                  <p className="mt-3 text-sm text-red-600">
                    {error}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleRevoke}
                  disabled={revoking}
                  className="mt-4 rounded-lg bg-red-600 px-5 py-3 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
                >
                  {revoking
                    ? "Revoking..."
                    : "Revoke Share Link"}
                </button>
              </div>
            ) : (
              <div className="rounded-lg bg-red-50 p-4">
                <p className="font-medium text-red-700">
                  Share link revoked
                </p>

                <p className="mt-1 text-sm text-red-600">
                  This share URL can no longer be used.
                </p>
              </div>
            )}

          </div>

        </div>
      </div>
    </main>
  );
}