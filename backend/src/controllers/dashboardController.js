const pool = require("../database/connection");

const resumo = async (req, res) => {
  const { mes, ano } = req.query;
  const anoAtual = ano || new Date().getFullYear();
  const mesAtual = mes || new Date().getMonth() + 1;

  try {
    // Total receitas do mês
    const [[{ totalReceitas }]] = await pool.query(
      "SELECT COALESCE(SUM(valor), 0) as totalReceitas FROM receitas WHERE user_id = $1 AND MONTH(data) = $2 AND YEAR(data) = $3",
      [req.userId, mesAtual, anoAtual]
    );

    // Total despesas do mês
    const [[{ totalDespesas }]] = await pool.query(
      "SELECT COALESCE(SUM(valor), 0) as totalDespesas FROM despesas WHERE user_id = $1 AND MONTH(data) = $2 AND YEAR(data) = $3",
      [req.userId, mesAtual, anoAtual]
    );

    // Receitas por categoria
    const [receitasPorCategoria] = await pool.query(
      "SELECT categoria, SUM(valor) as total FROM receitas WHERE user_id = $1 AND MONTH(data) = $2 AND YEAR(data) = $3 GROUP BY categoria",
      [req.userId, mesAtual, anoAtual]
    );

    // Despesas por categoria
    const [despesasPorCategoria] = await pool.query(
      "SELECT categoria, SUM(valor) as total FROM despesas WHERE user_id = $1 AND MONTH(data) = $2 AND YEAR(data) = $3 GROUP BY categoria",
      [req.userId, mesAtual, anoAtual]
    );

    // Evolução mensal do ano (últimos 6 meses)
    const [evolucaoReceitas] = await pool.query(
      `SELECT MONTH(data) as mes, SUM(valor) as total 
       FROM receitas 
       WHERE user_id = $1 AND YEAR(data) = $2 
       GROUP BY MONTH(data) ORDER BY mes`,
      [req.userId, anoAtual]
    );

    const [evolucaoDespesas] = await pool.query(
      `SELECT MONTH(data) as mes, SUM(valor) as total 
       FROM despesas 
       WHERE user_id = $1 AND YEAR(data) = $2 
       GROUP BY MONTH(data) ORDER BY mes`,
      [req.userId, anoAtual]
    );

    // Últimas transações
    const [ultimasReceitas] = await pool.query(
      "SELECT *, 'receita' as tipo FROM receitas WHERE user_id = $1 ORDER BY data DESC LIMIT 5",
      [req.userId]
    );

    const [ultimasDespesas] = await pool.query(
      "SELECT *, 'despesa' as tipo FROM despesas WHERE user_id = $1 ORDER BY data DESC LIMIT 5",
      [req.userId]
    );

    const ultimasTransacoes = [...ultimasReceitas, ...ultimasDespesas]
      .sort((a, b) => new Date(b.data) - new Date(a.data))
      .slice(0, 8);

    res.json({
      resumo: {
        totalReceitas: parseFloat(totalReceitas),
        totalDespesas: parseFloat(totalDespesas),
        saldo: parseFloat(totalReceitas) - parseFloat(totalDespesas),
      },
      receitasPorCategoria,
      despesasPorCategoria,
      evolucaoReceitas,
      evolucaoDespesas,
      ultimasTransacoes,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao buscar resumo" });
  }
};

module.exports = { resumo };
