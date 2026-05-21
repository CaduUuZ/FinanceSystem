import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Register() {
  const [form, setForm] = useState({ nome: "", email: "", senha: "", confirmar: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.senha !== form.confirmar) {
      return setError("As senhas não coincidem");
    }
    if (form.senha.length < 6) {
      return setError("A senha deve ter pelo menos 6 caracteres");
    }
    setLoading(true);
    try {
      await register(form.nome, form.email, form.senha);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao criar conta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.box}>
        <div style={styles.logoWrap}>
          <span style={styles.logoIcon}>◈</span>
          <h1 style={styles.logoText}>Financeiro</h1>
        </div>
        <p style={styles.subtitle}>Crie sua conta gratuita</p>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="form-group">
            <label>Nome</label>
            <input
              type="text"
              className="form-control"
              placeholder="Seu nome"
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              className="form-control"
              placeholder="seu@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label>Senha</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={form.senha}
                onChange={(e) => setForm({ ...form, senha: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Confirmar</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={form.confirmar}
                onChange={(e) => setForm({ ...form, confirmar: e.target.value })}
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: "100%", justifyContent: "center", marginTop: 8, padding: 12 }}
          >
            {loading ? "Criando conta..." : "Criar conta"}
          </button>
        </form>

        <p style={styles.loginLink}>
          Já tem conta?{" "}
          <Link to="/login" style={{ color: "var(--accent-green)", textDecoration: "none" }}>
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "var(--bg-primary)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  box: {
    background: "var(--bg-card)",
    border: "1px solid var(--border)",
    borderRadius: 16,
    padding: 40,
    width: "100%",
    maxWidth: 460,
    boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
  },
  logoWrap: { display: "flex", alignItems: "center", gap: 10, marginBottom: 8 },
  logoIcon: { fontSize: 28, color: "var(--accent-green)" },
  logoText: { fontSize: 24, fontWeight: 700 },
  subtitle: { color: "var(--text-muted)", marginBottom: 28, fontSize: 14 },
  errorBox: {
    background: "rgba(255,77,109,0.1)",
    border: "1px solid rgba(255,77,109,0.3)",
    borderRadius: 8,
    padding: "10px 14px",
    color: "var(--accent-red)",
    fontSize: 13,
    marginBottom: 16,
  },
  loginLink: { textAlign: "center", marginTop: 20, fontSize: 13, color: "var(--text-muted)" },
};
