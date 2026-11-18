// Client-side PDF report. jsPDF is loaded only when the button is clicked.
import { SITE } from "./site";

export type PdfTable = { title: string; head?: string[]; rows: string[][] };
export type PdfReport = {
  stats: [label: string, value: string][];
  tables: PdfTable[];
  notes: string[];
};

// jsPDF's built-in Helvetica only covers Latin-1; swap the few symbols we use.
const clean = (s: string) =>
  s
    .replace(/≈/g, "~")
    .replace(/[⚠→←⬇✓›·]/g, "")
    .replace(/–|—/g, "-")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .trim();

export async function downloadPdf(toolName: string, slug: string, inputs: [string, string][], report: PdfReport) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "letter" }); // US Letter
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 48;
  let y = M;

  const ensure = (h: number) => {
    if (y + h > H - M - 20) {
      doc.addPage();
      y = M;
    }
  };

  // Header band
  doc.setFillColor(22, 25, 29);
  doc.rect(0, 0, W, 64, "F");
  doc.setFillColor(245, 163, 0);
  doc.rect(0, 64, W, 4, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(clean(`${toolName}: Material Report`), M, 38);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`${SITE.url.replace("https://", "")}  |  ${new Date().toLocaleDateString("en-US")}`, W - M, 38, { align: "right" });
  y = 96;
  doc.setTextColor(22, 25, 29);

  const section = (t: string) => {
    ensure(30);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(74, 82, 92);
    doc.text(t.toUpperCase(), M, y);
    y += 6;
    doc.setDrawColor(214, 211, 205);
    doc.line(M, y, W - M, y);
    y += 14;
    doc.setTextColor(22, 25, 29);
  };

  const kv = (rows: [string, string][]) => {
    doc.setFontSize(10);
    for (const [k, v] of rows) {
      ensure(16);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(74, 82, 92);
      doc.text(clean(k), M, y);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(22, 25, 29);
      doc.text(clean(v), W - M, y, { align: "right" });
      y += 16;
    }
    y += 8;
  };

  section("Your inputs");
  kv(inputs);

  // Headline stat boxes
  section("Results");
  const cols = Math.min(4, report.stats.length);
  const bw = (W - 2 * M - (cols - 1) * 10) / cols;
  report.stats.forEach(([label, value], i) => {
    const col = i % cols;
    if (col === 0 && i > 0) y += 62;
    ensure(56);
    const x = M + col * (bw + 10);
    if (i === 0) {
      doc.setFillColor(254, 244, 222);
      doc.setDrawColor(245, 163, 0);
    } else {
      doc.setFillColor(246, 245, 242);
      doc.setDrawColor(214, 211, 205);
    }
    doc.roundedRect(x, y, bw, 52, 4, 4, "FD");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(74, 82, 92);
    doc.text(clean(label).toUpperCase(), x + 8, y + 15);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(22, 25, 29);
    doc.text(clean(value), x + 8, y + 38, { maxWidth: bw - 16 });
  });
  y += 72;

  for (const t of report.tables) {
    section(t.title);
    doc.setFontSize(10);
    const n = (t.head ?? t.rows[0]).length;
    const colX = (c: number) => (c === 0 ? M : M + ((W - 2 * M) * (c + 1)) / n);
    if (t.head) {
      doc.setFont("helvetica", "bold");
      doc.setTextColor(74, 82, 92);
      t.head.forEach((h, c) => doc.text(clean(h), colX(c), y, c === 0 ? undefined : { align: "right" }));
      y += 16;
    }
    doc.setTextColor(22, 25, 29);
    for (const row of t.rows) {
      ensure(16);
      doc.setFont("helvetica", "normal");
      row.forEach((cell, c) => {
        if (n === 2 && c === 1) doc.setFont("helvetica", "bold");
        doc.text(clean(cell), colX(c), y, c === 0 ? { maxWidth: (W - 2 * M) * 0.6 } : { align: "right" });
      });
      y += 16;
    }
    y += 10;
  }

  if (report.notes.length) {
    section("Notes");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    for (const note of report.notes) {
      const lines = doc.splitTextToSize(`- ${clean(note)}`, W - 2 * M);
      ensure(lines.length * 12);
      doc.text(lines, M, y);
      y += lines.length * 12 + 4;
    }
  }

  // Footer on every page
  const pages = doc.getNumberOfPages();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120, 126, 134);
    doc.text(
      "Estimate only. Confirm footing sizes, depths and reinforcement with your local building department or a licensed engineer.",
      M,
      H - 30,
    );
    doc.text(`Free calculator: ${SITE.url.replace("https://", "")}`, W - M, H - 18, { align: "right" });
  }

  doc.save(`${slug}-report-${new Date().toISOString().slice(0, 10)}.pdf`);
}
