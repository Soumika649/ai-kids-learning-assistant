import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();

app.use(cors({ origin: "*", methods: ["GET", "POST"] }));
app.use(express.json());

/* ── MongoDB connection ─────────────────────────────── */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

/* ── Auth routes ────────────────────────────────────── */
app.use("/auth", authRoutes);

/* ── Gemini AI setup ───────────────────────────────── */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ gemini-1.5-flash = 1500 req/day FREE  |  gemini-2.5-flash = only 20/day FREE
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

/* ── Simple per-IP rate limiter ────────────────────── */
const rateLimitMap = new Map();
function rateLimit(req, res, next) {
  const ip       = req.ip || "unknown";
  const now      = Date.now();
  const windowMs = 60_000;
  const maxReqs  = 15;

  if (!rateLimitMap.has(ip)) rateLimitMap.set(ip, []);
  const timestamps = rateLimitMap.get(ip).filter((t) => now - t < windowMs);
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);

  if (timestamps.length > maxReqs) {
    return res.status(429).json({ error: "Too many requests — please wait a moment! 😊" });
  }
  next();
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, times] of rateLimitMap) {
    const fresh = times.filter((t) => now - t < 60_000);
    if (fresh.length === 0) rateLimitMap.delete(ip);
    else rateLimitMap.set(ip, fresh);
  }
}, 300_000);

app.get("/", (req, res) => {
  res.send("🚀 Backend running. Use /story /quiz /words /translate /math");
});

/* ================================================================
   STORY ENDPOINT
   ================================================================ */

const STORY_FALLBACKS = [
  `Once upon a time, a little girl named Priya found a magic pencil in her garden. Anything she drew came to life! She drew a butterfly and it flew out of the paper. She drew a bowl of her favourite kheer and it appeared on the table. But Priya was a kind child. Instead of drawing things for herself, she drew food for hungry animals and flowers to make her village beautiful. The pencil smiled and granted her one special wish — to always have a happy heart. And so Priya lived joyfully, knowing that kindness is the greatest magic of all.`,
  `Arjun loved going to his grandmother's house in the village every summer. One morning he woke up early and saw a tiny elephant near the pond. The elephant was lost and crying. Arjun gave it some bananas and water. Together they followed the sound of the river and found the elephant's family waiting. The big mama elephant thanked Arjun with a gentle trunk pat. That evening Arjun told his grandmother the whole story. She smiled and said, "A kind heart always finds its way." Arjun never forgot that summer.`,
  `Deep in the jungle lived a young tiger cub named Kanu who was afraid of the dark. Every night he hid under a big leaf and shivered. One day a wise old owl named Moti said, "Kanu, the dark is just the sky resting its eyes." Kanu thought about this. That night he looked up and saw thousands of stars twinkling just for him. He was not afraid anymore. He roared softly at the moon. The moon glowed brighter. From that night on, Kanu became the bravest cub in the jungle and watched over all the sleeping animals.`,
];

let story = "";

app.post("/story", rateLimit, async (req, res) => {
  const { age, topic } = req.body;

  const prompt = `
Write a short story (max 200 words) for a ${age}-year-old Indian child about ${topic}.

Rules:
- Simple English
- No markdown
- No *
- No formatting
`;

  try {
    const result = await model.generateContent(prompt);
    story = result.response.text().replace(/\*/g, "").trim();
    res.json({ story });
  } catch (err) {
    console.error("❌ Story error:", err);
    const fallback = STORY_FALLBACKS[Math.floor(Math.random() * STORY_FALLBACKS.length)];
    res.json({ story: fallback, fallback: true });
  }
});

/* ================================================================
   AVATAR NAME ENDPOINT
   ================================================================ */

app.post("/avatar-name", rateLimit, async (req, res) => {
  const { childName, favoriteAnimal, favoriteColor } = req.body;

  const prompt = `
Create a fun superhero identity for a child named ${childName} whose favorite animal is ${favoriteAnimal} and favorite color is ${favoriteColor}.

Return ONLY valid JSON (no markdown, no backticks):
{
  "heroName": "...",
  "superpower": "...",
  "catchphrase": "..."
}
`;

  try {
    const result = await model.generateContent(prompt);
    let text = result.response.text().replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (err) {
    console.error("❌ Avatar error:", err);
    res.json({
      heroName: `Super ${childName}`,
      superpower: "Infinite curiosity",
      catchphrase: "Learning is my superpower!",
    });
  }
});

/* ================================================================
   QUIZ ENDPOINT
   ================================================================ */

app.post("/quiz", rateLimit, async (req, res) => {
  const { type, age } = req.body;

  let prompt = "";

  if (type === "spelling") {
    prompt = `
Create 5 spelling quiz questions for a ${age}-year-old child.
Each question asks which spelling is correct.
Return STRICT JSON only, no markdown, no extra text:
{"questions":[{"question":"Which spelling is correct?","options":["Applle","Apple","Aple","Apel"],"answer":"Apple"}]}
`;
  } else {
    prompt = `
Create 5 general knowledge questions for a ${age}-year-old child.
Topics may include animals, fruits, colors, planets, school, and India.
Return STRICT JSON only, no markdown, no extra text:
{"questions":[{"question":"What planet do we live on?","options":["Mars","Earth","Venus","Jupiter"],"answer":"Earth"}]}
`;
  }

  try {
    const result = await model.generateContent(prompt);
    let text = result.response.text().replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (err) {
    console.error("❌ Quiz error:", err);
    res.json({
      questions: [
        { question: "Which animal is called king of jungle?", options: ["Tiger", "Lion", "Elephant", "Dog"], answer: "Lion" },
        { question: "Which fruit is yellow?", options: ["Apple", "Banana", "Grapes", "Orange"], answer: "Banana" },
        { question: "How many legs does a dog have?", options: ["2", "3", "4", "5"], answer: "4" },
        { question: "Which planet do we live on?", options: ["Mars", "Earth", "Jupiter", "Venus"], answer: "Earth" },
        { question: "What color is the sky?", options: ["Blue", "Green", "Red", "Yellow"], answer: "Blue" },
      ],
    });
  }
});

/* ================================================================
   ROUTINE WORDS ENDPOINT
   ================================================================ */

app.post("/words", rateLimit, async (req, res) => {
  const { age } = req.body;

  const prompt = `
Pretend you are a ${age}-year-old Indian child.
Describe your daily routine from morning to night.
Rules:
- 6 to 8 short sentences
- One activity per line
- Use modern activities (school, homework, cricket, cartoons)
- Use Indian food (idli, dosa, rice, milk)
- Simple English
- NO markdown
- NO *
- NO bullet points
`;

  try {
    const result = await model.generateContent(prompt);
    let text = result.response.text().replace(/\*/g, "").replace(/•/g, "").trim();
    res.json({ words: text });
  } catch (err) {
    console.error("❌ Words error:", err);
    res.json({
      words: `I wake up early in the morning.
I brush my teeth and drink a glass of milk.
I go to school and learn new things.
In the afternoon I eat rice and curry for lunch.
In the evening I play cricket with my friends.
At night I watch cartoons and eat dinner.
Then I go to sleep happily.`,
    });
  }
});

/* ================================================================
   TRANSLATE ENDPOINT
   ================================================================ */

app.post("/translate", rateLimit, async (req, res) => {
  const { text } = req.body;

  if (!text || text.trim().length < 2) {
    return res.status(400).json({ error: "No text provided to translate." });
  }

  const prompt = `
Translate the following text into Telugu.
Use simple words suitable for kids.
Return ONLY the Telugu translation, no explanation, no English, no markdown.

${text}
`;

  try {
    const result = await model.generateContent(prompt);
    const translated = result.response.text().replace(/\*/g, "").trim();
    res.json({ translated });
  } catch (err) {
    console.error("❌ Translation error:", err);
    // Return a friendly fallback so the UI doesn't break
    res.json({ translated: text, fallback: true });
  }
});

/* ================================================================
   MATH ENDPOINT
   ================================================================ */

app.post("/math", rateLimit, async (req, res) => {
  const { age, operation } = req.body;

  const prompt = `
Generate 5 ${operation} math problems for a ${age}-year-old child.
Return ONLY a JSON array, no markdown, no extra text:
[{"question":"5 + 3 =","answer":8},{"question":"10 + 2 =","answer":12}]
`;

  try {
    const result = await model.generateContent(prompt);
    const raw     = result.response.text();
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const problems = JSON.parse(cleaned);
    res.json({ problems });
  } catch (err) {
    console.error("❌ Math error:", err);
    res.json({
      problems: [
        { question: "5 + 3 =",  answer: 8  },
        { question: "10 + 2 =", answer: 12 },
        { question: "7 + 4 =",  answer: 11 },
        { question: "6 + 6 =",  answer: 12 },
        { question: "9 + 1 =",  answer: 10 },
      ],
    });
  }
});

/* ================================================================
   BUDDY MESSAGE ENDPOINT  (context-aware, called on page load)
   ================================================================ */

app.post("/buddy-message", rateLimit, async (req, res) => {
  const { context, heroName, avatar, age, extra } = req.body;

  const contextGuide = {
    story:       "They're about to read a story. Be enthusiastic about imagination.",
    quiz:        "They're about to take a quiz. Be encouraging and hype them up.",
    math:        "They're doing math. Be motivating, math is their superpower.",
    memory:      "They're playing memory match. Challenge them playfully.",
    routine:     "They're exploring their daily routine. Be warm and curious.",
    leaderboard: "They're checking the leaderboard. Encourage them to keep earning points.",
    win:         "They just WON something! Celebrate wildly! Use lots of emojis!",
    fail:        "They struggled with something. Be kind, encouraging, build them back up.",
    dashboard:   "They just opened the home screen. Welcome them warmly.",
    idle:        "They've been inactive. Gently nudge them to explore something fun.",
    welcome:     "Brand new user! Make them feel amazing and excited to start!",
  };

  const prompt = `
You are Buddy, a magical animated guide character for a kids learning app.
You are talking to ${heroName} (age ${age}) who has the avatar: ${avatar}.

Context: ${contextGuide[context] || "Greet and guide the child."}
${extra ? `Extra info: ${extra}` : ""}

Rules:
- Write EXACTLY 1-2 short sentences (max 25 words total)
- Use the child's name (${heroName}) naturally
- Be warm, playful, energetic — like a best friend
- Use 1-2 emojis maximum
- NO markdown, NO asterisks, NO lists
- Speak directly to the child
- Age-appropriate for a ${age}-year-old

Reply with ONLY the message, nothing else.
`;

  try {
    const result  = await model.generateContent(prompt);
    const message = result.response.text().replace(/\*/g, "").replace(/```/g, "").trim();
    res.json({ message });
  } catch (err) {
    console.error("❌ Buddy message error:", err);
    const fallbacks = {
      story:       `Hey ${heroName}! 📖 What amazing story world shall we explore?`,
      quiz:        `Ready to crush this quiz, ${heroName}? 🎲 I believe in you!`,
      math:        `Numbers are your superpower, ${heroName}! 🧮 Let's solve!`,
      memory:      `Train that amazing brain, ${heroName}! 🧠 Flip those cards!`,
      routine:     `Let's hear about your awesome day, ${heroName}! 📅`,
      leaderboard: `You're climbing the ranks, ${heroName}! 🏆`,
      win:         `YES!!! You absolutely crushed it, ${heroName}! 🎉 So proud!`,
      fail:        `Every champion stumbles, ${heroName}! 💪 Try again!`,
      dashboard:   `Welcome back, ${heroName}! ✨ What adventure calls to you?`,
      idle:        `Psst ${heroName}... something exciting is waiting! 👀`,
    };
    res.json({ message: fallbacks[context] || `Hey ${heroName}! Ready for an adventure? 🌟` });
  }
});

/* ================================================================
   BUDDY ASK ENDPOINT  (voice questions from the child)
   ================================================================ */

app.post("/buddy-ask", rateLimit, async (req, res) => {
  const { question, heroName, age } = req.body;

  if (!question || question.trim().length < 2) {
    return res.json({ message: `Ask me anything, ${heroName}! 🌟` });
  }

  const prompt = `
You are Buddy, a friendly educational guide in a children's learning app.
You are talking to ${heroName}, who is ${age} years old.

The child asked: "${question}"

Answer rules:
- Answer the question DIRECTLY and ACCURATELY
- Keep it to 2-3 short sentences (max 45 words total)
- Use simple words a ${age}-year-old will understand
- Be warm and enthusiastic — like a knowledgeable best friend
- Use 1-2 fun emojis
- If it's a maths question, show the calculation clearly
- If it's about animals/science/geography — give a real fact
- NO markdown, NO asterisks, NO bullet points

Reply with ONLY your answer, nothing else.
`;

  try {
    const result  = await model.generateContent(prompt);
    const message = result.response.text().replace(/\*/g, "").replace(/```/g, "").trim();
    res.json({ message });
  } catch (err) {
    console.error("❌ Buddy ask error:", err.status || err.message);
    const q = question.toLowerCase();
    let fallback;
    if (/\d+\s*[+\-*\/x]\s*\d+/.test(q)) {
      try {
        const expr = q.match(/\d+\s*[+\-*\/]\s*\d+/)?.[0];
        if (expr) {
          const val = Function(`"use strict"; return (${expr})`)();
          fallback = `${expr} = ${val}! 🔢 Great maths question, ${heroName}!`;
        }
      } catch {}
    }
    if (!fallback) {
      fallback = `That's a brilliant question, ${heroName}! 🌟 Ask a teacher or parent — they'll know the answer!`;
    }
    res.json({ message: fallback });
  }
});

/* ================================================================
   STORY QUIZ ENDPOINT  (comprehension quiz from the generated story)
   ================================================================ */

app.post("/story-quiz", rateLimit, async (req, res) => {
  const { story, age } = req.body;

  if (!story || story.trim().length < 20) {
    return res.status(400).json({ error: "No story provided" });
  }

  const prompt = `
Based on this story for a ${age || 7}-year-old child, create 4 multiple-choice comprehension questions.

STORY:
${story}

Rules:
- Questions must be ONLY about events, characters, or facts IN the story above
- Do NOT ask general knowledge questions
- Each question must have 4 options
- One correct answer

Return STRICT JSON only, no markdown, no extra text:
{"questions":[{"question":"...","options":["A","B","C","D"],"answer":"A"}]}
`;

  try {
    const result = await model.generateContent(prompt);
    let text     = result.response.text().replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(text);
    res.json(parsed);
  } catch (err) {
    console.error("❌ Story quiz error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ================================================================
   MEMORY GAME ENDPOINT
   ================================================================ */

const MEMORY_FALLBACKS = {
  animals: [
    { emoji: "🐶", word: "Dog" },       { emoji: "🐱", word: "Cat" },
    { emoji: "🐘", word: "Elephant" },  { emoji: "🦁", word: "Lion" },
    { emoji: "🐸", word: "Frog" },      { emoji: "🦋", word: "Butterfly" },
    { emoji: "🐢", word: "Turtle" },    { emoji: "🦒", word: "Giraffe" },
    { emoji: "🐧", word: "Penguin" },   { emoji: "🦊", word: "Fox" },
    { emoji: "🐼", word: "Panda" },     { emoji: "🦜", word: "Parrot" },
  ],
  food: [
    { emoji: "🍕", word: "Pizza" },     { emoji: "🍎", word: "Apple" },
    { emoji: "🍌", word: "Banana" },    { emoji: "🍓", word: "Strawberry" },
    { emoji: "🥕", word: "Carrot" },    { emoji: "🍦", word: "Ice Cream" },
    { emoji: "🍩", word: "Donut" },     { emoji: "🥑", word: "Avocado" },
    { emoji: "🍇", word: "Grapes" },    { emoji: "🌽", word: "Corn" },
    { emoji: "🥐", word: "Croissant" }, { emoji: "🧁", word: "Cupcake" },
  ],
  flowers: [
    { emoji: "🌸", word: "Cherry Blossom" }, { emoji: "🌺", word: "Hibiscus" },
    { emoji: "🌻", word: "Sunflower" },      { emoji: "🌹", word: "Rose" },
    { emoji: "🌷", word: "Tulip" },          { emoji: "💐", word: "Bouquet" },
    { emoji: "🌼", word: "Daisy" },          { emoji: "🪷", word: "Lotus" },
    { emoji: "🌿", word: "Fern" },           { emoji: "🍀", word: "Clover" },
    { emoji: "🌱", word: "Seedling" },       { emoji: "🌾", word: "Wheat" },
  ],
  transport: [
    { emoji: "🚗", word: "Car" },       { emoji: "✈️", word: "Airplane" },
    { emoji: "🚂", word: "Train" },     { emoji: "🚢", word: "Ship" },
    { emoji: "🚁", word: "Helicopter" },{ emoji: "🛵", word: "Scooter" },
    { emoji: "🚌", word: "Bus" },       { emoji: "🚲", word: "Bicycle" },
    { emoji: "🛸", word: "UFO" },       { emoji: "🚀", word: "Rocket" },
    { emoji: "⛵", word: "Sailboat" },  { emoji: "🏍️", word: "Motorbike" },
  ],
  sports: [
    { emoji: "⚽", word: "Football" },      { emoji: "🏀", word: "Basketball" },
    { emoji: "🎾", word: "Tennis" },        { emoji: "🏏", word: "Cricket" },
    { emoji: "🏊", word: "Swimming" },      { emoji: "🎯", word: "Archery" },
    { emoji: "🏐", word: "Volleyball" },    { emoji: "🥊", word: "Boxing" },
    { emoji: "⛳", word: "Golf" },          { emoji: "🏋️", word: "Weightlifting" },
    { emoji: "🤸", word: "Gymnastics" },    { emoji: "🎿", word: "Skiing" },
  ],
  music: [
    { emoji: "🎵", word: "Music Note" }, { emoji: "🎸", word: "Guitar" },
    { emoji: "🥁", word: "Drums" },      { emoji: "🎹", word: "Piano" },
    { emoji: "🎺", word: "Trumpet" },    { emoji: "🎻", word: "Violin" },
    { emoji: "🎷", word: "Saxophone" },  { emoji: "🪘", word: "Bongo" },
    { emoji: "🎤", word: "Microphone" }, { emoji: "🪗", word: "Accordion" },
    { emoji: "🔔", word: "Bell" },       { emoji: "🎶", word: "Notes" },
  ],
};

app.post("/memory-game", async (req, res) => {
  const { theme, count } = req.body;
  const pairCount = Math.min(Math.max(Number(count) || 8, 4), 12);
  const safeTheme = theme || "animals";
  const pool      = MEMORY_FALLBACKS[safeTheme] || MEMORY_FALLBACKS.animals;
  const shuffled  = [...pool].sort(() => Math.random() - 0.5).slice(0, pairCount);
  shuffled.forEach((p, i) => (p.id = i));
  res.json({ pairs: shuffled });
});

/* ================================================================
   START SERVER
   ================================================================ */

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
});