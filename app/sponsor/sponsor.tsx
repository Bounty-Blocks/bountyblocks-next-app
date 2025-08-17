"use client";

import { useEffect, useMemo, useState } from "react";
import { uploadBlob, downloadBlob } from "../walrus";

// Ethereum provider minimal types (no `any`)
type EthereumRequestArgs = {
  method: string;
  params?: unknown[] | Record<string, unknown>;
};
interface EthereumProvider {
  request: (args: EthereumRequestArgs) => Promise<unknown>;
  on: (
    event: "accountsChanged" | "chainChanged",
    handler: (...args: unknown[]) => void
  ) => void;
  removeListener: (
    event: "accountsChanged" | "chainChanged",
    handler: (...args: unknown[]) => void
  ) => void;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

// Types
interface Company {
  id: string;
  name: string;
}

interface Track {
  id: string;
  companyId: string;
  name: string;
}

interface BugItem {
  id: string;
  companyId: string;
  trackId: string;
  title: string;
  severity: "low" | "medium" | "high" | "critical";
  rewardUsd: number;
  body: string;
  status: "reported" | "triaging" | "accepted" | "rejected";
  unlocked?: boolean;
}

// Dummy data (replace with real data later)
const COMPANIES: Company[] = [
  { id: "adobe", name: "Adobe" },
  { id: "consensys", name: "ConsenSys" },
  { id: "aave", name: "Aave" },
];

const TRACKS: Track[] = [
  { id: "web", companyId: "adobe", name: "Web App" },
  { id: "api", companyId: "adobe", name: "API" },
  { id: "wallet", companyId: "consensys", name: "Wallet" },
  { id: "smart", companyId: "aave", name: "Smart Contracts" },
];

const BUGS: BugItem[] = [
  {
    id: "b1",
    companyId: "adobe",
    trackId: "web",
    title:
      "Reflected XSS in project search results can escalate to account takeover",
    severity: "high",
    rewardUsd: 2500,
    status: "triaging",
    body: "When the query parameter `q` is not sanitized, an attacker can inject a payload that executes in the victim's browser. The vector is present on the search results page for unauthenticated users, which increases exposure. Steps to reproduce: 1) Visit /search?q=%3Cscript%3Ealert(1)%3C/script%3E 2) Observe execution. Recommended fix: Encode user input and use a strict CSP.",
  },
  {
    id: "b2",
    companyId: "adobe",
    trackId: "api",
    title: "Rate-limit bypass leads to mass enumeration of user emails",
    severity: "medium",
    rewardUsd: 800,
    status: "reported",
    body: "The /v1/users:lookup endpoint uses IP-based throttling, which can be bypassed with the X-Forwarded-For header. This allows an attacker to enumerate user emails by cycling header values. Recommend migrating to token-scoped rate limits and anomaly detection.",
  },
  {
    id: "b3",
    companyId: "consensys",
    trackId: "wallet",
    title: "Mnemonic leak via clipboard persistence on mobile share flow",
    severity: "critical",
    rewardUsd: 10000,
    status: "accepted",
    body: "Exporting wallet seed places the phrase into the system clipboard for longer than intended on Android 14, allowing other apps to read it. Use OS-secure share sheets and clear clipboard immediately after use.",
  },
  {
    id: "b4",
    companyId: "aave",
    trackId: "smart",
    title: "Rounding bug enables dust siphoning in interest accrual",
    severity: "low",
    rewardUsd: 300,
    status: "rejected",
    body: "Rounding at 18 decimals results in tiny leftover balances accumulating to the protocol over time. While economically negligible, the arithmetic can be tightened using mulDiv to minimize drift.",
  },
];

function classNames(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatAddress(addr: string) {
  return addr.slice(0, 6) + "…" + addr.slice(-4);
}

function SeverityBadge({ level }: { level: BugItem["severity"] }) {
  const tone = {
    low: "bg-emerald-500/10 text-emerald-500 ring-emerald-500/20",
    medium: "bg-amber-500/10 text-amber-500 ring-amber-500/20",
    high: "bg-orange-500/10 text-orange-500 ring-orange-500/20",
    critical: "bg-rose-500/10 text-rose-500 ring-rose-500/20",
  }[level];
  return (
    <span
      className={classNames(
        "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset",
        tone
      )}
    >
      {level.toUpperCase()}
    </span>
  );
}

function StatusBadge({ status }: { status: BugItem["status"] }) {
  const tone = {
    reported: "bg-slate-500/10 text-slate-400 ring-slate-500/20",
    triaging: "bg-sky-500/10 text-sky-400 ring-sky-500/20",
    accepted: "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
    rejected: "bg-rose-500/10 text-rose-400 ring-rose-500/20",
  }[status];
  return (
    <span
      className={classNames(
        "inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset",
        tone
      )}
    >
      {status}
    </span>
  );
}

function WalletButton() {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const hasEthereum = typeof window !== "undefined" && Boolean(window.ethereum);

  useEffect(() => {
    if (!hasEthereum || !window.ethereum) return;
    const ethereum = window.ethereum;

    const handleAccountsChanged = (accounts: string[]) => {
      setAccount(accounts?.[0] ?? null);
    };
    const handleChainChanged = (id: string) => {
      setChainId(id);
    };

    const onAccountsChanged = (...args: unknown[]) =>
      handleAccountsChanged((args[0] as string[]) ?? []);
    const onChainChanged = (...args: unknown[]) =>
      handleChainChanged(String(args[0] ?? ""));

    ethereum.request({ method: "eth_accounts" }).then(accs => {
      const accounts = accs as string[];
      setAccount(accounts?.[0] ?? null);
    });
    ethereum
      .request({ method: "eth_chainId" })
      .then(id => setChainId(id as string));

    ethereum.on("accountsChanged", onAccountsChanged);
    ethereum.on("chainChanged", onChainChanged);
    return () => {
      ethereum.removeListener("accountsChanged", onAccountsChanged);
      ethereum.removeListener("chainChanged", onChainChanged);
    };
  }, [hasEthereum]);

  const connect = async () => {
    if (!hasEthereum || !window.ethereum) {
      window.open("https://metamask.io", "_blank");
      return;
    }
    const ethereum = window.ethereum;
    const accs = (await ethereum.request({
      method: "eth_requestAccounts",
    })) as string[];
    setAccount(accs?.[0] ?? null);
  };

  return (
    <div className="flex items-center gap-2">
      {account ? (
        <div className="flex items-center gap-2 rounded-full border border-black/10 dark:border-white/15 px-3 py-1.5">
          <span className="text-xs text-foreground/70">
            {chainId ? parseInt(chainId, 16) : "-"}
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <button
            onClick={() => navigator.clipboard.writeText(account)}
            className="text-sm font-medium hover:opacity-80"
            title={account}
          >
            {formatAddress(account)}
          </button>
        </div>
      ) : (
        <button
          onClick={connect}
          className="inline-flex items-center gap-2 rounded-full bg-black text-white dark:bg-white dark:text-black px-4 py-2 text-sm font-medium shadow-sm hover:opacity-90 transition"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            className="opacity-90"
          >
            <path
              d="M12 5v14m-7-7h14"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
          Connect Wallet
        </button>
      )}
    </div>
  );
}

export default function SponsorPage() {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(
    COMPANIES[0].id
  );
  const [selectedTrackId, setSelectedTrackId] = useState<string | "all">("all");
  const [selectedBugId, setSelectedBugId] = useState<string | null>(null);
  const [mode, setMode] = useState<"bug" | "edit">("bug");
  const [query, setQuery] = useState("");

  const [tracks, setTracks] = useState<Track[]>(TRACKS);
  const [bugs, setBugs] = useState<BugItem[]>(BUGS);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [blobId, setBlobId] = useState<string | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const companyTracks = useMemo(
    () => tracks.filter(t => t.companyId === selectedCompanyId),
    [tracks, selectedCompanyId]
  );

  const filteredBugs = useMemo(() => {
    return bugs
      .filter(b => b.companyId === selectedCompanyId)
      .filter(b =>
        selectedTrackId === "all" ? true : b.trackId === selectedTrackId
      )
      .filter(b =>
        query.trim()
          ? (b.title + " " + b.body).toLowerCase().includes(query.toLowerCase())
          : true
      )
      .sort((a, b) => {
        const sevOrder = { low: 0, medium: 1, high: 2, critical: 3 } as const;
        return sevOrder[b.severity] - sevOrder[a.severity];
      });
  }, [selectedCompanyId, selectedTrackId, query]);

  useEffect(() => {
    if (!selectedBugId && filteredBugs.length) {
      setSelectedBugId(filteredBugs[0].id);
    }
  }, [filteredBugs, selectedBugId]);

  const selectedBug = useMemo(
    () => bugs.find(b => b.id === selectedBugId) ?? null,
    [bugs, selectedBugId]
  );

  return (
    <div className="relative min-h-screen w-full grid grid-cols-1 md:grid-cols-3">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(65%_35%_at_50%_-10%,rgba(88,101,242,0.15),transparent_60%)] dark:bg-[radial-gradient(65%_35%_at_50%_-10%,rgba(88,101,242,0.25),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,transparent,rgba(0,0,0,0.06))] dark:bg-[linear-gradient(to_bottom,transparent,transparent,rgba(0,0,0,0.35))]" />
      </div>
      {/* Sidebar */}
      <aside className="border-r border-black/10 dark:border-white/10 p-4 md:p-6 flex flex-col gap-4 md:gap-6 bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:col-span-1">
        <div className="flex items-center justify-between">
          <h1 className="text-base md:text-lg font-semibold">Sponsor</h1>
          <WalletButton />
        </div>

        {/* Company select */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-foreground/60">
            Company
          </label>
          <div className="relative">
            <select
              value={selectedCompanyId}
              onChange={e => {
                setSelectedCompanyId(e.target.value);
                setSelectedTrackId("all");
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

        {/* Track select */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-foreground/60">
            Track
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTrackId("all")}
              className={classNames(
                "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm ring-1 transition hover:shadow-[0_8px_24px_-18px_rgba(0,0,0,0.35)] dark:hover:shadow-[0_8px_24px_-16px_rgba(0,0,0,0.6)]",
                selectedTrackId === "all"
                  ? "bg-zinc-900 text-white ring-zinc-800 dark:bg-white/10 dark:text-zinc-100 dark:ring-white/10"
                  : "text-zinc-900 ring-zinc-200 backdrop-blur hover:bg-white/70 dark:text-zinc-100 dark:ring-white/10 dark:hover:bg-white/10"
              )}
            >
              All
            </button>
            {companyTracks.map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedTrackId(t.id)}
                className={classNames(
                  "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm ring-1 transition hover:shadow-[0_8px_24px_-18px_rgba(0,0,0,0.35)] dark:hover:shadow-[0_8px_24px_-16px_rgba(0,0,0,0.6)]",
                  selectedTrackId === t.id
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
            placeholder="Search reported bugs… (or enter Walrus Blob ID)"
            className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-background pl-9 pr-28 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
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
          <button
            type="button"
            onClick={async () => {
              const blob = query.trim();
              if (!blob) return;
              try {
                setIsSearching(true);
                setSearchError(null);
                const arr = await downloadBlob(blob);
                const json = new TextDecoder().decode(arr);
                const parsed = JSON.parse(json) as Partial<BugItem> & Record<string, unknown>;

                const allowedSeverity = new Set(["low", "medium", "high", "critical"]);
                const allowedStatus = new Set(["reported", "triaging", "accepted", "rejected"]);

                let trackIdGuess = typeof parsed.trackId === "string" && parsed.trackId
                  ? parsed.trackId
                  : (selectedTrackId !== "all" ? selectedTrackId : (companyTracks[0]?.id ?? ""));

                // Ensure track belongs to company
                const belongs = tracks.some(t => t.id === trackIdGuess && t.companyId === (parsed.companyId as string ?? selectedCompanyId));
                if (!belongs) {
                  trackIdGuess = companyTracks[0]?.id ?? trackIdGuess;
                }

                const bug: BugItem = {
                  id: typeof parsed.id === "string" && parsed.id ? parsed.id : `b${Date.now()}`,
                  companyId: typeof parsed.companyId === "string" && parsed.companyId ? parsed.companyId : selectedCompanyId,
                  trackId: trackIdGuess,
                  title: typeof parsed.title === "string" && parsed.title ? parsed.title : "(untitled)",
                  body: typeof parsed.body === "string" ? parsed.body : "",
                  rewardUsd: typeof parsed.rewardUsd === "number" ? parsed.rewardUsd : 0,
                  severity: allowedSeverity.has(String(parsed.severity)) ? (parsed.severity as BugItem["severity"]) : "low",
                  status: allowedStatus.has(String(parsed.status)) ? (parsed.status as BugItem["status"]) : "reported",
                  unlocked: true,
                };

                setBugs(prev => {
                  const exists = prev.some(b => b.id === bug.id);
                  if (exists) return prev.map(b => (b.id === bug.id ? bug : b));
                  return [bug, ...prev];
                });
                setSelectedCompanyId(bug.companyId);
                setSelectedTrackId(bug.trackId);
                setSelectedBugId(bug.id);
                setMode("bug");
              } catch (err: unknown) {
                const message = err instanceof Error ? err.message : "Failed to fetch blob";
                setSearchError(message);
              } finally {
                setIsSearching(false);
              }
            }}
            disabled={isSearching}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md border border-black/10 dark:border-white/15 px-3 py-1.5 text-xs font-medium hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-60"
          >
            {isSearching ? "Fetching…" : "Fetch"}
          </button>
        </div>
        {searchError && (
          <p className="text-xs text-rose-400">{searchError}</p>
        )}

        {/* Reported bugs list */}
        <div className="flex-1 min-h-0">
          <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-foreground/60">
            Reported Bugs
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
                  "group w-full text-left p-3 md:p-4 hover:bg-black/5 dark:hover:bg-white/5 transition flex items-start gap-3",
                  selectedBugId === b.id && "bg-black/5 dark:bg-white/5"
                )}
              >
                <div className="pt-0.5">
                  <span className="block h-2 w-2 rounded-full bg-foreground/40 group-hover:bg-foreground/70" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate font-medium text-sm md:text-[15px]">
                      {b.title}
                    </p>
                    <SeverityBadge level={b.severity} />
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-xs text-foreground/60">
                      ${b.rewardUsd.toLocaleString()} reward
                    </span>
                    <StatusBadge status={b.status} />
                  </div>
                </div>
              </button>
            ))}
            {filteredBugs.length === 0 && (
              <div className="p-6 text-sm text-foreground/60">
                No bugs found.
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => setMode("edit")}
            className="inline-flex items-center gap-2 rounded-lg border border-black/10 dark:border-white/15 bg-background px-3 py-2 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5"
          >
            Edit Track
          </button>
        </div>
      </aside>

      {/* Main panel */}
      <main className="min-h-screen p-4 md:p-8 md:col-span-2">
        {mode === "bug" && selectedBug && (
          <article className="mx-auto max-w-4xl">
            <header className="sticky top-0 z-10 -mx-4 md:mx-0 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/75 border-b border-black/10 dark:border-white/10 px-4 md:px-0 py-4">
              <h1 className="text-2xl md:text-3xl font-semibold leading-tight">
                {selectedBug.title}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <SeverityBadge level={selectedBug.severity} />
                <StatusBadge status={selectedBug.status} />
                <span className="ml-auto text-sm text-foreground/60">
                  ${selectedBug.rewardUsd.toLocaleString()} reward
                </span>
              </div>
            </header>

            {selectedBug.unlocked ? (
              <div className="mt-6">
                <p className="whitespace-pre-wrap leading-relaxed text-[15px] md:text-base">
                  {selectedBug.body}
                </p>
              </div>
            ) : (
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
            )}

            <div className="mt-8 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
              <button className="rounded-lg bg-zinc-900 text-white px-4 py-2 text-sm font-medium hover:opacity-90 dark:bg-white/10 dark:text-zinc-100">
                Accept
              </button>
              <button className="rounded-lg bg-rose-500 text-white px-4 py-2 text-sm font-medium hover:opacity-90">
                Reject
              </button>
              <button className="rounded-lg border border-black/10 dark:border-white/15 px-4 py-2 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5">
                Contact Hacker
              </button>
            </div>
          </article>
        )}

        {mode === "edit" && (
          <section className="mx-auto max-w-3xl">
            <header className="mb-6">
              <h2 className="text-2xl font-semibold">Edit Track</h2>
              <p className="text-sm text-foreground/60 mt-1">
                Update the short and long description for this bounty track.
              </p>
            </header>
            {blobId && (
              <div className="mb-4 rounded-lg border border-black/10 dark:border-white/10 bg-background p-3 text-sm">
                <span className="font-medium">Walrus Blob ID:</span>{" "}
                <span className="break-all">{blobId}</span>
              </div>
            )}
            {uploadError && (
              <div className="mb-4 rounded-lg border border-rose-500/25 bg-rose-500/10 p-3 text-sm text-rose-300">
                {uploadError}
              </div>
            )}
            <form
              className="space-y-5"
              onSubmit={e => {
                e.preventDefault();
                const form = e.currentTarget as HTMLFormElement;
                const fd = new FormData(form);
                const title = String(fd.get("title") ?? "").trim();
                const description = String(fd.get("description") ?? "").trim();
                if (!title || !description) return;
                const payload = {
                  id:
                    selectedTrackId === "all"
                      ? `t${Date.now()}`
                      : selectedTrackId,
                  companyId: selectedCompanyId,
                  name: title,
                  description,
                };

                (async () => {
                  try {
                    setUploading(true);
                    setUploadError(null);
                    setBlobId(null);
                    const res = await uploadBlob(
                      JSON.stringify(payload),
                      10,
                      undefined,
                      undefined,
                      "application/json; charset=utf-8"
                    );
                    let id: string | null = null;
                    if (typeof res === "string") {
                      id = res.trim();
                    } else if (res && typeof res === "object") {
                      const o = res as Record<string, unknown>;
                      const newlyCreated = o["newlyCreated"];
                      if (newlyCreated && typeof newlyCreated === "object") {
                        const blobObject = (newlyCreated as Record<string, unknown>)["blobObject"];
                        if (blobObject && typeof blobObject === "object") {
                          const inner = (blobObject as Record<string, unknown>)["blobId"];
                          if (typeof inner === "string") id = inner;
                        }
                      }
                      if (!id) {
                        const direct = o["blob_id"] ?? o["blobId"] ?? o["id"];
                        if (typeof direct === "string") id = direct as string;
                      }
                    }
                    if (!id) throw new Error("Upload did not return a blob ID");
                    setBlobId(id);

                    // If creating a new track, add it locally
                    setTracks(prev => {
                      const exists = prev.some(t => t.id === payload.id);
                      if (exists) return prev.map(t => (t.id === payload.id ? { ...t, name: payload.name } : t));
                      return [...prev, { id: payload.id, companyId: payload.companyId, name: payload.name }];
                    });
                    setSelectedTrackId(payload.id);
                  } catch (err: unknown) {
                    const message = err instanceof Error ? err.message : "Failed to store blob";
                    setUploadError(message);
                  } finally {
                    setUploading(false);
                  }
                })();
              }}
            >
              <div className="grid gap-2">
                <label className="text-sm font-medium">Title</label>
                <input
                  name="title"
                  required
                  defaultValue={`${
                    COMPANIES.find(c => c.id === selectedCompanyId)?.name
                  } — ${
                    selectedTrackId === "all"
                      ? "General"
                      : companyTracks.find(t => t.id === selectedTrackId)?.name
                  }`}
                  className="rounded-lg border border-black/10 dark:border-white/15 bg-background px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Long description</label>
                <textarea
                  name="description"
                  required
                  rows={8}
                  defaultValue={
                    "Describe the scope, impact expectations, and out-of-scope areas. Use markdown for clarity."
                  }
                  className="rounded-lg border border-black/10 dark:border-white/15 bg-background px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={uploading}
                  className="rounded-lg bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90 disabled:opacity-60"
                >
                  {uploading ? "Uploading…" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => setMode("bug")}
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
