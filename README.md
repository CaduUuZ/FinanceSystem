# 💰 FinanceiroApp — Dashboard Financeiro Completo

Sistema financeiro pessoal com **React + Node.js + MySQL**.

## 📁 Estrutura do Projeto

```
financeiro/
├── backend/         ← API Node.js + Express
│   ├── src/
│   │   ├── controllers/   (authController, receitasController, despesasController, dashboardController)
│   │   ├── routes/        (auth.js, receitas.js, despesas.js, dashboard.js)
│   │   ├── middleware/    (auth.js — JWT)
│   │   ├── database/      (connection.js — MySQL pool)
│   │   └── app.js         (entry point)
│   ├── database.sql       ← Script para criar as tabelas
│   └── package.json
│
└── frontend/        ← React + Vite
    ├── src/
    │   ├── pages/         (Login, Register, Dashboard, Receitas, Despesas)
    │   ├── components/    (Layout — sidebar)
    │   ├── contexts/      (AuthContext — JWT + estado global)
    │   ├── services/      (api.js — Axios configurado)
    │   ├── App.jsx        (Rotas React Router)
    │   └── main.jsx
    └── package.json
```

---

## 🚀 Como Rodar

### 1. Banco de Dados MySQL

```sql
-- Abra seu MySQL Workbench ou terminal e execute:
-- O arquivo database.sql (está na pasta backend/)
```

Ou copie e execute isso no MySQL:

```sql
CREATE DATABASE IF NOT EXISTS financeiro_db;
USE financeiro_db;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS receitas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(100) NOT NULL,
  valor DECIMAL(10, 2) NOT NULL,
  categoria VARCHAR(50) NOT NULL,
  data DATE NOT NULL,
  descricao TEXT,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS despesas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(100) NOT NULL,
  valor DECIMAL(10, 2) NOT NULL,
  categoria VARCHAR(50) NOT NULL,
  data DATE NOT NULL,
  descricao TEXT,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

---

### 2. Backend

```bash
cd backend
npm install
```

**Edite a conexão** em `src/database/connection.js`:
```js
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "SUA_SENHA_AQUI",  // ← troque isso
  database: "financeiro_db",
});
```

```bash
npm run dev
# Servidor rodando em http://localhost:3000
```

---

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
# App rodando em http://localhost:5173
```

---

## 🔗 Rotas da API

### Auth (sem token)
| Método | Rota             | Body                          |
|--------|------------------|-------------------------------|
| POST   | /auth/register   | { nome, email, senha }        |
| POST   | /auth/login      | { email, senha }              |

### Receitas (Bearer Token obrigatório)
| Método | Rota              | Descrição                         |
|--------|-------------------|-----------------------------------|
| GET    | /receitas         | Lista (filtros: ?mes=&ano=&categoria=) |
| POST   | /receitas         | Criar receita                     |
| PUT    | /receitas/:id     | Editar receita                    |
| DELETE | /receitas/:id     | Deletar receita                   |

### Despesas (Bearer Token obrigatório)
| Método | Rota              | Descrição                         |
|--------|-------------------|-----------------------------------|
| GET    | /despesas         | Lista (filtros: ?mes=&ano=&categoria=) |
| POST   | /despesas         | Criar despesa                     |
| PUT    | /despesas/:id     | Editar despesa                    |
| DELETE | /despesas/:id     | Deletar despesa                   |

### Dashboard
| Método | Rota                  | Descrição                          |
|--------|-----------------------|------------------------------------|
| GET    | /dashboard/resumo     | Resumo, gráficos, últimas transações |

---

## ✅ Funcionalidades

- [x] Cadastro e Login com JWT
- [x] CRUD completo de Receitas
- [x] CRUD completo de Despesas  
- [x] Filtros por mês/ano/categoria
- [x] Dashboard com cards de resumo
- [x] Gráfico de barras — evolução anual
- [x] Gráfico de pizza — despesas por categoria
- [x] Tabela de últimas transações
- [x] Autenticação protegida em todas as rotas

---

## 🔮 Próximos Passos (melhorias)

- [ ] Variáveis de ambiente com dotenv
- [ ] Refresh token
- [ ] Dark/Light mode toggle
- [ ] Exportar relatório em PDF
- [ ] Deploy (Railway + Vercel)
- [ ] Metas financeiras
- [ ] Notificações de orçamento

---

## 🛠 Testar a API com Postman/Insomnia

1. **POST /auth/register** → pega o token na resposta
2. Nas próximas requisições, coloca no header:
   ```
   Authorization: Bearer SEU_TOKEN_AQUI
   ```
3. **GET /receitas?mes=5&ano=2025** → lista receitas
