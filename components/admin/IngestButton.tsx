// components/admin/IngestButton.tsx
"use client";
import { useState } from "react";
export function IngestButton() {
  const [state, setState] = useState<"idle"|"running"|"done">("idle");
  const [result, setResult] = useState("");
  async function run() {
    setState("running");
    try {
      const res = await fetch("/api/ingest");
      const d = await res.json();
      setResult(`✓ ${d.summary?.totalCreated ?? 0} new articles ingested`);
      setState("done");
      setTimeout(() => setState("idle"), 5000);
    } catch { setState("idle"); }
  }
  return (
    <div className="flex items-center gap-3">
      {result && state === "done" && <span className="text-sm text-emerald-400">{result}</span>}
      <button onClick={run} disabled={state==="running"}
        className="inline-flex items-center gap-2 border border-border text-sm font-semibold px-4 py-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-60">
        {state==="running" ? <><span className="w-4 h-4 border-2 border-border border-t-foreground rounded-full animate-spin"/>Ingesting…</> : "⟳ Ingest RSS"}
      </button>
    </div>
  );
}
