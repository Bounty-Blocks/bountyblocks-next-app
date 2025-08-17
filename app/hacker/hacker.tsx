"use client";

import { useEffect, useMemo, useState } from "react";

// Domain models
interface Company {
  id: string;
  name: string;
}

interface Track {
  id: string;
  companyId: string;
  name: string;
  poolTotalUsd: number;
  awardedUsd: number;
  rewardsUsd: {
    high: number;
    medium: number;
    low: number;
    minor: number;
  };
  description: string;
}

interface BugItem {
  id: string;
  companyId: string;
  trackId: string;
  title: string;
  body: string;
  payoutToken?: string;
}

// Dummy seed data
const COMPANIES: Company[] = [
  { id: "adobe", name: "Adobe" },
  { id: "consensys", name: "ConsenSys" },
  { id: "aave", name: "Aave" },
];

const TRACKS: Track[] = [
  {
    id: "pii",
    companyId: "adobe",
    name: "PII Leaks",
    poolTotalUsd: 100_000,
    awardedUsd: 58_800,
    rewardsUsd: { high: 5_000, medium: 3_500, low: 1_000, minor: 250 },
    description:
      "Adobe wants reports related to exposures of personally identifiable information (PII) across products and services. Focus on clear reproduction steps, data exposure scope, and mitigation. Out of scope: public user profile info intentionally shared by users.",
  },
  {
    id: "web",
    companyId: "adobe",
    name: "Web App",
    poolTotalUsd: 60_000,
    awardedUsd: 10_500,
    rewardsUsd: { high: 4_000, medium: 2_000, low: 800, minor: 150 },
    description:
      "Report vulnerabilities in web properties, excluding marketing microsites. Looking for auth bypass, IDOR, SQLi, SSRF, and logic flaws.",
  },
  {
    id: "wallet",
    companyId: "consensys",
    name: "Wallet",
    poolTotalUsd: 200_000,
    awardedUsd: 92_000,
    rewardsUsd: { high: 12_000, medium: 6_000, low: 2_000, minor: 500 },
    description:
      "Client wallet security including seed handling, transaction signing, and phishing resistance.",
  },
];

const INITIAL_BUGS: BugItem[] = [
  {
    id: "h1",
    companyId: "adobe",
    trackId: "pii",
    title: "Photoshop export leaks EXIF email in shared previews",
    body: "Opening a PSD and exporting previews stores EXIF with user email in a publicly reachable CDN URL. Steps to reproduce ...",
  },
  {
    id: "h2",
    companyId: "adobe",
    trackId: "pii",
    title: "Firefly prompt history includes sensitive terms",
    body: "Prompt history is queryable by unauthenticated users when using a specific preview endpoint ...",
  },
  {
    id: "h3",
    companyId: "adobe",
    trackId: "web",
    title: "Illustrator XSS vulnerability",
    body: "Unsanitized attribute leads to DOM XSS in help widget ...",
  },
];

const TOKENS: string[] = ["USDC", "USDT", "USDF", "ETH (Wrapped)", "PYUSD"];

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function usd(value: number) {
  return "$" + value.toLocaleString();
}

export default function HackerPage() {
  const [companyId, setCompanyId] = useState<string>(COMPANIES[0].id);
  const [trackId, setTrackId] = useState<string>(
    TRACKS.find(t => t.companyId === COMPANIES[0].id)?.id ?? ""
  );
  const [mode, setMode] = useState<"track" | "bug" | "submit">("track");
  const [selectedBugId, setSelectedBugId] = useState<string | null>(null);
  const [query, setQuery] = useState<string>("");
  const [bugs, setBugs] = useState<BugItem[]>(INITIAL_BUGS);
  const [payoutQuery, setPayoutQuery] = useState<string>("");
  const [isPayoutOpen, setIsPayoutOpen] = useState<boolean>(false);

  const companyTracks = useMemo(
    () => TRACKS.filter(t => t.companyId === companyId),
    [companyId]
  );

  const currentTrack = useMemo(
    () => companyTracks.find(t => t.id === trackId) ?? companyTracks[0],
    [companyTracks, trackId]
  );

  const filteredBugs = useMemo(() => {
    return bugs
      .filter(b => b.companyId === companyId)
      .filter(b => (currentTrack ? b.trackId === currentTrack.id : true))
      .filter(b =>
        query.trim()
          ? (b.title + " " + b.body).toLowerCase().includes(query.toLowerCase())
          : true
      );
  }, [bugs, companyId, currentTrack, query]);

  const filteredTokens = useMemo(
    () =>
      TOKENS.filter(t => t.toLowerCase().includes(payoutQuery.toLowerCase())),
    [payoutQuery]
  );

  const selectedBug = useMemo(
    () => filteredBugs.find(b => b.id === selectedBugId) ?? null,
    [filteredBugs, selectedBugId]
  );

  const remaining = Math.max(
    (currentTrack?.poolTotalUsd ?? 0) - (currentTrack?.awardedUsd ?? 0),
    0
  );

  return (
    <div className="relative min-h-screen grid grid-cols-1 md:grid-cols-3">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(65%_35%_at_50%_-10%,rgba(88,101,242,0.15),transparent_60%)] dark:bg-[radial-gradient(65%_35%_at_50%_-10%,rgba(88,101,242,0.25),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,transparent,rgba(0,0,0,0.06))] dark:bg-[linear-gradient(to_bottom,transparent,transparent,rgba(0,0,0,0.35))]" />
      </div>
      {/* Sidebar */}
      <aside className="border-r border-black/10 dark:border-white/10 p-4 md:p-6 flex flex-col gap-4 md:gap-6 md:col-span-1">
        <div className="space-y-2">
          <label className="text-xs font-medium text-foreground/60">
            Company
          </label>
          <div className="relative">
            <select
              value={companyId}
              onChange={e => {
                const newCompany = e.target.value;
                setCompanyId(newCompany);
                const firstTrack = TRACKS.find(
                  t => t.companyId === newCompany
                )?.id;
                setTrackId(firstTrack ?? "");
                setMode("track");
                setSelectedBugId(null);
              }}
              className="w-full appearance-none rounded-lg border border-black/10 dark:border-white/15 bg-background px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
            >
              {COMPANIES.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50">
              ▾
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-medium text-foreground/60">
            Track
          </label>
          <div className="flex flex-wrap gap-2">
            {companyTracks.map(t => (
              <button
                key={t.id}
                onClick={() => {
                  setTrackId(t.id);
                  setMode("track");
                  setSelectedBugId(null);
                }}
                className={classNames(
                  "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm ring-1 transition hover:shadow-[0_8px_24px_-18px_rgba(0,0,0,0.35)] dark:hover:shadow-[0_8px_24px_-16px_rgba(0,0,0,0.6)]",
                  t.id === currentTrack?.id
                    ? "bg-zinc-900 text-white ring-zinc-800 dark:bg-white/10 dark:text-zinc-100 dark:ring-white/10"
                    : "text-zinc-900 ring-zinc-200 backdrop-blur hover:bg-white/70 dark:text-zinc-100 dark:ring-white/10 dark:hover:bg-white/10"
                )}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search for a bug…"
            className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-background pl-9 pr-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
          />
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50"
          >
            <path
              d="M21 21l-4.3-4.3M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Bugs list */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <h2 className="mt-2 mb-2 text-xs font-medium uppercase tracking-wide text-foreground/60">
            Bugs submitted
          </h2>
          <div className="h-full overflow-auto rounded-lg border border-black/10 dark:border-white/10 divide-y divide-black/5 dark:divide-white/5">
            {filteredBugs.map(b => (
              <button
                key={b.id}
                onClick={() => {
                  setSelectedBugId(b.id);
                  setMode("bug");
                }}
                className={classNames(
                  "group w-full text-left p-3 md:p-4 hover:bg-black/5 dark:hover:bg-white/5 transition",
                  selectedBugId === b.id && "bg-black/5 dark:bg-white/5"
                )}
              >
                <p className="font-medium text-sm md:text-[15px] truncate">
                  {b.title}
                </p>
                <p className="mt-1 line-clamp-1 text-xs text-foreground/60">
                  {b.body}
                </p>
              </button>
            ))}
            {filteredBugs.length === 0 && (
              <div className="p-6 text-sm text-foreground/60">No bugs yet.</div>
            )}
          </div>
        </div>

        {/* Sticky submit button */}
        <div className="sticky bottom-0 -mx-4 md:-mx-6 mt-4 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70 p-4 md:p-6 border-t border-black/10 dark:border-white/10">
          <button
            onClick={() => setMode("submit")}
            className="w-full rounded-lg bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90"
          >
            + Submit a new bug
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="min-h-screen p-4 md:p-8 md:col-span-2">
        {mode === "track" && currentTrack && (
          <section className="mx-auto max-w-4xl">
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              {currentTrack.name}
            </h1>

            {/* Stats split view */}
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid grid-cols-3 gap-3 rounded-xl border border-black/10 dark:border-white/10 p-4">
                <div className="rounded-lg bg-black/[.03] dark:bg-white/[.03] p-3">
                  <p className="text-xs text-foreground/60">Pool Total</p>
                  <p className="text-lg font-semibold">
                    {usd(currentTrack.poolTotalUsd)}
                  </p>
                </div>
                <div className="rounded-lg bg-black/[.03] dark:bg-white/[.03] p-3">
                  <p className="text-xs text-foreground/60">Total Awarded</p>
                  <p className="text-lg font-semibold">
                    {usd(currentTrack.awardedUsd)}
                  </p>
                </div>
                <div className="rounded-lg bg-black/[.03] dark:bg-white/[.03] p-3">
                  <p className="text-xs text-foreground/60">Remaining</p>
                  <p className="text-lg font-semibold">{usd(remaining)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl ring-1 ring-inset ring-rose-500/20 bg-rose-500/10 p-4">
                  <p className="text-xs text-rose-400">High severity</p>
                  <p className="text-lg font-semibold text-rose-300">
                    {usd(currentTrack.rewardsUsd.high)}
                  </p>
                </div>
                <div className="rounded-xl ring-1 ring-inset ring-amber-500/20 bg-amber-500/10 p-4">
                  <p className="text-xs text-amber-400">Medium severity</p>
                  <p className="text-lg font-semibold text-amber-300">
                    {usd(currentTrack.rewardsUsd.medium)}
                  </p>
                </div>
                <div className="rounded-xl ring-1 ring-inset ring-sky-500/20 bg-sky-500/10 p-4">
                  <p className="text-xs text-sky-400">Low severity</p>
                  <p className="text-lg font-semibold text-sky-300">
                    {usd(currentTrack.rewardsUsd.low)}
                  </p>
                </div>
                <div className="rounded-xl ring-1 ring-inset ring-emerald-500/20 bg-emerald-500/10 p-4">
                  <p className="text-xs text-emerald-400">Minor fix</p>
                  <p className="text-lg font-semibold text-emerald-300">
                    {usd(currentTrack.rewardsUsd.minor)}
                  </p>
                </div>
              </div>
            </div>

            <div className="prose prose-slate dark:prose-invert max-w-none mt-8">
              <h3 className="text-base font-semibold text-foreground/80">
                Track details
              </h3>
              <p className="mt-3 text-[15px] md:text-base">
                {currentTrack.description}
              </p>
            </div>
          </section>
        )}

        {mode === "bug" && selectedBug && (
          <article className="mx-auto max-w-4xl">
            <header className="-mx-4 md:mx-0 border-b border-black/10 dark:border-white/10 px-4 md:px-0 pb-4">
              <h2 className="text-2xl md:text-3xl font-semibold leading-tight">
                {selectedBug.title}
              </h2>
            </header>
            <div className="relative mt-6">
              <div className="filter blur-sm select-none pointer-events-none">
                <p className="whitespace-pre-wrap leading-relaxed text-[15px] md:text-base">
                  {selectedBug.body.repeat(4)}
                </p>
              </div>
              <div className="absolute inset-0 grid place-items-center">
                <div className="rounded-xl bg-background/90 backdrop-blur px-6 py-4 ring-1 ring-black/10 dark:ring-white/10 text-center">
                  <p className="font-medium">Long description is locked</p>
                  <p className="text-xs text-foreground/60 mt-1">
                    Only visible to sponsor triagers. Submit your own report to
                    participate.
                  </p>
                </div>
              </div>
            </div>
          </article>
        )}

        {mode === "submit" && (
          <section className="mx-auto max-w-3xl">
            <header className="mb-6">
              <h2 className="text-2xl font-semibold">Submit a bug</h2>
              <p className="text-sm text-foreground/60 mt-1">
                Provide a concise summary and a detailed write-up.
              </p>
            </header>
            <form
              onSubmit={e => {
                e.preventDefault();
                const form = e.currentTarget as HTMLFormElement;
                const fd = new FormData(form);
                const newBug: BugItem = {
                  id: `n${Date.now()}`,
                  companyId: String(fd.get("company")),
                  trackId: String(fd.get("track")),
                  title: String(fd.get("title")),
                  body: String(fd.get("body")),
                  payoutToken: payoutQuery || undefined,
                };
                setBugs(prev => [newBug, ...prev]);
                setCompanyId(newBug.companyId);
                setTrackId(newBug.trackId);
                setSelectedBugId(newBug.id);
                setMode("bug");
              }}
              className="space-y-5"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Company</label>
                  <select
                    name="company"
                    defaultValue={companyId}
                    className="rounded-lg border border-black/10 dark:border-white/15 bg-background px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
                  >
                    {COMPANIES.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Track</label>
                  <select
                    name="track"
                    defaultValue={currentTrack?.id}
                    className="rounded-lg border border-black/10 dark:border-white/15 bg-background px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
                  >
                    {companyTracks.map(t => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Short description</label>
                <input
                  required
                  name="title"
                  placeholder="Summarize the bug in one sentence"
                  className="rounded-lg border border-black/10 dark:border-white/15 bg-background px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
                />
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Long description</label>
                <textarea
                  required
                  name="body"
                  rows={14}
                  placeholder="Detailed reproduction steps, impact, affected components, and mitigation ideas."
                  className="rounded-lg border border-black/10 dark:border-white/15 bg-background px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
                />
              </div>

              <div className="grid gap-2 relative">
                <label className="text-sm font-medium">
                  Preferred payout token
                </label>
                <input
                  name="payoutToken"
                  value={payoutQuery}
                  onChange={e => {
                    setPayoutQuery(e.target.value);
                    setIsPayoutOpen(true);
                  }}
                  onFocus={() => setIsPayoutOpen(true)}
                  placeholder="Type to search (e.g., USDC, DAI, ETH)"
                  className="rounded-lg border border-black/10 dark:border-white/15 bg-background px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
                  autoComplete="off"
                />
                {isPayoutOpen && filteredTokens.length > 0 && (
                  <div className="absolute left-0 top-full z-10 mt-1 w-full rounded-lg border border-black/10 dark:border-white/15 bg-background shadow-lg">
                    <ul className="max-h-56 overflow-auto py-1">
                      {filteredTokens.map(token => (
                        <li key={token}>
                          <button
                            type="button"
                            className="w-full text-left px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5"
                            onMouseDown={e => {
                              e.preventDefault();
                              setPayoutQuery(token);
                              setIsPayoutOpen(false);
                            }}
                          >
                            {token}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="grid gap-2">
                <label className="text-sm font-medium">Email (optional)</label>
                <input
                  type="email"
                  name="email"
                  placeholder="name@domain.com"
                  className="rounded-lg border border-black/10 dark:border-white/15 bg-background px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  className="rounded-lg bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90"
                >
                  Submit
                </button>
                <button
                  type="button"
                  onClick={() => setMode("track")}
                  className="rounded-lg border border-black/10 dark:border-white/15 px-4 py-2 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5"
                >
                  Cancel
                </button>
              </div>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}
