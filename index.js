// index.js
const express = require('express');
const pool = require('./src/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

/** GET /produtos - lista todos */
app.get('/produtos', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM produtos');
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).send('Erro interno do servidor');
  }
});

/** GET /produtos/:id - busca 1 por id */
app.get('/produtos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM produtos WHERE id = ?', [id]);
    if (rows.length === 0) return res.status(404).send('Produto não encontrado');
    res.json(rows[0]);
  } catch (error) {
    console.error('Erro ao buscar produto:', error);
    res.status(500).send('Erro interno do servidor');
  }
});

/** POST /produtos - cria produto */
app.post('/produtos', async (req, res) => {
  const { nome, descricao, preco } = req.body;
  if (!nome || !preco) return res.status(400).send('Nome e preço são obrigatórios');

  try {
    const [result] = await pool.query(
      'INSERT INTO produtos (nome, descricao, preco) VALUES (?, ?, ?)',
      [nome, descricao ?? null, preco]
    );
    res.status(201).json({ id: result.insertId, nome, descricao, preco });
  } catch (error) {
    console.error('Erro ao criar produto:', error);
    res.status(500).send('Erro interno do servidor');
  }
});

/** PUT /produtos/:id - atualiza produto */
app.put('/produtos/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, descricao, preco } = req.body;

  try {
    const [result] = await pool.query(
      'UPDATE produtos SET nome = ?, descricao = ?, preco = ? WHERE id = ?',
      [nome, descricao ?? null, preco, id]
    );
    if (result.affectedRows === 0) return res.status(404).send('Produto não encontrado');
    res.status(200).json({ id: Number(id), nome, descricao, preco });
  } catch (error) {
    console.error('Erro ao atualizar produto:', error);
    res.status(500).send('Erro interno do servidor');
  }
});

/** DELETE /produtos/:id - remove produto */
app.delete('/produtos/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query('DELETE FROM produtos WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).send('Produto não encontrado');
    res.status(204).send(); // sem corpo
  } catch (error) {
    console.error('Erro ao deletar produto:', error);
    res.status(500).send('Erro interno do servidor');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
