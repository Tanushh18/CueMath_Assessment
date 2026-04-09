import { useState, useEffect, useRef } from 'react';

const keyframes = `
  @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes pulse { 0%,100%{opacity:.4;transform:scale(1)} 50%{opacity:.8;transform:scale(1.1)} }
  @keyframes spin { to{transform:rotate(360deg)} }
  @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes slideIn { from{opacity:0;transform:translateX(12px)} to{opacity:1;transform:translateX(0)} }
  @keyframes slideInLeft { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }
`;

const TOTAL = 5;

function Avatar({ initials, color = '#E1F5EE', textColor = '#0F6E56' }) {
  return (
    <div style={{
      width: 36, height: 36, borderRadius: '50%',
      background: color, color: textColor,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 12, fontWeight: 500, flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

function ProgressBar({ current, total }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ flex: 1, height: 4, background: '#E1F5EE', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: 'linear-gradient(90deg, #1D9E75, #5DCAA5)',
          borderRadius: 99,
          transition: 'width .5s ease',
        }} />
      </div>
      <span style={{ fontSize: 12, color: '#888', whiteSpace: 'nowrap', minWidth: 48 }}>
        {Math.min(current, total)} / {total}
      </span>
    </div>
  );
}

function Message({ msg, nameInitials }) {
  const isUser = msg.role === 'user';
  return (
    <div style={{
      display: 'flex',
      flexDirection: isUser ? 'row-reverse' : 'row',
      gap: 10,
      animation: isUser ? 'slideIn .3s ease' : 'slideInLeft .3s ease',
      alignItems: 'flex-end',
    }}>
      <Avatar
        initials={isUser ? nameInitials : 'AI'}
        color={isUser ? '#EEEDFE' : '#E1F5EE'}
        textColor={isUser ? '#534AB7' : '#0F6E56'}
      />
      <div style={{
        maxWidth: '72%',
        background: isUser ? '#EEEDFE' : '#f8faf9',
        border: `0.5px solid ${isUser ? 'rgba(127,119,221,.2)' : 'rgba(0,0,0,0.07)'}`,
        borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
        padding: '10px 14px',
        fontSize: 14,
        lineHeight: 1.6,
        color: '#222',
      }}>
        {msg.content}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
      <Avatar initials="AI" color="#E1F5EE" textColor="#0F6E56" />
      <div style={{
        background: '#f8faf9',
        border: '0.5px solid rgba(0,0,0,0.07)',
        borderRadius: '4px 16px 16px 16px',
        padding: '12px 16px',
        display: 'flex', gap: 5, alignItems: 'center',
      }}>
        {[0, 0.2, 0.4].map((d, i) => (
          <span key={i} style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#1D9E75',
            display: 'inline-block',
            animation: `pulse 1.2s ease-in-out ${d}s infinite`,
          }} />
        ))}
      </div>
    </div>
  );
}

export default function Interview({ name, onFinish }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [turnCount, setTurnCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [skills, setSkills] = useState({
    clarity: false,
    warmth: false,
    patience: false,
    simplicity: false,
    fluency: false,
  });
  const bottomRef = useRef(null);

  const nameInitials = name
    .split(' ')
    .map(w => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => { startInterview(); }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function startInterview() {
    setLoading(true);
    const intro = [{ role: 'user', content: `My name is ${name}. Start the interview.` }];
    const reply = await send(intro);
    setMessages([...intro, { role: 'assistant', content: reply }]);
    setLoading(false);
  }

  async function send(msgs) {
    const res = await fetch('http://localhost:1000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: msgs }),
    });
    const data = await res.json();
    return data.reply;
  }

  async function handleSend() {
    if (!input.trim() || loading) return;
    const newMsgs = [...messages, { role: 'user', content: input }];
    setInput('');
    setLoading(true);
    const reply = await send(newMsgs);
    const updated = [...newMsgs, { role: 'assistant', content: reply }];
    setMessages(updated);
    setLoading(false);
    const newTurn = turnCount + 1;
    setTurnCount(newTurn);
    // simulate skill tracking (basic demo logic)
    const keys = Object.keys(skills);
    const nextSkill = keys[newTurn % keys.length];
    setSkills(prev => ({ ...prev, [nextSkill]: true }));
    if (reply.includes('Thank you') || newTurn >= TOTAL) {
      onFinish({ summary: 'Interview completed successfully', recommendation: 'Pending' });
    }
  }

  const visibleMessages = messages.filter(m => !(m.role === 'user' && m.content.startsWith('My name is')));

  return (
    <>
      <style>{keyframes}</style>
      <div style={{
        minHeight: '100vh',
        background: '#f8faf9',
        display: 'flex',
        flexDirection: 'column',
      }}>

        {/* Header */}
        <div style={{
          background: '#fff',
          borderBottom: '0.5px solid rgba(0,0,0,0.08)',
          padding: '14px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: '#E1F5EE',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <circle cx="9" cy="9" r="7.5" stroke="#0F6E56" strokeWidth="1.2"/>
                <path d="M6 9l2.5 2.5L12 6.5" stroke="#1D9E75" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 500, color: '#111' }}>Cuemath Tutor Interview</div>
              <div style={{ fontSize: 11, color: '#888' }}>Interviewing: {name}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#1D9E75', display: 'inline-block', animation: 'pulse 2s ease-in-out infinite' }} />
            <span style={{ fontSize: 12, color: '#0F6E56', fontWeight: 500 }}>Live session</span>
          </div>
        </div>

        {/* Progress */}
        <div style={{ background: '#fff', padding: '10px 20px 14px', borderBottom: '0.5px solid rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 11, color: '#888' }}>Progress</span>
            <span style={{ fontSize: 11, color: '#0F6E56', fontWeight: 500 }}>
              Question {Math.min(turnCount + 1, TOTAL)} of {TOTAL}
            </span>
          </div>
          <ProgressBar current={turnCount} total={TOTAL} />
          {/* Skill coverage */}
          <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {Object.entries(skills).map(([skill, done]) => (
              <span key={skill} style={{
                fontSize: 10,
                padding: '4px 8px',
                borderRadius: 999,
                background: done ? '#E1F5EE' : '#f1f1f1',
                color: done ? '#0F6E56' : '#888',
                border: '0.5px solid rgba(0,0,0,0.08)'
              }}>
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          maxWidth: 680,
          width: '100%',
          margin: '0 auto',
          boxSizing: 'border-box',
        }}>
          {visibleMessages.length === 0 && loading && <TypingIndicator />}
          {visibleMessages.map((m, i) => (
            <Message key={i} msg={m} nameInitials={nameInitials} />
          ))}
          {visibleMessages.length > 0 && loading && <TypingIndicator />}
          {/* Insight box */}
          <div style={{
            background: '#fff',
            border: '0.5px solid rgba(0,0,0,0.08)',
            borderRadius: 10,
            padding: 10,
            fontSize: 12,
            color: '#555'
          }}>
            <b>AI Insight:</b> The interviewer is adapting questions based on your responses.
          </div>
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div style={{
          background: '#fff',
          borderTop: '0.5px solid rgba(0,0,0,0.08)',
          padding: '12px 16px',
        }}>
          <div style={{
            maxWidth: 680,
            margin: '0 auto',
            display: 'flex',
            gap: 10,
            alignItems: 'flex-end',
          }}>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type your answer… (Enter to send)"
              rows={1}
              style={{
                flex: 1,
                resize: 'none',
                padding: '10px 14px',
                fontSize: 14,
                borderRadius: 12,
                border: '0.5px solid rgba(0,0,0,0.15)',
                background: '#f8faf9',
                color: '#111',
                outline: 'none',
                lineHeight: 1.5,
                fontFamily: 'inherit',
                overflowY: 'hidden',
              }}
              onFocus={e => { e.target.style.borderColor = '#1D9E75'; e.target.style.boxShadow = '0 0 0 3px rgba(29,158,117,.1)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(0,0,0,0.15)'; e.target.style.boxShadow = 'none'; }}
              onInput={e => { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              style={{
                width: 42, height: 42,
                borderRadius: 12,
                border: 'none',
                background: input.trim() && !loading ? 'linear-gradient(135deg,#1D9E75,#0F6E56)' : '#e8e8e8',
                color: input.trim() && !loading ? '#fff' : '#aaa',
                cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                transition: 'background .2s, transform .15s',
              }}
              onMouseDown={e => { if (!e.currentTarget.disabled) e.currentTarget.style.transform = 'scale(.95)'; }}
              onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              {loading ? (
                <svg width="16" height="16" viewBox="0 0 16 16" style={{ animation: 'spin .8s linear infinite' }}>
                  <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" strokeDasharray="25" strokeDashoffset="8" fill="none" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M14 8H2M14 8L9 3M14 8L9 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          </div>
          <p style={{ textAlign: 'center', fontSize: 11, color: '#bbb', margin: '8px 0 0' }}>
            Shift + Enter for new line · Enter to send
          </p>
        </div>
      </div>
    </>
  );
}