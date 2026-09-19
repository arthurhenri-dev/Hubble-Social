
// Script da tela de login (index.html)
const btnLogin = document.getElementById("btnLogin");

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
const btnCadastrar = document.getElementById("btnCadastrar");

if (btnCadastrar){
    btnCadastrar.addEventListener("click", async function (){

        const nome = document.getElementById("nome").value;
        const email = document.getElementById("email").value;
        const senha = document.getElementById("senha").value;
        const nascimento = document.getElementById("nascimento").value;

        if ( !nome || !email || !senha || !nascimento) {
            alert("Preencha todos os campos!");
            return;
        }

        const resposta = await fetch("http://localhost:3000/cadastro", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                nome: nome, 
                email: email,
                senha: senha,
                nascimento: nascimento
            })
        });

        const dados = await resposta.json();

        alert(dados.mensagem);

        if (resposta.ok){
            window.location.href = "index.html";
        }
    });
}
