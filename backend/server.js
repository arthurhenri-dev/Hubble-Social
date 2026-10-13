require("dotenv").config();

const dns = require("dns");
dns.setDefaultResultOrder("ipv4first");

const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const cors = require("cors");

const { Resend } = require("resend");
const crypto = require("crypto");

const app = express();

const resend = new Resend(process.env.RESEND_API_KEY);

async function enviarTokenVerificacao(email, token) {
    const { data, error } = await resend.emails.send({
        from: "Hubble <onboarding@resend.dev>",
        to: email,
        subject: "Seu codigo de verificação do Hubble",
        html: `
            <div style="font-family: Arial, sans-serif; color: #17172b; max-width: 500px; margin: auto;">
                <h1 style="font-size: 28px;">Bem-vindo ao Hubble 💜</h1>

                <p>Use o código abaixo para verificar seu endereço de e-mail:</p>

                <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; padding: 20px 0;">
                    ${token}
                </div>

                <p>Este código expira em <strong>10 minutos</strong>.</p>

                <p style="color: #666; font-size: 13px;">
                    Se você não solicitou este código, ignore esta mensagem.
                </p>
            </div>
        `
    })

    if (error) {
        console.error("Erro ao enviar e-mail:", error);
        throw new Error("Não foi possível enviar o e-mail de verificação.")
    }

    return data;
}

function gerarTokenVerificacao() {
    return crypto.randomInt(0, 1000000)
        .toString()
        .padStart(6, "0");
}

function gerarHashToken(token) {
    return crypto
        .createHash("sha256")
        .update(token)
        .digest("hex")
}

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

app.post("/cadastro", async(req, res) => {
    const { nome, nascimento, email, senha } = req.body;

    if (!nome || !nascimento || !email || !senha) {
        return res.status(400).json ({
            mensagem: "Preencha todos os campos."
        });
    }

    try {
        // verifica se o email já está cadastrado
        const[usuarios] = await conexao.promise().query(
            "SELECT id FROM usuarios WHERE email = ?",
            [email]
        );

        if (usuarios.length > 0) {
            return res.status(409).json({
                mensagem: "Este e-mail já esta cadastrado. Faça login."
            });
        }

        // protege a senha e gera o token
        const senhaHash = await bcrypt.hash(senha, 10);
        const token = gerarTokenVerificacao();
        const tokenHash = gerarHashToken(token);

        // o token expira em 10 minutos
        const expiracao = new Date(Date.now() + 10 * 60 * 1000);

        const [resultado] = await conexao.promise().query(
            `INSERT INTO usuarios
            (nome, nascimento, email, senha, email_verificado, 
            token_verificacao_hash, token_verificacao_expira,
            tentativas_verificacao)
            VALUES (?, ?, ?, ?, FALSE, ?, ?, 0)`,
            [
                nome, 
                nascimento,
                email,
                senhaHash,
                tokenHash,
                expiracao
            ]
        );

        try {
            // envia o codigo por email
            await enviarTokenVerificacao(email, token);

            return res.status(201).json ({
                mensagem: "Cadastro realizado! Confira o seu email para verificar sua conta."
            });
        } catch (erroEmail) {
            // se o envio falhar, remove o cadastro recem criado
            await conexao.promise().query(
                "DELETE FROM usuarios WHERE id = ? AND email_verificado = FALSE",
                [resultado.insertId]
            );

            console.error("Falha no envio da verificação.");
            return res.status(502).json({
                mensagem: "Não foi possivel enviar o código. Tente novamente."
            });
        }
    } catch (erro) {
        // nao registra senha, token ou dados pessoais no console
        if (erro.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                mensagem: "Este e-mail já está cadastrado. Faça login."
            });
        }

        console.error("Erro ao realizar cadastro:", erro.message);

        return res.status(500).json({
            mensagem: "Erro no servidor ao realizar cadastro."
        });
    }

});


app.post("/verificar-email", async (req, res) => {
    const { email, token } = req.body;

    if (
        !email ||
        typeof token !== "string" ||
        !/^\d{6}$/.test(token)
    ) {
        return res.status(400).json({
            mensagem: "Informe seu e-mail e um código válido de 6 dígitos."
        });
    }

    try {
        const [usuarios] = await conexao.promise().query(
            `SELECT id, nome, email, email_verificado,
                    token_verificacao_hash, token_verificacao_expira,
                    tentativas_verificacao,
                    token_login_hash, token_login_expira,
                    tentativas_login
             FROM usuarios
             WHERE email = ?`,
            [email]
        );

        if (usuarios.length === 0) {
            return res.status(400).json({
                mensagem: "E-mail ou código inválido."
            });
        }

        const usuario = usuarios[0];

        // Define qual código deve ser validado
        const ehLogin = Boolean(usuario.email_verificado);

        const hashSalvo = ehLogin
            ? usuario.token_login_hash
            : usuario.token_verificacao_hash;

        const expiracao = ehLogin
            ? usuario.token_login_expira
            : usuario.token_verificacao_expira;

        const tentativas = ehLogin
            ? usuario.tentativas_login
            : usuario.tentativas_verificacao;

        const colunaTentativas = ehLogin
            ? "tentativas_login"
            : "tentativas_verificacao";

        const colunaHash = ehLogin
            ? "token_login_hash"
            : "token_verificacao_hash";

        const colunaExpiracao = ehLogin
            ? "token_login_expira"
            : "token_verificacao_expira";

        if (tentativas >= 5) {
            return res.status(429).json({
                mensagem: "Limite de tentativas atingido. Solicite um novo código."
            });
        }

        if (
            !hashSalvo ||
            !expiracao ||
            new Date(expiracao).getTime() <= Date.now()
        ) {
            return res.status(400).json({
                mensagem: "O código expirou ou não é mais válido. Solicite outro."
            });
        }

        const tokenHash = gerarHashToken(token);

        const codigoCorreto =
            /^[a-f0-9]{64}$/i.test(hashSalvo) &&
            crypto.timingSafeEqual(
                Buffer.from(tokenHash, "hex"),
                Buffer.from(hashSalvo, "hex")
            );

        if (!codigoCorreto) {
            await conexao.promise().query(
                `UPDATE usuarios
                SET ${colunaTentativas} = ${colunaTentativas} + 1
                WHERE id = ?`,
                [usuario.id]
            );

            return res.status(400).json({
                mensagem: "E-mail ou código inválido."
            });
        }

        // Código do cadastro: confirma o endereço de e-mail
        if (!ehLogin) {
            await conexao.promise().query(
                `UPDATE usuarios
                SET email_verificado = TRUE,
                    token_verificacao_hash = NULL,
                    token_verificacao_expira = NULL,
                    tentativas_verificacao = 0
                WHERE id = ?`,
                [usuario.id]
            );

            return res.json({
                mensagem: "E-mail verificado com sucesso! Agora você pode fazer login.",
                tipo: "cadastro"
            });
        }

        // Código do login: conclui a verificação desta tentativa
        await conexao.promise().query(
            `UPDATE usuarios
            SET token_login_hash = NULL,
                token_login_expira = NULL,
                tentativas_login = 0
            WHERE id = ?`,
            [usuario.id]
        );

        return res.json({
            mensagem: "Login verificado com sucesso!",
            tipo: "login",
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email: usuario.email
            }
        });

    } catch (erro) {
        console.error("Erro ao verificar código:", erro.message);

        return res.status(500).json({
            mensagem: "Erro no servidor ao verificar o código."
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
            "SELECT * FROM usuarios WHERE email = ?",
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
                mensagem: "E-mail ou senha incorretos."
            });
        }

        if (!usuario.email_verificado) {
            return res.status(403).json({
                mensagem: "Verifique seu e-mail pelo código enviado durante o cadastro."
            });
        }

        // Gera um código exclusivo para este login
        const token = gerarTokenVerificacao();
        const tokenHash = gerarHashToken(token);
        const expiracao = new Date(Date.now() + 10 * 60 * 1000);

        await conexao.promise().query(
            `UPDATE usuarios
            SET token_login_hash = ?,
                token_login_expira = ?,
                tentativas_login = 0
            HERE id = ?`,
            [tokenHash, expiracao, usuario.id]
        );

        try {
            await enviarTokenVerificacao(email, token);

            return res.json({
                mensagem: "Código enviado para seu e-mail. Digite-o para concluir o login.",
                verificacaoLogin: true
            });
        } catch (erroEmail) {
            await conexao.promise().query(
                `UPDATE usuarios
                SET token_login_hash = NULL,
                    token_login_expira = NULL,
                    tentativas_login = 0
                WHERE id = ?`,
                [usuario.id]
            );

            return res.status(502).json({
                mensagem: "Não foi possível enviar o código de login. Tente novamente."
            });
        }

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