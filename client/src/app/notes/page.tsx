"use client";

import { useEffect, useState } from "react";
import { getNotes,revokeNote } from "@/lib/api";
import { useRouter } from "next/navigation";

type Note = {
  _id: string;
  title: string;
  content: string;
  shareToken: string;
  shareType: "one-time" | "time-based";
  accessType: "public" | "password-protected";
  revoked: boolean;
  viewCount: number;
};

type CreatedNoteInfo = {
  shareUrl: string;
  accessKey?: string;
};

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [createdNote, setCreatedNote] =
    useState<CreatedNoteInfo | null>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const data = await getNotes();
        setNotes(data.notes);

        const savedNote = sessionStorage.getItem("createdNote");

        if (savedNote) {
          setCreatedNote(JSON.parse(savedNote));

         
          sessionStorage.removeItem("createdNote");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, []);

  const handleRevoke = async (id: string) => {
  try {
    await revokeNote(id);

    setNotes((currentNotes) =>
      currentNotes.map((note) =>
        note._id === id
          ? { ...note, revoked: true }
          : note
      )
    );
  } catch (error: any) {
    console.error(error);

    alert(
      error.response?.data?.message ||
        "Failed to revoke share link"
    );
  }
};

  const copyToClipboard = async (value: string) => {
    await navigator.clipboard.writeText(value);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-8">
        <p className="text-white">Loading notes...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-white">
            My Notes
          </h1>

          <button
            type="button"
            onClick={() => router.push("/notes/new")}
            className="rounded-lg bg-blue-600 px-5 py-3 text-white hover:bg-blue-700"
          >
            Create Note
          </button>
        </div>

        {/* Newly created note information */}
        {createdNote && (
          <div className="mt-8 rounded-xl border border-green-200 bg-white p-6">

            <h2 className="text-xl font-semibold text-slate-900">
              Note Created Successfully
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Save the access key now. It will not be shown again.
            </p>

            {/* Share URL */}
            <div className="mt-5">
              <p className="mb-2 text-sm font-medium text-slate-700">
                Share URL
              </p>

              <div className="flex gap-2">
                <input
                  readOnly
                  value={createdNote.shareUrl}
                  className="flex-1 rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900"
                />

                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(createdNote.shareUrl)
                  }
                  className="rounded-lg bg-slate-900 px-4 py-3 text-white"
                >
                  Copy
                </button>
              </div>
            </div>

            {/* Access Key */}
            {createdNote.accessKey && (
              <div className="mt-5">
                <p className="mb-2 text-sm font-medium text-slate-700">
                  Access Key
                </p>

                <div className="flex gap-2">
                  <input
                    readOnly
                    value={createdNote.accessKey}
                    className="flex-1 rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 font-mono text-lg font-bold text-slate-900"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(createdNote.accessKey!)
                    }
                    className="rounded-lg bg-slate-900 px-4 py-3 text-white"
                  >
                    Copy
                  </button>
                </div>

                <p className="mt-2 text-xs text-red-500">
                  Keep this access key safe. It cannot be recovered later.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        <div className="mt-8 grid gap-5">
          {notes.length === 0 ? (
            <div className="rounded-xl bg-white p-8 text-center">
              <p className="text-slate-600">
                You don't have any notes yet.
              </p>
            </div>
          ) : (
            notes.map((note) => {
              const shareUrl = `${window.location.origin}/share/${note.shareToken}`;

              return (
                <div
                  key={note._id}
                   onClick={() => router.push(`/notes/${note._id}`)}
                  className="rounded-xl bg-white p-6"
                >
                  <h2 className="text-xl font-semibold text-slate-900">
                    {note.title}
                  </h2>

                  <p className="mt-2 text-slate-600">
                    {note.content}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-3 text-sm">
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">
                      {note.shareType}
                    </span>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                      {note.accessType}
                    </span>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                      Views: {note.viewCount}
                    </span>
                  </div>

                  {/* Share URL */}
                  <div className="mt-5">
                    <p className="mb-2 text-sm font-medium text-slate-700">
                      Share URL
                    </p>

                    <div className="flex gap-2">
                      <input
                        readOnly
                        value={shareUrl}
                        className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-900"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(shareUrl)
                        }
                        className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  {/* Revoke */}
                  {!note.revoked && (
                    <button
                      type="button"
                       onClick={() => handleRevoke(note._id)}
                      className="mt-4 rounded-lg bg-red-100 px-4 py-2 text-sm text-red-600"
                    >
                      Revoke
                    </button>
                  )}

                  {note.revoked && (
                    <p className="mt-4 text-sm font-medium text-red-600">
                      Share link revoked
                    </p>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}