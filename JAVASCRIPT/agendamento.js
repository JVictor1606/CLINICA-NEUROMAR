import { db } from './firebase-config.js';
import { collection, getDocs, addDoc, query, where } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', async () => {
  const medicoSelect = document.getElementById('doutor');
  const servicoSelect = document.getElementById('servico');
  const dataInput = document.getElementById('data');
  const horaSelect = document.getElementById('hora');
  const form = document.getElementById('form-agendamento');

  // Configura data mínima para hoje
  const hoje = new Date();
  const dia = String(hoje.getDate()).padStart(2, '0');
  const mes = String(hoje.getMonth() + 1).padStart(2, '0');
  const ano = hoje.getFullYear();
  dataInput.min = `${ano}-${mes}-${dia}`;

  // Carrega profissionais e serviços
  const medicoServicoMap = {};
  const funcionariosSnapshot = await getDocs(collection(db, 'funcionarios'));
  const departamentos = new Set();

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

  // Lê parâmetros da URL
  const urlParams = new URLSearchParams(window.location.search);
  const medicoPreSelecionado = urlParams.get('medico');
  const servicoPreSelecionado = urlParams.get('servico');

  if (medicoPreSelecionado && medicoServicoMap[medicoPreSelecionado]) {
    medicoSelect.value = medicoPreSelecionado;
    servicoSelect.value = medicoServicoMap[medicoPreSelecionado] || servicoPreSelecionado || '';
    await atualizarHorarios(); // Atualiza horários imediatamente
  }

  // Atualiza serviço com base no profissional selecionado
  medicoSelect.addEventListener('change', () => {
    const medicoSelecionado = medicoSelect.value;
    servicoSelect.value = medicoServicoMap[medicoSelecionado] || '';
    atualizarHorarios();
  });

  // Atualiza horários disponíveis com base na data e profissional
  dataInput.addEventListener('change', atualizarHorarios);
  medicoSelect.addEventListener('change', atualizarHorarios);

  async function atualizarHorarios() {
    horaSelect.innerHTML = '<option value="">Selecione um horário</option>';
    const data = dataInput.value;
    const profissional = medicoSelect.value;

    if (!data || !profissional) return;

    // Horários fixos (8:00 às 17:00, intervalos de 1 hora)
    const horarios = [
      '08:00', '09:00', '10:00', '11:00', '12:00',
      '13:00', '14:00', '15:00', '16:00', '17:00'
    ];

    // Verifica horários ocupados
    const q = query(
      collection(db, 'horariosDisponiveis'),
      where('profissional', '==', profissional),
      where('data', '==', data),
      where('status', '==', 'ocupado')
    );
    const ocupadosSnapshot = await getDocs(q);
    const ocupados = new Set(ocupadosSnapshot.docs.map(doc => doc.data().hora));

    // Adiciona horários livres ao select
    horarios.forEach(hora => {
      if (!ocupados.has(hora)) {
        const option = document.createElement('option');
        option.value = hora;
        option.textContent = hora;
        horaSelect.appendChild(option);
      }
    });
  }

  // Gera arquivo ICS
  function gerarICS({ usuarioNome, profissional, servico, data, hora }) {
    const [ano, mes, dia] = data.split('-');
    const [horaInicio, minutoInicio] = hora.split(':');
    const dataInicio = new Date(ano, mes - 1, dia, horaInicio, minutoInicio);
    const dataFim = new Date(dataInicio.getTime() + 60 * 60 * 1000); // 1 hora depois

    const formatarDataICS = (date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//NEUROMAR//Agendamento//PT',
      'BEGIN:VEVENT',
      `UID:${Date.now()}@neuromar.com.br`,
      `DTSTAMP:${formatarDataICS(new Date())}`,
      `DTSTART:${formatarDataICS(dataInicio)}`,
      `DTEND:${formatarDataICS(dataFim)}`,
      `SUMMARY:Consulta com ${profissional} - ${servico}`,
      `DESCRIPTION:Agendamento na NEUROMAR com ${profissional} para ${servico}. Cliente: ${usuarioNome}.`,
      'LOCATION:Clínica NEUROMAR - Colares Moreira, UNDB, São Luís - MA',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'agendamento-neuromar.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Envia o agendamento
  form.addEventListener('submit', async e => {
    e.preventDefault();

    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const profissional = medicoSelect.value;
    const servico = servicoSelect.value;
    const data = dataInput.value;
    const hora = horaSelect.value;

    if (!nome || !email || !profissional || !servico || !data || !hora) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    try {
      // Verifica se o horário ainda está disponível
      const q = query(
        collection(db, 'horariosDisponiveis'),
        where('profissional', '==', profissional),
        where('data', '==', data),
        where('hora', '==', hora),
        where('status', '==', 'ocupado')
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        alert('Este horário já foi agendado. Por favor, escolha outro.');
        await atualizarHorarios();
        return;
      }

      // Cria o agendamento no Firestore
      await addDoc(collection(db, 'agendamentos'), {
        usuarioNome: nome,
        usuarioEmail: email,
        profissional,
        servico,
        data,
        hora,
        status: 'pendente',
        criadoEm: new Date()
      });

      // Marca o horário como ocupado
      await addDoc(collection(db, 'horariosDisponiveis'), {
        profissional,
        data,
        hora,
        status: 'ocupado'
      });

      // Envia e-mails de confirmação
      const response = await fetch('http://localhost:3000/enviar-email-agendamento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuarioNome: nome,
          usuarioEmail: email,
          profissional,
          servico,
          data,
          hora
        })
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error);
      }

      // Gera e baixa o arquivo ICS
      gerarICS({ usuarioNome: nome, profissional, servico, data, hora });

      alert('Agendamento realizado com sucesso! Você receberá um e-mail de confirmação e um arquivo para adicionar à sua agenda.');
      form.reset();
      horaSelect.innerHTML = '<option value="">Selecione um horário</option>';
      await atualizarHorarios();
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      alert(`Erro ao criar agendamento: ${error.message}`);
    }
  });
});