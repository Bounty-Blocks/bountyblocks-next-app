"use client";

import { useEffect, useMemo, useState } from "react";

// Ethereum provider minimal types (no `any`)
type EthereumRequestArgs = { method: string; params?: unknown[] | Record<string, unknown> };
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
    title: "Reflected XSS in project search results can escalate to account takeover",
    severity: "high",
    rewardUsd: 2500,
    status: "triaging",
    body:
      "When the query parameter `q` is not sanitized, an attacker can inject a payload that executes in the victim's browser. The vector is present on the search results page for unauthenticated users, which increases exposure. Steps to reproduce: 1) Visit /search?q=%3Cscript%3Ealert(1)%3C/script%3E 2) Observe execution. Recommended fix: Encode user input and use a strict CSP.",
  },
  {
    id: "b2",
    companyId: "adobe",
    trackId: "api",
    title: "Rate-limit bypass leads to mass enumeration of user emails",
    severity: "medium",
    rewardUsd: 800,
    status: "reported",
    body:
      "The /v1/users:lookup endpoint uses IP-based throttling, which can be bypassed with the X-Forwarded-For header. This allows an attacker to enumerate user emails by cycling header values. Recommend migrating to token-scoped rate limits and anomaly detection.",
  },
  {
    id: "b3",
    companyId: "consensys",
    trackId: "wallet",
    title: "Mnemonic leak via clipboard persistence on mobile share flow",
    severity: "critical",
    rewardUsd: 10000,
    status: "accepted",
    body:
      "Exporting wallet seed places the phrase into the system clipboard for longer than intended on Android 14, allowing other apps to read it. Use OS-secure share sheets and clear clipboard immediately after use.",
  },
  {
    id: "b4",
    companyId: "aave",
    trackId: "smart",
    title: "Rounding bug enables dust siphoning in interest accrual",
    severity: "low",
    rewardUsd: 300,
    status: "rejected",
    body:
      "Rounding at 18 decimals results in tiny leftover balances accumulating to the protocol over time. While economically negligible, the arithmetic can be tightened using mulDiv to minimize drift.",
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
    <span className={classNames("inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset", tone)}>
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
    <span className={classNames("inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset", tone)}>
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

    const onAccountsChanged = (...args: unknown[]) => handleAccountsChanged((args[0] as string[]) ?? []);
    const onChainChanged = (...args: unknown[]) => handleChainChanged(String(args[0] ?? ""));

    ethereum.request({ method: "eth_accounts" }).then((accs) => {
      const accounts = accs as string[];
      setAccount(accounts?.[0] ?? null);
    });
    ethereum.request({ method: "eth_chainId" }).then((id) => setChainId(id as string));

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
    const accs = (await ethereum.request({ method: "eth_requestAccounts" })) as string[];
    setAccount(accs?.[0] ?? null);
  };

  return (
    <div className="flex items-center gap-2">
      {account ? (
        <div className="flex items-center gap-2 rounded-full border border-black/10 dark:border-white/15 px-3 py-1.5">
          <span className="text-xs text-foreground/70">{chainId ? parseInt(chainId, 16) : "-"}</span>
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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="opacity-90"><path d="M12 5v14m-7-7h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          Connect Wallet
        </button>
      )}
    </div>
  );
}

export default function SponsorPage() {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(COMPANIES[0].id);
  const [selectedTrackId, setSelectedTrackId] = useState<string | "all">("all");
  const [selectedBugId, setSelectedBugId] = useState<string | null>(null);
  const [mode, setMode] = useState<"bug" | "edit">("bug");
  const [query, setQuery] = useState("");

  const companyTracks = useMemo(
    () => TRACKS.filter((t) => t.companyId === selectedCompanyId),
    [selectedCompanyId]
  );

  const filteredBugs = useMemo(() => {
    return BUGS.filter((b) => b.companyId === selectedCompanyId)
      .filter((b) => (selectedTrackId === "all" ? true : b.trackId === selectedTrackId))
      .filter((b) =>
        query.trim() ? (b.title + " " + b.body).toLowerCase().includes(query.toLowerCase()) : true
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
    () => filteredBugs.find((b) => b.id === selectedBugId) ?? null,
    [filteredBugs, selectedBugId]
  );

  return (
    <div className="min-h-screen w-full grid grid-cols-1 md:grid-cols-[320px_1fr]">
      {/* Sidebar */}
      <aside className="border-r border-black/10 dark:border-white/10 p-4 md:p-6 flex flex-col gap-4 md:gap-6 bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between">
          <h1 className="text-base md:text-lg font-semibold">Sponsor</h1>
          <WalletButton />
        </div>

        {/* Company select */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-foreground/60">Company</label>
          <div className="relative">
            <select
              value={selectedCompanyId}
              onChange={(e) => {
                setSelectedCompanyId(e.target.value);
                setSelectedTrackId("all");
                setSelectedBugId(null);
              }}
              className="w-full appearance-none rounded-lg border border-black/10 dark:border-white/15 bg-background px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
            >
              {COMPANIES.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-foreground/50">▾</span>
          </div>
        </div>

        {/* Track select */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-foreground/60">Track</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTrackId("all")}
              className={classNames(
                "rounded-full px-3 py-1.5 text-sm ring-1 ring-inset",
                selectedTrackId === "all"
                  ? "bg-foreground text-background ring-foreground"
                  : "bg-transparent text-foreground/80 ring-black/15 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5"
              )}
            >
              All
            </button>
            {companyTracks.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTrackId(t.id)}
                className={classNames(
                  "rounded-full px-3 py-1.5 text-sm ring-1 ring-inset",
                  selectedTrackId === t.id
                    ? "bg-foreground text-background ring-foreground"
                    : "bg-transparent text-foreground/80 ring-black/15 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5"
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
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search reported bugs…"
            className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-background pl-9 pr-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
          />
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/50"><path d="M21 21l-4.3-4.3M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        </div>

        {/* Reported bugs list */}
        <div className="flex-1 min-h-0">
          <h2 className="mb-2 text-xs font-medium uppercase tracking-wide text-foreground/60">Reported Bugs</h2>
          <div className="h-full overflow-auto rounded-lg border border-black/10 dark:border-white/10 divide-y divide-black/5 dark:divide-white/5">
            {filteredBugs.map((b) => (
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
                    <p className="truncate font-medium text-sm md:text-[15px]">{b.title}</p>
                    <SeverityBadge level={b.severity} />
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-xs text-foreground/60">${b.rewardUsd.toLocaleString()} reward</span>
                    <StatusBadge status={b.status} />
                  </div>
                </div>
              </button>
            ))}
            {filteredBugs.length === 0 && (
              <div className="p-6 text-sm text-foreground/60">No bugs found.</div>
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
      <main className="min-h-screen p-4 md:p-8">
        {mode === "bug" && selectedBug && (
          <article className="mx-auto max-w-4xl">
            <header className="sticky top-0 z-10 -mx-4 md:mx-0 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/75 border-b border-black/10 dark:border-white/10 px-4 md:px-0 py-4">
              <h1 className="text-2xl md:text-3xl font-semibold leading-tight">
                {selectedBug.title}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <SeverityBadge level={selectedBug.severity} />
                <StatusBadge status={selectedBug.status} />
                <span className="ml-auto text-sm text-foreground/60">${selectedBug.rewardUsd.toLocaleString()} reward</span>
              </div>
            </header>

            <div className="prose prose-slate dark:prose-invert max-w-none leading-relaxed">
              <h3 className="mt-6 text-base font-semibold text-foreground/80">Bug write-up</h3>
              <p className="mt-3 whitespace-pre-wrap text-[15px] md:text-base">
                {selectedBug.body}
              </p>
              <div className="mt-8 grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
                <button className="rounded-lg bg-emerald-500 text-white px-4 py-2 text-sm font-medium hover:opacity-90">Accept</button>
                <button className="rounded-lg bg-rose-500 text-white px-4 py-2 text-sm font-medium hover:opacity-90">Reject</button>
                <button className="rounded-lg border border-black/10 dark:border-white/15 px-4 py-2 text-sm font-medium hover:bg-black/5 dark:hover:bg-white/5">Contact Hacker</button>
              </div>
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
            <form
              className="space-y-5"
              onSubmit={(e) => {
                e.preventDefault();
                setMode("bug");
              }}
            >
              <div className="grid gap-2">
                <label className="text-sm font-medium">Title</label>
                <input
                  defaultValue={`${COMPANIES.find((c) => c.id === selectedCompanyId)?.name} — ${selectedTrackId === "all" ? "General" : companyTracks.find((t) => t.id === selectedTrackId)?.name}`}
                  className="rounded-lg border border-black/10 dark:border-white/15 bg-background px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Long description</label>
                <textarea
                  rows={8}
                  defaultValue={
                    "Describe the scope, impact expectations, and out-of-scope areas. Use markdown for clarity."
                  }
                  className="rounded-lg border border-black/10 dark:border-white/15 bg-background px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
                />
              </div>
              <div className="flex items-center gap-3">
                <button type="submit" className="rounded-lg bg-foreground text-background px-4 py-2 text-sm font-medium hover:opacity-90">
                  Save
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