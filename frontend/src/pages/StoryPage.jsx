import { useState } from "react";
import { useApp } from "../context/AppContext";
import Confetti from "../components/Confetti";
import { buddyShow } from "../components/Buddy";
import { post, speak, listen } from "../hooks/api";
import "./StoryPage.css";

const TOPICS = ["Lion","Space","Ocean","Dragon","Princess","Robot","Jungle","Magic School","Dinosaur","Superhero"];

// ─── Floating Cartoon Animations ──────────────────────────────────────────────
const FLOATING_ITEMS = [
  { emoji: "🦁", style: { left: "5%",  animationDuration: "6s",  animationDelay: "0s"   } },
  { emoji: "⭐", style: { left: "15%", animationDuration: "8s",  animationDelay: "1s"   } },
  { emoji: "🐬", style: { left: "25%", animationDuration: "7s",  animationDelay: "2s"   } },
  { emoji: "🦕", style: { left: "40%", animationDuration: "9s",  animationDelay: "0.5s" } },
  { emoji: "🌟", style: { left: "55%", animationDuration: "6.5s",animationDelay: "1.5s" } },
  { emoji: "🐉", style: { left: "65%", animationDuration: "8.5s",animationDelay: "3s"   } },
  { emoji: "🦋", style: { left: "75%", animationDuration: "7.5s",animationDelay: "0.8s" } },
  { emoji: "🚀", style: { left: "85%", animationDuration: "6s",  animationDelay: "2.5s" } },
  { emoji: "🌈", style: { left: "92%", animationDuration: "9s",  animationDelay: "1.2s" } },
];

// ─── Built-in Fallback Stories ─────────────────────────────────────────────────
const FALLBACK_STORIES = [
  {
    topic: "Lion",
    story: `Once upon a time, in the heart of the great African savanna, there lived a young lion named Leo. Unlike the other lions who roared loudly to show their strength, Leo was known for his kind heart and gentle ways.

One morning, Leo found a tiny bird with a broken wing lying under a baobab tree. Instead of walking past, Leo carefully sheltered the bird with his big paw, protecting it from the hot sun. Every day, Leo brought fresh water in a broad leaf and caught small insects for the bird to eat.

After two weeks, the bird's wing healed completely. Before flying away, the little bird sang the most beautiful song Leo had ever heard. The melody echoed across the savanna, and all the animals paused to listen.

From that day on, whenever Leo walked through the savanna, birds would fly above him singing joyfully. The other lions finally understood — true strength is not about roaring the loudest, but about showing kindness to those who need it most.

Leo became the most beloved lion in the land, not because he was the strongest, but because he was the kindest. And kindness, as everyone in the savanna learned, is the greatest power of all.`,
    translated: `ఒకప్పుడు, గొప్ప ఆఫ్రికన్ సవన్నా హృదయంలో, లియో అనే చిన్న సింహం నివసించేది. బిగ్గరగా అరచే ఇతర సింహాల వలె కాకుండా, లియో తన దయగల హృదయానికి మరియు సున్నితమైన స్వభావానికి ప్రసిద్ధి చెందాడు.

ఒక ఉదయం, లియో ఒక బాయోబాబ్ చెట్టు కింద విరిగిన రెక్కతో ఉన్న చిన్న పక్షిని కనుగొన్నాడు. వెళ్ళిపోవడానికి బదులు, లియో తన పెద్ద అరచేత్తో పక్షిని జాగ్రత్తగా రక్షించాడు. ప్రతి రోజు, లియో పెద్ద ఆకులో తాజా నీరు తెచ్చి పక్షికి తినడానికి చిన్న పురుగులను పట్టుకుంటాడు.

రెండు వారాల తర్వాత, పక్షి రెక్క పూర్తిగా నయమైంది. ఎగిరిపోయే ముందు, చిన్న పక్షి లియో ఎప్పుడూ వినని అత్యంత అందమైన పాట పాడింది.

ఆ రోజు నుండి, లియో సవన్నాలో నడిచినప్పుడల్లా, పక్షులు ఆనందంగా పాడుతూ అతని పైన ఎగురుతాయి. ఇతర సింహాలు చివరకు అర్థం చేసుకున్నాయి — నిజమైన బలం అత్యంత బిగ్గరగా అరవడం గురించి కాదు, కానీ అవసరమైన వారికి దయ చూపడం గురించి.

లియో భూమిలో అత్యంత ప్రేమించబడిన సింహం అయ్యాడు, అతను బలవంతుడు కాబట్టి కాదు, అతను దయగలవాడు కాబట్టి. మరియు దయ, సవన్నాలో ప్రతి ఒక్కరూ నేర్చుకున్నారు, అన్నిటికీ గొప్ప శక్తి.`,
    quiz: {
      questions: [
        { question: "What made Leo different from other lions?", options: ["He was the biggest lion", "He had a kind heart and gentle ways", "He could run the fastest", "He had the loudest roar"], answer: "He had a kind heart and gentle ways" },
        { question: "What did Leo find under the baobab tree?", options: ["A baby elephant", "A tiny bird with a broken wing", "A golden coin", "A magic flower"], answer: "A tiny bird with a broken wing" },
        { question: "How did Leo help the injured bird?", options: ["He ignored it and walked away", "He called other animals for help", "He brought water and food every day", "He carried it to a doctor"], answer: "He brought water and food every day" },
        { question: "What is the main lesson of this story?", options: ["Being the loudest is most important", "Kindness is the greatest power", "Only strong animals are respected", "Birds and lions cannot be friends"], answer: "Kindness is the greatest power" }
      ]
    }
  },
  {
    topic: "Space",
    story: `Far beyond the twinkling stars, in a galaxy full of wonder, there lived a young astronaut named Zara. At just eight years old, Zara had already built three model rockets in her bedroom and could name every planet in the solar system.

One starry night, a small glowing spacecraft landed in Zara's backyard. Out stepped a tiny alien named Pip, with three eyes and purple skin, who looked frightened and lost. His spaceship's engine had broken down, and he was millions of miles from his home planet, Luminos.

Zara didn't hesitate. She grabbed her tool kit and asked Pip to explain the problem. Using drawings and hand signals, they communicated across their language barrier. Together, working through the night, they repaired the engine using spare parts from Zara's old toy robots.

As dawn painted the sky pink, Pip's spaceship hummed to life. Pip handed Zara a glowing crystal. "This is how we say thank you on Luminos," he said in perfect English, having learned from listening to Zara.

Zara waved goodbye as the little spacecraft shot up through the clouds and disappeared into the stars. That morning, she wrote in her journal: "Today I made a friend from another world. Kindness has no language barrier."`,
    translated: `మెరిసే నక్షత్రాలకు అవతల, అద్భుతాలతో నిండిన ఒక గెలాక్సీలో, జారా అనే చిన్న వ్యోమగామి నివసించేది. కేవలం ఎనిమిది సంవత్సరాల వయసులో, జారా ఇప్పటికే తన గదిలో మూడు మోడల్ రాకెట్లు నిర్మించింది.

ఒక నక్షత్రాల రాత్రి, ఒక చిన్న మెరిసే అంతరిక్ష నౌక జారా వెనుక ముంగిట్లో దిగింది. పిప్ అనే చిన్న ఏలియన్ బయటకు వచ్చాడు, అతను భయపడినట్లు మరియు తప్పిపోయినట్లు కనిపించాడు. అతని అంతరిక్ష నౌక ఇంజిన్ పాడైంది.

జారా సంకోచించలేదు. ఆమె తన పరికరాల సెట్‌ను అందుకుంది మరియు పిప్‌ని సమస్య వివరించమని అడిగింది. కలిసి, రాత్రంతా పని చేసి, వారు పాత బొమ్మ రోబోట్ల స్పేర్ పార్ట్స్ ఉపయోగించి ఇంజిన్‌ను మరమ్మతు చేశారు.

తెల్లవారుఝామున, పిప్ అంతరిక్ష నౌక మళ్ళీ పని చేయడం ప్రారంభించింది. పిప్ జారాకు ఒక మెరిసే స్ఫటికాన్ని ఇచ్చాడు. "లుమినోస్‌లో మనం ధన్యవాదాలు చెప్పే విధానం ఇది."

జారా ఆ ఉదయం తన జర్నల్‌లో రాసింది: "ఈరోజు నేను మరొక ప్రపంచం నుండి ఒక స్నేహితుడిని సంపాదించాను. దయకు భాషా అడ్డంకి లేదు."`,
    quiz: {
      questions: [
        { question: "How old was Zara when this story took place?", options: ["Six years old", "Seven years old", "Eight years old", "Ten years old"], answer: "Eight years old" },
        { question: "Why did Pip land in Zara's backyard?", options: ["He wanted to explore Earth", "His spaceship's engine had broken", "He was looking for food", "He wanted to make friends"], answer: "His spaceship's engine had broken" },
        { question: "What did Zara use to fix the spaceship?", options: ["Magic spells", "Parts from old toy robots", "Her dad's car parts", "She called the mechanic"], answer: "Parts from old toy robots" },
        { question: "What did Pip give Zara as a thank you?", options: ["A map of his planet", "A glowing crystal", "A new rocket", "Three alien coins"], answer: "A glowing crystal" }
      ]
    }
  },
  {
    topic: "Ocean",
    story: `Deep beneath the sparkling blue ocean, where sunlight danced through the water in golden beams, there lived a young mermaid named Marina. She had shimmering blue scales and hair the color of sea foam, and she spent her days exploring the coral reef near her home.

One afternoon, Marina discovered something terrible — a massive net of plastic trash tangled around the most beautiful part of the reef, choking the colorful fish and sea turtles who called it home.

Marina knew she couldn't clean it alone. She swam through the ocean calling for help, and soon a team of volunteers answered: three dolphins who could pull the heavy ropes, a pod of whales who cleared the large debris, and hundreds of small fish who worked together to untangle the tiniest pieces.

They worked for three days and three nights. When the last piece of plastic was removed, the reef bloomed back to life. The fish danced, the sea turtles swam freely, and the coral glowed with brilliant colors once more.

The ocean king himself visited Marina. "You didn't just clean a reef," he said, "you showed everyone that when we work together, no problem is too big to solve." From that day on, Marina was known as the Guardian of the Great Reef.`,
    translated: `మెరిసే నీలి సముద్రం లోతుల్లో, మెరీనా అనే చిన్న మత్స్యకన్య నివసించేది. ఆమెకు మెరిసే నీలి పొలుసులు మరియు సముద్రపు నురుగు రంగు జుట్టు ఉంది.

ఒక మధ్యాహ్నం, మెరీనా ఒక భయంకరమైన విషయాన్ని కనుగొంది — పెద్ద ప్లాస్టిక్ చెత్తల వల రీఫ్‌లో చిక్కుకుపోయింది. మెరీనాకు తనొక్కదానికే శుభ్రపరచడం సాధ్యం కాదని తెలుసు.

ఆమె సహాయం అభ్యర్థిస్తూ సముద్రంలో ఈదింది. మూడు డాల్ఫిన్‌లు, తిమింగలాల గుంపు, మరియు వందల చిన్న చేపలు ఆమె పిలుపుకు స్పందించాయి.

వారు మూడు రోజులు మరియు మూడు రాత్రులు పని చేశారు. చివరి ప్లాస్టిక్ ముక్క తొలగించబడినప్పుడు, రీఫ్ మళ్ళీ జీవం పోసుకుంది.

సముద్రపు రాజు స్వయంగా మెరీనాను సందర్శించాడు. "మనం కలిసి పని చేసినప్పుడు, పరిష్కరించడానికి సాధ్యం కాని సమస్య ఏదీ లేదు అని నువ్వు అందరికీ చూపించావు."`,
    quiz: {
      questions: [
        { question: "What was the problem at the reef?", options: ["Too many sharks", "Plastic trash tangled everywhere", "The coral was too cold", "The fish were angry"], answer: "Plastic trash tangled everywhere" },
        { question: "Who helped Marina clean the reef?", options: ["Only dolphins", "The ocean king alone", "Dolphins, whales, and small fish", "Human divers"], answer: "Dolphins, whales, and small fish" },
        { question: "How long did the cleaning take?", options: ["One day", "One week", "Three days and three nights", "A whole month"], answer: "Three days and three nights" },
        { question: "What title did Marina earn at the end?", options: ["Queen of the Ocean", "Guardian of the Great Reef", "Princess of Dolphins", "Keeper of Treasures"], answer: "Guardian of the Great Reef" }
      ]
    }
  },
  {
    topic: "Robot",
    story: `In the bustling city of Techville, where every house had a robot helper, there lived a small robot named Bolt. Unlike the shiny, perfect robots in the store windows, Bolt had a dent on his left side, one eye that blinked faster than the other, and a voice that sometimes squeaked.

Bolt was owned by a seven-year-old girl named Priya, who thought he was absolutely perfect. Every morning, Bolt would make her breakfast (always a little burnt), help her find her missing socks (he kept track of 247 socks), and walk her to school telling robot jokes along the way.

One rainy day, Priya fell into a muddy ditch near the school. Bolt immediately calculated the safest way to pull her out — but his arm wasn't strong enough. Instead of giving up, he called for help through his antenna, alerting all the nearby robots. In seconds, twelve robots of all shapes and sizes came running.

Together, they formed a chain and carefully pulled Priya to safety. Bolt scanned her carefully and his squeaky voice said, "Priya, I may not be a perfect robot, but I will always find a way to keep you safe."

Priya hugged the dented little robot. "That's exactly why you're my perfect robot," she said. And Bolt's chest light glowed the brightest it ever had.`,
    translated: `టెక్‌విల్లే నగరంలో, బోల్ట్ అనే చిన్న రోబో నివసించేది. దుకాణాల అద్దాలలో మెరిసే, పరిపూర్ణ రోబోల వలె కాకుండా, బోల్ట్‌కు ఎడమ వైపు ఒక గుంత ఉంది, ఒక కన్ను వేగంగా ఆరిపోయేది, మరియు ఒక గొంతు ఒకోసారి చిరుగుట వినబడేది.

బోల్ట్‌ను ప్రియా అనే ఏడు సంవత్సరాల అమ్మాయి సొంతం చేసుకుంది, ఆమె అతన్ని పూర్తిగా పరిపూర్ణంగా భావించింది. ప్రతి ఉదయం, బోల్ట్ ఆమె అల్పాహారం తయారు చేసేవాడు, ఆమె మేజోళ్ళు కనుగొనడంలో సహాయపడేవాడు.

ఒక వర్షపు రోజు, ప్రియా ఒక బురదపు కందకంలో పడిపోయింది. బోల్ట్ వెంటనే సహాయం కోసం పిలిచాడు. కొద్ది సెకన్లలో, పన్నెండు రోబోలు పరుగెత్తుకుని వచ్చాయి.

కలిసి, వారు ప్రియాను జాగ్రత్తగా సురక్షితంగా లాగారు. బోల్ట్ యొక్క చిరుగుట గొంతు చెప్పింది, "ప్రియా, నేను పరిపూర్ణ రోబో కాకపోవచ్చు, కానీ నేను ఎల్లప్పుడూ నిన్ను సురక్షితంగా ఉంచడానికి మార్గం కనుగొంటాను."

ప్రియా గుంతపడిన చిన్న రోబోను హత్తుకుంది. "అందుకే నువ్వు నా పరిపూర్ణ రోబో," ఆమె చెప్పింది.`,
    quiz: {
      questions: [
        { question: "What made Bolt different from other robots?", options: ["He was the biggest robot", "He had a dent, blinking eye, and squeaky voice", "He was the most expensive", "He could fly"], answer: "He had a dent, blinking eye, and squeaky voice" },
        { question: "How many socks did Bolt keep track of?", options: ["100 socks", "200 socks", "247 socks", "300 socks"], answer: "247 socks" },
        { question: "Why couldn't Bolt save Priya alone?", options: ["He didn't want to help", "His arm wasn't strong enough", "He was too far away", "He didn't know she fell"], answer: "His arm wasn't strong enough" },
        { question: "What did Bolt say to Priya after saving her?", options: ["I am a perfect robot", "I will always find a way to keep you safe", "I need to be repaired", "Thank you for trusting me"], answer: "I will always find a way to keep you safe" }
      ]
    }
  }
];

const getRandomFallbackStory = () => FALLBACK_STORIES[Math.floor(Math.random() * FALLBACK_STORIES.length)];

const getFallbackByTopic = (topic) => {
  const lower = (topic || "").toLowerCase();
  return FALLBACK_STORIES.find(s => s.topic.toLowerCase() === lower) || getRandomFallbackStory();
};

const normalizeAnswer = (value) =>
  String(value ?? "").replace(/\s+/g, " ").trim().toLowerCase();

const getCorrectOption = (question) => {
  if (!question) return "";
  const rawAnswer = String(question.answer ?? "").trim();
  const options = Array.isArray(question.options) ? question.options : [];
  const idxFromLetter = rawAnswer.match(/^[A-D]$/i)
    ? rawAnswer.toUpperCase().charCodeAt(0) - 65 : -1;
  if (idxFromLetter >= 0 && options[idxFromLetter] !== undefined) return String(options[idxFromLetter]).trim();
  const match = options.find(opt => normalizeAnswer(opt) === normalizeAnswer(rawAnswer));
  return match ? String(match).trim() : rawAnswer;
};

export default function StoryPage() {
  const { profile, addXP } = useApp();

  const [age, setAge]       = useState(profile?.age || 7);
  const [topic, setTopic]   = useState("");
  const [story, setStory]   = useState("");
  const [translated, setTranslated] = useState("");
  const [isFallback, setIsFallback] = useState(false);

  const [storyLoading, setStoryLoading] = useState(false);
  const [quizLoading,  setQuizLoading]  = useState(false);
  const [transLoading, setTransLoading] = useState(false);

  const [quiz,    setQuiz]    = useState(null);
  const [answers, setAnswers] = useState({});
  const [score,   setScore]   = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const [listening, setListening] = useState(false);
  const [confetti,  setConfetti]  = useState(false);
  const [speaking,  setSpeaking]  = useState(false);

  const getStory = async (overrideTopic) => {
    const finalTopic = overrideTopic || topic;
    if (!finalTopic.trim()) return;
    setStoryLoading(true);
    setStory(""); setTranslated(""); setQuiz(null); setScore(null);
    setAnswers({}); setSubmitted(false); setIsFallback(false);

    let success = false;
    try {
      const data = await post("story", { age, topic: finalTopic });
      if (data?.story) { setStory(data.story); success = true; }
    } catch { success = false; }

    if (!success) {
      const fallback = getFallbackByTopic(finalTopic);
      setStory(fallback.story);
      setIsFallback(true);
    }

    addXP(10);
    setConfetti(true);
    buddyShow("win", "Great story! 📖");
    setTimeout(() => setConfetti(false), 1400);
    setStoryLoading(false);
  };

  const handleVoice = () => {
    listen(
      (transcript) => { setTopic(transcript); getStory(transcript); },
      () => setListening(false)
    );
    setListening(true);
  };

  const handleSpeak = () => {
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return; }
    setSpeaking(true);
    speak(story, "en-US", 0.88);
    setTimeout(() => setSpeaking(false), story.length * 65 + 2000);
  };

  const translateToTelugu = async () => {
    setTransLoading(true);
    if (isFallback) {
      const fallback = getFallbackByTopic(topic);
      if (fallback.translated) {
        setTranslated(fallback.translated);
        speak(fallback.translated, "te-IN");
        setTransLoading(false);
        return;
      }
    }
    let ok = false;
    try {
      const data = await post("translate", { text: story });
      if (data?.translated) { setTranslated(data.translated); speak(data.translated, "te-IN"); ok = true; }
    } catch { ok = false; }
    if (!ok) {
      const fallback = getFallbackByTopic(topic);
      if (fallback.translated) { setTranslated(fallback.translated); speak(fallback.translated, "te-IN"); }
      else setTranslated("అనువాదం అందుబాటులో లేదు. దయచేసి మళ్ళీ ప్రయత్నించండి.");
    }
    setTransLoading(false);
  };

  const getQuiz = async () => {
    if (!story) return;
    setQuizLoading(true);
    setQuiz(null); setAnswers({}); setScore(null); setSubmitted(false);
    if (isFallback) {
      const fallback = getFallbackByTopic(topic);
      if (fallback.quiz) {
        setTimeout(() => { setQuiz(fallback.quiz); setQuizLoading(false); }, 600);
        return;
      }
    }
    let ok = false;
    try {
      const data = await post("story-quiz", { story, age });
      const questions = (data?.questions || []).map(q => ({
        ...q, question: String(q.question ?? "").trim(),
        answer: String(q.answer ?? "").trim(),
        options: (q.options || []).map(opt => String(opt ?? "").trim()),
      }));
      if (questions.length > 0) { setQuiz({ questions }); ok = true; }
    } catch { ok = false; }
    if (!ok) {
      const fallback = getFallbackByTopic(topic);
      setQuiz(fallback.quiz || { questions: [] });
    }
    setQuizLoading(false);
  };

  const selectAnswer = (qi, opt) => { if (!submitted) setAnswers(prev => ({ ...prev, [qi]: opt })); };

  const submitQuiz = () => {
    let s = 0;
    quiz.questions.forEach((q, i) => {
      if (normalizeAnswer(answers[i]) === normalizeAnswer(getCorrectOption(q))) s++;
    });
    setScore(s); setSubmitted(true);
    if (s === quiz.questions.length) {
      setConfetti(true); buddyShow("win", "Perfect score! 🌟"); addXP(20);
      setTimeout(() => setConfetti(false), 1400);
    } else { buddyShow("fail", `${s}/${quiz.questions.length} — Good try! 💪`); addXP(10); }
  };

  return (
    <div className="story-page">
      <Confetti active={confetti} />

      {/* Floating Cartoon Animations */}
      <div className="floating-container" aria-hidden="true">
        {FLOATING_ITEMS.map((item, idx) => (
          <div key={idx} className="floating-emoji" style={item.style}>{item.emoji}</div>
        ))}
      </div>

      <div className="story-header">
        <div className="story-header-icon">📖</div>
        <h1 className="story-title">Story Time!</h1>
        <p className="story-sub">Create magical stories & test your understanding ✨</p>
      </div>

      {profile && (
        <div className="story-profile-card" style={{
          background: "var(--c-surface)",
          border: `1px solid ${(profile.color || "#8B5CF6")}33`,
          borderRadius: "var(--r-lg)", padding: "16px 18px", marginBottom: 20,
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: "50%",
            display: "grid", placeItems: "center", fontSize: "1.8rem",
            background: `linear-gradient(135deg, ${profile.color || "#8B5CF6"}, #FF3D9A)`,
          }}>{profile.avatar || "👤"}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 900, fontSize: "1.05rem" }}>{profile.heroName || profile.name || "Student"}</div>
            <div style={{ color: "var(--c-muted)", fontSize: ".92rem", fontWeight: 700 }}>Age: {profile.age || "-"}</div>
            {profile.superpower && <div style={{ color: "#FFD60A", fontSize: ".82rem", marginTop: 4 }}>✨ {profile.superpower}</div>}
          </div>
        </div>
      )}

      <div className="story-input-card">
        <div className="story-age-row">
          <label className="story-label">Child's Age</label>
          <div className="story-age-btns">
            {[4,5,6,7,8,9,10,11,12].map(a => (
              <button key={a} className={`age-chip${age===a?' active':''}`} onClick={() => setAge(a)}>{a}</button>
            ))}
          </div>
        </div>
        <div className="story-topic-row">
          <label className="story-label">Pick a Topic</label>
          <div className="story-topic-chips">
            {TOPICS.map(t => (
              <button key={t} className={`topic-chip-s${topic===t?' active':''}`} onClick={() => setTopic(t)}>{t}</button>
            ))}
          </div>
          <div className="story-input-row">
            <input
              className="story-input" value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="Or type your own topic…"
              onKeyDown={e => e.key === 'Enter' && getStory()}
            />
            <button className={`voice-btn${listening?' active':''}`} onClick={handleVoice} title="Speak your topic">
              {listening ? "🔴" : "🎤"}
            </button>
          </div>
        </div>
        <button className="story-generate-btn" onClick={() => getStory()} disabled={storyLoading || !topic.trim()}>
          {storyLoading ? <><span className="btn-spinner"/>Creating story…</> : <>✨ Generate Story</>}
        </button>
      </div>

      {isFallback && story && (
        <div className="fallback-notice">
          📚 Showing a featured story while we connect. Your personalized story is coming soon!
        </div>
      )}

      {story && (
        <div className="story-display-card">
          <div className="story-display-header">
            <h2 className="story-display-title">📚 Your Story</h2>
            <div className="story-actions">
              <button className={`story-action-btn${speaking?' active':''}`} onClick={handleSpeak}>
                {speaking ? "⏹️ Stop" : "🔊 Read Aloud"}
              </button>
              <button className="story-action-btn teal" onClick={translateToTelugu} disabled={transLoading}>
                {transLoading ? "⏳" : "🌐 Telugu"}
              </button>
              <button className="story-action-btn purple" onClick={getQuiz} disabled={quizLoading}>
                {quizLoading ? <><span className="btn-spinner-sm"/>Quiz…</> : "🎲 Take Quiz"}
              </button>
            </div>
          </div>
          <div className="story-text">
            {story.split(/(?<=[.!?])\s+/).map((sentence, i) => (
              <span key={i} className="story-sentence" onClick={() => speak(sentence)} title="Click to hear">
                {sentence}{' '}
              </span>
            ))}
          </div>
          <p className="story-hint">💡 Click any sentence to hear it read aloud</p>
        </div>
      )}

      {translated && (
        <div className="story-telugu-card">
          <div className="story-display-header">
            <h3 className="story-display-title">🌐 తెలుగు అనువాదం</h3>
            <button className="story-action-btn teal" onClick={() => speak(translated, "te-IN")}>🔊 వినండి</button>
          </div>
          <p className="story-telugu-text">{translated}</p>
        </div>
      )}

      {quiz && quiz.questions?.length > 0 && (
        <div className="story-quiz-card">
          <h2 className="quiz-title">🎲 Story Quiz</h2>
          <p className="quiz-sub">Answer based on the story you just read!</p>
          {quiz.questions.map((q, i) => (
            <div key={i} className="quiz-question">
              <p className="quiz-q-text"><span className="quiz-q-num">{i + 1}</span>{q.question}</p>
              <div className="quiz-options">
                {q.options.map((opt, j) => {
                  const correctOption = getCorrectOption(q);
                  let cls = "quiz-opt";
                  if (submitted) {
                    if (normalizeAnswer(opt) === normalizeAnswer(correctOption)) cls += " correct";
                    else if (normalizeAnswer(answers[i]) === normalizeAnswer(opt)) cls += " wrong";
                  } else if (answers[i] === opt) { cls += " selected"; }
                  return (
                    <button key={j} className={cls} onClick={() => selectAnswer(i, opt)} disabled={submitted}>
                      <span className="opt-letter">{String.fromCharCode(65+j)}</span>{opt}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {!submitted ? (
            <button className="quiz-submit-btn" onClick={submitQuiz}
              disabled={Object.keys(answers).length < quiz.questions.length}>
              ✅ Submit Quiz
            </button>
          ) : (
            <div className="quiz-result">
              <div className="quiz-result-emoji">
                {score === quiz.questions.length ? "🌟" : score >= quiz.questions.length/2 ? "👍" : "💪"}
              </div>
              <h3 className="quiz-result-text">Score: {score}/{quiz.questions.length}</h3>
              <p className="quiz-result-sub">
                {score === quiz.questions.length ? "Perfect! You read carefully! 🎉"
                  : score >= quiz.questions.length/2 ? "Good job! Read the story again to improve! 📖"
                  : "Keep practicing! Every story makes you smarter! ✨"}
              </p>
              <button className="quiz-retry-btn"
                onClick={() => { setQuiz(null); setAnswers({}); setScore(null); setSubmitted(false); }}>
                🔄 Try Again
              </button>
            </div>
          )}
        </div>
      )}

      {!story && !storyLoading && (
        <div className="story-empty">
          <div className="story-empty-icon">📚</div>
          <p>Pick a topic and generate your first story!</p>
        </div>
      )}
    </div>
  );
}