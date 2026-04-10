import { useState, useEffect, useRef, useCallback } from 'react';

// ─── Constants ───────────────────────────────────────────────────────────────
const TOTAL = 5;
const SKILLS = ['clarity', 'warmth', 'patience', 'simplicity', 'fluency'];
const FEEDBACK_GOOD = [
  'Great clarity!',
  'Excellent warmth',
  'Solid answer',
  'Very clear explanation',
  'Nice fluency',
];
const FEEDBACK_TIP = [
  'Try a specific example',
  'Keep it simpler',
  'Add more detail',
  'Be more concise',
  'Show your enthusiasm',
];
const INSIGHTS = [
  'Evaluating your communication style…',
  'Testing patience and empathy now',
  'Checking for subject clarity next',
  'Assessing teaching fluency…',
  'Final round — stay confident!',
];

// ─── Keyframes (injected once) ───────────────────────────────────────────────
const KEYFRAMES = `
  @keyframes fadeUp    { from{opacity:0;transform:translateY(8px)}  to{opacity:1;transform:translateY(0)} }
  @keyframes pulse     { 0%,100%{opacity:.4;transform:scale(1)} 50%{opacity:.9;transform:scale(1.15)} }
  @keyframes spin      { to{transform:rotate(360deg)} }
  @keyframes shimmer   { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
  @keyframes slideR    { from{opacity:0;transform:translateX(10px)}  to{opacity:1;transform:translateX(0)} }
  @keyframes slideL    { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:translateX(0)} }
  @keyframes pop       { 0%{transform:scale(.85);opacity:0} 60%{transform:scale(1.06)} 100%{transform:scale(1);opacity:1} }
  @keyframes confetti  { 0%{transform:translateY(0) rotate(0);opacity:1} 100%{transform:translateY(90px) rotate(720deg);opacity:0} }
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getInitials(name) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function getTimestamp() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function markdownToHTML(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)/gm, '<li style="margin-left:16px;list-style:disc">$1</li>')
    .replace(/\n/g, '<br/>');
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({ initials, variant = 'ai' }) {
  const styles = {
    ai:   { background: '#E1F5EE', color: '#0F6E56' },
    user: { background: '#EEEDFE', color: '#534AB7' },
  };
  return (
    <div style={{
      width: 34, height: 34, borderRadius: '50%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 11, fontWeight: 500, flexShrink: 0,
      ...styles[variant],
    }}>
      {initials}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: 9, alignItems: 'flex-end' }}>
      <Avatar initials="RY" variant="ai" />
      <div style={{
        background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)',
        borderRadius: '4px 14px 14px 14px', padding: '11px 14px',
        display: 'flex', gap: 5, alignItems: 'center',
      }}>
        {[0, 0.2, 0.4].map((d, i) => (
          <span key={i} style={{
            width: 6, height: 6, borderRadius: '50%', background: '#1D9E75',
            display: 'inline-block',
            animation: `pulse 1.2s ease-in-out ${d}s infinite`,
          }} />
        ))}
      </div>
    </div>
  );
}

function SkeletonBubble() {
  const skBase = {
    borderRadius: 8, height: 14,
    background: 'linear-gradient(90deg,#f1f1f1 25%,#e0e0e0 50%,#f1f1f1 75%)',
    backgroundSize: '400px 100%',
    animation: 'shimmer 1.4s infinite',
  };
  return (
    <div style={{ display: 'flex', gap: 9, alignItems: 'flex-end' }}>
      <Avatar initials="RY" variant="ai" />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1, maxWidth: '72%' }}>
        <div style={{ ...skBase, width: '90%' }} />
        <div style={{ ...skBase, width: '65%' }} />
      </div>
    </div>
  );
}

function FeedbackPill({ type, text }) {
  const styles = {
    good: { background: '#E1F5EE', color: '#0F6E56', border: '0.5px solid rgba(15,110,86,.15)' },
    tip:  { background: '#FAEEDA', color: '#854F0B', border: '0.5px solid rgba(133,79,11,.15)' },
  };
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      fontSize: 11, padding: '3px 9px', borderRadius: 99,
      marginTop: 4, animation: 'pop .3s ease',
      ...styles[type],
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />
      {text}
    </div>
  );
}

function InsightBox({ text }) {
  return (
    <div style={{
      background: '#fff',
      border: '0.5px solid rgba(0,0,0,0.08)',
      borderLeft: '2px solid #1D9E75',
      borderRadius: '0 10px 10px 0',
      padding: '9px 12px',
      fontSize: 12,
      color: '#555',
      animation: 'fadeUp .4s ease',
    }}>
      <strong style={{ color: '#0F6E56', fontWeight: 500 }}>AI Insight:</strong> {text}
    </div>
  );
}

function SkillBar({ name, value }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 80, flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 10, color: '#888', textTransform: 'capitalize' }}>{name}</span>
        <span style={{ fontSize: 10, color: '#0F6E56', fontWeight: 500 }}>{value}%</span>
      </div>
      <div style={{ height: 3, background: '#D3D1C7', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${value}%`,
          background: 'linear-gradient(90deg,#1D9E75,#9FE1CB)',
          borderRadius: 99, transition: 'width .8s cubic-bezier(.4,0,.2,1)',
        }} />
      </div>
    </div>
  );
}

function MessageBubble({ msg, nameInitials }) {
  const isUser = msg.role === 'user';
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard?.writeText(msg.content).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: isUser ? 'row-reverse' : 'row',
      gap: 9, alignItems: 'flex-end',
      animation: isUser ? 'slideR .3s ease' : 'slideL .3s ease',
    }}>
      <Avatar initials={isUser ? nameInitials : 'RY'} variant={isUser ? 'user' : 'ai'} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, maxWidth: '72%', alignItems: isUser ? 'flex-end' : 'flex-start' }}>
        <div style={{ position: 'relative' }}>
          {/* Copy action (AI only) */}
          {!isUser && (
            <button
              onClick={handleCopy}
              style={{
                position: 'absolute', top: -26, right: 0,
                border: '0.5px solid rgba(0,0,0,0.1)',
                background: '#fff', color: '#666',
                padding: '3px 8px', borderRadius: 6,
                fontSize: 11, cursor: 'pointer',
                opacity: 0,
                transition: 'opacity .15s',
              }}
              className="bubble-copy-btn"
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          )}
          <div
            style={{
              padding: '9px 13px', fontSize: 14, lineHeight: 1.65, color: '#111',
              background: isUser ? '#EEEDFE' : '#fff',
              border: `0.5px solid ${isUser ? 'rgba(83,74,183,.15)' : 'rgba(0,0,0,0.08)'}`,
              borderRadius: isUser ? '14px 4px 14px 14px' : '4px 14px 14px 14px',
            }}
            dangerouslySetInnerHTML={{ __html: markdownToHTML(msg.content) }}
          />
        </div>
        {msg.feedback && <FeedbackPill type={msg.feedback.type} text={msg.feedback.text} />}
        <span style={{ fontSize: 10, color: '#999', padding: '0 4px' }}>{msg.timestamp}</span>
      </div>
    </div>
  );
}

function ProgressStrip({ turnCount, skillScores }) {
  const pct = Math.round((turnCount / TOTAL) * 100);
  return (
    <div style={{
      background: '#fff', padding: '10px 16px 12px',
      borderBottom: '0.5px solid rgba(0,0,0,0.07)',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: '#888' }}>Progress</span>
        <span style={{ fontSize: 11, color: '#0F6E56', fontWeight: 500 }}>
          Question {Math.min(turnCount + 1, TOTAL)} of {TOTAL}
        </span>
      </div>
      <div style={{ height: 4, background: '#E1F5EE', borderRadius: 99, overflow: 'hidden', marginBottom: 10 }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: 'linear-gradient(90deg,#1D9E75,#5DCAA5)',
          borderRadius: 99, transition: 'width .6s cubic-bezier(.4,0,.2,1)',
        }} />
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {SKILLS.map((s) => (
          <SkillBar key={s} name={s} value={skillScores[s]} />
        ))}
      </div>
    </div>
  );
}

function EndScreen({ skillScores, onRetry }) {
  const overall = Math.round(
    Object.values(skillScores).reduce((a, b) => a + b, 0) / SKILLS.length / 10
  );
  const pct = overall * 10;
  const rec = pct >= 70 ? 'Strong Hire' : pct >= 50 ? 'Potential Hire' : 'Needs Improvement';
  const recColor = pct >= 70 ? '#0F6E56' : pct >= 50 ? '#854F0B' : '#dc2626';
  const recBg   = pct >= 70 ? '#E1F5EE'  : pct >= 50 ? '#FAEEDA' : '#fef2f2';
  const strengths   = SKILLS.filter((s) => skillScores[s] >= 50).slice(0, 3);
  const improvements = SKILLS.filter((s) => skillScores[s] < 50).slice(0, 2);

  function handleShare() {
    const text = `I scored ${overall}/10 on the Cuemath Tutor Interview! 🎉`;
    if (navigator.share) {
      navigator.share({ title: 'Cuemath Interview', text }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(text);
      alert('Result copied to clipboard!');
    }
  }

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '24px 16px', overflowY: 'auto',
      animation: 'fadeUp .5s ease',
    }}>
      <div style={{
        background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)',
        borderRadius: 16, padding: 24, width: '100%', maxWidth: 480,
        animation: 'pop .4s ease',
      }}>
        {/* Score */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 52, fontWeight: 500, color: '#0F6E56', lineHeight: 1 }}>
            {overall}
            <span style={{ fontSize: 22, color: '#888' }}>/10</span>
          </div>
          <div style={{ fontSize: 13, color: '#888', marginTop: 4 }}>Overall Interview Score</div>
          <div style={{
            display: 'inline-block', marginTop: 10,
            padding: '4px 14px', borderRadius: 99,
            fontSize: 12, fontWeight: 500,
            background: recBg, color: recColor,
            border: `0.5px solid ${recColor}33`,
          }}>
            {rec}
          </div>
        </div>

        {/* Skill breakdown */}
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 11, color: '#888', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 10 }}>
            Skill breakdown
          </div>
          {SKILLS.map((s) => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7 }}>
              <span style={{ fontSize: 12, color: '#888', textTransform: 'capitalize', width: 80 }}>{s}</span>
              <div style={{ flex: 1, height: 5, background: '#D3D1C7', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${skillScores[s]}%`,
                  background: 'linear-gradient(90deg,#1D9E75,#9FE1CB)',
                  borderRadius: 99, transition: 'width 1s cubic-bezier(.4,0,.2,1)',
                }} />
              </div>
              <span style={{ fontSize: 11, color: '#0F6E56', fontWeight: 500, minWidth: 32, textAlign: 'right' }}>
                {skillScores[s]}%
              </span>
            </div>
          ))}
        </div>

        {/* Strengths */}
        {strengths.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, color: '#888', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 8 }}>
              Strengths
            </div>
            {strengths.map((s) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#111', padding: '3px 0' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#1D9E75', flexShrink: 0 }} />
                Strong {s}
              </div>
            ))}
          </div>
        )}

        {/* Improvements */}
        {improvements.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, color: '#888', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 8 }}>
              Areas to improve
            </div>
            {improvements.map((s) => (
              <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#111', padding: '3px 0' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#BA7517', flexShrink: 0 }} />
                Work on {s}
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
          <button
            onClick={onRetry}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 10,
              border: '0.5px solid rgba(0,0,0,0.12)',
              background: '#fff', color: '#111', fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Retry interview
          </button>
          <button
            onClick={handleShare}
            style={{
              flex: 1, padding: '10px 0', borderRadius: 10,
              border: 'none', background: '#1D9E75', color: '#fff',
              fontSize: 13, cursor: 'pointer',
            }}
          >
            Share result
          </button>
        </div>
      </div>
    </div>
  );
}

function Confetti() {
  const colors = ['#1D9E75', '#5DCAA5', '#534AB7', '#EEEDFE', '#9FE1CB', '#0F6E56'];
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 999 }}>
      {Array.from({ length: 36 }).map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 30}%`,
          width: 8, height: 8,
          background: colors[i % colors.length],
          borderRadius: Math.random() > 0.5 ? '50%' : 2,
          animation: `confetti ${0.6 + Math.random() * 0.6}s ease forwards`,
          animationDelay: `${Math.random() * 0.5}s`,
        }} />
      ))}
    </div>
  );
}

// ─── API call ─────────────────────────────────────────────────────────────────
async function callAPI(messages) {
  try {
    const res = await fetch('https://cuemath-assessment1.onrender.com/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });
    if (!res.ok) throw new Error('Server error');
    const data = await res.json();
    return data.reply;
  } catch {
    return "Sorry, I couldn't connect to the server. Please try again.";
  }
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Interview({ name, onFinish }) {
  const INTERVIEWERS = [
    'Riya', 'Aman', 'Neha', 'Arjun', 'Priya', 'Rahul', 'Sneha', 'Karan'
  ];
  const interviewerNameRef = useRef(
    INTERVIEWERS[Math.floor(Math.random() * INTERVIEWERS.length)]
  );
  const [messages, setMessages]     = useState([]);
  const [input, setInput]           = useState('');
  const [turnCount, setTurnCount]   = useState(0);
  const [loading, setLoading]       = useState(false);
  const [phase, setPhase]           = useState('loading'); // 'loading' | 'interview' | 'done'
  const [skillScores, setSkillScores] = useState(
    Object.fromEntries(SKILLS.map((s) => [s, 0]))
  );
  const [insights, setInsights]     = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [isListening, setIsListening]   = useState(false);
  const [hdrSub, setHdrSub]         = useState('Starting interview…');

  const bottomRef     = useRef(null);
  const textareaRef   = useRef(null);
  const recognitionRef = useRef(null);
  const apiMsgsRef    = useRef([]); // raw [{role,content}] for API

  const nameInitials = getInitials(name);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, insights]);

  // Start
  useEffect(() => {
    startInterview();
  }, []);

  async function startInterview() {
    setHdrSub('Waking up server…');
    setShowSkeleton(true);
    const intro = [{ role: 'user', content: `My name is ${name}. Start the interview.` }];
    apiMsgsRef.current = intro;
    const reply = await callAPI(intro);
    apiMsgsRef.current.push({ role: 'assistant', content: reply });
    setShowSkeleton(false);
    setMessages([{ role: 'assistant', content: reply, timestamp: getTimestamp() }]);
    setInsights([INSIGHTS[0]]);
    setHdrSub(`Interviewing: ${name}`);
    setPhase('interview');
    setTimeout(() => textareaRef.current?.focus(), 300);
  }

  async function handleSend() {
    if (!input.trim() || loading || phase !== 'interview') return;
    const userText = input.trim();
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    const userMsg = { role: 'user', content: userText, timestamp: getTimestamp() };
    setMessages((prev) => [...prev, userMsg]);
    apiMsgsRef.current.push({ role: 'user', content: userText });

    setLoading(true);

    // Realistic delay
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 800));

    const reply = await callAPI(apiMsgsRef.current);
    apiMsgsRef.current.push({ role: 'assistant', content: reply });

    const newTurn = turnCount + 1;
    setTurnCount(newTurn);

    // Update skill scores
    setSkillScores((prev) => {
      const next = { ...prev };
      const primarySkill = SKILLS[newTurn % SKILLS.length];
      next[primarySkill] = Math.min(100, next[primarySkill] + 15 + Math.floor(Math.random() * 25));
      SKILLS.forEach((s, i) => {
        if (i < newTurn) {
          next[s] = Math.max(next[s], 20 + Math.floor(Math.random() * 30));
        }
      });
      return next;
    });

    // Feedback pill
    const isGood = Math.random() > 0.35;
    const feedback = {
      type: isGood ? 'good' : 'tip',
      text: isGood
        ? FEEDBACK_GOOD[newTurn % FEEDBACK_GOOD.length]
        : FEEDBACK_TIP[newTurn % FEEDBACK_TIP.length],
    };

    const aiMsg = { role: 'assistant', content: reply, timestamp: getTimestamp(), feedback };
    setMessages((prev) => [...prev, aiMsg]);

    if (newTurn < TOTAL) {
      setInsights((prev) => [...prev, INSIGHTS[Math.min(newTurn, INSIGHTS.length - 1)]]);
    }

    setLoading(false);

    const isDone = reply.toLowerCase().includes('thank you') || newTurn >= TOTAL;
    if (isDone) {
      setTimeout(async () => {
        setPhase('done');
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 1600);

        try {
          // Build transcript from messages
          const transcript = apiMsgsRef.current
            .map(m => `${m.role.toUpperCase()}: ${m.content}`)
            .join("\n");

          const res = await fetch('https://cuemath-assessment1.onrender.com/api/assess', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ transcript })
          });

          const data = await res.json();

          // Send real AI report to Results
          onFinish?.(data);
        } catch (err) {
          console.error('Assessment failed:', err);
          onFinish?.({
            summary: 'Failed to generate report',
            recommendation: 'Maybe'
          });
        }
      }, 1200);
    }
  }

  // ── Voice input ──────────────────────────────────────────────────────────────
  function toggleMic() {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please use Chrome.');
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = 'en-IN';
    recognitionRef.current = rec;
    setIsListening(true);

    rec.onresult = (e) => {
      let transcript = '';

      for (let i = e.resultIndex; i < e.results.length; i++) {
        transcript += e.results[i][0].transcript;
      }

      setInput(prev => {
        const updated = (prev ? prev + ' ' : '') + transcript;

        // resize textarea properly
        if (textareaRef.current) {
          textareaRef.current.value = updated;
          textareaRef.current.style.height = 'auto';
          textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
        }

        return updated;
      });
    };
    rec.onend = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);
    rec.start();
    rec.onstart = () => console.log('Mic started');
  }

  // ── Textarea auto-resize ──────────────────────────────────────────────────────
  function handleTextareaInput(e) {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  }

  // ── Styles ────────────────────────────────────────────────────────────────────
  const S = {
    root: {
      minHeight: '100vh',
      background: '#f8faf9',
      display: 'flex',
      flexDirection: 'column',
      maxWidth: 700,
      margin: '0 auto',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    },
    header: {
      background: '#fff',
      borderBottom: '0.5px solid rgba(0,0,0,0.08)',
      padding: '12px 16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexShrink: 0,
    },
    hdrAvatar: {
      width: 40, height: 40, borderRadius: '50%',
      background: '#E1F5EE', color: '#0F6E56',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 13, fontWeight: 500, flexShrink: 0, position: 'relative',
    },
    onlineDot: {
      position: 'absolute', bottom: 1, right: 1,
      width: 9, height: 9, borderRadius: '50%',
      background: '#1D9E75', border: '2px solid #fff',
    },
    msgArea: {
      flex: 1, overflowY: 'auto',
      padding: '16px',
      display: 'flex', flexDirection: 'column', gap: 14,
    },
    inputBar: {
      background: '#fff',
      borderTop: '0.5px solid rgba(0,0,0,0.08)',
      padding: '10px 14px 12px',
      flexShrink: 0,
    },
    inputRow: {
      display: 'flex', gap: 8, alignItems: 'flex-end',
    },
    textarea: {
      flex: 1, resize: 'none',
      padding: '9px 12px', fontSize: 14,
      borderRadius: 12,
      border: '0.5px solid rgba(0,0,0,0.15)',
      background: '#f8faf9', color: '#111',
      outline: 'none', lineHeight: 1.5,
      fontFamily: 'inherit', overflowY: 'hidden',
      transition: 'border-color .15s, box-shadow .15s',
    },
    iconBtn: (active) => ({
      width: 40, height: 40, borderRadius: 11,
      border: `0.5px solid ${active ? 'rgba(220,38,38,.25)' : 'rgba(0,0,0,0.12)'}`,
      background: active ? 'rgba(220,38,38,.08)' : '#fff',
      color: active ? '#dc2626' : '#666',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', flexShrink: 0,
      transition: 'background .15s, border-color .15s, transform .1s',
    }),
    sendBtn: (enabled) => ({
      width: 40, height: 40, borderRadius: 11,
      border: 'none',
      background: enabled ? '#1D9E75' : '#e0e0e0',
      color: enabled ? '#fff' : '#aaa',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: enabled ? 'pointer' : 'not-allowed',
      flexShrink: 0,
      transition: 'background .2s, transform .1s',
    }),
  };

  const inputEnabled = input.trim().length > 0 && !loading && phase === 'interview';

  return (
    <>
      <style>{KEYFRAMES}</style>
      {showConfetti && <Confetti />}

      <div style={S.root}>
        {/* ── Header ── */}
        <div style={S.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={S.hdrAvatar}>
              RY
              <span style={S.onlineDot} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#111' }}>
                {interviewerNameRef.current} — Cuemath Hiring Manager
              </div>
              <div style={{ fontSize: 11, color: '#888' }}>{hdrSub}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#0F6E56', fontWeight: 500 }}>
            <span style={{
              width: 7, height: 7, borderRadius: '50%', background: '#1D9E75',
              display: 'inline-block', animation: 'pulse 2s ease-in-out infinite',
            }} />
            Live session
          </div>
        </div>

        {/* ── Progress (hidden on end screen) ── */}
        {phase !== 'done' && (
          <ProgressStrip turnCount={turnCount} skillScores={skillScores} />
        )}

        {/* ── End screen ── */}
        {phase === 'done' && (
          <EndScreen skillScores={skillScores} onRetry={() => window.location.reload()} />
        )}

        {/* ── Messages ── */}
        {phase !== 'done' && (
          <div style={S.msgArea}>
            {showSkeleton && <SkeletonBubble />}
            {messages.map((m, i) => (
              <MessageBubble key={i} msg={m} nameInitials={nameInitials} />
            ))}
            {loading && !showSkeleton && <TypingIndicator />}
            {insights.map((ins, i) => (
              <InsightBox key={i} text={ins} />
            ))}
            <div ref={bottomRef} />
          </div>
        )}

        {/* ── Input bar (hidden on end screen) ── */}
        {phase !== 'done' && (
          <div style={S.inputBar}>
            <div style={{ fontSize: 11, color: isListening ? '#dc2626' : '#888', marginBottom: 5 }}>
              {isListening ? 'Listening… speak now' : 'Try to answer in 2–4 sentences'}
            </div>
            <div style={S.inputRow}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleTextareaInput}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#1D9E75';
                  e.target.style.boxShadow = '0 0 0 3px rgba(29,158,117,.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'rgba(0,0,0,0.15)';
                  e.target.style.boxShadow = 'none';
                }}
                placeholder={
                  isListening
                    ? 'Listening…'
                    : phase === 'interview'
                    ? 'Type your answer… (Enter to send)'
                    : 'Interview complete'
                }
                rows={1}
                disabled={loading || phase !== 'interview'}
                style={S.textarea}
              />

              {/* Mic button */}
              <button
                onClick={toggleMic}
                disabled={loading || phase !== 'interview'}
                style={S.iconBtn(isListening)}
                title="Voice input (Speech to Text)"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <rect x="5" y="1" width="6" height="9" rx="3" stroke="currentColor" strokeWidth="1.4"/>
                  <path d="M2 8s0 5 6 5 6-5 6-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                  <line x1="8" y1="13" x2="8" y2="15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                </svg>
              </button>

              {/* Send button */}
              <button
                onClick={handleSend}
                disabled={!inputEnabled}
                style={S.sendBtn(inputEnabled)}
                onMouseDown={(e) => { if (inputEnabled) e.currentTarget.style.transform = 'scale(.93)'; }}
                onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                {loading ? (
                  <svg width="16" height="16" viewBox="0 0 16 16" style={{ animation: 'spin .8s linear infinite' }}>
                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"
                      strokeDasharray="25" strokeDashoffset="8" fill="none"/>
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <path d="M13 7.5H2M13 7.5L8.5 3M13 7.5L8.5 12"
                      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            </div>

            <p style={{ textAlign: 'center', fontSize: 10, color: '#bbb', marginTop: 6 }}>
              {input.length > 0 ? `${input.length} chars · ` : ''}Shift+Enter for new line · Enter to send
              {' · '}
              <span style={{ color: isListening ? '#dc2626' : 'inherit' }}>
                {isListening ? 'Mic on' : 'Mic off'}
              </span>
            </p>
          </div>
        )}
      </div>
    </>
  );
}