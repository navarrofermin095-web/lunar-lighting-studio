/* =====================================================================
   Lunar Lighting Studio — App logic
   Roles rendering · multi-step form · validation · verification · submit
   ===================================================================== */
(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  /* ---------- 0. tiny helpers ---------- */
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  };
  const escapeHtml = (s) =>
    String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );

  /* ---------- 1. header / footer wiring ---------- */
  $("#year").textContent = new Date().getFullYear();
  $("#navToggle").addEventListener("click", () => $("#nav").classList.toggle("open"));
  $$("#nav a").forEach((a) => a.addEventListener("click", () => $("#nav").classList.remove("open")));
  if (STUDIO.discordUrl && STUDIO.discordUrl !== "#") {
    $("#footerDiscord").href = STUDIO.discordUrl;
  }

  /* ---------- 2. hero stats ---------- */
  (function heroStats() {
    const totalSpots = ROLES.reduce((s, r) => s + r.total, 0);
    const openSpots = ROLES.reduce((s, r) => s + Math.max(0, r.total - r.filled), 0);
    const openRoles = ROLES.filter((r) => !isRoleFull(r)).length;
    const stats = [
      [openRoles, "roles hiring"],
      [openSpots, "open spots"],
      [ROLES.length, "disciplines"],
    ];
    const wrap = $("#heroStats");
    stats.forEach(([n, label]) => {
      const s = el("div", "stat");
      s.innerHTML = `<b>${n}</b><span>${label}</span>`;
      wrap.appendChild(s);
    });
  })();

  /* ---------- 3. render role cards ---------- */
  const rolesGrid = $("#rolesGrid");
  function renderRoles(filter = "all") {
    rolesGrid.innerHTML = "";
    ROLES.filter((r) => {
      if (filter === "open") return !isRoleFull(r);
      if (filter === "full") return isRoleFull(r);
      return true;
    }).forEach((r) => {
      const full = isRoleFull(r);
      const pct = Math.min(100, Math.round((r.filled / r.total) * 100));
      const card = el("article", "role-card");
      card.innerHTML = `
        <div class="rc-top">
          <span class="rc-icon">${r.icon}</span>
          <span class="badge ${full ? "full" : "open"}">${full ? "Full · Waitlist" : "Open"}</span>
        </div>
        <h3>${escapeHtml(r.name)}</h3>
        <p class="rc-blurb">${escapeHtml(r.blurb)}</p>
        <div class="rc-tags">${r.skills.map((s) => `<span>${escapeHtml(s)}</span>`).join("")}</div>
        <div class="rc-progress">
          <div class="rc-meta"><span>${r.filled}/${r.total} filled</span><span>${full ? "0 spots" : (r.total - r.filled) + " spots"}</span></div>
          <div class="rc-track"><div class="rc-bar ${full ? "is-full" : ""}" style="width:${pct}%"></div></div>
        </div>
        <button class="btn ${full ? "btn-ghost" : "btn-primary"}" data-apply="${r.id}">
          ${full ? "Join waitlist" : "Apply for this role"}
        </button>`;
      rolesGrid.appendChild(card);
    });
    // wire apply buttons
    $$("[data-apply]", rolesGrid).forEach((b) =>
      b.addEventListener("click", () => {
        roleSelect.value = b.dataset.apply;
        roleSelect.dispatchEvent(new Event("change"));
        $("#apply").scrollIntoView({ behavior: "smooth" });
      })
    );
  }
  $$("#rolesFilter .chip").forEach((c) =>
    c.addEventListener("click", () => {
      $$("#rolesFilter .chip").forEach((x) => x.classList.remove("active"));
      c.classList.add("active");
      renderRoles(c.dataset.filter);
    })
  );

  /* ---------- 4. populate selects ---------- */
  const roleSelect = $("#role");
  roleSelect.innerHTML =
    '<option value="">Select a role…</option>' +
    ROLES.map((r) => `<option value="${r.id}">${escapeHtml(r.name)}${isRoleFull(r) ? " (waitlist)" : ""}</option>`).join("");

  $("#ageRange").innerHTML =
    '<option value="">Select…</option>' +
    AGE_RANGES.map((a) => `<option value="${a.value}">${a.label}</option>`).join("");

  $("#docType").innerHTML =
    '<option value="">Select…</option>' +
    DOCUMENT_TYPES.map((d) => `<option value="${d.value}">${d.label}</option>`).join("");

  /* ---------- 5. role-specific questions ---------- */
  const roleQuestions = $("#roleQuestions");
  const roleBanner = $("#roleBanner");
  function renderRoleQuestions(roleId) {
    const role = roleById(roleId);
    roleQuestions.innerHTML = "";
    if (!role) {
      roleBanner.innerHTML = `<p>Please select a role in step 1 first.</p>`;
      return;
    }
    roleBanner.innerHTML = `
      <span class="rb-icon">${role.icon}</span>
      <div><h4>${escapeHtml(role.name)}</h4>
      <p>${role.isInvestor ? "Investor enquiry — this routes to a private conversation, no payment is taken here." : "Answer these role-specific questions so we can evaluate your fit."}</p></div>`;
    role.questions.forEach((q, i) => {
      const f = el("div", "field span-2");
      f.innerHTML = `
        <label for="rq${i}">${i + 1}. ${escapeHtml(q)} <em>*</em></label>
        <textarea id="rq${i}" name="rq${i}" data-roleq="${i}" rows="3" required></textarea>`;
      roleQuestions.appendChild(f);
    });
  }
  roleSelect.addEventListener("change", () => {
    renderRoleQuestions(roleSelect.value);
    updateMarksheetHint();
  });

  /* ---------- 6. age gate + marksheet hint ---------- */
  const ageSelect = $("#ageRange");
  const guardianBlock = $("#guardianBlock");
  function currentAge() { return AGE_RANGES.find((a) => a.value === ageSelect.value); }
  function updateAgeGate() {
    const a = currentAge();
    guardianBlock.classList.toggle("hidden", !(a && a.minor));
  }
  function updateMarksheetHint() {
    const a = currentAge();
    $("#marksheetHint").style.display = a && a.under28 ? "block" : "none";
  }
  ageSelect.addEventListener("change", () => { updateAgeGate(); updateMarksheetHint(); });

  /* ---------- 7. file uploads ---------- */
  const MAX_BYTES = 8 * 1024 * 1024;
  const uploads = {}; // name -> File
  function wireDrop(inputId, previewId) {
    const input = $("#" + inputId);
    const zone = input.closest(".dropzone");
    const preview = $("#" + previewId);
    const handle = (file) => {
      if (!file) return;
      if (file.size > MAX_BYTES) { preview.style.color = "var(--full)"; preview.textContent = "⚠️ File is larger than 8 MB."; uploads[inputId] = null; return; }
      uploads[inputId] = file;
      preview.style.color = "var(--open)";
      preview.innerHTML = "";
      if (file.type.startsWith("image/")) {
        const img = el("img");
        img.src = URL.createObjectURL(file);
        preview.appendChild(img);
      }
      preview.appendChild(el("span", null, "✓ " + escapeHtml(file.name)));
    };
    input.addEventListener("change", () => handle(input.files[0]));
    ["dragover", "dragenter"].forEach((ev) => zone.addEventListener(ev, (e) => { e.preventDefault(); zone.classList.add("drag"); }));
    ["dragleave", "drop"].forEach((ev) => zone.addEventListener(ev, () => zone.classList.remove("drag")));
    zone.addEventListener("drop", (e) => { e.preventDefault(); handle(e.dataTransfer.files[0]); });
  }
  wireDrop("docFront", "docFrontPreview");
  wireDrop("docSelfie", "docSelfiePreview");

  /* ---------- 8. multi-step engine ---------- */
  const form = $("#applicationForm");
  const steps = $$(".step", form);
  const stepperItems = $$("#stepper li");
  const prevBtn = $("#prevBtn");
  const nextBtn = $("#nextBtn");
  const submitBtn = $("#submitBtn");
  let current = 1;
  const TOTAL_STEPS = steps.length;

  function showStep(n) {
    current = n;
    steps.forEach((s) => s.classList.toggle("active", +s.dataset.step === n));
    stepperItems.forEach((li) => {
      const step = +li.dataset.step;
      li.classList.toggle("active", step === n);
      li.classList.toggle("done", step < n);
    });
    prevBtn.style.visibility = n === 1 ? "hidden" : "visible";
    nextBtn.style.display = n === TOTAL_STEPS ? "none" : "inline-flex";
    submitBtn.style.display = n === TOTAL_STEPS ? "inline-flex" : "none";
    if (n === TOTAL_STEPS) buildReview();
    $("#apply").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function markInvalid(field, bad) {
    const wrap = field.closest(".field");
    if (wrap) wrap.classList.toggle("invalid", bad);
  }

  function validateStep(n) {
    const stepEl = steps.find((s) => +s.dataset.step === n);
    let ok = true;
    let firstBad = null;

    // required inputs/selects/textareas
    $$("input, select, textarea", stepEl).forEach((f) => {
      if (f.type === "checkbox") return; // handled below
      if (f.hasAttribute("required") && f.offsetParent !== null) {
        const empty = !f.value.trim();
        markInvalid(f, empty);
        if (empty) { ok = false; firstBad = firstBad || f; }
        else if (f.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value)) {
          markInvalid(f, true); ok = false; firstBad = firstBad || f;
        }
      }
    });

    // required checkboxes that are visible
    $$('input[type="checkbox"][required]', stepEl).forEach((c) => {
      if (c.offsetParent !== null && !c.checked) { markInvalid(c, true); ok = false; firstBad = firstBad || c; }
      else markInvalid(c, false);
    });

    // step 3: document + guardian custom checks
    if (n === 3) {
      if (!uploads.docFront) { ok = false; const p = $("#docFrontPreview"); p.style.color = "var(--full)"; if (!p.textContent) p.textContent = "⚠️ A document image is required."; firstBad = firstBad || $("#docFront").closest(".field"); }
      const a = currentAge();
      if (a && a.minor) {
        ["guardianName", "guardianEmail"].forEach((id) => { const f = $("#" + id); const bad = !f.value.trim(); markInvalid(f, bad); if (bad) { ok = false; firstBad = firstBad || f; } });
        const gc = $("#guardianConsent"); if (!gc.checked) { markInvalid(gc, true); ok = false; firstBad = firstBad || gc; } else markInvalid(gc, false);
      }
    }

    if (!ok && firstBad && firstBad.scrollIntoView) firstBad.scrollIntoView({ behavior: "smooth", block: "center" });
    return ok;
  }

  nextBtn.addEventListener("click", () => {
    if (!validateStep(current)) return;
    if (current === 1) renderRoleQuestions(roleSelect.value); // ensure step2 built
    showStep(Math.min(TOTAL_STEPS, current + 1));
  });
  prevBtn.addEventListener("click", () => showStep(Math.max(1, current - 1)));

  // clear invalid styling as user types
  form.addEventListener("input", (e) => { if (e.target.closest(".field.invalid")) markInvalid(e.target, false); });

  /* ---------- 9. review ---------- */
  function collect() {
    const data = {};
    $$("input, select, textarea", form).forEach((f) => {
      if (f.type === "checkbox") data[f.name] = f.checked;
      else if (f.name) data[f.name] = f.value.trim();
    });
    return data;
  }
  function buildReview() {
    const d = collect();
    const role = roleById(d.role);
    const panel = $("#reviewPanel");
    const rows = [
      ["Applicant", `${d.fullName || "—"} · ${d.email || "—"}`],
      ["Discord", d.discord || "—"],
      ["Roblox", d.roblox || "—"],
      ["Role", role ? role.name : "—"],
      ["Age range", (AGE_RANGES.find((a) => a.value === d.ageRange) || {}).label || "—"],
      ["Location", `${d.country || "—"} · ${d.timezone || "—"}`],
      ["Availability", d.availability || "—"],
      ["Experience", d.experience || "—"],
      ["Portfolio", d.portfolio || "—"],
    ];
    let html = rows.map((r) => `<div class="rv-row"><b>${r[0]}</b><span>${escapeHtml(r[1])}</span></div>`).join("");
    if (role) {
      html += `<div class="rv-group">${escapeHtml(role.name)} — answers</div>`;
      role.questions.forEach((q, i) => {
        html += `<div class="rv-row"><b>Q${i + 1}</b><span>${escapeHtml(d["rq" + i] || "—")}</span></div>`;
      });
    }
    const docLabel = (DOCUMENT_TYPES.find((x) => x.value === d.docType) || {}).label || "—";
    html += `<div class="rv-group">Verification</div>`;
    html += `<div class="rv-row"><b>Document</b><span>${escapeHtml(docLabel)}${uploads.docFront ? " · ✓ uploaded" : ""}</span></div>`;
    panel.innerHTML = html;
  }

  /* ---------- 10. submit ---------- */
  submitBtn.addEventListener("click", async () => {
    if (!validateStep(3) || !validateStep(1)) { showStep(1); return; }
    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting…";

    const payload = collect();
    const role = roleById(payload.role);
    // structure the evaluation data your AI agent will receive
    const application = {
      submittedAt: new Date().toISOString(),
      studio: STUDIO.name,
      role: role ? role.name : payload.role,
      applicant: {
        fullName: payload.fullName, email: payload.email,
        discord: payload.discord, roblox: payload.roblox,
        ageRange: payload.ageRange, country: payload.country,
        timezone: payload.timezone, availability: payload.availability,
        experience: payload.experience, portfolio: payload.portfolio,
      },
      motivation: payload.motivation,
      referral: payload.referral,
      roleAnswers: role ? role.questions.map((q, i) => ({ question: q, answer: payload["rq" + i] })) : [],
      verification: {
        docType: payload.docType,
        hasDocument: !!uploads.docFront,
        hasSelfie: !!uploads.docSelfie,
        guardianConsent: payload.guardianConsent || false,
      },
      consents: { revShare: payload.revShareConsent, privacy: payload.privacyConsent },
    };

    const ref = "LLS-" + Date.now().toString(36).toUpperCase();
    let delivered = false;
    try {
      // ---- BACKEND HOOK (api/apply.js on Vercel) ----
      // Posts the application as JSON; the serverless function runs the
      // Gemini evaluation and emails the verdict to the studio owner.
      // Document images are intentionally NOT uploaded here — raw IDs are
      // verified through a dedicated KYC flow during onboarding, never
      // stored in our own backend or sent by email.
      // If no backend is deployed, this fails gracefully and falls back
      // to the send-by-email box below.
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ application, reference: ref }),
      });
      if (!res.ok) throw new Error("no-backend");
      delivered = true;
    } catch (err) {
      // No backend connected: the applicant delivers the application by email.
      console.info("[Lunar Lighting Studio] Application (backend not connected):", application);
    }

    if (!delivered) buildEmailFallback(application, ref);
    $("#successRole").textContent = role ? role.name : "the team";
    $("#successRef").textContent = ref;
    form.classList.add("hidden");
    $(".form-nav").classList.add("hidden");
    $("#stepper").classList.add("hidden");
    $("#successPanel").classList.remove("hidden");
    $("#apply").scrollIntoView({ behavior: "smooth" });
  });

  /* ---- send-by-email fallback (used until the backend is deployed) ---- */
  function applicationToText(app, ref) {
    const a = app.applicant;
    const lines = [
      "LUNAR LIGHTING STUDIO — APPLICATION",
      "Reference: " + ref,
      "Submitted: " + app.submittedAt,
      "",
      "ROLE: " + app.role,
      "",
      "— APPLICANT —",
      "Name: " + a.fullName,
      "Email: " + a.email,
      "Discord: " + a.discord,
      "Roblox: " + a.roblox,
      "Age range: " + a.ageRange,
      "Location: " + a.country + " (" + a.timezone + ")",
      "Availability: " + a.availability,
      "Experience: " + a.experience,
      "Portfolio: " + (a.portfolio || "—"),
      "Heard about us: " + (app.referral || "—"),
      "",
      "— MOTIVATION —",
      app.motivation,
      "",
      "— ROLE QUESTIONS —",
    ];
    app.roleAnswers.forEach((x, i) => {
      lines.push("Q" + (i + 1) + ". " + x.question, "A: " + x.answer, "");
    });
    lines.push(
      "— VERIFICATION —",
      "Document type: " + (app.verification.docType || "—"),
      "Document uploaded on site: " + (app.verification.hasDocument ? "yes" : "no") +
        " (images are verified in the secure onboarding flow, not by email)",
      "Guardian consent: " + (app.verification.guardianConsent ? "yes" : "n/a"),
      "Rev-share consent: " + (app.consents.revShare ? "yes" : "no")
    );
    return lines.join("\n");
  }

  function buildEmailFallback(app, ref) {
    const box = $("#emailFallback");
    if (!box) return;
    const text = applicationToText(app, ref);
    const subject = "Application " + ref + " — " + app.role + " — " + app.applicant.fullName;
    const mailto =
      "mailto:" + STUDIO.resultEmail +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(text.slice(0, 1500) + (text.length > 1500 ? "\n\n[Full application pasted below by applicant]" : ""));
    box.innerHTML = `
      <h4>One last step — deliver your application 📬</h4>
      <p>Send your application to the studio by email. Click the button (or copy the text and email it to <strong>${escapeHtml(STUDIO.resultEmail)}</strong>).</p>
      <div class="ef-actions">
        <a class="btn btn-primary btn-sm" href="${mailto}">Open email &amp; send</a>
        <button type="button" class="btn btn-ghost btn-sm" id="copyAppBtn">Copy application text</button>
      </div>
      <textarea id="appText" readonly rows="8"></textarea>`;
    $("#appText").value = text;
    box.classList.remove("hidden");
    $("#copyAppBtn").addEventListener("click", async () => {
      const ta = $("#appText");
      ta.select();
      let ok = false;
      try { await navigator.clipboard.writeText(text); ok = true; }
      catch (e) { try { ok = document.execCommand("copy"); } catch (e2) {} }
      $("#copyAppBtn").textContent = ok ? "✓ Copied!" : "Press Ctrl+C to copy";
    });
  }

  $("#resetBtn").addEventListener("click", () => {
    form.reset();
    Object.keys(uploads).forEach((k) => delete uploads[k]);
    $("#docFrontPreview").innerHTML = ""; $("#docSelfiePreview").innerHTML = "";
    const ef = $("#emailFallback"); if (ef) { ef.innerHTML = ""; ef.classList.add("hidden"); }
    roleQuestions.innerHTML = ""; updateAgeGate();
    form.classList.remove("hidden");
    $(".form-nav").classList.remove("hidden");
    $("#stepper").classList.remove("hidden");
    $("#successPanel").classList.add("hidden");
    submitBtn.disabled = false; submitBtn.textContent = "Submit application";
    showStep(1);
  });

  /* ---------- 11. privacy modal ---------- */
  const privacyModal = $("#privacyModal");
  const openPrivacy = () => privacyModal.classList.remove("hidden");
  const closePrivacy = () => privacyModal.classList.add("hidden");
  ["#openPrivacy", "#footerPrivacy"].forEach((s) => $(s) && $(s).addEventListener("click", (e) => { e.preventDefault(); openPrivacy(); }));
  $("#privacyClose").addEventListener("click", closePrivacy);
  privacyModal.addEventListener("click", (e) => { if (e.target === privacyModal) closePrivacy(); });

  /* ---------- 12. starfield ---------- */
  (function starfield() {
    const canvas = $("#stars");
    const ctx = canvas.getContext("2d");
    let stars = [], w, h;
    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      const count = Math.min(140, Math.floor((w * h) / 14000));
      stars = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        r: Math.random() * 1.3 + 0.2,
        a: Math.random() * 0.6 + 0.2,
        tw: Math.random() * 0.02 + 0.004,
        dir: Math.random() > 0.5 ? 1 : -1,
      }));
    }
    function draw() {
      ctx.clearRect(0, 0, w, h);
      stars.forEach((s) => {
        s.a += s.tw * s.dir;
        if (s.a <= 0.15 || s.a >= 0.85) s.dir *= -1;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200,220,255,${s.a})`;
        ctx.fill();
      });
      requestAnimationFrame(draw);
    }
    window.addEventListener("resize", resize);
    resize();
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) draw();
  })();

  /* ---------- init ---------- */
  renderRoles("all");
  showStep(1);
  updateAgeGate();
})();
