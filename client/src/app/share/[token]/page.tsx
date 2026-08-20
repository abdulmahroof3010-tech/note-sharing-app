"use client";

import { useEffect, useState,useRef } from "react";
import { useParams } from "next/navigation";
import {
  getSharedNote,
  unlockSharedNote,
} from "@/lib/api";

type SharedNote = {
  title: string;
  content: string;
};

export default function SharedNotePage() {
  const params = useParams();
  const token = params.token as string;
  const hasFetched=useRef(false)

  const [note, setNote] = useState<SharedNote | null>(null);
  const [requiresPassword, setRequiresPassword] = useState(false);
  const [accessKey, setAccessKey] = useState("");

  const [loading, setLoading] = useState(true);
  const [unlocking, setUnlocking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {

     if (hasFetched.current) {
    return;
  }

    hasFetched.current = true;
  const fetchSharedNote = async () => {
    try {
      const data = await getSharedNote(token);

      setNote(data);
    } catch (error: any) {
      const responseData = error.response?.data;

      if (responseData?.requiresPassword) {
        setRequiresPassword(true);
        return;
      }

      setError(
        responseData?.message ||
          "Unable to access this note"
      );
    } finally {
      setLoading(false);
    }
  };

  fetchSharedNote();
}, [token]);

  const handleUnlock = async () => {
    if (!accessKey.trim()) {
      setError("Access key is required");
      return;
    }

    try {
      setError("");
      setUnlocking(true);

      const data = await unlockSharedNote(
        token,
        accessKey
      );

      setNote(data);
      setRequiresPassword(false);
    } catch (error: any) {
      setError(
        error.response?.data?.message ||
          "Invalid access key"
      );
    } finally {
      setUnlocking(false);
    }
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

  if (error && !requiresPassword) {
    return (
      <main className="min-h-screen bg-slate-950 p-8">
        <div className="mx-auto max-w-2xl rounded-xl bg-white p-8">
          <h1 className="text-xl font-semibold text-red-600">
            Unable to open note
          </h1>

          <p className="mt-3 text-slate-600">
            {error}
          </p>
        </div>
      </main>
    );
  }

  if (requiresPassword) {
    return (
      <main className="min-h-screen bg-slate-950 p-8">
        <div className="mx-auto max-w-md rounded-xl bg-white p-8">

          <h1 className="text-2xl font-bold text-slate-900">
            Protected Note
          </h1>

          <p className="mt-2 text-slate-500">
            Enter the access key to view this note.
          </p>

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 p-3 text-red-600">
              {error}
            </div>
          )}

          <input
            type="text"
            value={accessKey}
            onChange={(e) =>
              setAccessKey(e.target.value)
            }
            placeholder="Enter access key"
            className="mt-6 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-blue-500"
          />

          <button
            type="button"
            onClick={handleUnlock}
            disabled={unlocking}
            className="mt-4 w-full rounded-lg bg-blue-600 py-3 text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {unlocking ? "Unlocking..." : "Unlock Note"}
          </button>

        </div>
      </main>
    );
  }

  if (!note) {
    return null;
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8">
      <div className="mx-auto max-w-3xl rounded-xl bg-white p-8">

        <h1 className="text-3xl font-bold text-slate-900">
          {note.title}
        </h1>

        <div className="mt-6 whitespace-pre-wrap text-slate-700">
          {note.content}
        </div>

      </div>
    </main>
  );
}