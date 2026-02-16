export default function AdminLoginPage({
  username,
  password,
  errorMessage,
  onUsernameChange,
  onPasswordChange,
  onSubmit
}) {
  return (
    <main className="admin-login-page">
      <section className="admin-login-card">
        <h1>Login Admin</h1>
        <p className="helper">Acesso restrito ao painel do Restaurante Ribeiro.</p>
        <form onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="adminUser">Login</label>
            <input
              id="adminUser"
              type="text"
              value={username}
              onChange={(event) => onUsernameChange(event.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="adminPass">Senha</label>
            <input
              id="adminPass"
              type="password"
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-dark">
            Entrar
          </button>
          {errorMessage && <p className="admin-login-error">{errorMessage}</p>}
        </form>
      </section>
    </main>
  )
}
