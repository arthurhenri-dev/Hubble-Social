
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

        const resposta = await fetch("https://hubble-backend-pxj0.onrender.com/login", {
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
            window.location.href = "verificacao.html";
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

        const resposta = await fetch("https://hubble-backend-pxj0.onrender.com/cadastro", {
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
            window.location.href = "verificacao.html";
        }
    });
}

const camposCodigo = document.querySelectorAll(".digito-codigo");

camposCodigo.forEach((campo, indice) => {
    
    campo.addEventListener("input", () => {
        campo.value = campo.value.replace(/\D/g, "");

        if (campo.value && indice < camposCodigo.length - 1) {
            camposCodigo[indice + 1].focus();
        }
    });

    campo.addEventListener("keydown", (evento) => {
        if (
            evento.key === "Backspace" &&
            !campo.value &&
            indice > 0
        ) {
            camposCodigo[indice - 1].focus();
        }
    });

    campo.addEventListener("paste", (evento) => {
        evento.prevenDefault();

        const texto = evento.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, 6);
        
        texto.split("").forEach((digito, i) => {
            camposCodigo[i].value = digito;
        });

        const proximoCampo = Math.min(
            texto.legth,
            camposCodigo.length - 1
        );

        camposCodigo[proximoCampo].focus();
    });

});