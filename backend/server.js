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

// rota do cadastro

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

// rota do login
app.post("/login", (req, res) => {

    const { email, senha } = req.body;

    console.log("Login recebido:", email, senha);

    const sql = "SELECT * FROM usuarios WHERE email = ?";

    conexao.query(sql, [email], async (erro, resultados) => {

        if (erro) {
            console.log("Erro ao fazer login:", erro);

            return res.status(500).json({
                mensagem: "Erro no servidor."
            });
        }

        console.log("Usuários encontrados:", resultados.length);

        if (resultados.length === 0) {
            return res.status(401).json({
                mensagem: "Email ou senha incorretos."
            });
        }

        const usuario = resultados[0];

        console.log("Usuário encontrado:", usuario.email);
        console.log("Hash salvo:", usuario.senha);

        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

        console.log("Senha correta:", senhaCorreta);

        if (!senhaCorreta) {
            return res.status(401).json({
                mensagem: "Email ou senha incorretos."
            });
        }

        res.json({
            mensagem: "Login realizado com sucesso!",
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email
            }
        });
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor do Hubble rodando na porta ${PORT}!`);
});