import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-6 text-center text-slate-900">
      <div className="max-w-2xl">
        <div className="mb-5 inline-flex items-center rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
          🔒 Secure Note Sharing
        </div>

        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Share Notes
          <span className="text-blue-600"> Securely.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-600">
          Create notes and share them using secure links with public,
          password-protected, one-time, or time-based access.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/login"
            className="rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition hover:bg-blue-700"
          >
            Login
          </Link>

          <Link
            href="/register"
            className="rounded-lg border border-slate-300 bg-white px-6 py-3 font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Register
          </Link>
        </div>
      </div>
    </main>
  );
}