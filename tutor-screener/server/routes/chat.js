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
      // Predefined interview questions
      const QUESTIONS = [
        "THIS IS TEST QUESTION",
        "How do you handle a student who is struggling to understand a concept?",
        "How do you keep students engaged during a lesson?",
        "How do you ensure a student has truly understood a topic?",
        "Can you share an example of a challenging teaching situation and how you handled it?"
      ];

      // Count how many assistant questions already asked
      const askedCount = messages.filter(m => m.role === "assistant").length;

      // Store user responses
      const userResponses = messages
        .filter(m => m.role === "user")
        .map(m => m.content);

      // If still questions left
      if (askedCount < QUESTIONS.length) {
        replyText = QUESTIONS[askedCount];
      } else {
        // Interview finished – frontend should now call /api/assess
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