const pool = require("../database/connection");

const resumo = async (req, res) => {
  const { mes, ano } = req.query;

  const anoAtual = ano || new Date().getFullYear();
  const mesAtual = mes || new Date().getMonth() + 1;

  try {

    // Total receitas
    const receitasResult = await pool.query(
      `
      SELECT COALESCE(SUM(valor), 0) AS "totalReceitas"
      FROM receitas
      WHERE user_id = $1
      AND EXTRACT(MONTH FROM data) = $2
      AND EXTRACT(YEAR FROM data) = $3
      `,
      [req.userId, mesAtual, anoAtual]
    );

    const totalReceitas =
      receitasResult.rows[0].totalReceitas;

    // Total despesas
    const despesasResult = await pool.query(
      `
      SELECT COALESCE(SUM(valor), 0) AS "totalDespesas"
      FROM despesas
      WHERE user_id = $1
      AND EXTRACT(MONTH FROM data) = $2
      AND EXTRACT(YEAR FROM data) = $3
      `,
      [req.userId, mesAtual, anoAtual]
    );

    const totalDespesas =
      despesasResult.rows[0].totalDespesas;

    // Receitas por categoria
    const receitasCategoriaResult = await pool.query(
      `
      SELECT categoria, SUM(valor) AS total
      FROM receitas
      WHERE user_id = $1
      AND EXTRACT(MONTH FROM data) = $2
      AND EXTRACT(YEAR FROM data) = $3
      GROUP BY categoria
      `,
      [req.userId, mesAtual, anoAtual]
    );

    const receitasPorCategoria =
      receitasCategoriaResult.rows;

    // Despesas por categoria
    const despesasCategoriaResult = await pool.query(
      `
      SELECT categoria, SUM(valor) AS total
      FROM despesas
      WHERE user_id = $1
      AND EXTRACT(MONTH FROM data) = $2
      AND EXTRACT(YEAR FROM data) = $3
      GROUP BY categoria
      `,
      [req.userId, mesAtual, anoAtual]
    );

    const despesasPorCategoria =
      despesasCategoriaResult.rows;

    // Evolução receitas
    const evolucaoReceitasResult = await pool.query(
      `
      SELECT
        EXTRACT(MONTH FROM data) AS mes,
        SUM(valor) AS total
      FROM receitas
      WHERE user_id = $1
      AND EXTRACT(YEAR FROM data) = $2
      GROUP BY mes
      ORDER BY mes
      `,
      [req.userId, anoAtual]
    );

    const evolucaoReceitas =
      evolucaoReceitasResult.rows;

    // Evolução despesas
    const evolucaoDespesasResult = await pool.query(
      `
      SELECT
        EXTRACT(MONTH FROM data) AS mes,
        SUM(valor) AS total
      FROM despesas
      WHERE user_id = $1
      AND EXTRACT(YEAR FROM data) = $2
      GROUP BY mes
      ORDER BY mes
      `,
      [req.userId, anoAtual]
    );

    const evolucaoDespesas =
      evolucaoDespesasResult.rows;

    // Últimas receitas
    const ultimasReceitasResult = await pool.query(
      `
      SELECT *, 'receita' AS tipo
      FROM receitas
      WHERE user_id = $1
      ORDER BY data DESC
      LIMIT 5
      `,
      [req.userId]
    );

    const ultimasReceitas =
      ultimasReceitasResult.rows;

    // Últimas despesas
    const ultimasDespesasResult = await pool.query(
      `
      SELECT *, 'despesa' AS tipo
      FROM despesas
      WHERE user_id = $1
      ORDER BY data DESC
      LIMIT 5
      `,
      [req.userId]
    );

    const ultimasDespesas =
      ultimasDespesasResult.rows;

    const ultimasTransacoes = [
      ...ultimasReceitas,
      ...ultimasDespesas
    ]
      .sort(
        (a, b) =>
          new Date(b.data) - new Date(a.data)
      )
      .slice(0, 8);

    res.json({
      resumo: {
        totalReceitas: parseFloat(totalReceitas),
        totalDespesas: parseFloat(totalDespesas),
        saldo:
          parseFloat(totalReceitas) -
          parseFloat(totalDespesas),
      },

      receitasPorCategoria,
      despesasPorCategoria,
      evolucaoReceitas,
      evolucaoDespesas,
      ultimasTransacoes,
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Erro ao buscar resumo"
    });
  }
};

module.exports = { resumo };