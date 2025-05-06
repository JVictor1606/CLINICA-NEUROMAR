document.addEventListener('DOMContentLoaded', function() {
  // Inicialização
  const form = document.getElementById('form-funcionario');
  const fotoInput = document.getElementById('foto');
  const fotoPreview = document.getElementById('foto-preview');
  const tabela = document.getElementById('tabela-funcionarios');
  
  let funcionarios = JSON.parse(localStorage.getItem('funcionarios')) || [];
  let editandoIndex = null;

  // Carregar dados iniciais
  carregarTabela();

  // Configurar preview da foto
  fotoInput.addEventListener('change', function(e) {
      if (e.target.files.length > 0) {
          const reader = new FileReader();
          reader.onload = function(event) {
              fotoPreview.src = event.target.result;
          };
          reader.readAsDataURL(e.target.files[0]);
      }
  });

  // Submit do formulário
  form.addEventListener('submit', function(e) {
      e.preventDefault();
      salvarFuncionario();
  });

  // Função para salvar funcionário
  function salvarFuncionario() {
      // Validar campos obrigatórios
      const camposObrigatorios = ['nome', 'email', 'telefone', 'departamento', 'status', 'registro'];
      for (const campoId of camposObrigatorios) {
          const campo = document.getElementById(campoId);
          if (!campo.value.trim()) {
              alert(`Por favor, preencha o campo ${campo.placeholder || campoId}`);
              campo.focus();
              return;
          }
      }

      // Criar objeto funcionário
      const funcionario = {
          nome: document.getElementById('nome').value,
          email: document.getElementById('email').value,
          telefone: document.getElementById('telefone').value,
          departamento: document.getElementById('departamento').value,
          status: document.getElementById('status').value,
          linkedin: document.getElementById('linkedin').value,
          registro: document.getElementById('registro').value,
          descricao: document.getElementById('descricao').value,
          foto: fotoPreview.src,
          mostrarNaEquipe: document.getElementById('mostrar-equipe').checked
      };

      // Salvar ou atualizar
      if (editandoIndex !== null) {
          funcionarios[editandoIndex] = funcionario;
      } else {
          funcionarios.push(funcionario);
      }

      // Atualizar localStorage
      localStorage.setItem('funcionarios', JSON.stringify(funcionarios));
      
      // Resetar formulário
      form.reset();
      fotoPreview.src = '../imagens/placeholder.jpg';
      editandoIndex = null;
      
      // Recarregar tabela
      carregarTabela();
      
      alert('Funcionário salvo com sucesso!');
  }

  // Função para carregar dados na tabela
  function carregarTabela() {
      tabela.innerHTML = '';
      
      if (funcionarios.length === 0) {
          tabela.innerHTML = `
              <tr>
                  <td colspan="8" class="empty-table">Nenhum funcionário cadastrado</td>
              </tr>`;
          return;
      }

      funcionarios.forEach((func, index) => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
              <td><img src="${func.foto || '../imagens/placeholder.jpg'}" class="foto-funcionario"></td>
              <td>${func.nome}</td>
              <td>${func.email}</td>
              <td>${func.telefone}</td>
              <td>${func.departamento}</td>
              <td>${func.status}</td>
              <td><a href="${func.linkedin}" target="_blank" class="linkedin-link">LinkedIn</a></td>
              <td class="acoes">
                  <button onclick="editarFuncionario(${index})" class="btn-editar">Editar</button>
                  <button onclick="removerFuncionario(${index})" class="btn-remover">Remover</button>
              </td>
          `;
          tabela.appendChild(tr);
      });
  }

  // Funções globais para edição/remoção
  window.editarFuncionario = function(index) {
      const func = funcionarios[index];
      
      // Preencher formulário
      document.getElementById('nome').value = func.nome;
      document.getElementById('email').value = func.email;
      document.getElementById('telefone').value = func.telefone;
      document.getElementById('departamento').value = func.departamento;
      document.getElementById('status').value = func.status;
      document.getElementById('linkedin').value = func.linkedin;
      document.getElementById('registro').value = func.registro;
      document.getElementById('descricao').value = func.descricao || '';
      document.getElementById('mostrar-equipe').checked = func.mostrarNaEquipe !== false;
      
      // Foto
      fotoPreview.src = func.foto || '../imagens/placeholder.jpg';
      
      // Marcar como editando
      editandoIndex = index;
      
      // Scroll para o topo
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  window.removerFuncionario = function(index) {
      if (confirm('Tem certeza que deseja remover este funcionário?')) {
          funcionarios.splice(index, 1);
          localStorage.setItem('funcionarios', JSON.stringify(funcionarios));
          carregarTabela();
          
          if (editandoIndex === index) {
              form.reset();
              fotoPreview.src = '../imagens/placeholder.jpg';
              editandoIndex = null;
          }
      }
  };
});