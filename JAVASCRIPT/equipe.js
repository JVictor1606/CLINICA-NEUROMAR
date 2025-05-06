document.addEventListener('DOMContentLoaded', function() {
  // Carrega funcionários do localStorage
  const funcionarios = JSON.parse(localStorage.getItem('funcionarios')) || [];
  const equipeContainer = document.getElementById('equipe-container');
  const botoesFiltro = document.querySelectorAll('.filtro-btn');
  
  // Filtra apenas os que devem aparecer na equipe pública
  const equipePublica = funcionarios.filter(func => func.mostrarNaEquipe !== false);
  
  if (equipePublica.length === 0) {
      equipeContainer.innerHTML = '<p class="sem-equipe">Nenhum profissional cadastrado na equipe ainda.</p>';
      return;
  }
  
  // Cria o HTML para cada funcionário
  equipePublica.forEach(funcionario => {
      const card = document.createElement('div');
      card.className = 'profissional-card';
      card.dataset.categoria = funcionario.departamento;
      
      card.innerHTML = `
          <div class="profissional-foto-container">
              <img src="${funcionario.foto || '../imagens/placeholder.jpg'}" 
                   alt="${funcionario.nome}" class="profissional-foto">
          </div>
          
          <div class="profissional-info">
              <h2>${funcionario.nome}</h2>
              <p class="registro-profissional">${funcionario.registro}</p>
              <p class="especialidade">${funcionario.departamento}</p>
              <p class="descricao">${funcionario.descricao || 'Profissional especializado'}</p>
              
              <div class="profissional-acoes">
                  <a href="${funcionario.linkedin}" target="_blank" class="linkedin-btn">
                      <i class="fab fa-linkedin"></i> LinkedIn
                  </a>
                  <a href="../html/agendamento.html?medico=${encodeURIComponent(funcionario.nome)}&servico=${encodeURIComponent(funcionario.departamento)}" 
                     class="agendar-btn">
                      <i class="fas fa-calendar-alt"></i> Agendar Consulta
                  </a>
              </div>
          </div>
      `;
      
      equipeContainer.appendChild(card);
  });
  
  // Filtros por especialidade
  botoesFiltro.forEach(botao => {
      botao.addEventListener('click', function() {
          // Remove classe ativa de todos os botões
          botoesFiltro.forEach(b => b.classList.remove('active'));
          // Adiciona classe ativa no botão clicado
          this.classList.add('active');
          
          const filtro = this.dataset.filter;
          const cards = document.querySelectorAll('.profissional-card');
          
          cards.forEach(card => {
              if (filtro === 'todos' || card.dataset.categoria === filtro) {
                  card.style.display = 'block';
              } else {
                  card.style.display = 'none';
              }
          });
      });
  });
});