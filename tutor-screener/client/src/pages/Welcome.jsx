import { useState, useEffect, useRef } from 'react';

// ─── Keyframes ────────────────────────────────────────────────────────────────
const KEYFRAMES = `
  @keyframes float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
  @keyframes fadeUp   { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
  @keyframes pulse    { 0%,100%{opacity:.35;transform:scale(1)} 50%{opacity:.65;transform:scale(1.08)} }
  @keyframes spin     { to{transform:rotate(360deg)} }
  @keyframes ripple   { 0%{transform:scale(0);opacity:.45} 100%{transform:scale(3.5);opacity:0} }
  @keyframes shake    { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-5px)} 40%,80%{transform:translateX(5px)} }
  @keyframes checkPop { 0%{transform:scale(0) rotate(-15deg);opacity:0} 70%{transform:scale(1.15) rotate(3deg)} 100%{transform:scale(1) rotate(0);opacity:1} }
  @keyframes slideTag { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
  @keyframes blobDrift{ 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(12px,-8px) scale(1.05)} 66%{transform:translate(-8px,10px) scale(.96)} }
`;

// ─── Feature list ─────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <path d="M9 2L11.2 6.5L16 7.3L12.5 10.7L13.4 15.5L9 13.2L4.6 15.5L5.5 10.7L2 7.3L6.8 6.5L9 2Z"
          stroke="#0F6E56" strokeWidth="1.3" strokeLinejoin="round" fill="none"/>
      </svg>
    ),
    title: 'Live feedback',
    desc: 'Instant per-answer insights',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="9" r="7" stroke="#0F6E56" strokeWidth="1.3"/>
        <path d="M6 9.5L8 11.5L12 7" stroke="#1D9E75" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: 'Adaptive questions',
    desc: 'AI adjusts to your answers',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="2" y="3" width="14" height="12" rx="3" stroke="#0F6E56" strokeWidth="1.3"/>
        <path d="M5 9h8M5 12h5" stroke="#1D9E75" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
    title: 'Instant results',
    desc: 'Score + detailed breakdown',
  },
];

// ─── Steps shown in the right panel ───────────────────────────────────────────
const STEPS = [
  { num: '01', label: 'Enter your name',       sub: 'Personalises your session' },
  { num: '02', label: 'Answer 5 questions',    sub: 'AI-powered interview' },
  { num: '03', label: 'Get your score',        sub: 'Detailed skill breakdown' },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function Welcome({ onStart }) {
  const [name, setName]       = useState('');
  const [loading, setLoading] = useState(false);
  const [ripple, setRipple]   = useState(null);
  const [shake, setShake]     = useState(false);
  const [focused, setFocused] = useState(false);
  const [checked, setChecked] = useState(false); // checkmark on valid name
  const inputRef = useRef(null);

  // Auto-focus
  useEffect(() => { inputRef.current?.focus(); }, []);

  // Show checkmark once name is non-empty
  useEffect(() => {
    setChecked(name.trim().length > 0);
  }, [name]);

  function handleStart(e) {
    if (!name.trim() || loading) {
      setShake(true);
      inputRef.current?.focus();
      setTimeout(() => setShake(false), 500);
      return;
    }
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    setRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setTimeout(() => setRipple(null), 650);
    setLoading(true);
    setTimeout(() => onStart(name.trim()), 650);
  }

  const borderColor = focused ? '#1D9E75' : shake ? '#dc2626' : 'rgba(0,0,0,0.14)';
  const boxShadow   = focused
    ? '0 0 0 3px rgba(29,158,117,.12)'
    : shake
    ? '0 0 0 3px rgba(220,38,38,.1)'
    : 'none';

  return (
    <>
      <style>{KEYFRAMES}</style>

      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        background: '#f8faf9',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'system-ui,-apple-system,sans-serif',
      }}>

        {/* ── Ambient blobs ── */}
        {[
          { w:380, h:380, bg:'#5DCAA5', t:-100, l:-100, op:.09, dur:'11s' },
          { w:280, h:280, bg:'#7F77DD', b:-80,  r:-80,  op:.08, dur:'13s', delay:'3s' },
          { w:200, h:200, bg:'#1D9E75', b:60,   l:'8%', op:.07, dur:'15s', delay:'6s' },
        ].map((b, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: b.w, height: b.h,
            borderRadius: '50%',
            background: b.bg,
            filter: 'blur(70px)',
            opacity: b.op,
            top: b.t, left: b.l, bottom: b.b, right: b.r,
            animation: `blobDrift ${b.dur} ease-in-out infinite ${b.delay || ''}`,
            pointerEvents: 'none',
          }} />
        ))}

        {/* ── Outer wrapper: two-column on wide screens ── */}
        <div style={{
          display: 'flex',
          gap: 16,
          width: '100%',
          maxWidth: 860,
          alignItems: 'stretch',
          animation: 'fadeUp .5s ease both',
        }}>

          {/* ── LEFT: main card ── */}
          <div style={{
            background: '#fff',
            borderRadius: 20,
            border: '0.5px solid rgba(0,0,0,0.08)',
            padding: '2.25rem 2rem',
            flex: '1 1 0',
            minWidth: 0,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: 0,
          }}>

            {/* Icon */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: 62, height: 62, borderRadius: 16,
                background: '#E1F5EE',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 1rem',
                animation: 'float 5s ease-in-out infinite',
              }}>
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M6 16C6 10.477 10.477 6 16 6s10 4.477 10 10-4.477 10-10 10S6 21.523 6 16Z"
                    stroke="#0F6E56" strokeWidth="1.4" fill="none"/>
                  <path d="M12 16l3 3 5-6"
                    stroke="#1D9E75" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="16" cy="10.5" r="1.2" fill="#5DCAA5"/>
                </svg>
              </div>

              {/* Live badge */}
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                background: '#E1F5EE', color: '#0F6E56',
                fontSize: 11, fontWeight: 500,
                padding: '4px 11px', borderRadius: 20,
                marginBottom: '.7rem', letterSpacing: '.03em',
                animation: 'slideTag .4s ease .2s both',
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: '#1D9E75', display: 'inline-block',
                  animation: 'pulse 2s ease-in-out infinite',
                }} />
                Assessment in progress
              </div>

              <h1 style={{ fontSize: 22, fontWeight: 500, color: '#111', margin: '0 0 .35rem' }}>
                Cuemath Tutor Interview
              </h1>
              <p style={{ fontSize: 13.5, color: '#666', margin: '0 0 1.6rem', lineHeight: 1.65 }}>
                Enter your name to begin a personalised, AI-driven assessment session.
              </p>
            </div>

            {/* Label */}
            <label style={{
              fontSize: 12, color: '#555', marginBottom: 6,
              display: 'block', fontWeight: 500, letterSpacing: '.02em',
            }}>
              Your full name
            </label>

            {/* Input wrapper */}
            <div style={{
              position: 'relative',
              marginBottom: '1.1rem',
              animation: shake ? 'shake .4s ease' : 'none',
            }}>
              {/* Person icon */}
              <svg style={{
                position: 'absolute', left: 11, top: '50%',
                transform: 'translateY(-50%)',
                width: 16, height: 16, color: focused ? '#1D9E75' : '#aaa',
                pointerEvents: 'none', transition: 'color .2s',
              }} viewBox="0 0 16 16" fill="none">
                <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M3 13c0-2.761 2.239-4 5-4s5 1.239 5 4"
                  stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>

              <input
                ref={inputRef}
                type="text"
                placeholder="e.g. Priya Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleStart(e)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                autoComplete="off"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '11px 38px 11px 36px',
                  fontSize: 14, borderRadius: 10,
                  border: `0.5px solid ${borderColor}`,
                  background: '#f8faf9',
                  color: '#111', outline: 'none',
                  transition: 'border-color .2s, box-shadow .2s',
                  boxShadow,
                }}
              />

              {/* Checkmark */}
              {checked && (
                <div style={{
                  position: 'absolute', right: 11, top: '50%',
                  transform: 'translateY(-50%)',
                  animation: 'checkPop .3s ease',
                }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="7" fill="#E1F5EE"/>
                    <path d="M5 8l2.5 2.5L11 6" stroke="#1D9E75" strokeWidth="1.4"
                      strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              )}
            </div>

            {/* CTA button */}
            <button
              onClick={handleStart}
              disabled={loading}
              style={{
                width: '100%', padding: '12px',
                borderRadius: 10, border: 'none',
                fontSize: 14, fontWeight: 500,
                cursor: loading ? 'not-allowed' : 'pointer',
                background: name.trim() && !loading
                  ? 'linear-gradient(135deg,#1D9E75 0%,#0F6E56 100%)'
                  : '#e0e0e0',
                color: name.trim() && !loading ? '#fff' : '#aaa',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                position: 'relative', overflow: 'hidden',
                transition: 'background .25s, opacity .2s, transform .12s',
              }}
              onMouseEnter={(e) => { if (!loading && name.trim()) e.currentTarget.style.opacity = '.88'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
              onMouseDown={(e) => { if (!loading && name.trim()) e.currentTarget.style.transform = 'scale(.98)'; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              {ripple && (
                <span style={{
                  position: 'absolute', borderRadius: '50%',
                  background: 'rgba(255,255,255,.35)',
                  width: 64, height: 64,
                  left: ripple.x - 32, top: ripple.y - 32,
                  animation: 'ripple .65s linear',
                  pointerEvents: 'none',
                }} />
              )}
              {loading ? (
                <>
                  <svg width="15" height="15" viewBox="0 0 15 15"
                    style={{ animation: 'spin .8s linear infinite' }}>
                    <circle cx="7.5" cy="7.5" r="6" stroke="currentColor"
                      strokeWidth="1.5" strokeDasharray="28" strokeDashoffset="10" fill="none"/>
                  </svg>
                  Starting session…
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <path d="M7.5 1L13.5 7.5L7.5 14M13.5 7.5H1.5"
                      stroke="currentColor" strokeWidth="1.6"
                      strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Begin assessment
                </>
              )}
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '1.1rem 0 .85rem' }}>
              <div style={{ flex: 1, height: '0.5px', background: 'rgba(0,0,0,0.08)' }} />
              <span style={{ fontSize: 11, color: '#bbb' }}>your session includes</span>
              <div style={{ flex: 1, height: '0.5px', background: 'rgba(0,0,0,0.08)' }} />
            </div>

            {/* Feature pills */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              {FEATURES.map((f, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  background: '#f8faf9',
                  border: '0.5px solid rgba(0,0,0,0.08)',
                  borderRadius: 99, padding: '5px 11px',
                  fontSize: 12, color: '#555',
                  animation: `fadeUp .4s ease ${i * .08 + .3}s both`,
                }}>
                  {f.icon}
                  {f.title}
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: info panel (hidden on very small screens via JS trick) ── */}
          <div style={{
            background: '#fff',
            borderRadius: 20,
            border: '0.5px solid rgba(0,0,0,0.08)',
            padding: '2.25rem 1.75rem',
            width: 240,
            flexShrink: 0,
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: 0,
            // hide on narrow viewports with a media-query equivalent via CSS class
          }} className="welcome-right-panel">

            <div style={{ fontSize: 11, fontWeight: 500, color: '#888', textTransform: 'uppercase', letterSpacing: '.06em', marginBottom: '1rem' }}>
              How it works
            </div>

            {/* Steps */}
            {STEPS.map((s, i) => (
              <div key={i} style={{
                display: 'flex', gap: 12, alignItems: 'flex-start',
                marginBottom: i < STEPS.length - 1 ? '1.1rem' : 0,
                animation: `fadeUp .4s ease ${i * .1 + .25}s both`,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 10,
                  background: '#E1F5EE', color: '#0F6E56',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 600, flexShrink: 0, letterSpacing: '.02em',
                }}>
                  {s.num}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: '#111', lineHeight: 1.35 }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{s.sub}</div>
                </div>
              </div>
            ))}

            {/* Divider */}
            <div style={{ height: '0.5px', background: 'rgba(0,0,0,0.07)', margin: '1.25rem 0' }} />

            {/* Stats row */}
            {[
              { val: '5', label: 'Questions' },
              { val: '~8', label: 'Minutes' },
              { val: '10', label: 'Max score' },
            ].map((stat, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginBottom: i < 2 ? 10 : 0,
                animation: `fadeUp .4s ease ${i * .08 + .5}s both`,
              }}>
                <span style={{ fontSize: 12, color: '#888' }}>{stat.label}</span>
                <span style={{
                  fontSize: 13, fontWeight: 500, color: '#0F6E56',
                  background: '#E1F5EE', padding: '2px 9px',
                  borderRadius: 99, border: '0.5px solid rgba(15,110,86,.12)',
                }}>
                  {stat.val}
                </span>
              </div>
            ))}

            {/* Divider */}
            <div style={{ height: '0.5px', background: 'rgba(0,0,0,0.07)', margin: '1.25rem 0' }} />

            {/* Trust note */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                <path d="M8 2L14 4.5v4c0 3.5-2.8 5.8-6 6.5C2.8 14.3 2 12 2 8.5v-4L8 2Z"
                  stroke="#0F6E56" strokeWidth="1.2" fill="none"/>
                <path d="M5.5 8l2 2 3-3" stroke="#1D9E75" strokeWidth="1.3"
                  strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <p style={{ fontSize: 11.5, color: '#888', lineHeight: 1.6, margin: 0 }}>
                Your responses are confidential and used only for this assessment.
              </p>
            </div>
          </div>
        </div>

        {/* ── Footer ── */}
        <p style={{ marginTop: '1.1rem', textAlign: 'center', fontSize: 11, color: '#bbb', animation: 'fadeIn .6s ease .5s both' }}>
          Powered by Cuemath · Secure &amp; confidential
        </p>
      </div>

      {/* Hide right panel on small screens */}
      <style>{`
        @media (max-width: 600px) {
          .welcome-right-panel { display: none !important; }
        }
      `}</style>
    </>
  );
}