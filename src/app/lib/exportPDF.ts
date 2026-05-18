import { jsPDF } from "jspdf";
import type { AnalysisResult } from "../types";

// Helper to convert dynamic image sources to PNG/JPEG Base64
async function getBase64FromUrl(url: string): Promise<string> {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function exportReportAsPDF(
  result: AnalysisResult,
  imageSrc: string
) {
  try {
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // 1. Draw solid dark professional background
    pdf.setFillColor(6, 10, 18); // Elegant deep-navy background
    pdf.rect(0, 0, pageWidth, pageHeight, "F");

    // 2. Draw border frame
    pdf.setDrawColor(0, 229, 255); // Neon Cyan border
    pdf.setLineWidth(0.4);
    pdf.rect(8, 8, pageWidth - 16, pageHeight - 16);

    // 3. Draw Header Title Block
    pdf.setFillColor(12, 20, 36);
    pdf.rect(8, 8, pageWidth - 16, 25, "F");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(16);
    pdf.setTextColor(0, 255, 136); // Emerald Green
    pdf.text("PUBLIC SAFETY ASSESSMENT REPORT", pageWidth / 2, 17, { align: "center" });

    pdf.setFont("courier", "bold");
    pdf.setFontSize(8);
    pdf.setTextColor(0, 229, 255);
    pdf.text(`REFERENCE ID: ${result.targetId}  |  STATUS: COMPLETE  |  ${new Date().toUTCString()}`, pageWidth / 2, 25, { align: "center" });

    // 4. Target Image Block
    let y = 38;
    try {
      if (imageSrc) {
        const base64Img = imageSrc.startsWith("data:") ? imageSrc : await getBase64FromUrl(imageSrc);
        const imgWidth = 70;
        const imgHeight = 50;
        const imgX = (pageWidth - imgWidth) / 2;

        // Image container background
        pdf.setFillColor(15, 23, 42);
        pdf.rect(imgX - 2, y - 2, imgWidth + 4, imgHeight + 4, "F");
        pdf.setDrawColor(0, 255, 136);
        pdf.setLineWidth(0.3);
        pdf.rect(imgX - 2, y - 2, imgWidth + 4, imgHeight + 4, "S");

        // Add actual target image
        pdf.addImage(base64Img, "JPEG", imgX, y, imgWidth, imgHeight);
        y += imgHeight + 10;
      }
    } catch (err) {
      console.error("PDF image injection error:", err);
      y += 10; // Fallback spacing
    }

    // 5. Info Grid Card (Expanded to show Origin, Safety Standoff Radius, RCS)
    pdf.setFillColor(15, 23, 42);
    pdf.rect(12, y, pageWidth - 24, 38, "F");
    pdf.setDrawColor(255, 255, 255, 0.05);
    pdf.rect(12, y, pageWidth - 24, 38, "S");

    // Grid columns row 1
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.setTextColor(150, 160, 180);
    pdf.text("CLASSIFICATION", 18, y + 8);
    pdf.text("ACCURACY INDEX", 90, y + 8);
    pdf.text("THREAT RATING", 145, y + 8);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(10);
    pdf.setTextColor(255, 255, 255);
    pdf.text(result.classification, 18, y + 15);
    pdf.text(result.confidence, 90, y + 15);

    // Threat label colored
    const tColor = result.threatLevel === "CRITICAL" || result.threatLevel === "HIGH" ? [255, 68, 68] : [0, 255, 136];
    pdf.setTextColor(tColor[0], tColor[1], tColor[2]);
    pdf.text(result.threatLevel, 145, y + 15);

    // Grid row 2 (New fields)
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.setTextColor(150, 160, 180);
    pdf.text("ORIGIN MATRIX", 18, y + 24);
    pdf.text("STANDOFF RADIUS", 90, y + 24);
    pdf.text("RADAR PROFILE", 145, y + 24);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9.5);
    pdf.setTextColor(230, 235, 245);
    pdf.text(result.origin || "Unknown", 18, y + 31);
    pdf.text(result.safetyRadius || "0 meters - Safe", 90, y + 31);
    pdf.text(result.radarCrossSection || "N/A", 145, y + 31);

    y += 46;

    // 6. Detailed Assessment Paragraph
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.setTextColor(0, 229, 255);
    pdf.text("DIAGNOSTIC ANALYSIS SUMMARY", 12, y);
    pdf.setDrawColor(0, 229, 255, 0.2);
    pdf.line(12, y + 2, pageWidth - 12, y + 2);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(220, 225, 235);
    const descLines = pdf.splitTextToSize(result.description, pageWidth - 24);
    pdf.text(descLines, 12, y + 8);

    y += 8 + descLines.length * 5 + 8;

    // 7. Potential & Capabilities Card (New detail card in PDF)
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.setTextColor(255, 136, 0); // Orange title
    pdf.text("POTENTIAL HAZARDS & CAPABILITIES", 12, y);
    pdf.setDrawColor(255, 136, 0, 0.2);
    pdf.line(12, y + 2, pageWidth - 12, y + 2);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9.5);
    pdf.setTextColor(220, 225, 235);
    const potentialText = result.potential || "No significant utility hazards or anomalous capabilities detected.";
    const potLines = pdf.splitTextToSize(potentialText, pageWidth - 24);
    pdf.text(potLines, 12, y + 8);

    y += 8 + potLines.length * 5 + 8;

    // 8. Safety Action Directives
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.setTextColor(0, 255, 136);
    pdf.text("PUBLIC SAFETY ACTION DIRECTIVES", 12, y);
    pdf.setDrawColor(0, 255, 136, 0.2);
    pdf.line(12, y + 2, pageWidth - 12, y + 2);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9.5);
    pdf.setTextColor(210, 215, 225);
    const recommendationText = result.recommendations || "Maintain typical situational readiness and monitor local channels.";
    const recLines = pdf.splitTextToSize(`Recommendation: ${recommendationText}`, pageWidth - 24);
    pdf.text(recLines, 12, y + 8);

    y += 8 + recLines.length * 5 + 6;

    // Directives list
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(9);
    pdf.setTextColor(255, 255, 255);
    pdf.text("✓ Keep secure observation distance from anomalies", 15, y);
    pdf.text("✓ Avoid direct containment attempts; report to dispatch", 15, y + 5);
    pdf.text("✓ In urgent situations, dial local emergency lines (911 / 112)", 15, y + 10);

    y += 20;

    // 9. Signatures Block
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8);
    pdf.setTextColor(150, 160, 180);
    pdf.text("OPERATIONAL SIGNATURE REGISTER", 12, y);
    pdf.setDrawColor(255, 255, 255, 0.05);
    pdf.line(12, y + 2, pageWidth - 12, y + 2);

    let sigY = y + 8;
    result.signatures.forEach((sig) => {
      pdf.setFont("courier", "bold");
      pdf.setFontSize(8.5);
      pdf.setTextColor(180, 190, 200);
      pdf.text(`> ${sig.name.padEnd(20, " ")}: ${sig.status}`, 16, sigY);
      sigY += 5.5;
    });

    // 10. Footer Brand Block
    pdf.setFillColor(12, 20, 36);
    pdf.rect(8, pageHeight - 17, pageWidth - 16, 9, "F");

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7);
    pdf.setTextColor(0, 255, 136);
    pdf.text("PUBLIC THREAT CLASSIFIER • CERTIFIED SECURE OSINT NETWORK", pageWidth / 2, pageHeight - 11, { align: "center" });

    pdf.save(`Safety-Assessment-Report-${result.targetId}.pdf`);
  } catch (err) {
    console.error("PDF generation failed:", err);
  }
}
