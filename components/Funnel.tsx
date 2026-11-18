"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import AdSlot from "./AdSlot";
import PdfCard from "./PdfCard";
import { PROCESSING_MS } from "@/lib/ads";
import { SITE } from "@/lib/site";
import { downloadPdf, type PdfReport } from "@/lib/pdf";
import { useIsEmbed } from "./Embed";

type Stage = "input" | "processing" | "result";

/** State machine for the 3-step funnel: input → processing → result. */
export function useFunnel<R>() {
  const [stage, setStage] = useState<Stage>("input");
  const [result, setResult] = useState<R | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback((validate: () => string | null, compute: () => R) => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    setResult(compute()); // math is instant; the processing screen is presentation only
    setStage(PROCESSING_MS > 0 ? "processing" : "result");
  }, []);

  const finish = useCallback(() => setStage("result"), []);
  const reset = useCallback(() => setStage("input"), []);
  return { stage, result, error, run, finish, reset };
}

function ProcessingScreen({ steps, onDone }: { steps: string[]; onDone: () => void }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const per = PROCESSING_MS / steps.length;
    const timers = steps.map((_, k) => setTimeout(() => setI(k), per * k));
    const done = setTimeout(onDone, PROCESSING_MS);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(done);
    };
  }, [steps, onDone]);

  return (
    <div className="space-y-5 py-4" role="status" aria-live="polite">
      <div className="h-2 w-full overflow-hidden rounded-full bg-concrete">
        <div className="h-full rounded-full bg-safety animate-[fill_var(--d)_linear_forwards]" style={{ ["--d" as string]: `${PROCESSING_MS}ms` }} />
      </div>
      <ul className="space-y-2 font-mono text-sm">
        {steps.map((s, k) => (
          <li key={s} className={k < i ? "text-steel" : k === i ? "text-ink" : "text-steel/40"}>
            {k < i ? "✓" : k === i ? "›" : "·"} {s}
          </li>
        ))}
      </ul>
      <AdSlot id="processing" />
    </div>
  );
}

export type SummaryRow = [label: string, value: string];
export type NextStep = { title: string; text: string; href: string; cta: string };

export default function Funnel({
  toolName,
  steps,
  stage,
  onFinish,
  onReset,
  input,
  result,
  inputSummary,
  slug,
  report,
  nextStep,
}: {
  nextStep?: () => NextStep | null;
  slug: string;
  report: () => PdfReport | null;
  toolName: string;
  steps: string[];
  stage: Stage;
  onFinish: () => void;
  onReset: () => void;
  input: ReactNode;
  result: ReactNode;
  inputSummary: SummaryRow[];
}) {
  const top = useRef<HTMLDivElement>(null);
  const embed = useIsEmbed();
  const [pdfKey, setPdfKey] = useState(0);
  const [card, setCard] = useState<null | "working" | "done" | "error">(null);

  useEffect(() => {
    if (stage !== "input") top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (stage === "input") setCard(null);
  }, [stage]);

  const onPdf = async () => {
    setPdfKey((k) => k + 1); // re-mount the existing slot: fresh impression
    setCard("working"); // slide-in card appears immediately
    const data = report();
    try {
      if (!data) throw new Error("no result");
      await downloadPdf(toolName, slug, inputSummary, data);
      setCard("done");
    } catch {
      setCard("error");
      window.print(); // fallback: browser "Save as PDF"
    }
  };

  return (
    <div ref={top} className="scroll-mt-4">
      <div className="rounded-lg border border-line bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-line px-5 py-3 font-mono text-xs uppercase tracking-wider text-steel print:hidden">
          <StepDot n={1} label="Enter" active={stage === "input"} done={stage !== "input"} />
          <span className="h-px flex-1 bg-line" />
          <StepDot n={2} label="Calculate" active={stage === "processing"} done={stage === "result"} />
          <span className="h-px flex-1 bg-line" />
          <StepDot n={3} label="Results" active={stage === "result"} done={false} />
        </div>

        <div className="p-5 sm:p-6">
          {stage === "input" && input}
          {stage === "processing" && <ProcessingScreen steps={steps} onDone={onFinish} />}
          {stage === "result" && (
            <div className="space-y-6">
              <AdSlot id="result-top" />
              <div className="print-area space-y-6">
                <div className="hidden print:block">
                  <div className="text-xl font-bold">{toolName}: Material Report</div>
                  <div className="text-sm text-steel">
                    {SITE.url.replace("https://", "")} · {new Date().toLocaleDateString("en-US")}
                  </div>
                  <table className="mt-3 text-sm">
                    <tbody>
                      {inputSummary.map(([k, v]) => (
                        <tr key={k}>
                          <td className="pr-6 text-steel">{k}</td>
                          <td className="font-mono">{v}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {result}
                <p className="hidden text-xs text-steel print:block">
                  Estimate only. Confirm footing sizes, depths and reinforcement with your local building department or a licensed engineer.
                </p>
              </div>
              <div className="flex flex-col gap-3 border-t border-line pt-5 sm:flex-row print:hidden">
                <button onClick={onPdf} disabled={card === "working"} className="btn-primary flex-1 disabled:opacity-70">
                  {card === "working" ? "Preparing PDF…" : "⬇ Download PDF Report"}
                </button>
                <button onClick={onReset} className="btn-secondary">
                  ← Edit inputs
                </button>
              </div>
              {card && <PdfCard status={card} onClose={() => setCard(null)} />}
              {(() => {
                const ns = nextStep?.();
                return ns ? (
                  <Link
                    href={embed ? `${SITE.url}${ns.href}` : ns.href}
                    target={embed ? "_blank" : undefined}
                    className="group flex flex-col gap-3 rounded-lg border-2 border-ink bg-ink p-4 text-white transition hover:bg-[#23272d] sm:flex-row sm:items-center print:hidden"
                  >
                    <div className="flex-1">
                      <div className="text-[11px] font-bold uppercase tracking-widest text-safety">Next step</div>
                      <div className="text-lg font-bold">{ns.title}</div>
                      <div className="text-sm text-white/70">{ns.text}</div>
                    </div>
                    <span className="btn-primary whitespace-nowrap px-4 py-2 text-sm">{ns.cta} →</span>
                  </Link>
                ) : null;
              })()}
              <AdSlot key={pdfKey} id="result-pdf" />
            </div>
          )}
        </div>
      </div>
      {stage === "input" && <AdSlot id="input-below" className="mt-6" />}
    </div>
  );
}

function StepDot({ n, label, active, done }: { n: number; label: string; active: boolean; done: boolean }) {
  return (
    <span className={`flex items-center gap-1.5 ${active ? "text-ink" : ""}`}>
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
          active ? "bg-safety text-ink" : done ? "bg-ink text-white" : "bg-concrete text-steel"
        }`}
      >
        {done ? "✓" : n}
      </span>
      <span className="hidden sm:inline">{label}</span>
    </span>
  );
}
