"use client";

import { useEffect, useState } from "react";
import HackerPage from "./hacker/hacker";
import SponsorPage from "./sponsor/sponsor";
import WalrusPage from "./walrus/walrus";
import {
  fcl,
  getAccountPublicKeys,
  callCadenceScript,
  callCadenceTransaction,
  callCadenceTransactionWithPrepare,
} from "./flow";

// Narrow type for FCL current user snapshot used by this page
type FlowUserSnapshot = {
  addr?: string | null;
  loggedIn?: boolean;
  publicKeys?: {
    keyId: number;
    publicKeyHex: string;
    signAlgo: string;
    hashAlgo: string;
    weight: number;
    sequenceNumber: number;
  }[];
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<"hacker" | "sponsor" | "walrus">(
    "hacker"
  );
  const [flowUser, setFlowUser] = useState<FlowUserSnapshot | null>(null);

  useEffect(() => {
    const unsubscribe = fcl.currentUser.subscribe(
      (user: FlowUserSnapshot | null) => {
        setFlowUser(user);
        if (user?.addr) {
          getAccountPublicKeys(user.addr).then((keys) => {
            console.log(keys);
            setFlowUser((user) => ({ ...user, publicKeys: keys }));
            callCadenceTransactionWithPrepare().then((response) => {
              console.log(response);
            });
          });
        }
      }
    );
    return () => unsubscribe();
  }, []);

  const connectFlowWallet = async () => {
    try {
      await fcl.authenticate();
    } catch (error) {
      console.error("Flow wallet connection failed:", error);
    }
  };

  return (
    <div className="relative min-h-screen w-full">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(65%_35%_at_50%_-10%,rgba(88,101,242,0.15),transparent_60%)] dark:bg-[radial-gradient(65%_35%_at_50%_-10%,rgba(88,101,242,0.25),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,transparent,rgba(0,0,0,0.06))] dark:bg-[linear-gradient(to_bottom,transparent,transparent,rgba(0,0,0,0.35))]" />
      </div>

      <nav className="sticky top-0 z-20 border-b border-white/10 bg-white/40 backdrop-blur supports-[backdrop-filter]:bg-white/30 dark:border-white/10 dark:bg-white/5">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center gap-3">
            <div className="text-sm font-semibold">BountyBlocks</div>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => setActiveTab("hacker")}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm ring-1 transition hover:shadow-[0_8px_24px_-18px_rgba(0,0,0,0.35)] dark:hover:shadow-[0_8px_24px_-16px_rgba(0,0,0,0.6)] ${
                  activeTab === "hacker"
                    ? "bg-zinc-900 text-white ring-zinc-800 dark:bg-white/10 dark:text-zinc-100 dark:ring-white/10"
                    : "text-zinc-900 ring-zinc-200 backdrop-blur hover:bg-white/70 dark:text-zinc-100 dark:ring-white/10 dark:hover:bg-white/10"
                }`}
              >
                Hacker
              </button>
              <button
                onClick={() => setActiveTab("sponsor")}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm ring-1 transition hover:shadow-[0_8px_24px_-18px_rgba(0,0,0,0.35)] dark:hover:shadow-[0_8px_24px_-16px_rgba(0,0,0,0.6)] ${
                  activeTab === "sponsor"
                    ? "bg-zinc-900 text-white ring-zinc-800 dark:bg-white/10 dark:text-zinc-100 dark:ring-white/10"
                    : "text-zinc-900 ring-zinc-200 backdrop-blur hover:bg-white/70 dark:text-zinc-100 dark:ring-white/10 dark:hover:bg-white/10"
                }`}
              >
                Sponsor
              </button>
              <button
                onClick={() => setActiveTab("walrus")}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm ring-1 transition hover:shadow-[0_8px_24px_-18px_rgba(0,0,0,0.35)] dark:hover:shadow-[0_8px_24px_-16px_rgba(0,0,0,0.6)] ${
                  activeTab === "walrus"
                    ? "bg-zinc-900 text-white ring-zinc-800 dark:bg-white/10 dark:text-zinc-100 dark:ring-white/10"
                    : "text-zinc-900 ring-zinc-200 backdrop-blur hover:bg-white/70 dark:text-zinc-100 dark:ring-white/10 dark:hover:bg-white/10"
                }`}
              >
                Walrus
              </button>
              {/* Flow wallet connection button */}
              <button
                onClick={connectFlowWallet}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm ring-1 transition hover:shadow-sm ${
                  flowUser?.addr
                    ? "border border-zinc-200/60 bg-white/60 text-zinc-900 ring-black/5 backdrop-blur dark:border-white/10 dark:bg-white/[0.06] dark:text-zinc-100 dark:ring-white/10"
                    : "bg-zinc-900 text-white ring-zinc-800 hover:bg-zinc-800 dark:bg-white/10 dark:text-zinc-100 dark:ring-white/10"
                }`}
              >
                {flowUser?.addr ? (
                  <>
                    <span className="relative inline-flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-60 animate-ping"></span>
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-white/80"></span>
                    </span>
                    <span>{`Connected: ${flowUser.addr.slice(
                      0,
                      6
                    )}...${flowUser.addr.slice(-4)}`}</span>
                  </>
                ) : (
                  <>
                    <span className="inline-flex h-2 w-2 rounded-full bg-gray-300"></span>
                    <span>Connect Flow Wallet</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="bg-transparent">
        {activeTab === "hacker" ? (
          <HackerPage />
        ) : activeTab === "sponsor" ? (
          <SponsorPage />
        ) : (
          <WalrusPage />
        )}
      </main>
    </div>
  );
}
