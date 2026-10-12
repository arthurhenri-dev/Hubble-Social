require("dotenv").config();

const mysql = require("mysql2");

const conexao = mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false
    }
});

const sql = `
    ALTER TABLE usuarios
    ADD COLUMN token_login_hash VARCHAR(255) NULL,
    ADD COLUMN token_login_expira DATETIME NULL,
    ADD COLUMN tentativas_login INT NOT NULL DEFAULT 0
`;

conexao.query(sql, (erro) => {
    if (erro) {
        console.error("Erro ao alterar a tabela:", erro.message);
    } else {
        console.log("Tabela usuarios atualizada com sucesso!");
    }

    conexao.end();
})