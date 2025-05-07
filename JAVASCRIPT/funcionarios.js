import { db } from './firebase-config.js';
import { collection, addDoc, getDocs, deleteDoc, doc, setDoc, getDoc } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// Handle form submission
document.getElementById('form-funcionario').addEventListener('submit', async (e) => {
  e.preventDefault();

  const idEditando = document.getElementById('form-funcionario').getAttribute('data-editando-id');

  const nome = document.getElementById('nome').value.trim();
  const email = document.getElementById('email').value.trim();
  const telefone = document.getElementById('telefone').value.trim();
  const departamento = document.getElementById('departamento').value;
  const status = document.getElementById('status').value;
  const linkedin = document.getElementById('linkedin').value.trim();
  const registro = document.getElementById('registro').value.trim();
  const descricao = document.getElementById('descricao').value.trim();
  const mostrarEquipe = document.getElementById('mostrar-equipe').checked;
  const fotoInput = document.getElementById('foto');
  let fotoBase64 = idEditando ? (await getDoc(doc(db, 'funcionarios', idEditando))).data().fotoBase64 || '' : '';

  try {
    // Validate inputs
    if (!nome || !email || !telefone || !departamento || !status || !linkedin || !registro || !descricao) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Handle image upload
    if (fotoInput.files.length > 0) {
      const file = fotoInput.files[0];

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!validTypes.includes(file.type)) {
        alert('Por favor, selecione uma imagem válida (JPEG, PNG ou GIF).');
        return;
      }

      // Compress and convert to base64
      fotoBase64 = await compressAndConvertToBase64(file);
      // Check size (Firestore document size limit is 1MB)
      if (fotoBase64.length > 700000) { // Approx 700KB to stay under 1MB with other fields
        alert('A imagem é muito grande. Por favor, selecione uma imagem menor ou mais comprimida.');
        return;
      }
    } else if (!idEditando && !fotoBase64) {
      // Use empty string if no image is provided for new employees
      fotoBase64 = '';
    }

    const dadosFuncionario = {
      nome,
      email,
      telefone,
      departamento,
      status,
      linkedin,
      registro,
      descricao,
      mostrarEquipe,
      fotoBase64, // Store base64 string
      criadoEm: new Date(),
      atualizadoEm: new Date()
    };

    if (idEditando) {
      await setDoc(doc(db, 'funcionarios', idEditando), dadosFuncionario);
      alert('Funcionário atualizado com sucesso!');
      document.getElementById('form-funcionario').removeAttribute('data-editando-id');
      document.querySelector('.btn-salvar').textContent = 'Salvar';
    } else {
      await addDoc(collection(db, 'funcionarios'), dadosFuncionario);
      alert('Funcionário cadastrado com sucesso!');
    }

    document.getElementById('form-funcionario').reset();
    document.getElementById('foto-preview').src = '/imagens/placeholder.jpg';
    await carregarFuncionarios();
  } catch (error) {
    console.error('Erro ao salvar funcionário:', error);
    alert(`Erro ao salvar funcionário: ${error.message}`);
  }
});

// Compress image and convert to base64
async function compressAndConvertToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const maxDimension = 800; // Max width or height
        let width = img.width;
        let height = img.height;

        // Resize image
        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to base64 with compression (quality 0.7)
        const base64 = canvas.toDataURL(file.type, 0.7);
        resolve(base64);
      };
      img.onerror = () => reject(new Error('Erro ao carregar a imagem.'));
    };
    reader.onerror = () => reject(new Error('Erro ao ler o arquivo.'));
    reader.readAsDataURL(file);
  });
}

// Load employees
async function carregarFuncionarios() {
  const tabela = document.getElementById('tabela-funcionarios');
  tabela.innerHTML = '';

  try {
    const querySnapshot = await getDocs(collection(db, 'funcionarios'));
    if (querySnapshot.empty) {
      tabela.innerHTML = '<tr><td colspan="8" style="text-align: center;">Nenhum funcionário cadastrado.</td></tr>';
      return;
    }

    querySnapshot.forEach((doc) => {
      const dados = doc.data();
      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td>
          <img src="${dados.fotoBase64 || '/imagens/placeholder.jpg'}" 
               alt="Foto de ${dados.nome}" 
               width="50" 
               height="50" 
               style="object-fit: cover; border-radius: 50%;" 
               onerror="this.src='/imagens/placeholder.jpg'" />
        </td>
        <td>${dados.nome}</td>
        <td>${dados.email}</td>
        <td>${dados.telefone}</td>
        <td>${dados.departamento}</td>
        <td>${dados.status}</td>
        <td><a href="${dados.linkedin}" target="_blank" rel="noopener noreferrer">LinkedIn</a></td>
        <td>
          <button class="btn-editar" onclick="editarFuncionario('${doc.id}')">Editar</button>
          <button class="btn-remover" onclick="removerFuncionario('${doc.id}')">Excluir</button>
        </td>
      `;

      tabela.appendChild(tr);
    });
  } catch (error) {
    console.error('Erro ao carregar funcionários:', error);
    tabela.innerHTML = '<tr><td colspan="8" style="text-align: center;">Erro ao carregar funcionários.</td></tr>';
  }
}

// Delete employee
async function removerFuncionario(id) {
  if (confirm('Tem certeza que deseja excluir este funcionário?')) {
    try {
      await deleteDoc(doc(db, 'funcionarios', id));
      alert('Funcionário excluído com sucesso!');
      await carregarFuncionarios();
    } catch (error) {
      console.error('Erro ao excluir funcionário:', error);
      alert(`Erro ao excluir funcionário: ${error.message}`);
    }
  }
}

// Edit employee
async function editarFuncionario(id) {
  try {
    const docRef = doc(db, 'funcionarios', id);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
      const dados = snapshot.data();

      document.getElementById('nome').value = dados.nome;
      document.getElementById('email').value = dados.email;
      document.getElementById('telefone').value = dados.telefone;
      document.getElementById('departamento').value = dados.departamento;
      document.getElementById('status').value = dados.status;
      document.getElementById('linkedin').value = dados.linkedin;
      document.getElementById('registro').value = dados.registro;
      document.getElementById('descricao').value = dados.descricao;
      document.getElementById('mostrar-equipe').checked = dados.mostrarEquipe;
      document.getElementById('foto-preview').src = dados.fotoBase64 || '/imagens/placeholder.jpg';

      document.getElementById('form-funcionario').setAttribute('data-editando-id', id);
      document.querySelector('.btn-salvar').textContent = 'Atualizar';
    } else {
      alert('Funcionário não encontrado.');
    }
  } catch (error) {
    console.error('Erro ao carregar funcionário para edição:', error);
    alert(`Erro ao carregar funcionário: ${error.message}`);
  }
}

// Image preview
document.getElementById('foto').addEventListener('change', function () {
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      document.getElementById('foto-preview').src = e.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    document.getElementById('foto-preview').src = '/imagens/placeholder.jpg';
  }
});

// Expose functions globally
window.editarFuncionario = editarFuncionario;
window.removerFuncionario = removerFuncionario;

// Initial load
carregarFuncionarios();