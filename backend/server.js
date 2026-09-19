require("dotenv").config();


const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const cors = require("cors");

const app = express();

app.use(cors());

app.use(express.json());

const conexao = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

conexao.connect((erro) => {
    if (erro){
        console.log("Erro ao conectar ao MySQL:", erro);
        return;
    }

    console.log("Conetado ao MySQL!");
});

app.post("/cadastro", async(req, res) => {
    const { nome, nascimento, email, senha } = req.body;

    console.log("Dados recebidos:", req.body);

    try{
        const senhaHash = await bcrypt.hash(senha, 10);

        const sql = `
            INSERT INTO usuarios (nome, nascimento, email, senha)
            VALUES(?, ?, ?, ?)
        `;
    
        conexao.query(
            sql,
            [nome, nascimento, email, senhaHash],
            (erro) => {

                if (erro) {
                    console.log("Erro ao cadastrar:", erro);

                    return res.status(500).json({
                        mensagem: "Erro ao cadastrar usuario."
                    });
                }

                res.json({
                    mensagem: "Usuário cadastrado com sucesso!"
                });
            }
        );
    } catch (erro) {

        console.log("Erro:", erro);

        res.status(500).json({
            mensagem: "Erro no servidor."
        })
    }
});

app.listen(3000, () => {
    console.log("Servidor do Hubble rodando na porta 3000!");
});