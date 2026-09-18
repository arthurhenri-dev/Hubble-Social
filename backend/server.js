const express = require("express");
const mysql = require("mysql2");

const app = express();

app.use(express.json());

const conexao = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "05082007nA",
    database: "hubble"
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