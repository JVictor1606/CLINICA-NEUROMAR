import { db } from './firebase-config.js';
import { collection, getDocs, doc, deleteDoc, updateDoc, query, where, addDoc } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Evento DOMContentLoaded disparado. Iniciando carregamento de agendamentos...');
  const tabela = document.getElementById('tabela-agendamentos')?.querySelector('tbody');
  const modalEditar = document.getElementById('modal-editar');
  const formEditar = document.getElementById('form-editar-agendamento');
  const cancelarEditar = document.getElementById('cancelar-editar');
  const medicoSelect = document.getElementById('edit-doutor');
  const servicoSelect = document.getElementById('edit-servico');
  const dataInput = document.getElementById('edit-data');
  const horaSelect = document.getElementById('edit-hora');

  if (!tabela) {
    console.error('Elemento <tbody> da tabela não encontrado.');
    return;
  }

  if (!modalEditar || !formEditar || !cancelarEditar || !medicoSelect || !servicoSelect || !dataInput || !horaSelect) {
    console.error('Elementos do modal de edição não encontrados.');
    return;
  }

  // Configura data mínima para hoje
  const hoje = new Date();
  dataInput.min = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-${String(hoje.getDate()).padStart(2, '0')}`;

  // Carrega profissionais e serviços
  const medicoServicoMap = {};
  const departamentos = new Set();
  try {
    const funcionariosSnapshot = await getDocs(collection(db, 'funcionarios'));
    console.log('Funcionários carregados:', funcionariosSnapshot.size);
    medicoSelect.innerHTML = '<option value="">Selecione um profissional</option>';
    servicoSelect.innerHTML = '<option value="">Selecione um serviço</option>';

    funcionariosSnapshot.forEach(doc => {
      const dados = doc.data();
      const option = document.createElement('option');
      option.value = dados.nome;
      option.textContent = dados.nome;
      medicoSelect.appendChild(option);

      medicoServicoMap[dados.nome] = dados.departamento;
      departamentos.add(dados.departamento);
    });

    departamentos.forEach(depto => {
      const servOption = document.createElement('option');
      servOption.value = depto;
      servOption.textContent = depto;
      servicoSelect.appendChild(servOption);
    });
  } catch (error) {
    console.error('Erro ao carregar funcionários:', error);
    alert('Erro ao carregar profissionais: ' + error.message);
  }

  // Atualiza serviço com base no profissional selecionado
  medicoSelect.addEventListener('change', () => {
    const medicoSelecionado = medicoSelect.value;
    servicoSelect.value = medicoServicoMap[medicoSelecionado] || '';
    atualizarHorariosEditar();
  });

  // Atualiza horários disponíveis com base na data e profissional
  dataInput.addEventListener('change', atualizarHorariosEditar);
  medicoSelect.addEventListener('change', atualizarHorariosEditar);

  async function atualizarHorariosEditar(agendamentoId = null, horarioAtual = null) {
    horaSelect.innerHTML = '<option value="">Selecione um horário</option>';
    const data = dataInput.value;
    const profissional = medicoSelect.value;

    if (!data || !profissional) {
      console.log('Dados insuficientes para atualizar horários:', { data, profissional });
      return;
    }

    const horarios = [
      '08:00', '09:00', '10:00', '11:00', '12:00',
      '13:00', '14:00', '15:00', '16:00', '17:00'
    ];

    try {
      console.log(`Consultando horários ocupados para Profissional=${profissional}, Data=${data}`);
      const q = query(
        collection(db, 'horariosDisponiveis'),
        where('profissional', '==', profissional),
        where('data', '==', data),
        where('status', '==', 'ocupado')
      );
      const ocupadosSnapshot = await getDocs(q);
      const ocupados = new Set(ocupadosSnapshot.docs.map(doc => doc.data().hora));
      console.log('Horários ocupados:', Array.from(ocupados));

      // Adiciona horários disponíveis
      horarios.forEach(hora => {
        // Inclui o horário atual do agendamento sendo editado, mesmo que esteja ocupado
        if (!ocupados.has(hora) || (horarioAtual === hora && agendamentoId)) {
          const option = document.createElement('option');
          option.value = hora;
          option.textContent = hora;
          horaSelect.appendChild(option);
        }
      });

      // Seleciona o horário atual, se fornecido
      if (horarioAtual) {
        horaSelect.value = horarioAtual;
        console.log(`Horário atual selecionado: ${horarioAtual}`);
      }
    } catch (error) {
      console.error('Erro ao carregar horários ocupados:', error);
      alert('Erro ao carregar horários: ' + error.message);
    }
  }

  async function carregarAgendamentos() {
    try {
      console.log('Consultando coleção "agendamentos" no Firestore...');
      if (!db) {
        throw new Error('Firestore db não está inicializado. Verifique firebase-config.js.');
      }
      const snapshot = await getDocs(collection(db, 'agendamentos'));
      console.log(`Consulta retornou ${snapshot.size} agendamentos.`);

      tabela.innerHTML = '';

      if (snapshot.empty) {
        console.log('Nenhum agendamento encontrado na coleção "agendamentos".');
        tabela.innerHTML = '<tr><td colspan="8" class="empty-table">Nenhum agendamento encontrado.</td></tr>';
        return [];
      }

      const agendamentos = [];
      snapshot.forEach(doc => {
        const dados = doc.data();
        console.log('Agendamento encontrado:', { id: doc.id, ...dados });
        agendamentos.push({ id: doc.id, ...dados });
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${dados.usuarioNome || 'N/A'}</td>
          <td>${dados.usuarioEmail || 'N/A'}</td>
          <td>${dados.profissional || 'N/A'}</td>
          <td>${dados.servico || 'N/A'}</td>
          <td>${dados.data || 'N/A'}</td>
          <td>${dados.hora || 'N/A'}</td>
          <td>${dados.status || 'N/A'}</td>
          <td class="acoes">
            <button class="btn-editar" data-id="${doc.id}" data-nome="${dados.usuarioNome || ''}" data-email="${dados.usuarioEmail || ''}" 
                    data-profissional="${dados.profissional || ''}" data-servico="${dados.servico || ''}" data-data="${dados.data || ''}" 
                    data-hora="${dados.hora || ''}" data-status="${dados.status || 'pendente'}">Editar</button>
            <button class="btn-apagar" data-id="${doc.id}" data-profissional="${dados.profissional || ''}" 
                    data-data="${dados.data || ''}" data-hora="${dados.hora || ''}">Apagar</button>
          </td>
        `;
        tabela.appendChild(tr);
      });

      // Adiciona eventos aos botões de apagar
      document.querySelectorAll('.btn-apagar').forEach(button => {
        button.addEventListener('click', async (e) => {
          const id = e.target.dataset.id;
          const profissional = e.target.dataset.profissional;
          const data = e.target.dataset.data;
          const hora = e.target.dataset.hora;

          if (confirm('Tem certeza que deseja apagar este agendamento?')) {
            try {
              console.log(`Apagando agendamento ID: ${id}`);
              await deleteDoc(doc(db, 'agendamentos', id));

              console.log(`Liberando horário: Profissional=${profissional}, Data=${data}, Hora=${hora}`);
              const q = query(
                collection(db, 'horariosDisponiveis'),
                where('profissional', '==', profissional),
                where('data', '==', data),
                where('hora', '==', hora),
                where('status', '==', 'ocupado')
              );
              const snapshot = await getDocs(q);
              snapshot.forEach(async (docSnapshot) => {
                console.log(`Removendo horário ID: ${docSnapshot.id}`);
                await deleteDoc(doc(db, 'horariosDisponiveis', docSnapshot.id));
              });

              alert('Agendamento apagado com sucesso!');
              await carregarAgendamentos();
            } catch (error) {
              console.error('Erro ao apagar agendamento:', error);
              alert(`Erro ao apagar agendamento: ${error.message}`);
            }
          }
        });
      });

      // Adiciona eventos aos botões de editar
      document.querySelectorAll('.btn-editar').forEach(button => {
        button.addEventListener('click', async (e) => {
          const id = e.target.dataset.id;
          const nome = e.target.dataset.nome;
          const email = e.target.dataset.email;
          const profissional = e.target.dataset.profissional;
          const servico = e.target.dataset.servico;
          const data = e.target.dataset.data;
          const hora = e.target.dataset.hora;
          const status = e.target.dataset.status;

          console.log('Abrindo modal de edição para agendamento:', { id, nome, email, profissional, servico, data, hora, status });

          // Preenche o formulário do modal
          document.getElementById('edit-nome').value = nome;
          document.getElementById('edit-email').value = email;
          document.getElementById('edit-doutor').value = profissional;
          document.getElementById('edit-servico').value = servico;
          document.getElementById('edit-data').value = data;
          document.getElementById('edit-status').value = status;

          // Abre o modal
          modalEditar.style.display = 'flex';

          // Atualiza os horários disponíveis, incluindo o horário atual
          await atualizarHorariosEditar(id, hora);

          // Configura o envio do formulário
          formEditar.onsubmit = async (event) => {
            event.preventDefault();
            const novoNome = document.getElementById('edit-nome').value.trim();
            const novoEmail = document.getElementById('edit-email').value.trim();
            const novoProfissional = document.getElementById('edit-doutor').value;
            const novoServico = document.getElementById('edit-servico').value;
            const novaData = document.getElementById('edit-data').value;
            const novaHora = document.getElementById('edit-hora').value;
            const novoStatus = document.getElementById('edit-status').value;

            if (!novoNome || !novoEmail || !novoProfissional || !novoServico || !novaData || !novaHora || !novoStatus) {
              alert('Por favor, preencha todos os campos.');
              return;
            }

            try {
              // Verifica se o novo horário está disponível (exceto se for o mesmo agendamento)
              if (novoProfissional !== profissional || novaData !== data || novaHora !== hora) {
                const q = query(
                  collection(db, 'horariosDisponiveis'),
                  where('profissional', '==', novoProfissional),
                  where('data', '==', novaData),
                  where('hora', '==', novaHora),
                  where('status', '==', 'ocupado')
                );
                const snapshot = await getDocs(q);
                if (!snapshot.empty) {
                  alert('Este horário já está ocupado. Escolha outro.');
                  return;
                }
              }

              // Atualiza o agendamento
              await updateDoc(doc(db, 'agendamentos', id), {
                usuarioNome: novoNome,
                usuarioEmail: novoEmail,
                profissional: novoProfissional,
                servico: novoServico,
                data: novaData,
                hora: novaHora,
                status: novoStatus,
                atualizadoEm: new Date()
              });

              // Atualiza o horário no horariosDisponiveis
              if (novoProfissional !== profissional || novaData !== data || novaHora !== hora) {
                // Remove o horário antigo
                const qAntigo = query(
                  collection(db, 'horariosDisponiveis'),
                  where('profissional', '==', profissional),
                  where('data', '==', data),
                  where('hora', '==', hora),
                  where('status', '==', 'ocupado')
                );
                const snapshotAntigo = await getDocs(qAntigo);
                snapshotAntigo.forEach(async (docSnapshot) => {
                  await deleteDoc(doc(db, 'horariosDisponiveis', docSnapshot.id));
                });

                // Adiciona o novo horário
                await addDoc(collection(db, 'horariosDisponiveis'), {
                  profissional: novoProfissional,
                  data: novaData,
                  hora: novaHora,
                  status: 'ocupado'
                });
              }

              alert('Agendamento atualizado com sucesso!');
              modalEditar.style.display = 'none';
              await carregarAgendamentos();
            } catch (error) {
              console.error('Erro ao atualizar agendamento:', error);
              alert(`Erro ao atualizar agendamento: ${error.message}`);
            }
          };
        });
      });

      return agendamentos;
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      tabela.innerHTML = '<tr><td colspan="8" class="empty-table">Erro ao carregar agendamentos: ' + error.message + '</td></tr>';
      return [];
    }
  }

  // Fecha o modal ao clicar em "Cancelar"
  cancelarEditar.addEventListener('click', () => {
    modalEditar.style.display = 'none';
  });

  await carregarAgendamentos();
});