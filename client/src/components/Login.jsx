export default function Login({ onLogin }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const name = e.target.username.value;
    if (name) onLogin(name);
  };

  return (
    <div className="login-container">
      <h1>Bienvenido a GREAT RISK</h1>
      <form onSubmit={handleSubmit}>
        <input name="username" type="text" placeholder="your 42 Login..." required />
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}
