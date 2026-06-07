import { useEffect, useRef, useState } from 'react';

const POS_STORAGE_KEY = 'chat:pos';
const EDGE_MARGIN = 20;

function loadPosFromSession() {
  try {
    const raw = sessionStorage.getItem(POS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number') {
      return parsed;
    }
  } catch {
    // ignore malformed value
  }
  return null;
}

function clampToViewport(x, y, el) {
  if (!el) return { x, y };
  const maxX = Math.max(0, window.innerWidth - el.offsetWidth);
  const maxY = Math.max(0, window.innerHeight - el.offsetHeight);
  return {
    x: Math.max(0, Math.min(maxX, x)),
    y: Math.max(0, Math.min(maxY, y)),
  };
}

export default function Chat({ messages, onSend, status, playerId }) {
  const [draft, setDraft] = useState('');
  const [minimized, setMinimized] = useState(false);
  const [pos, setPos] = useState(() => loadPosFromSession());
  const [dragging, setDragging] = useState(false);
  const dragOffsetRef = useRef({ dx: 0, dy: 0 });
  const boxRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    const el = listRef.current;
    if (el && !minimized) el.scrollTop = el.scrollHeight;
  }, [messages, minimized]);

  useEffect(() => {
    if (pos !== null || !boxRef.current) return;
    const el = boxRef.current;
    const x = window.innerWidth - el.offsetWidth - EDGE_MARGIN;
    const y = window.innerHeight - el.offsetHeight - EDGE_MARGIN;
    setPos(clampToViewport(x, y, el));
  }, [pos]);

  useEffect(() => {
    if (pos) sessionStorage.setItem(POS_STORAGE_KEY, JSON.stringify(pos));
  }, [pos]);

  useEffect(() => {
    if (!dragging) return;
    function onMove(e) {
      const { dx, dy } = dragOffsetRef.current;
      setPos(clampToViewport(e.clientX - dx, e.clientY - dy, boxRef.current));
    }
    function onUp() {
      setDragging(false);
    }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragging]);

  useEffect(() => {
    function onResize() {
      setPos((prev) => (prev ? clampToViewport(prev.x, prev.y, boxRef.current) : prev));
    }
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  function onMouseDown(e) {
    if (e.target.closest('form')) return;
    if (!pos) return;
    e.preventDefault();
    dragOffsetRef.current = { dx: e.clientX - pos.x, dy: e.clientY - pos.y };
    setDragging(true);
  }

  function submit(e) {
    e.preventDefault();
    if (!draft.trim()) return;
    if (onSend(draft)) setDraft('');
  }

  const disabled = status !== 'open';

  // Buscar el último mensaje del servidor sobre el conteo de jugadores
  const serverMessages = messages.filter(m => m.from === 'Server' && m.text.includes('Players connected'));
  const playerCountMatch = serverMessages[serverMessages.length - 1]?.text.match(/\d+/);
  const playerCount = playerCountMatch ? playerCountMatch[0] : null;

  const activateOnKey = (handler) => (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handler();
    }
  };

  if (minimized) {
    return (
      <div
        role="button"
        tabIndex={0}
        aria-expanded={false}
        aria-label="Expand chat"
        onClick={() => setMinimized(false)}
        onKeyDown={activateOnKey(() => setMinimized(false))}
        style={{
          backgroundColor: '#0f0f0f',
          border: '2px solid #6496FF',
          borderRadius: '6px 6px 0 0',
          padding: '6px 12px',
          fontFamily: 'monospace',
          fontSize: '11px',
          color: '#6496FF',
          cursor: 'pointer',
          fontWeight: 'bold',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 -2px 10px rgba(0,0,0,0.5)'
        }}
      >
        <span>
          CHAT {messages.length > 0 && `(${messages.length})`}
          {playerCount && <span style={{ color: '#4CAF50', marginLeft: '8px' }}>• {playerCount} online</span>}
        </span>
        <span>▲</span>
      </div>
    );
  }

  return (
    <div
      ref={boxRef}
      onMouseDown={onMouseDown}
      style={{
        position: 'fixed',
        top: pos?.y ?? 0,
        left: pos?.x ?? 0,
        width: '280px',
        zIndex: 20,
        visibility: pos ? 'visible' : 'hidden',
        cursor: dragging ? 'grabbing' : 'grab',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#0f0f0f',
        border: '2px solid #6496FF',
        borderRadius: '6px',
        padding: '8px',
        fontFamily: 'monospace',
        fontSize: '12px',
        color: '#E0E0E0',
        minHeight: '160px',
        maxHeight: '220px',
        boxShadow: '0 0 20px rgba(0,0,0,0.5)'
      }}
    >
      <div
        role="button"
        tabIndex={0}
        aria-expanded={true}
        aria-label="Minimize chat"
        onClick={() => setMinimized(true)}
        onKeyDown={activateOnKey(() => setMinimized(true))}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#6496FF',
          fontWeight: 'bold',
          marginBottom: '4px',
          cursor: 'pointer'
        }}
      >
        <span>
          Chat {disabled && <span style={{ color: '#FF6B6B' }}>({status})</span>}
          {playerCount && <span style={{ color: '#4CAF50', marginLeft: '8px', fontSize: '10px' }}>• {playerCount} online</span>}
        </span>
        <span style={{ fontSize: '10px' }}>▼</span>
      </div>
      <div
        ref={listRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          backgroundColor: 'rgba(0,0,0,0.4)',
          padding: '6px',
          borderRadius: '4px',
          marginBottom: '6px',
          textAlign: 'left',
        }}
      >
        {messages.length === 0 && (
          <div style={{ color: '#666', fontStyle: 'italic' }}>No messages yet</div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: '2px' }}>
            <span style={{ 
              color: m.from === playerId ? '#FFD700' : (m.from === 'Server' ? '#4CAF50' : '#6496FF'),
              fontWeight: m.from === 'Server' ? 'bold' : 'normal'
            }}>
              {m.from === 'Server' ? `[${m.from}]` : m.from}
            </span>
            <span style={{ color: '#888' }}>: </span>
            <span style={{ fontStyle: m.from === 'Server' ? 'italic' : 'normal' }}>{m.text}</span>
          </div>
        ))}
      </div>
      <form onSubmit={submit} style={{ display: 'flex', gap: '4px' }}>
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={1000}
          disabled={disabled}
          placeholder={disabled ? 'Connecting…' : 'Type a message'}
          style={{
            flex: 1,
            padding: '4px 6px',
            fontSize: '12px',
            fontFamily: 'monospace',
            backgroundColor: '#1a1a1a',
            color: '#E0E0E0',
            border: '1px solid #333',
            borderRadius: '3px',
            outline: 'none',
            cursor: 'text',
          }}
        />
        <button
          type="submit"
          disabled={disabled || !draft.trim()}
          style={{
            padding: '4px 10px',
            fontSize: '12px',
            backgroundColor: '#6496FF',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            fontWeight: 'bold',
            opacity: disabled || !draft.trim() ? 0.5 : 1,
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
