// Script da tela de login (index.html)

const btnLogin = document.getElementById("btnLogin");

if (btnLogin) {
    btnLogin.addEventListener("click", async () => {
        
        const email = document.getElementById("loginEmail").value;
        const senha = document.getElementById("loginSenha").value;

        if (!email || !senha){
            alert("Preencha todos os campos!");
            return;
        }   

        try {
            const resposta = await fetch("https://hubble-backend-pxj0.onrender.com/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, senha })
            });

            const dados = await resposta.json();

            alert(dados.mensagem);

            if (resposta.ok) {
                sessionStorage.setItem(
                    "usuarioHubble",
                    JSON.stringify(dados.usuario)
                );

                window.location.href = "index.html";
            }
        } catch (erro) {
            console.error("Erro ao fazer login:", erro);
            alert("Não foi possível conectar ao servidor.");
        }
    });
}

// Script da tela de cadastro (cad.html)
const btnCadastrar = document.getElementById("btnCadastrar");

if (btnCadastrar) {
    btnCadastrar.addEventListener("click", async () => {

        const nome = document.getElementById("nome").value;
        const email = document.getElementById("email").value;
        const senha = document.getElementById("senha").value;
        const nascimento = document.getElementById("nascimento").value;

        if (!nome || !email || !senha || !nascimento) {
            alert("Preencha todos os campos!");
            return;
        }

        try {
            const resposta = await fetch("https://hubble-backend-pxj0.onrender.com/cadastro", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nome,
                    email,
                    senha,
                    nascimento
                })
            });

            console.log("Status da resposta:", resposta.status);
            console.log("Resposta do servidor:", resposta);

            const dados = await resposta.json();

            console.log = ("Dados recebidos:", dados);

            alert(dados.mensagem);

            if (resposta.ok) {
                window.location.href = "login.html";
            }
            
        } catch (erro) {
            console.error("Erro ao realizar cadastro:", erro);
            alert("Não foi possível conectar ao servidor.");
        }
    });
}