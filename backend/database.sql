-- Execute este script no seu MySQL antes de rodar o backend

CREATE DATABASE financeiro_db;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS receitas (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(100) NOT NULL,
  valor DECIMAL(10, 2) NOT NULL,
  categoria VARCHAR(50) NOT NULL,
  data DATE NOT NULL,
  descricao TEXT,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE investimentos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    valor NUMERIC(12,2) NOT NULL,
    rentabilidade NUMERIC(5,2),
    user_id INT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS despesas (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(100) NOT NULL,
  valor DECIMAL(10, 2) NOT NULL,
  categoria VARCHAR(50) NOT NULL,
  data DATE NOT NULL,
  descricao TEXT,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Categorias sugeridas para receitas: Salário, Freelance, Investimentos, Outros
-- Categorias sugeridas para despesas: Alimentação, Transporte, Moradia, Saúde, Lazer, Educação, Outros
