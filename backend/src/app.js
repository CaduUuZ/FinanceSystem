const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const receitasRoutes = require("./routes/receitas");
const despesasRoutes = require("./routes/despesas");
const dashboardRoutes = require("./routes/dashboard");

const app = express();

// Middlewares
app.use(cors({
  origin: "http://localhost:5173", // URL do Vite
  credentials: true,
}));
app.use(express.json());

// Rotas
app.use("/auth", authRoutes);
app.use("/receitas", receitasRoutes);
app.use("/despesas", despesasRoutes);
app.use("/dashboard", dashboardRoutes);

// Rota de health check
app.get("/", (req, res) => {
  res.json({ message: "API Financeiro funcionando! 🚀" });
});

// Tratamento de erros globais
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Algo deu errado!" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});
