document.getElementById('faleconosco').addEventListener('submit', function(event) {
    event.preventDefault();
  
    const email = document.getElementById('email').value.trim();
    const assunto = document.getElementById('assunto').value.trim();
    const mensagem = document.getElementById('mensagem').value.trim();
  
    fetch('http://localhost:3000/enviar-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, assunto, mensagem })
    })
    .then(response => response.text())
    .then(data => {
      alert(data);
      document.getElementById('faleconosco').reset();
    })
    .catch(error => {
      console.error('Erro:', error);
      alert('Erro ao enviar. 😞');
    });
  });
  