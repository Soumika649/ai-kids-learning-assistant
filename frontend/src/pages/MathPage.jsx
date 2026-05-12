import { useState } from "react";
import { useApp } from "../context/AppContext";
import { speak } from "../hooks/api";
import Confetti from "../components/Confetti";
import { buddyShow } from "../components/Buddy";

const OPS = [
  { v: "addition", l: "Addition", sym: "➕", c: "#FF3D9A" },
  { v: "subtraction", l: "Subtraction", sym: "➖", c: "#8B5CF6" },
  { v: "multiplication", l: "Multiply", sym: "✖️", c: "#06B6D4" },
  { v: "division", l: "Division", sym: "➗", c: "#14F0C0" },
];

export default function MathPage() {
  const { profile, xp, level, badges, addXP, earnBadge, mathSkills, updateMathSkill } = useApp();

  const [op, setOp] = useState("addition");
  const [problems, setProblems] = useState([]);
  const [answers, setAnswers] = useState({});
  const [hints, setHints] = useState({});
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [wobble, setWobble] = useState(null);

  const curOp = OPS.find((o) => o.v === op) || OPS[0];
  const skillStats = mathSkills || {};
  const skillSummary = OPS.map((item) => {
    const stat = skillStats[item.v] || { correct: 0, total: 0 };
    const percent = stat.total ? Math.round((stat.correct / stat.total) * 100) : 0;
    return { ...item, ...stat, percent };
  });
  const weakSkills = skillSummary.filter((item) => item.total > 0 && item.percent < 60);

  const generateProblems = () => {
    const age = profile?.age || 7;
    const list = [];

    for (let i = 0; i < 5; i++) {
      let a;
      let b;
      let question = "";
      let answer = 0;
      let hint = "";

      let addMax = 10;
      let mulMax = 5;
      let allowSub = true;
      let allowMul = false;
      let allowDiv = false;

      if (age <= 5) {
        addMax = 5;
        allowSub = false;
      } else if (age <= 7) {
        addMax = 20;
        mulMax = 5;
        allowMul = true;
        allowDiv = true;
      } else if (age <= 9) {
        addMax = 50;
        mulMax = 5;
        allowMul = true;
        allowDiv = true;
      } else {
        addMax = 100;
        mulMax = 10;
        allowMul = true;
        allowDiv = true;
      }

      if (op === "addition") {
        a = Math.floor(Math.random() * addMax) + 1;
        b = Math.floor(Math.random() * addMax) + 1;
        question = `${a} + ${b} =`;
        answer = a + b;
        hint = `Add ${a} and ${b}`;
      }

      if (op === "subtraction") {
        a = Math.floor(Math.random() * addMax) + 1;
        b = Math.floor(Math.random() * addMax) + 1;

        if (!allowSub) {
          question = `${a} + ${b} =`;
          answer = a + b;
          hint = `Add ${a} and ${b}`;
        } else {
          if (b > a) [a, b] = [b, a];
          question = `${a} - ${b} =`;
          answer = a - b;
          hint = `Take ${b} away from ${a}`;
        }
      }

      if (op === "multiplication") {
        if (!allowMul) {
          a = Math.floor(Math.random() * addMax) + 1;
          b = Math.floor(Math.random() * addMax) + 1;
          question = `${a} + ${b} =`;
          answer = a + b;
          hint = `Add ${a} and ${b}`;
        } else {
          a = Math.floor(Math.random() * mulMax) + 1;
          b = Math.floor(Math.random() * mulMax) + 1;
          question = `${a} × ${b} =`;
          answer = a * b;
          hint = `${a} groups of ${b}`;
        }
      }

      if (op === "division") {
        if (!allowDiv) {
          a = Math.floor(Math.random() * addMax) + 1;
          b = Math.floor(Math.random() * addMax) + 1;
          question = `${a} + ${b} =`;
          answer = a + b;
          hint = `Add ${a} and ${b}`;
        } else {
          b = Math.floor(Math.random() * 10) + 1;
          answer = Math.floor(Math.random() * 10) + 1;
          a = answer * b;
          question = `${a} ÷ ${b} =`;
          hint = `${a} split into ${b} equal parts`;
        }
      }

      list.push({ question, answer, hint });
    }

    return list;
  };

  const getProblems = () => {
    setLoading(true);
    setDone(false);
    setScore(0);
    setAnswers({});
    setHints({});

    setTimeout(() => {
      setProblems(generateProblems());
      setLoading(false);
    }, 500);
  };

  const setAns = (i, v) => {
    setAnswers((p) => ({ ...p, [i]: v }));
    setWobble(i);
    setTimeout(() => setWobble(null), 250);
  };

  const isCorrect = (i) => Number(answers[i]) === problems[i]?.answer;

  const submit = () => {
    let n = 0;

    problems.forEach((p, i) => {
      if (Number(answers[i]) === p.answer) n++;
    });

    setScore(n);
    setDone(true);
    updateMathSkill(op, n, problems.length);

    const pct = n / problems.length;

    if (pct === 1) {
      setConfetti(true);
      setTimeout(() => setConfetti(false), 100);

      addXP(40);
      buddyShow("win", "Perfect math score!");

      earnBadge({
        id: "math-ace",
        icon: "🔢",
        name: "Math Ace",
        desc: "Perfect math score!",
      });
    } else {
      addXP(Math.round(pct * 25));
    }

    speak(
      `You got ${n} out of ${problems.length} correct! ${
        n === problems.length ? "Amazing!" : "Good try!"
      }`
    );
  };

  const allDone =
    problems.length > 0 &&
    problems.every((_, i) => answers[i] !== undefined && answers[i] !== "");

  return (
    <div className="page">
      <Confetti active={confetti} />

      <div className="text-center" style={{ marginBottom: 22 }}>
        <div
          style={{
            fontSize: "3rem",
            display: "inline-block",
            animation: "bounce 2.5s ease-in-out infinite",
            marginBottom: 6,
          }}
        >
          🧮
        </div>

        <h1
          className="page-title"
          style={{
            background: "linear-gradient(135deg,#06B6D4,#8B5CF6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Math Fun!
        </h1>

        <p className="text-muted text-sm">Choose an operation and solve 🧠</p>
      </div>

      {profile && (
        <div
          className="card card-raised"
          style={{
            padding: 16,
            marginBottom: 16,
            border: `2px solid ${(profile.color || "#8B5CF6")}33`,
            background: `linear-gradient(135deg, ${(profile.color || "#8B5CF6")}18, rgba(255,255,255,0.04))`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                fontSize: "1.8rem",
                background: `linear-gradient(135deg, ${profile.color || "#8B5CF6"}, #06B6D4)`,
              }}
            >
              {profile.avatar || "👤"}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 900, fontSize: "1.05rem" }}>
                {profile.heroName || profile.name || "Student"}
              </div>
              <div className="text-muted" style={{ fontSize: ".9rem" }}>
                Age: {profile.age || "-"} | Level: {level || 1} | XP: {xp || 0}
              </div>
              <div style={{ fontSize: ".82rem", marginTop: 4, color: "#FFD60A" }}>
                Badges: {badges?.length || 0}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card card-raised" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ fontWeight: 900, marginBottom: 10, color: curOp.c }}>
          Math Skill Analysis
        </div>

        <div style={{ display: "grid", gap: 8 }}>
          {skillSummary.map((item) => (
            <div
              key={item.v}
              style={{
                display: "grid",
                gridTemplateColumns: "110px 1fr auto",
                gap: 10,
                alignItems: "center",
              }}
            >
              <span style={{ fontSize: ".9rem", fontWeight: 800 }}>{item.l}</span>
              <div
                style={{
                  height: 10,
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.08)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${item.percent}%`,
                    height: "100%",
                    borderRadius: 999,
                    background: `linear-gradient(90deg, ${item.c}, #FFD60A)`,
                  }}
                />
              </div>
              <span style={{ fontSize: ".8rem", fontWeight: 800, color: item.c }}>
                {item.total ? `${item.percent}%` : "--"}
              </span>
            </div>
          ))}
        </div>

        <p className="text-muted" style={{ fontSize: ".82rem", marginTop: 12, marginBottom: 0 }}>
          {weakSkills.length
            ? `Needs practice: ${weakSkills.map((item) => item.l).join(", ")}`
            : "No weak skill found yet. Keep solving problems to build the analysis."}
        </p>
      </div>

      <div className="grid-2" style={{ marginBottom: 16 }}>
        {OPS.map((o) => (
          <button
            key={o.v}
            onClick={() => setOp(o.v)}
            className="card"
            style={{
              padding: "14px 12px",
              border: `2px solid ${op === o.v ? o.c : "var(--c-border2)"}`,
              background: op === o.v ? `${o.c}16` : "var(--c-raised)",
              fontWeight: 800,
              color: "var(--c-text)",
            }}
          >
            <span style={{ fontSize: "1.6rem", display: "block" }}>
              {o.sym}
            </span>
            {o.l}
          </button>
        ))}
      </div>

      <div className="text-center" style={{ marginBottom: 20 }}>
        <button className="btn btn-blue" onClick={getProblems}>
          {problems.length ? "🔄 New Problems" : "🧮 Get Problems!"}
        </button>
      </div>

      {loading && (
        <div className="text-center">
          <p className="text-muted">Generating math problems... ✨</p>
        </div>
      )}

      {problems.length > 0 && (
        <>
          <div style={{ display: "grid", gap: 10 }}>
            {problems.map((p, i) => (
              <div key={i} className="card card-raised" style={{ padding: 16 }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      fontSize: "1.6rem",
                      color: curOp.c,
                      marginRight: 12,
                    }}
                  >
                    {p.question}
                  </span>

                  <input
                    type="number"
                    className="math-answer"
                    value={answers[i] || ""}
                    onChange={(e) => setAns(i, e.target.value)}
                    placeholder="?"
                    disabled={done}
                    style={{
                      transform: wobble === i ? "scale(1.1)" : "scale(1)",
                    }}
                  />

                  {!done && p.hint && (
                    <button
                      onClick={() => setHints((h) => ({ ...h, [i]: !h[i] }))}
                      style={{
                        marginLeft: 10,
                        background: "none",
                        border: "none",
                        color: "#FFD60A",
                        fontWeight: 800,
                      }}
                    >
                      💡 Hint
                    </button>
                  )}

                  {done && (
                    isCorrect(i) ? (
                      <span
                        style={{
                          color: "limegreen",
                          marginLeft: 10,
                          fontWeight: 800,
                        }}
                      >
                        ✅ Correct
                      </span>
                    ) : (
                      <span
                        style={{
                          color: "red",
                          marginLeft: 10,
                          fontWeight: 800,
                        }}
                      >
                        ❌ Wrong
                      </span>
                    )
                  )}
                </div>

                {hints[i] && !done && (
                  <p style={{ fontSize: ".8rem", marginTop: 8 }}>💡 {p.hint}</p>
                )}

                {done && !isCorrect(i) && (
                  <p style={{ color: "#FFD60A", marginTop: 8 }}>
                    Correct Answer: <b>{p.answer}</b>
                  </p>
                )}
              </div>
            ))}
          </div>

          {!done && (
            <button
              className="btn btn-teal btn-full btn-lg"
              onClick={submit}
              disabled={!allDone}
            >
              ✅ Check My Answers!
            </button>
          )}
        </>
      )}

      {done && (
        <div className="card text-center">
          <h2 style={{ color: "#06B6D4" }}>
            🎯 Total Score: {score}/{problems.length}
          </h2>

          <button className="btn btn-blue" onClick={getProblems}>
            🔄 Try Again
          </button>
        </div>
      )}
    </div>
  );
}
