"use client";

import { useState, type FormEvent } from "react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatus("saving");
    const response = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const body = (await response.json()) as { error?: string };
    if (!response.ok) {
      setStatus("idle");
      setError(body.error || "Could not save that email");
      return;
    }
    setStatus("done");
  }

  return (
    <section className="bg-[#0c1411] px-6 py-25 text-center text-white" style={{margin: "25px 0 25px"}}>
      <h2 className="text-4xl font-black leading-[0.95] tracking-tight md:text-6xl">Become a Nike Member</h2>
      <p className="mt-4 text-base text-white/90">Get the latest products from Nike, plus access to exclusive sales and events.</p>
      {status === "done" ? (
        <p className="mt-8 text-sm tracking-wide">You&apos;re on the list.</p>
      ) : (
        <form onSubmit={(event) => void submit(event)} className="mx-auto mt-8 flex w-full max-w-xl flex-col gap-3 sm:flex-row">
          <label className="min-w-0 flex-1 text-left">
            <span className="sr-only">Email address</span>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Your email address"
              className="w-full border border-white bg-transparent px-4 py-3 text-white outline-none placeholder:text-white/70"
            />
          </label>
          <button type="submit" disabled={status === "saving"} className="shrink-0 bg-white px-8 py-3 text-sm font-semibold tracking-widest text-black disabled:opacity-60">
            {status === "saving" ? "SAVING" : "SIGN UP"}
          </button>
        </form>
      )}
      {error ? <p className="mt-3 text-sm text-sale">{error}</p> : null}
    </section>
  );
}
