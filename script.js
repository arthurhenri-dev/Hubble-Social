
// Script da tela de login (index.html)
const btnLogin = document.getElementaryById("btnLogin");

if (btnLogin){
    document.getElementById("btnLogin").addEventListener("click", function () {

        const email = document.getElementById("loginEmail").value;
        const senha = document.getElementById("loginSenha").value;

        const usuarioSalvo = JSON.parse(localStorage.getItem("usuario"));

        if (!usuarioSalvo) {
            alert("Nenhum usuario encontrado");
            return;
        }

        if (email === usuarioSalvo.email && senha === usuarioSalvo.senha) {
            alert("Login realizado com sucesso! Bem vindo!")
        } else {
            alert("Email ou senha incorretos! Tente novamente")
        }
    });
}

// Script da tela de cadastro (cad.html)
const btnCadastrar = document.getElementaryById("btnCadastrar");

if (btnCadastrar){
    document.getElementById("btnCadastrar").addEventListener("click", function () {

        const nome = document.getElementById("nome").value;
        const email = document.getElementById("email").value;
        const senha = document.getElementById("senha").value;
        const nascimento = document.getElementById("nascimento").value;

        if ( !nome || !email || !senha || !nascimento){
            alert("Preecha todos os campos!");
            return;
        }

        const usuario = {
            nome: nome,
            email: email,
            senha: senha,
            nascimento: nascimento
        };

        localStorage.setItem("usuario", JSON.stringify(usuario));

        alert("Cadastro realizado com sucesso!");
        window.location.href = "login.html";

    });
}
