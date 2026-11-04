require("dotenv").config();

const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const cors = require("cors");

const app = express();

app.use(cors());

app.use(express.json());

const conexao = mysql.createPool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});


// rota do cadastro

app.post("/cadastro", async (req, res) => {
    const { nome, nascimento, email, senha } = req.body;

    if (!nome || !nascimento || !email || !senha) {
        return res.status(400).jon({
            mensagem: "Preencha todos os campos."
        });
    }

    try {
        // verifica se o usuario ja está cadastrado
        const [usuarios] = await conexao.promise().query(
            "SELECT id FROM usuarios WHERE email = ?",
            [email]
        );

        if (usuarios.length > 0) {
            return res.status(409).json({
                mensagem: "Este e-mail já está cadastrado. Faça login."
            });
        }

        // protege a senha
        const senhaHash = await bcrypt.hash(senha, 10);

        // registra o usuario
        await conexao.promise().query(
            `INSERT INTO usuarios
            (nome, nascimento, email, senha)
            VALUES (?, ?, ?, ?)`,
            [nome, nascimento, email, senhaHash]
        );

        return res.status(201).json({
            mensagem: "Cadastro realizado com sucesso!"
        });

    } catch (erro) {
        if (erro.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                mensagem: "Este email já está cadastrado. Faça login."
            });
        }

        console.error("Erro ao realizar cadastro:", erro.message);

        return res.status(500).json({
            mensagem: "Erro no servidor ao realizar cadastro."
        });
    }
});

// rota do login

app.post("/login", async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({
            mensagem: "Informe seu e-mail e sua senha."
        });
    }

    try {
        const [usuarios] = await conexao.promise().query(
            "SELECT id, nome, email, senha FROM usuarios WHERE email = ?",
            [email]
        );

        if (usuarios.length === 0) {
            return res.status(401).json({
                mensagem: "E-mail ou senha incorretos."
            });
        }

        const usuario = usuarios[0];

        const senhaCorreta = await bcrypt.compare(
            senha,
            usuario.senha
        );

        if (!senhaCorreta) {
            return res.status(401).json({
                mensagem: "E-mail ou senha incorretos"
            });
        }

        return res.json({
            mensagem: "Login realizado com sucesso!",
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email
            }
        });

    } catch (erro) {
        console.error("Erro ao fazer login:", erro.message);

        return res.status(500).json({
            mensagem: "Erro no servidor."
        });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor do Hubble rodando na porta ${PORT}!`);
});