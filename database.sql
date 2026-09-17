-- Active: 1789669926946@@127.0.0.1@3306@hubble
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
    'Arthur Henrique',
    '2007-08-05',
    'teste@gmail.com',
    '123456'
);

SELECT * FROM usuarios;