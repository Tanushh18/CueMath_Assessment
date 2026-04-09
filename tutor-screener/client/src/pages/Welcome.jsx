import { useState } from 'react';

const styles = `
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes pulse { 0%,100%{opacity:.4;transform:scale(1)} 50%{opacity:.7;transform:scale(1.08)} }
  @keyframes spin { to{transform:rotate(360deg)} }
  @keyframes ripple { 0%{transform:scale(0);opacity:.5} 100%{transform:scale(3);opacity:0} }
`;

export default function Welcome({ onStart }) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [ripple, setRipple] = useState(null);

  const handleStart = (e) => {
    if (!name.trim()) return;
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    setRipple({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    setTimeout(() => setRipple(null), 620);
    setLoading(true);
    setTimeout(() => onStart(name.trim()), 600);
  };

  return (
    <>
      <style>{styles}</style>
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2.5rem 1rem',
        position: 'relative',
        overflow: 'hidden',
        background: '#f8faf9',
      }}>
        {/* Ambient blobs */}
        <div style={{ position:'absolute', width:320, height:320, borderRadius:'50%', background:'#5DCAA5', filter:'blur(60px)', opacity:.1, top:-80, left:-80, animation:'pulse 7s ease-in-out infinite', pointerEvents:'none' }} />
        <div style={{ position:'absolute', width:260, height:260, borderRadius:'50%', background:'#7F77DD', filter:'blur(60px)', opacity:.1, bottom:-60, right:-60, animation:'pulse 9s ease-in-out infinite 2s', pointerEvents:'none' }} />
        <div style={{ position:'absolute', width:180, height:180, borderRadius:'50%', background:'#5DCAA5', filter:'blur(60px)', opacity:.1, bottom:40, left:'10%', animation:'pulse 11s ease-in-out infinite 4s', pointerEvents:'none' }} />

        {/* Card */}
        <div style={{
          background: '#fff',
          borderRadius: 20,
          border: '0.5px solid rgba(0,0,0,0.08)',
          padding: '2.5rem 2rem',
          width: '100%',
          maxWidth: 420,
          boxSizing: 'border-box',
          animation: 'fadeUp .5s ease both',
          position: 'relative',
        }}>
          {/* Icon */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 64, height: 64, borderRadius: 16,
              background: '#E1F5EE',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem',
              animation: 'float 5s ease-in-out infinite',
            }}>
              <svg width="34" height="34" viewBox="0 0 34 34" fill="none">
                <path d="M7 17 C7 11.477 11.477 7 17 7 C22.523 7 27 11.477 27 17 C27 22.523 22.523 27 17 27 C11.477 27 7 22.523 7 17Z" stroke="#0F6E56" strokeWidth="1.5" fill="none"/>
                <path d="M13 17 L16 20 L21 14" stroke="#1D9E75" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="17" cy="11.5" r="1.2" fill="#5DCAA5"/>
              </svg>
            </div>

            {/* Badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              background: '#E1F5EE', color: '#0F6E56',
              fontSize: 11, fontWeight: 500,
              padding: '4px 10px', borderRadius: 20,
              marginBottom: '.75rem', letterSpacing: '.03em',
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#1D9E75', display:'inline-block', animation:'pulse 2s ease-in-out infinite' }} />
              Assessment in progress
            </div>

            <h1 style={{ fontSize: 22, fontWeight: 500, color: '#111', margin: '0 0 .4rem' }}>
              Cuemath Tutor Interview
            </h1>
            <p style={{ fontSize: 14, color: '#666', margin: '0 0 1.75rem', lineHeight: 1.6 }}>
              Welcome! Please enter your name below to begin your personalised assessment session.
            </p>
          </div>

          {/* Input */}
          <label style={{ fontSize: 12, color: '#888', marginBottom: 6, display: 'block', fontWeight: 500, letterSpacing: '.02em' }}>
            Your full name
          </label>
          <div style={{ position: 'relative', marginBottom: '1.25rem' }}>
            <svg style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', width:16, height:16, color:'#aaa', pointerEvents:'none' }} viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="5.5" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
              <path d="M3 13c0-2.761 2.239-4 5-4s5 1.239 5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            </svg>
            <input
              type="text"
              placeholder="e.g. Priya Sharma"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && name.trim() && handleStart(e)}
              autoComplete="off"
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '11px 14px 11px 38px',
                fontSize: 14, borderRadius: 10,
                border: '0.5px solid rgba(0,0,0,0.15)',
                background: '#f8faf9',
                color: '#111', outline: 'none',
              }}
              onFocus={e => { e.target.style.borderColor = '#1D9E75'; e.target.style.boxShadow = '0 0 0 3px rgba(29,158,117,.12)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(0,0,0,0.15)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Button */}
          <button
            onClick={handleStart}
            disabled={!name.trim() || loading}
            style={{
              width: '100%', padding: '12px',
              borderRadius: 10, border: 'none',
              fontSize: 14, fontWeight: 500,
              cursor: name.trim() && !loading ? 'pointer' : 'not-allowed',
              background: 'linear-gradient(135deg, #1D9E75 0%, #0F6E56 100%)',
              color: '#fff',
              opacity: name.trim() && !loading ? 1 : 0.45,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              position: 'relative', overflow: 'hidden',
              transition: 'opacity .2s, transform .15s',
            }}
          >
            {ripple && (
              <span style={{
                position: 'absolute', borderRadius: '50%',
                background: 'rgba(255,255,255,.35)',
                width: 60, height: 60,
                left: ripple.x, top: ripple.y,
                marginTop: -30, marginLeft: -30,
                animation: 'ripple .6s linear',
                pointerEvents: 'none',
              }} />
            )}
            {loading ? (
              <>
                <svg width="15" height="15" viewBox="0 0 15 15" style={{ animation:'spin .8s linear infinite' }}>
                  <circle cx="7.5" cy="7.5" r="6" stroke="currentColor" strokeWidth="1.5" strokeDasharray="28" strokeDashoffset="10" fill="none"/>
                </svg>
                Starting...
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                  <path d="M7.5 1L13.5 7.5L7.5 14M13.5 7.5H1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Begin assessment
              </>
            )}
          </button>

          {/* Divider */}
          <div style={{ display:'flex', alignItems:'center', gap:10, margin:'1.1rem 0' }}>
            <div style={{ flex:1, height:'0.5px', background:'rgba(0,0,0,0.08)' }} />
            <span style={{ fontSize:11, color:'#aaa' }}>your session includes</span>
            <div style={{ flex:1, height:'0.5px', background:'rgba(0,0,0,0.08)' }} />
          </div>

          {/* Features */}
          <div style={{ display:'flex', justifyContent:'center', gap:'1.25rem' }}>
            {['Live feedback', 'Adaptive questions', 'Instant results'].map(f => (
              <span key={f} style={{ display:'flex', alignItems:'center', gap:5, fontSize:11.5, color:'#666' }}>
                <span style={{ width:5, height:5, borderRadius:'50%', background:'#1D9E75', flexShrink:0 }} />
                {f}
              </span>
            ))}
          </div>
        </div>

        <p style={{ marginTop:'1.25rem', textAlign:'center', fontSize:11, color:'#aaa' }}>
          Powered by Cuemath · Secure & confidential
        </p>
      </div>
    </>
  );
}