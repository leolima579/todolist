// backend/server.js

const express = require('express');
const { Pool } = require('pg'); // Importa a classe Pool do pacote 'pg'
const cors = require('cors'); // Importa o pacote cors

const app = express();
const port = 3000; // Porta onde o servidor Node.js irá rodar

// Configuração do CORS: Permite que o seu front-end (rodando no navegador)
// faça requisições para este back-end. Ajuste a origin se o seu front-end
// não estiver rodando no mesmo endereço (ex: http://127.0.0.1:5500 se usar Live Server)
app.use(cors({
    origin: 'null', // Permite requisições de arquivos locais (ex: abrindo index.html diretamente)
    // Se você usa o Live Server do VS Code, a origem pode ser algo como 'http://127.0.0.1:5500'
    // ou 'http://localhost:5500'
}));

// Middleware para processar JSON nas requisições
app.use(express.json());

// Configuração do Pool de Conexões com o PostgreSQL
const pool = new Pool({
    user: 'postgres',         // Seu usuário do PostgreSQL
    host: 'localhost',        // Onde o PostgreSQL está rodando
    database: 'todo_list_db', // O nome do banco de dados que você criou
    password: 'roxzims2', // A senha que você definiu durante a instalação
    port: 5432,               // Porta padrão do PostgreSQL
});

// Testar a conexão com o banco de dados
pool.connect((err, client, done) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
    } else {
        console.log('Conectado ao banco de dados PostgreSQL!');
        client.release(); // Libera o cliente de volta para o pool
    }
});

// --- Rotas da API (CRUD) ---

// Rota para Obter Todas as Tarefas (READ)
app.get('/tasks', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tasks ORDER BY id ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro do servidor');
    }
});

// Rota para Criar uma Nova Tarefa (CREATE)
app.post('/tasks', async (req, res) => {
    try {
        const { description } = req.body;
        const result = await pool.query(
            'INSERT INTO tasks (description) VALUES($1) RETURNING *',
            [description]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro do servidor');
    }
});

// Rota para Atualizar uma Tarefa (UPDATE)
app.put('/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { description, completed } = req.body;
        let query;
        let values;

        if (description !== undefined && completed !== undefined) {
            query = 'UPDATE tasks SET description = $1, completed = $2 WHERE id = $3 RETURNING *';
            values = [description, completed, id];
        } else if (description !== undefined) {
            query = 'UPDATE tasks SET description = $1 WHERE id = $2 RETURNING *';
            values = [description, id];
        } else if (completed !== undefined) {
            query = 'UPDATE tasks SET completed = $1 WHERE id = $2 RETURNING *';
            values = [completed, id];
        } else {
            return res.status(400).send('Nenhum campo para atualizar fornecido.');
        }

        const result = await pool.query(query, values);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Tarefa não encontrada.' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro do servidor');
    }
});

// Rota para Deletar uma Tarefa (DELETE)
app.delete('/tasks/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM tasks WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Tarefa não encontrada.' });
        }
        res.json({ message: 'Tarefa deletada com sucesso!', deletedTask: result.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Erro do servidor');
    }
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor Node.js rodando em http://localhost:${port}`);
});