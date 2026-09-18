require("dotenv").config();

const express = require("express");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");

const app = express();

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

app.listen(3000, () => {
    console.log("Servidor do Hubble rodando na porta 3000!");
});