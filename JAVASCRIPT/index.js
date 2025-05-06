document.getElementById('faleconosco').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  const form = e.target;
  const submitBtn = form.querySelector('button[type="submit"]');
  const feedbackDiv = document.getElementById('form-feedback');
  
  // Desativa o botão e mostra estado de carregamento
  submitBtn.disabled = true;
  submitBtn.textContent = 'Enviando...';
  feedbackDiv.textContent = '';
  feedbackDiv.className = '';
  
  try {
      const formData = new FormData(form);
      
      const response = await fetch('/enviar-email', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
          feedbackDiv.textContent = data.message;
          feedbackDiv.className = 'success';
          form.reset();
          
          // Recarrega o reCAPTCHA
          if (typeof grecaptcha !== 'undefined') {
              grecaptcha.reset();
          }
      } else {
          feedbackDiv.textContent = data.error || 'Erro ao enviar mensagem';
          feedbackDiv.className = 'error';
      }
  } catch (error) {
      console.error('Erro:', error);
      feedbackDiv.textContent = 'Erro de conexão. Tente novamente mais tarde.';
      feedbackDiv.className = 'error';
  } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Enviar email';
  }
});