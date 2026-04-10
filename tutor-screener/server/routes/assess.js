const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');

// fetch for node (used for Ollama fallback)
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

function normalizeResult(r) {
  return {
    recommendation: r?.recommendation || "Maybe",
    summary: r?.summary || "No summary generated.",
    scores: {
      clarity: {
        score: r?.scores?.clarity?.score ?? 5,
        quote: r?.scores?.clarity?.quote || "No evidence provided"
      },
      warmth: {
        score: r?.scores?.warmth?.score ?? 5,
        quote: r?.scores?.warmth?.quote || "No evidence provided"
      },
      patience: {
        score: r?.scores?.patience?.score ?? 5,
        quote: r?.scores?.patience?.quote || "No evidence provided"
      },
      simplicity: {
        score: r?.scores?.simplicity?.score ?? 5,
        quote: r?.scores?.simplicity?.quote || "No evidence provided"
      },
      fluency: {
        score: r?.scores?.fluency?.score ?? 5,
        quote: r?.scores?.fluency?.quote || "No evidence provided"
      }
    }
  };
}

async function callGeminiWithRetry(model, prompt, retries = 5, baseDelay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await model.generateContent(prompt);
    } catch (err) {
      const isRetryable = err.message.includes('429') || err.message.includes('503');

      if (isRetryable && i < retries - 1) {
        const delay = baseDelay * Math.pow(2, i); // exponential backoff
        console.log(`Retrying Gemini... attempt ${i + 1}, waiting ${delay}ms`);
        await new Promise(res => setTimeout(res, delay));
      } else {
        throw err;
      }
    }
  }
}

router.post('/', async (req, res) => {
  try {
    const { transcript } = req.body;

    let result;

    try {
      const { GoogleGenerativeAI } = require("@google/generative-ai");
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const geminiRes = await callGeminiWithRetry(model, `
You are an experienced, fair, and human interviewer evaluating a tutor candidate for teaching kids (ages 6–16).

Focus ONLY on soft skills:
- Communication clarity
- Warmth (tone, empathy)
- Patience
- Ability to simplify concepts
- English fluency

Be grounded in the transcript. Use SPECIFIC quotes from the candidate as evidence.

Transcript:
${transcript}

Return STRICT JSON only:
{
  "recommendation": "Pass | Maybe | Reject",
  "summary": "2 concise sentences summarizing overall performance",
  "scores": {
    "clarity": {"score": 1-10, "quote": "..."},
    "warmth": {"score": 1-10, "quote": "..."},
    "patience": {"score": 1-10, "quote": "..."},
    "simplicity": {"score": 1-10, "quote": "..."},
    "fluency": {"score": 1-10, "quote": "..."}
  }
}

No markdown. No backticks. No extra text.`);

      const raw = geminiRes.response.text();

      const clean = raw
        .replace(/```json|```/g, '')
        .replace(/^[^\{]*/, '')
        .replace(/[^\}]*$/, '')
        .trim();

      result = normalizeResult(JSON.parse(clean));

    } catch (error) {
      console.error('Gemini failed:', error.message);

      let userMessage = "Unable to generate assessment at this time.";

      if (error.message.includes('429')) {
        userMessage = "Report not generated: Free tier quota exceeded. Please try again later.";
      } else if (error.message.includes('503')) {
        userMessage = "Report not generated: AI service is currently overloaded. Please retry in a few seconds.";
      } else if (error.message.includes('API_KEY_INVALID')) {
        userMessage = "Report not generated: Invalid or expired API key.";
      }

      result = normalizeResult({
        recommendation: "Maybe",
        summary: userMessage,
        scores: {
          clarity: { score: 5, quote: "Fallback default" },
          warmth: { score: 5, quote: "Fallback default" },
          patience: { score: 5, quote: "Fallback default" },
          simplicity: { score: 5, quote: "Fallback default" },
          fluency: { score: 5, quote: "Fallback default" }
        }
      });
    }

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Assessment failed' });
  }
});

module.exports = router;