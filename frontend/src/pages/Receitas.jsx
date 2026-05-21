import { useState, useEffect } from "react";
import api from "../services/api";

const CATEGORIAS = ["Salário", "Freelance", "Investimentos", "Aluguel", "Vendas", "Outros"];
const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

const formatBRL = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const hoje = new Date().toISOString().split("T")[0];

export default function Receitas() {
  const now = new Date();
  const [receitas, setReceitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [ano, setAno] = useState(now.getFullYear());
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [form, setForm] = useState({ titulo: "", valor: "", categoria: "Salário", data: hoje, descricao: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchReceitas = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ mes, ano });
      if (filtroCategoria) params.append("categoria", filtroCategoria);
      const { data } = await api.get(`/receitas?${params}`);
      setReceitas(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReceitas(); }, [mes, ano, filtroCategoria]);

  const abrirModal = (receita = null) => {
    if (receita) {
      setEditando(receita);
      setForm({
        titulo: receita.titulo,
        valor: receita.valor,
        categoria: receita.categoria,
        data: receita.data?.split("T")[0] || hoje,
        descricao: receita.descricao || "",
      });
    } else {
      setEditando(null);
      setForm({ titulo: "", valor: "", categoria: "Salário", data: hoje, descricao: "" });
    }
    setError("");
    setModal(true);
  };

  const salvar = async () => {
    setError("");
    if (!form.titulo || !form.valor || !form.data) {
      return setError("Preencha todos os campos obrigatórios");
    }
    setSaving(true);
    try {
      if (editando) {
        await api.put(`/receitas/${editando.id}`, form);
      } else {
        await api.post("/receitas", form);
      }
      setModal(false);
      fetchReceitas();
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const deletar = async (id) => {
    if (!confirm("Deseja deletar esta receita?")) return;
    try {
      await api.delete(`/receitas/${id}`);
      fetchReceitas();
    } catch (err) {
      console.error(err);
    }
  };

  const total = receitas.reduce((acc, r) => acc + Number(r.valor), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-32">
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700 }}>Receitas</h2>
          <p className="text-muted text-sm" style={{ marginTop: 4 }}>
            Total: <span className="text-green font-semibold">{formatBRL(total)}</span>
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => abrirModal()}>
          + Nova Receita
        </button>
      </div>

      {/* Filtros */}
      <div className="card mb-24">
        <div className="flex gap-12 items-center">
          <select className="form-control" value={mes} onChange={(e) => setMes(Number(e.target.value))} style={{ width: "auto" }}>
            {MESES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select className="form-control" value={ano} onChange={(e) => setAno(Number(e.target.value))} style={{ width: "auto" }}>
            {[2023, 2024, 2025, 2026].map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <select className="form-control" value={filtroCategoria} onChange={(e) => setFiltroCategoria(e.target.value)} style={{ width: "auto" }}>
            <option value="">Todas as categorias</option>
            {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {/* Tabela */}
      <div className="card">
        {loading ? (
          <p style={{ color: "var(--text-muted)", textAlign: "center", padding: 32, fontSize: 14 }}>Carregando...</p>
        ) : receitas.length === 0 ? (
          <p style={{ color: "var(--text-muted)", textAlign: "center", padding: 48, fontSize: 14 }}>
            Nenhuma receita encontrada para este período.
          </p>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Categoria</th>
                  <th>Data</th>
                  <th style={{ textAlign: "right" }}>Valor</th>
                  <th style={{ textAlign: "right" }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {receitas.map((r) => (
                  <tr key={r.id}>
                    <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>{r.titulo}</td>
                    <td>
                      <span className="badge badge-green">{r.categoria}</span>
                    </td>
                    <td>{new Date(r.data).toLocaleDateString("pt-BR")}</td>
                    <td style={{ textAlign: "right", color: "var(--accent-green)", fontWeight: 600 }}>
                      {formatBRL(r.valor)}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div className="flex gap-8" style={{ justifyContent: "flex-end" }}>
                        <button className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => abrirModal(r)}>Editar</button>
                        <button className="btn btn-danger" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => deletar(r.id)}>Deletar</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editando ? "Editar Receita" : "Nova Receita"}</h3>
              <button className="modal-close" onClick={() => setModal(false)}>×</button>
            </div>

            {error && (
              <div style={{ background: "rgba(255,77,109,0.1)", border: "1px solid rgba(255,77,109,0.3)", borderRadius: 8, padding: "10px 14px", color: "var(--accent-red)", fontSize: 13, marginBottom: 16 }}>
                {error}
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="form-group">
                <label>Título *</label>
                <input type="text" className="form-control" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Ex: Salário mensal" />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Valor *</label>
                  <input type="number" step="0.01" min="0" className="form-control" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} placeholder="0,00" />
                </div>
                <div className="form-group">
                  <label>Data *</label>
                  <input type="date" className="form-control" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Categoria *</label>
                <select className="form-control" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })}>
                  {CATEGORIAS.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Descrição</label>
                <input type="text" className="form-control" value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Opcional" />
              </div>
              <div className="flex gap-12" style={{ marginTop: 8 }}>
                <button className="btn btn-secondary" style={{ flex: 1, justifyContent: "center" }} onClick={() => setModal(false)}>Cancelar</button>
                <button className="btn btn-primary" style={{ flex: 1, justifyContent: "center" }} onClick={salvar} disabled={saving}>
                  {saving ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
