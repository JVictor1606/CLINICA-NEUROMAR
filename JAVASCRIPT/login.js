document.getElementById('form-login').addEventListener('submit', function(e) {
    e.preventDefault();
  
    const matricula = document.getElementById('matricula').value.trim();
    const senha = document.getElementById('senha').value.trim();
  
    const matriculaValida = "002-025573";
    const senhaValida = "teste123";
  
    if (matricula === matriculaValida && senha === senhaValida) {
      // Redireciona para a página inicial administrativa
      window.location.href = "../html/admarea.html";  // ou outro destino como "admin.html"
    } else {
      const erro = document.getElementById('erro');
      erro.textContent = "Matrícula ou senha incorretos.";
      erro.style.color = "red";
    }
  });

