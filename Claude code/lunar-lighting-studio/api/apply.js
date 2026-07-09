/* =====================================================================
   Lunar Lighting Studio — /api/apply  (Vercel serverless function)
   ---------------------------------------------------------------------
   Receives an application (JSON), evaluates it with Gemini, and emails
   the verdict to the studio owner via Resend. Zero npm dependencies —
   both APIs are called over plain REST with Node's global fetch.

   REQUIRED ENVIRONMENT VARIABLES (Vercel → Settings → Environment Variables):
     GEMINI_API_KEY   your Gemini API key   (https://aistudio.google.com/apikey)
     RESEND_API_KEY   your Resend API key   (https://resend.com/api-keys)
     RESULT_EMAIL     navarrofermin095@gmail.com   (where verdicts are sent)

   NEVER hard-code keys in this file or in the frontend.

   Notes:
   - Resend free tier: use from "onboarding@resend.dev" and send to the
     email your Resend account is registered with. Once you verify a
     domain in Resend, change FROM below.
   - Identity documents are NOT uploaded here on purpose: raw ID images
     must be handled by a dedicated KYC provider (Stripe Identity /
     Veriff / Onfido), not stored or emailed by us. The email includes
     verification metadata only.
   ===================================================================== */

const GEMINI_MODEL = "gemini-2.5-flash";
const FROM = "Lunar Lighting Studio <onboarding@resend.dev>";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "method_not_allowed" });
  }
  try {
    const { application, reference } = req.body || {};
    if (!application || !application.role || !application.applicant) {
      return res.status(400).json({ ok: false, error: "bad_request" });
    }
    const ref = String(reference || "LLS-UNKNOWN").slice(0, 24);

    // 1) AI evaluation — if Gemini fails, we still deliver the email.
    let evaluation;
    try {
      evaluation = await evaluateApplication(application);
    } catch (err) {
      console.error("gemini_failed:", err);
      evaluation = {
        score: null,
        recommendation: "Review manually",
        strengths: [],
        redFlags: ["AI evaluation unavailable — review this application manually."],
        summary: "The AI evaluation could not run for this submission.",
      };
    }

    // 2) Email the verdict to the studio owner.
    await sendVerdictEmail(application, evaluation, ref);

    return res.status(200).json({ ok: true, reference: ref });
  } catch (err) {
    console.error("apply_failed:", err);
    return res.status(500).json({ ok: false, error: "processing_failed" });
  }
}

/* ---- Gemini evaluation (REST, structured JSON output) ---------------- */
async function evaluateApplication(app) {
  const prompt = `You are a senior hiring lead at ${app.studio}, a Roblox game studio.
Evaluate this applicant for the role "${app.role}". Judge skill evidence, portfolio,
communication quality, availability, and overall fit. Be fair and concise.

Return ONLY JSON with keys:
  score (number 0-100),
  recommendation ("Advance" | "Maybe" | "Reject"),
  strengths (string[]),
  redFlags (string[]),
  summary (string, 3-4 sentences).

Application:
${JSON.stringify(app, null, 2)}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": process.env.GEMINI_API_KEY,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", temperature: 0.2 },
      }),
    }
  );
  if (!res.ok) throw new Error("gemini_" + res.status + ": " + (await res.text()).slice(0, 300));
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  return JSON.parse(text);
}

/* ---- Resend email (REST) --------------------------------------------- */
async function sendVerdictEmail(app, ev, ref) {
  const to = process.env.RESULT_EMAIL || "navarrofermin095@gmail.com";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: [to],
      subject: `New application — ${app.role} — ${ev.recommendation} (${ref})`,
      html: renderEmail(app, ev, ref),
    }),
  });
  if (!res.ok) throw new Error("resend_" + res.status + ": " + (await res.text()).slice(0, 300));
}

/* ---- email template (verdict + answers, no document images) ---------- */
function renderEmail(app, ev, ref) {
  const a = app.applicant || {};
  const v = app.verification || {};
  const answers = (app.roleAnswers || [])
    .map((x, i) => `<p><b>Q${i + 1}. ${esc(x.question)}</b><br>${esc(x.answer)}</p>`)
    .join("");
  return `
  <div style="font-family:system-ui,sans-serif;color:#111;max-width:640px">
    <h2>New application — ${esc(app.role)}</h2>
    <p><b>Recommendation:</b> ${esc(ev.recommendation)} &nbsp; <b>Score:</b> ${ev.score ?? "—"}/100</p>
    <p><b>Reference:</b> ${esc(ref)} · <b>Submitted:</b> ${esc(app.submittedAt)}</p>
    <h3>Applicant</h3>
    <p>${esc(a.fullName)} · ${esc(a.email)}<br>
       Discord: ${esc(a.discord)} · Roblox: ${esc(a.roblox)}<br>
       Age: ${esc(a.ageRange)} · ${esc(a.country)} (${esc(a.timezone)})<br>
       Availability: ${esc(a.availability)} · Experience: ${esc(a.experience)}<br>
       Portfolio: ${esc(a.portfolio) || "—"} · Heard via: ${esc(app.referral) || "—"}</p>
    <h3>AI evaluation (Gemini)</h3>
    <p>${esc(ev.summary)}</p>
    <p><b>Strengths:</b> ${(ev.strengths || []).map(esc).join(", ") || "—"}</p>
    <p><b>Red flags:</b> ${(ev.redFlags || []).map(esc).join(", ") || "—"}</p>
    <h3>Motivation</h3><p>${esc(app.motivation)}</p>
    <h3>Role answers</h3>${answers}
    <h3>Verification</h3>
    <p>Document type: ${esc(v.docType || "—")} · Uploaded on site: ${v.hasDocument ? "yes" : "no"} ·
       Guardian consent: ${v.guardianConsent ? "yes" : "n/a"}<br>
       <i>Document images are not transmitted by email; verify identity via your secure KYC flow during onboarding.</i></p>
  </div>`;
}

/* ---- helpers ---------------------------------------------------------- */
function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );
}
