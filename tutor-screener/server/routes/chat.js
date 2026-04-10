const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const express = require('express');
const router = express.Router();

function formatReply(text) {
  if (!text) return "Could you tell me more about y?";

  // remove markdown/backticks
  let t = text.replace(/```[\s\S]*?```/g, '').trim();

  // split into sentences
  const sentences = t.split(/(?<=[.!?])\s+/).filter(Boolean);

  // keep at most 2 sentences
  let kept = sentences.slice(0, 2).join(' ');

  // ensure ends with one question
  if (!/\?$/.test(kept)) {
    // try to find a question sentence
    const q = sentences.find(s => /\?$/.test(s));
    if (q) {
      kept = sentences[0] ? `${sentences[0]} ${q}` : q;
    } else {
      // append a simple follow-up
      kept = `${kept.replace(/[.!]+$/, '')}. Can you elaborate a bit more?`;
    }
  }

  // ensure only one question (keep last '?')
  const parts = kept.split('?');
  if (parts.length > 2) {
    kept = parts.slice(0, -1).join('?').split('?')[0] + '?';
  }

  return kept.trim();
}

router.post('/', async (req, res) => {
  try {
    const { messages } = req.body;
    let replyText;
    try {
      const userMessages = messages.filter(m => m.role === "user");
      const lastUserMsg = userMessages[userMessages.length - 1]?.content || "";

      const FOLLOW_UP_QUESTIONS = [
        "Can you give a specific example from your experience?",
        "How did the student respond in that situation?",
        "What would you do differently next time?",
        "How do you measure if your approach worked?",
        "Can you break that down in a simpler way for a child?",
        "How would you explain this to a 10-year-old?",
        "What challenges do you usually face while teaching this?",
        "How do you adapt if a student loses interest?",
        "Can you walk me through your thought process step by step?",
        "How do you ensure long-term retention of concepts?",
        "What signals tell you a student is confused?",
        "How do you handle repeated mistakes from a student?",
        "Can you share another example like this?",
        "How do you build confidence in weak students?",
        "How do you keep explanations engaging?",
        "What tools or techniques do you use to simplify topics?",
        "How do you manage time during a lesson?",
        "How do you balance speed and understanding?",
        "How do you personalize teaching for different students?",
        "How do you check understanding without directly asking?",
        "What’s your strategy for revision?",
        "How do you motivate a disengaged student?",
        "What’s the hardest concept you’ve taught and how?",
        "How do you explain abstract concepts effectively?",
        "How do you handle a student who says ‘I don’t understand’ repeatedly?",
        "What would you do if a student gives up midway?",
        "How do you encourage questions from students?",
        "How do you handle incorrect answers constructively?",
        "How do you create a comfortable learning environment?",
        "How do you assess improvement over time?",
        "How do you adjust difficulty level during teaching?",
        "What techniques do you use to maintain attention?",
        "How do you explain mistakes without discouraging the student?",
        "How do you build conceptual clarity?",
        "How do you deal with different learning speeds?",
        "How do you encourage independent thinking?",
        "How do you make learning fun?",
        "How do you structure your lesson plans?",
        "How do you deal with distractions during teaching?",
        "How do you ensure active participation?",
        "How do you summarize a lesson effectively?",
        "How do you reinforce previously learned concepts?",
        "How do you handle pressure during teaching?",
        "How do you respond to unexpected questions?",
        "How do you keep improving as a teacher?",
        "What feedback have you received and how did you act on it?",
        "How do you handle a completely new topic?",
        "How do you simplify complex problems?",
        "How do you track student progress?",
        "How do you ensure consistency in teaching?",
        "How do you build rapport with students?",
        "How do you manage difficult situations in class?"
      ];

      const askedCount = messages.filter(m => m.role === "assistant").length;

      if (askedCount === 0) {
        replyText = "Can you tell me about your teaching experience?";
      } else if (askedCount < 55) {
        const randomIndex = Math.floor(Math.random() * FOLLOW_UP_QUESTIONS.length);
        replyText = FOLLOW_UP_QUESTIONS[randomIndex];
      } else {
        replyText = "Interview completed. Generating your report...";
      }
    } catch (err) {
      replyText = "Sorry, I'm having trouble responding right now. Please try again.";
    }
    res.json({ reply: replyText });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Chat failed' });
  }
});

module.exports = router;
