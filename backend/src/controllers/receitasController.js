const pool = require("../database/connection");

const listar = async (req, res) => {
  const { mes, ano, categoria } = req.query;

  let query = `
    SELECT *
    FROM receitas
    WHERE user_id = $1
  `;

  const params = [req.userId];
  let index = 2;

  if (mes && ano) {
    query += `
      AND EXTRACT(MONTH FROM data)::int = $${index}
      AND EXTRACT(YEAR FROM data)::int = $${index + 1}
    `;

    params.push(mes, ano);
    index += 2;

  } else if (ano) {
    query += `
      AND EXTRACT(YEAR FROM data)::int = $${index}
    `;

    params.push(ano);
    index++;
  }

  if (categoria) {
    query += `
      AND categoria = $${index}
    `;

    params.push(categoria);
    index++;
  }

  query += " ORDER BY data DESC";

  try {

    const result = await pool.query(
      query,
      params
    );

    res.json(result.rows);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Erro ao buscar receitas"
    });
  }
};

const criar = async (req, res) => {
  const {
    titulo,
    valor,
    categoria,
    data,
    descricao
  } = req.body;

  if (!titulo || !valor || !categoria || !data) {
    return res.status(400).json({
      error:
        "Título, valor, categoria e data são obrigatórios"
    });
  }

  try {

    const result = await pool.query(
      `
      INSERT INTO receitas
      (
        titulo,
        valor,
        categoria,
        data,
        descricao,
        user_id
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        titulo,
        valor,
        categoria,
        data,
        descricao || null,
        req.userId
      ]
    );

    res.status(201).json(result.rows[0]);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Erro ao criar receita"
    });
  }
};

const atualizar = async (req, res) => {
  const { id } = req.params;

  const {
    titulo,
    valor,
    categoria,
    data,
    descricao
  } = req.body;

  try {

    const existing = await pool.query(
      `
      SELECT id
      FROM receitas
      WHERE id = $1
      AND user_id = $2
      `,
      [id, req.userId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        error: "Receita não encontrada"
      });
    }

    const result = await pool.query(
      `
      UPDATE receitas
      SET
        titulo = $1,
        valor = $2,
        categoria = $3,
        data = $4,
        descricao = $5
      WHERE id = $6
      RETURNING *
      `,
      [
        titulo,
        valor,
        categoria,
        data,
        descricao || null,
        id
      ]
    );

    res.json(result.rows[0]);

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Erro ao atualizar receita"
    });
  }
};

const deletar = async (req, res) => {
  const { id } = req.params;

  try {

    const existing = await pool.query(
      `
      SELECT id
      FROM receitas
      WHERE id = $1
      AND user_id = $2
      `,
      [id, req.userId]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({
        error: "Receita não encontrada"
      });
    }

    await pool.query(
      "DELETE FROM receitas WHERE id = $1",
      [id]
    );

    res.json({
      message: "Receita deletada com sucesso"
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Erro ao deletar receita"
    });
  }
};

module.exports = {
  listar,
  criar,
  atualizar,
  deletar
};