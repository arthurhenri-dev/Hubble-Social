-- Active: 1790033803825@@hubble-db-hubble-sql.k.aivencloud.com@21887
CREATE DATABASE  IF NOT EXISTS hubble;

USE hubble;
CREATE TABLE IF NOT EXISTS usuarios(
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    nascimento DATE NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL
);

INSERT INTO usuarios(nome, nascimento, email, senha)
VALUES(
    'Teste Node',
    '2007-08-05',
    'testenode@gmail.com',
    'hash_teste'
);

SELECT * FROM usuarios;

DESCRIBE usuarios;
SHOW TABLES;

DELETE FROM usuarios;
ALTER TABLE usuarios AUTO_INCREMENT = 1;

SELECT
    @@hostname AS servidor,
    @@port AS porta,
    DATABASE() AS banco;