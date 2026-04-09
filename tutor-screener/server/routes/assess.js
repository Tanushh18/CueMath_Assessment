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

router.post('/', async (req, res) => {
  try {
    const { transcript } = req.body;

    let result;

    try {
      // Primary: Claude (strict JSON)
      const response = await client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: `You are an experienced, fair, and human interviewer evaluating a tutor candidate for teaching kids (ages 6–16).

Focus ONLY on soft skills:
- Communication clarity
- Warmth (tone, empathy)
- Patience
- Ability to simplify concepts
- English fluency

Be grounded in the transcript. Use SPECIFIC quotes from the candidate as evidence.

Transcript:
${transcript}

Return ONLY valid JSON (no markdown, no extra text) in this exact format:
{
  "recommendation": "Pass | Maybe | Reject",
  "summary": "2 concise sentences summarizing overall performance in a friendly, professional tone",
  "scores": {
    "clarity": {"score": 1-10, "quote": "exact quote from candidate"},
    "warmth": {"score": 1-10, "quote": "exact quote"},
    "patience": {"score": 1-10, "quote": "exact quote"},
    "simplicity": {"score": 1-10, "quote": "exact quote"},
    "fluency": {"score": 1-10, "quote": "exact quote"}
  }
}

Scoring guidance:
- 8–10: strong, clear, natural, student-friendly
- 5–7: acceptable but inconsistent
- 1–4: unclear, robotic, or not student-friendly

Do not hallucinate quotes. If evidence is weak, reflect that in score.`
          }
        ]
      });

      result = normalizeResult(JSON.parse(response.content[0].text));

    } catch (apiError) {
      console.log('Claude failed, switching to Phi-3...', apiError.message);

      try {
        // First fallback: Phi-3 (local)
        const ollamaRes = await fetch('http://localhost:11434/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: 'phi3',
            prompt: `You are evaluating a tutor candidate for kids (6–16). Focus on clarity, warmth, patience, simplicity, and fluency.

Transcript:
${transcript}

Write:
- A friendly 2 sentence summary
- A final recommendation (Pass/Maybe/Reject)
- Scores (1-10) for clarity, warmth, patience, simplicity, fluency
- Include a short reason with a brief quote from the candidate for each score

Keep it concise and human-like.`,
            stream: false
          })
        });

        const data = await ollamaRes.json();
        const text = data.response || '';

        result = normalizeResult({
          recommendation: text.includes('Pass') ? 'Pass' : text.includes('Reject') ? 'Reject' : 'Maybe',
          summary: text.slice(0, 200),
          scores: {
            clarity: { score: 6, quote: 'Based on overall explanation quality' },
            warmth: { score: 6, quote: 'Based on tone inferred' },
            patience: { score: 6, quote: 'Based on responses' },
            simplicity: { score: 6, quote: 'Based on explanation simplicity' },
            fluency: { score: 6, quote: 'Based on language fluency' }
          }
        });

      } catch (phiError) {
        console.log('Phi-3 failed, switching to Gemini...', phiError.message);

        try {
          // Final fallback: Gemini
          const { GoogleGenerativeAI } = require("@google/generative-ai");
          const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
          const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

          const geminiRes = await model.generateContent(`
You are a human interviewer evaluating a tutor for kids (6–16). Use the transcript to assess clarity, warmth, patience, simplicity, and fluency with quotes.

Transcript:
${transcript}

Return STRICT JSON only:
{
  "recommendation": "Pass | Maybe | Reject",
  "summary": "2 concise sentences",
  "scores": {
    "clarity": {"score": 1-10, "quote": "..."},
    "warmth": {"score": 1-10, "quote": "..."},
    "patience": {"score": 1-10, "quote": "..."},
    "simplicity": {"score": 1-10, "quote": "..."},
    "fluency": {"score": 1-10, "quote": "..."}
  }
}

No markdown. No backticks. No extra text.`)

          const raw = geminiRes.response.text();
          console.log("Gemini raw response:", raw);
          const clean = raw
            .replace(/```json|```/g, '')
            .replace(/^[^\{]*/, '')
            .replace(/[^\}]*$/, '')
            .trim();

          result = normalizeResult(JSON.parse(clean));

        } catch (geminiError) {
          console.error('All models failed:', geminiError.message);

          result = normalizeResult({
            recommendation: "Maybe",
            summary: "Unable to generate full assessment at this time.",
            scores: {
              clarity: { score: 5, quote: "Fallback default" },
              warmth: { score: 5, quote: "Fallback default" },
              patience: { score: 5, quote: "Fallback default" },
              simplicity: { score: 5, quote: "Fallback default" },
              fluency: { score: 5, quote: "Fallback default" }
            }
          });
        }
      }
    }

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Assessment failed' });
  }
});

module.exports = router;