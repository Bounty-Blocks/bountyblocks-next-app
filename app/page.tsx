"use client";

import { useState } from "react";
import HackerPage from "./hacker/hacker";
import SponsorPage from "./sponsor/sponsor";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"hacker" | "sponsor">("hacker");

  return (
    <div className="min-h-screen w-full">
      <nav className="sticky top-0 z-20 border-b border-black/10 dark:border-white/10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center gap-3">
            <div className="text-sm font-semibold">BountyBlocks</div>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={() => setActiveTab("hacker")}
                className={`rounded-full px-3 py-1.5 text-sm ring-1 ring-inset transition ${
                  activeTab === "hacker"
                    ? "bg-foreground text-background ring-foreground"
                    : "bg-transparent text-foreground/80 ring-black/15 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                Hacker
              </button>
              <button
                onClick={() => setActiveTab("sponsor")}
                className={`rounded-full px-3 py-1.5 text-sm ring-1 ring-inset transition ${
                  activeTab === "sponsor"
                    ? "bg-foreground text-background ring-foreground"
                    : "bg-transparent text-foreground/80 ring-black/15 dark:ring-white/15 hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                Sponsor
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main>
        {activeTab === "hacker" ? <HackerPage /> : <SponsorPage />}
      </main>
    </div>
  );
}
