
// Script da tela de login (index.html)
const btnLogin = document.getElementById("btnLogin");

if (btnLogin){
    btnLogin.addEventListener("click", async () => {

        const email = document.getElementById("loginEmail").value;
        const senha = document.getElementById("loginSenha").value;

        if (!email || !senha) {
            alert("Preencha todos os campos!");
            return;
        }

        const resposta = await fetch("http://localhost:3000/login", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email: email,
                senha: senha
            })
        });

        const dados = await resposta.json();

        alert(dados.mensagem);

        if (resposta.ok) {
            console.log("Usuário logado:", dados.usuario);
        }
    });
}

// Script da tela de cadastro (cad.html)
const btnCadastrar = document.getElementById("btnCadastrar");


if (btnCadastrar){
    btnCadastrar.addEventListener("click", async() => {

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
