document.addEventListener("DOMContentLoaded", function () {
    const botoes = document.querySelectorAll(".filtro-btn");
    const cards = document.querySelectorAll(".membro-equipe");
  
    botoes.forEach(botao => {
      botao.addEventListener("click", () => {
        const filtro = botao.getAttribute("data-filter");
  
        // Remover classe ativa dos outros botões
        botoes.forEach(b => b.classList.remove("ativo"));
        botao.classList.add("ativo");
  
        // Mostrar/ocultar cards
        cards.forEach(card => {
          const especialidade = card.getAttribute("data-categoria");
          if (filtro === "todos" || especialidade === filtro) {
            card.style.display = "block";
          } else {
            card.style.display = "none";
          }
        });
      });
    });
  });
  