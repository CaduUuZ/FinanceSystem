import { useState, useEffect } from "react";
import api from "../services/api";

const CATEGORIAS = ["Alimentação", "Transporte", "Moradia", "Saúde", "Lazer", "Educação", "Roupas", "Contas", "Outros"];
const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];

const formatBRL = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

const hoje = new Date().toISOString().split("T")[0];

export default function Despesas() {
  const now = new Date();
  const [despesas, setDespesas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editando, setEditando] = useState(null);
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [ano, setAno] = useState(now.getFullYear());
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [form, setForm] = useState({ titulo: "", valor: "", categoria: "Alimentação", data: hoje, descricao: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const fetchDespesas = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ mes, ano });
      if (filtroCategoria) params.append("categoria", filtroCategoria);
      const { data } = await api.get(`/despesas?${params}`);
      setDespesas(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDespesas(); }, [mes, ano, filtroCategoria]);

  const abrirModal = (despesa = null) => {
    if (despesa) {
      setEditando(despesa);
      setForm({
        titulo: despesa.titulo,
        valor: despesa.valor,
        categoria: despesa.categoria,
        data: despesa.data?.split("T")[0] || hoje,
        descricao: despesa.descricao || "",
      });
    } else {
      setEditando(null);
      setForm({ titulo: "", valor: "", categoria: "Alimentação", data: hoje, descricao: "" });
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
        await api.put(`/despesas/${editando.id}`, form);
      } else {
        await api.post("/despesas", form);
      }
      setModal(false);
      fetchDespesas();
    } catch (err) {
      setError(err.response?.data?.error || "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  const deletar = async (id) => {
    if (!confirm("Deseja deletar esta despesa?")) return;
    try {
      await api.delete(`/despesas/${id}`);
      fetchDespesas();
    } catch (err) {
      console.error(err);
    }
  };

  const total = despesas.reduce((acc, d) => acc + Number(d.valor), 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-32">
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700 }}>Despesas</h2>
          <p className="text-muted text-sm" style={{ marginTop: 4 }}>
            Total: <span className="text-red font-semibold">{formatBRL(total)}</span>
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => abrirModal()}>
          + Nova Despesa
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
        ) : despesas.length === 0 ? (
          <p style={{ color: "var(--text-muted)", textAlign: "center", padding: 48, fontSize: 14 }}>
            Nenhuma despesa encontrada para este período.
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
                {despesas.map((d) => (
                  <tr key={d.id}>
                    <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>{d.titulo}</td>
                    <td>
                      <span className="badge badge-red">{d.categoria}</span>
                    </td>
                    <td>{new Date(d.data).toLocaleDateString("pt-BR")}</td>
                    <td style={{ textAlign: "right", color: "var(--accent-red)", fontWeight: 600 }}>
                      {formatBRL(d.valor)}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div className="flex gap-8" style={{ justifyContent: "flex-end" }}>
                        <button className="btn btn-secondary" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => abrirModal(d)}>Editar</button>
                        <button className="btn btn-danger" style={{ padding: "6px 12px", fontSize: 12 }} onClick={() => deletar(d.id)}>Deletar</button>
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
              <h3>{editando ? "Editar Despesa" : "Nova Despesa"}</h3>
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
                <input type="text" className="form-control" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Ex: Mercado" />
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
