export default function Login({ onLogin }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const name = e.target.username.value;
    if (name) onLogin(name);
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>GREAT RISK</h1>
      <p style={subtitleStyle}>Login for Battle</p>
      
      <form onSubmit={handleSubmit}>
        <label style={labelStyle}>YOUR 42 LOGIN</label>
        <input 
          name="username" 
          type="text" 
          placeholder="type your login here" 
          required 
          style={inputStyle}
        />
        <button type="submit" style={btnStyle}>ENTER</button>
      </form>
    </div>
  );
}

// ESTILOS COPIADOS DEL LOBBY PARA QUE SEA IDÉNTICO
const containerStyle = {
  maxWidth: '600px',
  margin: '60px auto',
  fontFamily: 'monospace',
  color: 'white',
  backgroundColor: '#1a1a2e',
  padding: '40px',
  borderRadius: '12px',
  border: '2px solid #FF6B6B',
  boxShadow: '0 0 30px rgba(255, 107, 107, 0.3)',
};

const titleStyle = { 
  textAlign: 'center', 
  color: '#FF6B6B',
  marginTop: '0px',
  marginBottom: '4px', 
  letterSpacing: '2px' 
};

const subtitleStyle = { 
  textAlign: 'center', 
  color: '#aaa', 
  paddingTop: '15px',
  marginBottom: '32px', 
};

const labelStyle = { 
  display: 'block', 
  marginBottom: '8px', 
  color: '#FFD700' 
};

const inputStyle = {
  width: '100%',
  padding: '10px',
  backgroundColor: '#333',
  color: 'white',
  border: '2px solid #555',
  borderRadius: '4px',
  fontFamily: 'monospace',
  fontSize: '13px',
  boxSizing: 'border-box',
  marginBottom: '20px',
  textAlign: 'center',
};

const btnStyle = {
  width: '100%',
  padding: '10px',
  backgroundColor: '#FF6B6B',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
  fontFamily: 'monospace',
  fontWeight: 'bold',
  fontSize: '13px',
};
