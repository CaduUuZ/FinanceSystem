const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("../database/connection");
const { JWT_SECRET } = require("../middleware/auth");

const register = async (req, res) => {
  const { nome, email, senha } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({
      error: "Nome, email e senha são obrigatórios"
    });
  }

  try {
    const existing = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existing.rows.length > 0) {
      return res.status(409).json({
        error: "Email já cadastrado"
      });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const result = await pool.query(
      `
      INSERT INTO users (nome, email, senha)
      VALUES ($1, $2, $3)
      RETURNING id, nome, email
      `,
      [nome, email, senhaHash]
    );

    const user = result.rows[0];

    const token = jwt.sign(
      {
        id: user.id,
        nome: user.nome
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Usuário criado com sucesso",
      token,
      user
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Erro interno do servidor"
    });
  }
};

const login = async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({
      error: "Email e senha são obrigatórios"
    });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        error: "Email ou senha incorretos"
      });
    }

    const user = result.rows[0];

    const senhaCorreta = await bcrypt.compare(
      senha,
      user.senha
    );

    if (!senhaCorreta) {
      return res.status(401).json({
        error: "Email ou senha incorretos"
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        nome: user.nome
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email
      }
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      error: "Erro interno do servidor"
    });
  }
};

module.exports = { register, login };
