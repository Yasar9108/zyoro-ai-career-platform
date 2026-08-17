const fs = require("fs");
const path = require("path");
const { Writable } = require("stream");
const PDFDocument = require("pdfkit");

const LOG_TAG = "(aiResumePdf.service)=>";

// ==========================
// Layout constants
// ==========================
const PAGE_MARGIN = 36;
const FONT = "Times-Roman";
const FONT_BOLD = "Times-Bold";
const FONT_ITALIC = "Times-Italic";
const COLOR_TEXT = "#000000";
const COLOR_LINE = "#000000";
const A4_HEIGHT = 841.89;
const PAGE_BOTTOM = A4_HEIGHT - PAGE_MARGIN;

// Absolute floor for readability — below this, text stops looking like a
// real resume. We shrink down to this before we ever remove a bullet.
const MIN_BODY_FONT = 7.8;

function estimateContentLength(optimizedResume) {
  let len = 0;
  len += (optimizedResume.summary || "").length;
  len += (optimizedResume.skills || []).join(", ").length;

  (optimizedResume.experience || []).forEach((e) => {
    len += (e.role || "").length + (e.company || "").length;
    (e.description || []).forEach((d) => (len += d.length));
  });

  (optimizedResume.projects || []).forEach((p) => {
    len += (p.title || "").length;
    (p.description || []).forEach((d) => (len += d.length));
  });

  len += (optimizedResume.certifications || []).join(" ").length;
  len += (optimizedResume.education || [])
    .map((e) => `${e.degree} ${e.college}`)
    .join(" ").length;

  return len;
}

// Base/starting scale — a STARTING POINT. The fit loop below adjusts it up
// (stretch) or down (shrink) to actually fit the page instead of guessing
// from character count alone.
function getScale(optimizedResume) {
  const len = estimateContentLength(optimizedResume);

  if (len > 2800) return { body: 8.5, heading: 10, name: 20, lineGap: 0.5, gapSm: 3, gapMd: 7 };
  if (len > 2200) return { body: 9, heading: 10.5, name: 22, lineGap: 0.75, gapSm: 4, gapMd: 8 };
  return { body: 9.5, heading: 11, name: 24, lineGap: 1, gapSm: 5, gapMd: 10 };
}

function shrinkScale(scale) {
  return {
    body: Math.max(scale.body - 0.3, MIN_BODY_FONT),
    heading: Math.max(scale.heading - 0.3, 9),
    name: Math.max(scale.name - 0.8, 16),
    lineGap: Math.max(scale.lineGap - 0.12, 0.15),
    gapSm: Math.max(scale.gapSm - 0.8, 1.5),
    gapMd: Math.max(scale.gapMd - 1.2, 3),
  };
}

function isAtFloor(scale) {
  return scale.body <= MIN_BODY_FONT;
}

function stretchScale(scale, leftover, sectionCount) {
  // Spread leftover whitespace across section gaps and line spacing
  // instead of dumping it all at the bottom of the page.
  const perGap = Math.min(leftover / Math.max(sectionCount, 1), 16);
  return {
    ...scale,
    gapMd: scale.gapMd + perGap,
    gapSm: scale.gapSm + perGap * 0.35,
    lineGap: Math.min(scale.lineGap + 0.25, 2.2),
  };
}

function countSections(optimizedResume) {
  let n = 0;
  if (optimizedResume.summary) n++;
  if ((optimizedResume.skills || []).length) n++;
  if ((optimizedResume.experience || []).length) n++;
  if ((optimizedResume.projects || []).length) n++;
  if ((optimizedResume.certifications || []).length) n++;
  if ((optimizedResume.education || []).length) n++;
  return n;
}

// ==========================
// Rendering primitives
// ==========================
function sectionHeading(doc, title, scale) {
  doc.fontSize(scale.heading).font(FONT_BOLD).fillColor(COLOR_TEXT).text(title.toUpperCase());

  const lineY = doc.y + 2;
  doc
    .moveTo(doc.page.margins.left, lineY)
    .lineTo(doc.page.width - doc.page.margins.right, lineY)
    .strokeColor(COLOR_LINE)
    .lineWidth(0.75)
    .stroke();

  doc.y = lineY + scale.gapSm;
  doc.x = doc.page.margins.left;
  doc.font(FONT).fontSize(scale.body);
}

function bulletList(doc, items, scale) {
  const bulletIndent = 11;
  const contentWidth = doc.page.width - doc.page.margins.right - doc.page.margins.left;

  items.forEach((point) => {
    const startX = doc.page.margins.left + 8;
    const y = doc.y;

    doc.fontSize(scale.body).font(FONT).fillColor(COLOR_TEXT);
    doc.text("•", startX, y, { width: bulletIndent });
    doc.text(point, startX + bulletIndent, y, {
      width: contentWidth - bulletIndent - 8,
      align: "justify",
      lineGap: scale.lineGap,
    });

    doc.y += 2;
    doc.x = doc.page.margins.left;
  });
}

function twoColumnLine(doc, leftText, rightText, leftFont, rightFont, size) {
  const leftX = doc.page.margins.left;
  const rightEdge = doc.page.width - doc.page.margins.right;
  const y = doc.y;

  doc.font(leftFont).fontSize(size).fillColor(COLOR_TEXT).text(leftText, leftX, y);
  const leftHeight = doc.y - y;

  if (rightText) {
    const rightWidth = doc.widthOfString(rightText);
    doc.font(rightFont).fontSize(size).text(rightText, rightEdge - rightWidth, y);
  }

  doc.y = y + leftHeight + 1;
  doc.x = doc.page.margins.left;
}

// ==========================
// Full body render — used for BOTH the invisible measure pass and the
// real output pass, so what we measure is exactly what we draw.
// No bullet slicing here — every point in optimizedResume gets rendered.
// ==========================
function renderResumeBody(doc, optimizedResume, scale) {
  const personalInfo = optimizedResume.personalInfo || {};

  // Header
  doc
    .fontSize(scale.name)
    .font(FONT_BOLD)
    .fillColor(COLOR_TEXT)
    .text((personalInfo.name || "CANDIDATE NAME").toUpperCase(), { align: "center" });

  doc.y += 3;

  const contactBits = [
    personalInfo.email,
    personalInfo.phone,
    personalInfo.linkedin ? "LinkedIn" : null,
    personalInfo.github ? "Github" : null,
  ].filter(Boolean);

  doc
    .fontSize(8.5)
    .font(FONT)
    .fillColor(COLOR_TEXT)
    .text(contactBits.join("     "), { align: "center" });

  doc.y += scale.gapMd;
  doc.x = doc.page.margins.left;

  // Professional Summary
  if (optimizedResume.summary) {
    sectionHeading(doc, "Professional Summary", scale);
    doc.text(optimizedResume.summary, { align: "justify", lineGap: scale.lineGap });
    doc.y += scale.gapMd;
    doc.x = doc.page.margins.left;
  }

  // Technical Skills
  if (optimizedResume.skills && optimizedResume.skills.length > 0) {
    sectionHeading(doc, "Technical Skills", scale);
    doc
      .font(FONT_BOLD)
      .fontSize(scale.body)
      .text("Skills: ", { continued: true })
      .font(FONT)
      .text(optimizedResume.skills.join(", "), { lineGap: scale.lineGap });
    doc.y += scale.gapMd;
    doc.x = doc.page.margins.left;
  }

  // Experience
  if (optimizedResume.experience && optimizedResume.experience.length > 0) {
    sectionHeading(doc, "Experience", scale);

    optimizedResume.experience.forEach((exp, idx) => {
      twoColumnLine(doc, exp.role || "", "", FONT_BOLD, FONT, scale.body + 0.3);
      twoColumnLine(
        doc,
        exp.company || "",
        exp.duration || "",
        FONT_ITALIC,
        FONT_ITALIC,
        scale.body - 0.3
      );
      doc.y += 2;

      if (Array.isArray(exp.description)) {
        bulletList(doc, exp.description, scale);
      }
      if (idx < optimizedResume.experience.length - 1) doc.y += scale.gapSm;
    });

    doc.y += scale.gapMd;
    doc.x = doc.page.margins.left;
  }

  // Projects
  if (optimizedResume.projects && optimizedResume.projects.length > 0) {
    sectionHeading(doc, "Projects", scale);

    optimizedResume.projects.forEach((project, idx) => {
      doc.font(FONT_BOLD).fontSize(scale.body + 0.3).text(project.title || "");
      doc.y += 1;
      doc.x = doc.page.margins.left;

      if (Array.isArray(project.description)) {
        bulletList(doc, project.description, scale);
      }

      if (project.tech) {
        const startX = doc.page.margins.left + 8;
        doc.font(FONT_BOLD).fontSize(scale.body).text("Tools Used: ", startX, doc.y, { continued: true });
        doc.font(FONT).text(project.tech);
        doc.x = doc.page.margins.left;
      }

      if (idx < optimizedResume.projects.length - 1) doc.y += scale.gapSm;
    });

    doc.y += scale.gapMd;
    doc.x = doc.page.margins.left;
  }

  // Certifications
  if (optimizedResume.certifications && optimizedResume.certifications.length > 0) {
    sectionHeading(doc, "Certifications", scale);
    bulletList(doc, optimizedResume.certifications, scale);
    doc.y += scale.gapMd;
    doc.x = doc.page.margins.left;
  }

  // Education
  if (optimizedResume.education && optimizedResume.education.length > 0) {
    sectionHeading(doc, "Education", scale);

    optimizedResume.education.forEach((edu, idx) => {
      twoColumnLine(doc, edu.college || "", edu.year || "", FONT_BOLD, FONT_ITALIC, scale.body + 0.3);
      twoColumnLine(doc, edu.degree || "", "", FONT_ITALIC, FONT, scale.body - 0.3);
      if (idx < optimizedResume.education.length - 1) doc.y += scale.gapSm;
    });
  }

  return doc.y;
}

// A stream that just swallows bytes — used to render a "throwaway" PDF
// purely to measure layout height, without touching the filesystem.
function nullStream() {
  return new Writable({ write(_chunk, _enc, cb) { cb(); } });
}

// Renders once in-memory to find (a) whether content overflows page 1,
// and (b) how much blank space is left if it doesn't.
function measureLayout(optimizedResume, scale) {
  return new Promise((resolve) => {
    const measureDoc = new PDFDocument({ size: "A4", margin: PAGE_MARGIN, bufferPages: true });
    measureDoc.pipe(nullStream());
    const finalY = renderResumeBody(measureDoc, optimizedResume, scale);
    const pageCount = measureDoc.bufferedPageRange().count;
    measureDoc.end();
    resolve({ finalY, pageCount });
  });
}

// Removes exactly one bullet — the LAST (least important, since the AI is
// prompted to order by impact) bullet from whichever section currently has
// the most bullets. Returns null if there's nothing left safe to trim
// (every section already down to 1 bullet). Never mutates the input.
function trimOneLeastImportantBullet(optimizedResume) {
  const clone = JSON.parse(JSON.stringify(optimizedResume));
  let target = null;
  let maxLen = 1; // never trim a section down to 0 bullets

  (clone.experience || []).forEach((e) => {
    if (Array.isArray(e.description) && e.description.length > maxLen) {
      maxLen = e.description.length;
      target = e.description;
    }
  });
  (clone.projects || []).forEach((p) => {
    if (Array.isArray(p.description) && p.description.length > maxLen) {
      maxLen = p.description.length;
      target = p.description;
    }
  });

  if (!target) return null;
  target.pop();
  return clone;
}

// Tries to fit ALL content by shrinking font/spacing first. Only if it still
// doesn't fit at the minimum readable font does it fall back to trimming one
// bullet at a time (from the longest section) and retrying.
async function fitContentToPage(optimizedResume) {
  let resume = optimizedResume;
  const MAX_TRIM_ATTEMPTS = 8;

  for (let trimAttempt = 0; trimAttempt <= MAX_TRIM_ATTEMPTS; trimAttempt++) {
    let scale = getScale(resume);
    const sectionCount = countSections(resume);
    let fitsAtSomeScale = false;

    // Shrink loop: keep shrinking until it fits on one page, or we hit the
    // readability floor.
    for (let guard = 0; guard < 40; guard++) {
      const { finalY, pageCount } = await measureLayout(resume, scale);

      if (pageCount === 1) {
        const leftover = PAGE_BOTTOM - finalY;
        if (leftover > 30) {
          const stretched = stretchScale(scale, leftover, sectionCount);
          const check = await measureLayout(resume, stretched);
          scale = check.pageCount > 1 ? scale : stretched;
        }
        fitsAtSomeScale = true;
        break;
      }

      if (isAtFloor(scale)) break; // can't shrink further
      scale = shrinkScale(scale);
    }

    if (fitsAtSomeScale) {
      if (trimAttempt > 0) {
        console.warn(
          LOG_TAG,
          `Trimmed ${trimAttempt} bullet(s) as a last resort to fit one page.`
        );
      }
      return { resume, scale };
    }

    // Still doesn't fit even at minimum font — trim one bullet and retry.
    const trimmed = trimOneLeastImportantBullet(resume);
    if (!trimmed) {
      // Nothing left to safely trim — ship it as-is (will render at floor
      // size, possibly still 2 pages; a warning fires downstream).
      console.warn(LOG_TAG, "Content could not be trimmed further; rendering at minimum size.");
      return { resume, scale };
    }
    resume = trimmed;
  }

  // Exhausted trim attempts — return best effort.
  return { resume, scale: getScale(resume) };
}

async function generateAIResumePdf(optimizedResume, userId) {
  console.debug(LOG_TAG, " Entered into generateAIResumePdf: " + new Date().toISOString());

  try {
    const outputDir = path.join(__dirname, "../uploads/generated-resumes");
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const fileName = `resume_${userId}_${Date.now()}.pdf`;
    const filePath = path.join(outputDir, fileName);

    const { resume, scale } = await fitContentToPage(optimizedResume);

    const doc = new PDFDocument({ size: "A4", margin: PAGE_MARGIN, bufferPages: true });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    renderResumeBody(doc, resume, scale);

    doc.end();

    return await new Promise((resolve, reject) => {
      stream.on("finish", () => {
        console.debug(LOG_TAG, " Exited from generateAIResumePdf: " + new Date().toISOString());
        const pageCount = doc.bufferedPageRange().count;
        if (pageCount > 1) {
          console.warn(LOG_TAG, `WARNING: resume rendered as ${pageCount} pages, not 1`);
        }
        resolve(filePath);
      });
      stream.on("error", reject);
    });
  } catch (err) {
    console.debug(LOG_TAG, err);
    throw err;
  }
}

module.exports = {
  generateAIResumePdf,
};