import { useState } from "react";

const AIRTABLE_TOKEN = "patJzBZrSzyj0KE3z.9bb1f9ce6b43c2833c11102073f09fdf16a2c244";
const AIRTABLE_BASE = "appPT74Frgqu5jSx9";
const AIRTABLE_TABLE = "Responses";

const C = {
  primary: "#8B5E3C",
  primaryDark: "#6B4423",
  primaryLight: "#F5EDE3",
  accent: "#C4853A",
  bg: "linear-gradient(160deg, #FDF6EE 0%, #FAF7F2 60%, #FDF3E7 100%)",
  tagBg: "#F5EDE3",
  tagText: "#6B4423",
  selBorder: "#8B5E3C",
  selBg: "#F5EDE3",
  selText: "#6B4423",
  dot: "#C4853A",
  dotInactive: "#EDD9C4",
  btnBg: "#8B5E3C",
  progressBar: "linear-gradient(90deg, #8B5E3C, #C4853A)",
  bannerBg: "linear-gradient(90deg, #6B4423, #8B5E3C)",
  introBg: "linear-gradient(135deg, #FDF6EE, #F5EDE3)",
  introBorder: "#DDB899",
  introText: "#6B4423",
};

const PAGES = [
  {
    id: "about", title: "About You", subtitle: "Help us understand who you are",
    questions: [
      { id: "life_stage", label: "Which best describes you?", type: "single",
        options: ["Student", "Early career professional", "Mid career professional", "Parent with children at home", "Retired", "Other"] },
      { id: "age", label: "Age range?", type: "single",
        options: ["18–24", "25–34", "35–44", "45–54", "55+"] },
      { id: "health_goal", label: "What's your primary health goal right now?", type: "single",
        options: ["More energy", "Longevity", "Strength / performance", "Mental clarity", "Weight management", "Gut health"] },
    ],
  },
  {
    id: "habits", title: "Your Routine", subtitle: "Tell us about your supplement habits",
    questions: [
      { id: "supplement_types", label: "Which supplements do you currently take? (Select all that apply)", type: "multi",
        options: ["Multivitamin", "Magnesium", "Omega-3 / Fish Oil", "Vitamin D", "Vitamin C", "Probiotics", "Collagen", "Protein powder", "Greens powder", "Fiber supplement", "Zinc", "B-Complex", "Iron", "None"] },
      { id: "frustrations", label: "What frustrates you most about supplements? (Pick up to 2)", type: "multi", max: 2,
        options: ["Too many pills", "Hard to remember", "Bad taste", "Too expensive", "Not sure they work", "Nothing — I'm happy"] },
      { id: "convenience_importance", label: "How important is convenience in your daily routine?", type: "scale",
        options: ["Not important", "Somewhat important", "Very important", "Essential"] },
    ],
  },
  {
    id: "baseline", title: "Baseline", subtitle: "One bite. Every day.",
    intro: "Baseline is an 85-calorie daily bite packed with 20 essential vitamins and minerals, 5g of fiber, and 690mg of plant omega-3. Made with dates, almond butter, flax, and honey. One bite. Every day.",
    questions: [
      { id: "concept_interest", label: "How interested are you in a product like this?", type: "scale",
        options: ["Not interested", "Somewhat interested", "Very interested", "Extremely interested"] },
      { id: "would_buy", label: "Would you buy Baseline when it launches?", type: "single",
        options: ["Yes, sign me up", "Probably yes", "Maybe", "Probably not"] },
      { id: "phone", label: "Do you want founder-level early access?",
        sublabel: "Drop your number and we'll text you first when we launch — plus a chance to win $200.",
        type: "phone", placeholder: "(555) 000-0000" },
    ],
  },
];

const TOTAL = PAGES.length;

function BaselineLogo({ size = "md" }) {
  const fontSize = size === "lg" ? "2rem" : "1rem";
  const lineWidth = size === "lg" ? 52 : 26;
  const lineThickness = size === "lg" ? 3 : 2;
  return (
   <div style={{ display: "inline-flex", alignItems: "flex-end" }}>
      <span style={{ fontFamily: "'Georgia','Times New Roman',serif", fontSize, fontWeight: 400, color: C.primaryDark, letterSpacing: "0.08em", lineHeight: 1 }}>BASE</span>
      <div style={{ width: lineWidth, height: 1.5, background: C.primaryDark, marginLeft: 1, marginBottom: 2 }} />
    </div>
  );
}

export default function BaselineSurvey() {
  const [page, setPage] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const current = PAGES[page];
  const progress = (page / TOTAL) * 100;

  const handleSingle = (qid, val) => setAnswers(a => ({ ...a, [qid]: val }));
  const handleText = (qid, val) => setAnswers(a => ({ ...a, [qid]: val }));
  const handleMulti = (qid, val, max) => setAnswers(a => {
    const prev = a[qid] || [];
    if (prev.includes(val)) return { ...a, [qid]: prev.filter(v => v !== val) };
    if (max && prev.length >= max) return { ...a, [qid]: [...prev.slice(1), val] };
    return { ...a, [qid]: [...prev, val] };
  });

  const back = () => page > 0 && setPage(p => p - 1);

  const next = async () => {
    if (page < TOTAL - 1) { setPage(p => p + 1); return; }
    setSubmitting(true);
    try {
      await fetch(`https://api.airtable.com/v0/${AIRTABLE_BASE}/${AIRTABLE_TABLE}`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${AIRTABLE_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({ fields: {
          "Life Stage": answers["life_stage"] || "",
          "Age": answers["age"] || "",
          "Health Goal": answers["health_goal"] || "",
          "Supplements": (answers["supplement_types"] || []).join(", "),
          "Frustrations": (answers["frustrations"] || []).join(", "),
          "Convenience": answers["convenience_importance"] || "",
          "Concept Interest": answers["concept_interest"] || "",
          "Would Buy": answers["would_buy"] || "",
          "Phone": answers["phone"] || "",
          "Submitted At": new Date().toISOString(),
        }})
      });
    } catch(e) { console.error("Airtable error:", e); }
    setSubmitting(false);
    setSubmitted(true);
  };

  const scaleColors = ["#d1d5db", "#DDB899", "#C4853A", "#8B5E3C"];
  const isInterestedBuyer = ["Yes, sign me up", "Probably yes"].includes(answers["would_buy"]);

  if (submitted) return (
    <div style={{ ...S.shell, background: C.bg }}>
      <div style={S.topBar}><BaselineLogo /></div>
      <div style={S.card}>
        <div style={{ textAlign: "center", padding: "3rem 1.5rem" }}>
          <div style={{ marginBottom: "1.5rem" }}><BaselineLogo size="lg" /></div>
          <h2 style={{ ...S.thankYouTitle, color: C.primaryDark }}>
            {isInterestedBuyer ? "You're in. Welcome to Baseline." : "Thank you."}
          </h2>
          <p style={S.thankYouBody}>
            {isInterestedBuyer
              ? "You have founder-level early access. You'll be the first to know when we launch — and first in line for free samples."
              : "Your feedback directly shapes Baseline. We really appreciate it."}
          </p>
          <div style={{ ...S.tag, background: C.tagBg, color: C.tagText }}>Baseline — One Bite. Every Day.</div>
          {isInterestedBuyer && (
            <div style={{ marginTop: "2rem" }}>
              <p style={{ color: "#374151", fontSize: "0.9rem", marginBottom: "1rem", fontFamily: "sans-serif" }}>Want to see what we're building?</p>
              <a href="https://baselinebite.com" target="_blank" rel="noopener noreferrer" style={{ ...S.ctaButton, background: C.btnBg }}>Visit baselinebite.com →</a>
            </div>
          )}
          <p style={{ fontSize: "0.78rem", color: "#9ca3af", marginTop: "2.5rem", fontFamily: "sans-serif" }}>🎉 One participant will be selected to win $200. Winner notified by text.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ ...S.shell, background: C.bg }}>
      <div style={S.topBar}>
        <BaselineLogo />
        <div style={S.stepLabel}>{page + 1} / {TOTAL}</div>
      </div>
      <div style={S.progressTrack}>
        <div style={{ ...S.progressFill, width: `${progress}%`, background: C.progressBar }} />
      </div>
      {page === 0 && <div style={{ ...S.giveawayBanner, background: C.bannerBg }}>🎉 2 minutes · chance to <strong>win $200</strong></div>}

      <div style={S.card}>
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ ...S.sectionTag, background: C.tagBg, color: C.tagText }}>{current.title}</div>
          <p style={S.pageSubtitle}>{current.subtitle}</p>
        </div>
        {current.intro && (
          <div style={{ ...S.introBanner, background: C.introBg, borderColor: C.introBorder, color: C.introText }}>
            <p style={{ margin: 0, fontSize: "0.9rem", lineHeight: 1.7 }}>{current.intro}</p>
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
          {current.questions.map(q => (
            <div key={q.id}>
              <p style={S.qLabel}>{q.label}</p>
              {q.sublabel && <p style={S.qSublabel}>{q.sublabel}</p>}
              {q.type === "single" && (
                <div style={S.optionGrid}>
                  {q.options.map(opt => {
                    const sel = answers[q.id] === opt;
                    return <button key={opt} onClick={() => handleSingle(q.id, opt)}
                      style={{ ...S.optionBtn, ...(sel ? { border: `1.5px solid ${C.selBorder}`, background: C.selBg, color: C.selText, fontWeight: 600 } : {}) }}>
                      {sel && <span style={{ ...S.checkDot, background: C.primary }} />}{opt}
                    </button>;
                  })}
                </div>
              )}
              {q.type === "multi" && <>
                <div style={{ ...S.optionGrid, gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))" }}>
                  {q.options.map(opt => {
                    const sel = (answers[q.id] || []).includes(opt);
                    return <button key={opt} onClick={() => handleMulti(q.id, opt, q.max)}
                      style={{ ...S.optionBtn, ...(sel ? { border: `1.5px solid ${C.selBorder}`, background: C.selBg, color: C.selText, fontWeight: 600 } : {}) }}>
                      {sel && <span style={{ ...S.checkDot, background: C.primary }} />}{opt}
                    </button>;
                  })}
                </div>
                {q.max && <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.4rem", fontFamily: "sans-serif" }}>Pick up to {q.max}</p>}
              </>}
              {q.type === "scale" && (
                <div style={S.scaleRow}>
                  {q.options.map((opt, i) => {
                    const sel = answers[q.id] === opt;
                    return <button key={opt} onClick={() => handleSingle(q.id, opt)}
                      style={{ ...S.scaleBtn, backgroundColor: sel ? scaleColors[i] : "#f3f4f6", color: sel ? (i >= 2 ? "#fff" : "#111") : "#374151", borderColor: sel ? scaleColors[i] : "#e5e7eb", fontWeight: sel ? 700 : 400 }}>
                      {opt}
                    </button>;
                  })}
                </div>
              )}
              {q.type === "phone" && (
                <input type="tel" placeholder={q.placeholder} value={answers[q.id] || ""}
                  onChange={e => handleText(q.id, e.target.value)} style={{ ...S.input, borderColor: "#e5e7eb" }} />
              )}
            </div>
          ))}
        </div>
        <div style={S.navRow}>
          {page > 0 && <button onClick={back} style={S.backBtn}>← Back</button>}
          <button onClick={next} disabled={submitting}
            style={{ ...S.nextBtn, background: submitting ? "#C4853A" : C.btnBg, marginLeft: "auto" }}>
            {submitting ? "Submitting..." : page === TOTAL - 1 ? "Submit →" : "Continue →"}
          </button>
        </div>
      </div>

      <div style={S.dots}>
        {PAGES.map((_, i) => <div key={i} style={{ ...S.dot, background: i === page ? C.dot : C.dotInactive }} />)}
      </div>
      <p style={S.footer}>Anonymous · used only to improve Baseline</p>
    </div>
  );
}

const S = {
  shell: { minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", padding: "0 1rem 3rem", fontFamily: "'Georgia',serif" },
  topBar: { width: "100%", maxWidth: 600, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.5rem 0 0.5rem" },
  stepLabel: { fontSize: "0.8rem", color: "#9ca3af", fontFamily: "sans-serif" },
  progressTrack: { width: "100%", maxWidth: 600, height: 3, background: "#e5e7eb", borderRadius: 99, marginBottom: "1rem", overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 99, transition: "width 0.4s ease" },
  giveawayBanner: { width: "100%", maxWidth: 600, color: "#fff", textAlign: "center", fontSize: "0.85rem", padding: "0.6rem 1rem", borderRadius: 10, marginBottom: "1rem", fontFamily: "sans-serif" },
  card: { width: "100%", maxWidth: 600, background: "#fff", borderRadius: 20, padding: "2rem 2rem 1.5rem", boxShadow: "0 4px 40px rgba(139,94,60,0.08)", border: "1px solid #EDD9C4" },
  sectionTag: { display: "inline-block", fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", padding: "0.28rem 0.7rem", borderRadius: 99, fontFamily: "sans-serif", marginBottom: "0.4rem" },
  pageSubtitle: { color: "#6b7280", fontSize: "0.88rem", margin: 0, fontFamily: "sans-serif" },
  introBanner: { border: "1px solid", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "1.5rem", fontFamily: "sans-serif" },
  qLabel: { fontSize: "0.95rem", fontWeight: 700, color: "#111827", marginBottom: "0.5rem", marginTop: 0, lineHeight: 1.4, fontFamily: "sans-serif" },
  qSublabel: { fontSize: "0.85rem", color: "#6b7280", marginBottom: "0.75rem", marginTop: "-0.2rem", fontFamily: "sans-serif" },
  optionGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))", gap: "0.45rem" },
  optionBtn: { padding: "0.55rem 0.9rem", border: "1.5px solid #e5e7eb", borderRadius: 10, background: "#fafafa", color: "#374151", fontSize: "0.83rem", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: "0.45rem", fontFamily: "sans-serif", transition: "all 0.15s" },
  checkDot: { width: 7, height: 7, borderRadius: "50%", flexShrink: 0 },
  scaleRow: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.5rem" },
  scaleBtn: { padding: "0.65rem 1rem", border: "1.5px solid", borderRadius: 10, cursor: "pointer", fontSize: "0.85rem", fontFamily: "sans-serif", transition: "all 0.2s" },
  input: { width: "100%", borderRadius: 10, border: "1.5px solid", padding: "0.85rem", fontSize: "1rem", fontFamily: "sans-serif", color: "#374151", outline: "none", boxSizing: "border-box", marginTop: "0.25rem" },
  navRow: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2rem", paddingTop: "1.25rem", borderTop: "1px solid #F5EDE3" },
  backBtn: { background: "none", border: "none", color: "#9ca3af", fontSize: "0.85rem", cursor: "pointer", fontFamily: "sans-serif" },
  nextBtn: { color: "#fff", border: "none", borderRadius: 10, padding: "0.75rem 2rem", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer", fontFamily: "sans-serif" },
  dots: { display: "flex", gap: "0.5rem", marginTop: "1.25rem" },
  dot: { width: 8, height: 8, borderRadius: "50%", transition: "background 0.3s" },
  tag: { display: "inline-block", fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", padding: "0.3rem 0.75rem", borderRadius: 99, fontFamily: "sans-serif" },
  thankYouTitle: { fontFamily: "sans-serif", fontSize: "1.8rem", fontWeight: 700, marginBottom: "0.75rem" },
  thankYouBody: { color: "#6b7280", fontSize: "1rem", lineHeight: 1.7, maxWidth: 380, margin: "0 auto 1.5rem", fontFamily: "sans-serif" },
  ctaButton: { display: "inline-block", color: "#fff", padding: "0.85rem 2rem", borderRadius: 12, fontSize: "0.95rem", fontWeight: 700, textDecoration: "none", fontFamily: "sans-serif" },
  footer: { marginTop: "1rem", fontSize: "0.75rem", color: "#9ca3af", textAlign: "center", fontFamily: "sans-serif" },
};
