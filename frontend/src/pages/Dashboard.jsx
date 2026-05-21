import { useState, useEffect } from "react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import { Wallet } from "lucide-react";

import api from "../services/api";
import { useAuth } from "../contexts/AuthContext";

const MESES = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
const CORES_PIE = ["#00d4aa","#4d79ff","#ffbe0b","#9b5de5","#ff4d6d","#00b4d8","#fb5607"];

const investimentosMock = [
  { tipo: "Ações", total: 5000 },
  { tipo: "FIIs", total: 2200 },
  { tipo: "Cripto", total: 1800 },
  { tipo: "Reserva", total: 1200 },
];

const totalInvestido = investimentosMock.reduce(
  (acc, item) => acc + item.total,
  0
);

const formatBRL = (v) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

export default function Dashboard() {
  const { user } = useAuth();
  const now = new Date();
  const [mes, setMes] = useState(now.getMonth() + 1);
  const [ano, setAno] = useState(now.getFullYear());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: res } = await api.get(`/dashboard/resumo?mes=${mes}&ano=${ano}`);
        setData(res);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [mes, ano]);

  // Monta dados de evolução mensal para o BarChart
  const barData = MESES.map((nome, i) => {
    const mesNum = i + 1;
    const receita = data?.evolucaoReceitas?.find((r) => r.mes === mesNum)?.total || 0;
    const despesa = data?.evolucaoDespesas?.find((d) => d.mes === mesNum)?.total || 0;
    return { name: nome, Receitas: Number(receita), Despesas: Number(despesa) };
  });

  if (loading) return <div style={{ color: "var(--text-muted)", padding: 32 }}>Carregando...</div>;

  const { resumo, despesasPorCategoria, ultimasTransacoes } = data || {};

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-32">
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 700 }}>Olá, {user?.nome?.split(" ")[0]}</h2>
          <p className="text-muted text-sm" style={{ marginTop: 4 }}>Visão geral das suas finanças</p>
        </div>
        <div className="flex gap-8">
          <select
            className="form-control"
            value={mes}
            onChange={(e) => setMes(Number(e.target.value))}
            style={{ width: "auto" }}
          >
            {MESES.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select
            className="form-control"
            value={ano}
            onChange={(e) => setAno(Number(e.target.value))}
            style={{ width: "auto" }}
          >
            {[2023, 2024, 2025, 2026].map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      </div>

      {/* Cards de resumo */}
      <div className="grid-3 mb-24">
        <SummaryCard
          label="Total Receitas"
          value={formatBRL(resumo?.totalReceitas || 0)}
          color="var(--accent-green)"
          icon="↑"
        />
        <SummaryCard
          label="Total Despesas"
          value={formatBRL(resumo?.totalDespesas || 0)}
          color="var(--accent-red)"
          icon="↓"
        />
        <SummaryCard
          label="Saldo"
          value={formatBRL(resumo?.saldo || 0)}
          color={resumo?.saldo >= 0 ? "var(--accent-green)" : "var(--accent-red)"}
          icon={<Wallet size={20} />}
          highlight
        />
      </div>

      {/* Gráficos */}
      <div className="grid-2 mb-24">
        {/* Evolução anual */}
        <div className="card">
          <h3 style={{ marginBottom: 20, fontSize: 15 }}>Evolução Anual — {ano}</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData} barCategoryGap="30%">
              <XAxis dataKey="name" tick={{ fill: "#5a5f78", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#5a5f78", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) =>
                  v >= 1000
                    ? `R$${(v / 1000).toFixed(1)}k`
                    : `R$${v}`
                } />
              <Tooltip
                contentStyle={{ background: "#1e2130", border: "1px solid #2a2d3e", borderRadius: 8, fontSize: 13 }}
                formatter={(v) => formatBRL(v)}
              />
              <Bar dataKey="Receitas" fill="var(--accent-green)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Despesas" fill="var(--accent-red)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Carteira de investimentos */}
        <div className="card">
          <h3 style={{ marginBottom: 20, fontSize: 15 }}>
            Carteira de Investimentos
          </h3>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 24,
              height: 220,
            }}
          >
            <ResponsiveContainer width="55%" height="100%">
              <PieChart>
                <Pie
                  data={investimentosMock}
                  dataKey="total"
                  nameKey="tipo"
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={95}
                  paddingAngle={3}
                  label={({ percent }) =>
                    `${(percent * 100).toFixed(0)}%`
                  }
                >
                  {investimentosMock.map((_, i) => (
                    <Cell
                      key={i}
                      fill={CORES_PIE[i % CORES_PIE.length]}
                    />
                  ))}
                </Pie>

                <Tooltip
                  contentStyle={{
                    background: "#1e2130",
                    border: "1px solid #2a2d3e",
                    borderRadius: 8,
                    fontSize: 13,
                  }}
                  formatter={(v) => formatBRL(v)}
                />
              </PieChart>
            </ResponsiveContainer>

            <div style={{ flex: 1 }}>
              <div
                style={{
                  marginBottom: 20,
                }}
              >
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: "var(--text-primary)",
                  }}
                >
                  {formatBRL(totalInvestido)}
                </div>

                <div
                  style={{
                    color: "var(--text-muted)",
                    fontSize: 13,
                  }}
                >
                  Total investido
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {investimentosMock.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: 14,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <div
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 999,
                          background:
                            CORES_PIE[i % CORES_PIE.length],
                        }}
                      />

                      <span
                        style={{
                          color: "var(--text-secondary)",
                        }}
                      >
                        {item.tipo}
                      </span>
                    </div>

                    <span
                      style={{
                        fontWeight: 600,
                        color: "var(--text-primary)",
                      }}
                    >
                      {formatBRL(item.total)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Últimas transações */}
      <div className="card">
        <h3 style={{ marginBottom: 20, fontSize: 15 }}>Últimas Transações</h3>
        {ultimasTransacoes?.length > 0 ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Título</th>
                  <th>Categoria</th>
                  <th>Data</th>
                  <th>Tipo</th>
                  <th style={{ textAlign: "right" }}>Valor</th>
                </tr>
              </thead>
              <tbody>
                {ultimasTransacoes.map((t, i) => (
                  <tr key={i}>
                    <td style={{ color: "var(--text-primary)", fontWeight: 500 }}>{t.titulo}</td>
                    <td>{t.categoria}</td>
                    <td>{new Date(t.data).toLocaleDateString("pt-BR")}</td>
                    <td>
                      <span className={`badge ${t.tipo === "receita" ? "badge-green" : "badge-red"}`}>
                        {t.tipo === "receita" ? "Receita" : "Despesa"}
                      </span>
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 600, color: t.tipo === "receita" ? "var(--accent-green)" : "var(--accent-red)" }}>
                      {t.tipo === "receita" ? "+" : "-"}{formatBRL(t.valor)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ color: "var(--text-muted)", fontSize: 13, textAlign: "center", padding: 32 }}>
            Nenhuma transação encontrada. Adicione receitas e despesas!
          </p>
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, color, icon, highlight }) {
  return (
    <div className="card" style={{ borderColor: highlight ? color + "40" : "var(--border)" }}>
      <div className="flex items-center justify-between mb-16">
        <span style={{ fontSize: 13, color: "var(--text-muted)" }}>{label}</span>
        <div style={{ color }}>{icon}</div>
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}
