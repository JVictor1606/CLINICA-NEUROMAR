import { db, storage} from './firebase-config.js';
import { collection, addDoc,getDocs,deleteDoc, doc, setDoc, getDoc   } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";


document.getElementById('form-funcionario').addEventListener('submit', async (e) => {
    e.preventDefault();

    const idEditando = document.getElementById('form-funcionario').getAttribute('data-editando-id');

    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const telefone = document.getElementById('telefone').value;
    const departamento = document.getElementById('departamento').value;
    const status = document.getElementById('status').value;
    const linkedin = document.getElementById('linkedin').value;
    const registro = document.getElementById('registro').value;
    const descricao = document.getElementById('descricao').value;
    const mostrarEquipe = document.getElementById('mostrar-equipe').checked;
    const fotoInput = document.getElementById('foto');
    let fotoURL = "";

    try {
        if (fotoInput.files.length > 0) {
            const file = fotoInput.files[0];
            const storageRef = ref(storage, `fotos/${Date.now()}_${file.name}`);
            await uploadBytes(storageRef, file);
            fotoURL = await getDownloadURL(storageRef);
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
            fotoURL,
            criadoEm: new Date()
        };

        if (idEditando) {
            await setDoc(doc(db, "funcionarios", idEditando), dadosFuncionario);
            alert("Funcionário atualizado com sucesso!");
            document.getElementById('form-funcionario').removeAttribute('data-editando-id');
            document.querySelector('.btn-salvar').textContent = 'Salvar';
        } else {
            await addDoc(collection(db, "funcionarios"), dadosFuncionario);
            alert("Funcionário cadastrado com sucesso!");
        }

        document.getElementById('form-funcionario').reset();
        carregarFuncionarios();
    } catch (error) {
        console.error("Erro ao salvar funcionário:", error);
        alert("Erro ao salvar funcionário.");
    }
});



async function carregarFuncionarios() {
    const tabela = document.getElementById('tabela-funcionarios');
    tabela.innerHTML = "";

    const querySnapshot = await getDocs(collection(db, "funcionarios"));
    querySnapshot.forEach((doc) => {
        const dados = doc.data();
        const tr = document.createElement('tr');

        tr.innerHTML = `
            <td><img src="${dados.fotoURL || '../imagens/placeholder.jpg'}" width="50" height="50" /></td>
            <td>${dados.nome}</td>
            <td>${dados.email}</td>
            <td>${dados.telefone}</td>
            <td>${dados.departamento}</td>
            <td>${dados.status}</td>
            <td><a href="${dados.linkedin}" target="_blank">LinkedIn</a></td>
            <td>
                <button class="btn-editar" onclick="editarFuncionario('${doc.id}')">Editar</button>
                <button class="btn-remover" onclick="removerFuncionario('${doc.id}')">Excluir</button>
            </td>
        `;

        tabela.appendChild(tr);
    });
}
async function removerFuncionario(id) {
    if (confirm("Tem certeza que deseja excluir este funcionário?")) {
        try {
            await deleteDoc(doc(db, "funcionarios", id));
            alert("Funcionário excluído com sucesso!");
            carregarFuncionarios(); 
        } catch (error) {
            console.error("Erro ao excluir funcionário:", error);
            alert("Erro ao excluir funcionário.");
        }
    }
}

async function editarFuncionario(id) {
    const docRef = doc(db, "funcionarios", id);
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

        // Armazena o ID do documento sendo editado
        document.getElementById('form-funcionario').setAttribute('data-editando-id', id);

        // Muda botão para "Atualizar"
        document.querySelector('.btn-salvar').textContent = 'Atualizar';
    }
}
carregarFuncionarios();

document.getElementById('foto').addEventListener('change', function () {
    const file = this.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById('foto-preview').src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
});

window.editarFuncionario = editarFuncionario;
window.removerFuncionario = removerFuncionario;