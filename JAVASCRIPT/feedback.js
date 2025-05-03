let notaSelecionada = 0;

document.querySelectorAll('.estrela').forEach(estrela => {
  estrela.addEventListener('click', () => {
    notaSelecionada = parseInt(estrela.dataset.valor);
    document.querySelectorAll('.estrela').forEach(e => e.classList.remove('selecionada'));
    for (let i = 0; i < notaSelecionada; i++) {
      document.querySelectorAll('.estrela')[i].classList.add('selecionada');
    }
  });
});

document.getElementById('feedback-form').addEventListener('submit', function(e) {
  e.preventDefault();
  
  const nome = document.getElementById('nome').value;
  const email = document.getElementById('email').value;
  const comentario = document.getElementById('comentario').value;

  if (!comentario.trim()) {
    alert("Por favor, escreva um comentário.");
    return;
  }

  const feedback = {
    nome,
    email,
    nota: notaSelecionada,
    comentario,
    data: new Date().toLocaleString()
  };

  // Armazena no localStorage
  const feedbacks = JSON.parse(localStorage.getItem('feedbacks')) || [];
  feedbacks.push(feedback);
  localStorage.setItem('feedbacks', JSON.stringify(feedbacks));

  // Mensagem de sucesso
  document.getElementById('mensagem').style.display = 'block';
  this.reset();
  notaSelecionada = 0;
  document.querySelectorAll('.estrela').forEach(e => e.classList.remove('selecionada'));
});
