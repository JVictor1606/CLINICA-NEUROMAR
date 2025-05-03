let funcionarios = JSON.parse(localStorage.getItem('funcionarios')) || [];

function listarFuncionarios() {
  const tabela = document.getElementById('tabela-funcionarios');
  tabela.innerHTML = '';
  funcionarios.forEach((func, index) => {
    tabela.innerHTML += `
      <tr>
        <td><img src="${func.foto}" alt="Foto" width="50" height="50" style="border-radius: 50%; object-fit: cover;"></td>
        <td>${func.nome}</td>
        <td>${func.email}</td>
        <td>${func.telefone}</td>
        <td>${func.departamento}</td>
        <td>${func.status}</td>
        <td><a href="${func.linkedin}" target="_blank">LinkedIn</a></td>
        <td>
          <button onclick="editarFuncionario(${index})">Editar</button>
          <button onclick="removerFuncionario(${index})">Remover</button>
        </td>
      </tr>`;
  });
}

function adicionarFuncionario(event) {
  event.preventDefault();

  const fotoInput = document.getElementById('foto');
  const reader = new FileReader();

  reader.onload = function (e) {
    const novoFuncionario = {
      nome: document.getElementById('nome').value,
      email: document.getElementById('email').value,
      telefone: document.getElementById('telefone').value,
      departamento: document.getElementById('departamento').value,
      status: document.getElementById('status').value,
      foto: e.target.result,
      linkedin: document.getElementById('linkedin').value
    };

    funcionarios.push(novoFuncionario);
    localStorage.setItem('funcionarios', JSON.stringify(funcionarios));
    listarFuncionarios();
    document.getElementById('form-funcionario').reset();
  };

  if (fotoInput.files.length > 0) {
    reader.readAsDataURL(fotoInput.files[0]);
  } else {
    alert("Por favor, selecione uma foto.");
  }
}

function removerFuncionario(index) {
  funcionarios.splice(index, 1);
  localStorage.setItem('funcionarios', JSON.stringify(funcionarios));
  listarFuncionarios();
}

function editarFuncionario(index) {
  const func = funcionarios[index];
  document.getElementById('nome').value = func.nome;
  document.getElementById('email').value = func.email;
  document.getElementById('telefone').value = func.telefone;
  document.getElementById('departamento').value = func.departamento;
  document.getElementById('status').value = func.status;
  document.getElementById('linkedin').value = func.linkedin;
  removerFuncionario(index); // remove o anterior e aguarda o novo preenchimento
}

document.getElementById('form-funcionario').addEventListener('submit', adicionarFuncionario);
window.onload = listarFuncionarios;
