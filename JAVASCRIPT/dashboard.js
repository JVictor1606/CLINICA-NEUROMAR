import { db } from './firebase-config.js';
import { collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Função para carregar agendamentos
  async function carregarAgendamentos() {
    try {
      const snapshot = await getDocs(collection(db, 'agendamentos'));
      const agendamentos = [];
      snapshot.forEach(doc => {
        agendamentos.push({ id: doc.id, ...doc.data() });
      });
      return agendamentos;
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      return [];
    }
  }

  // Função para atualizar gráficos
  async function atualizarGraficos() {
    const agendamentos = await carregarAgendamentos();

    // Contagem de agendamentos por dia da semana
    const diasSemana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];
    const contagemDias = [0, 0, 0, 0, 0];

    agendamentos.forEach(agendamento => {
      const data = new Date(agendamento.data);
      const diaSemana = data.getDay(); // 0 (Domingo) a 6 (Sábado)
      if (diaSemana >= 1 && diaSemana <= 5) { // Considera apenas Seg-Sex
        contagemDias[diaSemana - 1]++;
      }
    });

    // Gráfico de agendamentos por dia
    const ctxAg = document.getElementById('grafico-agendamentos').getContext('2d');
    new Chart(ctxAg, {
      type: 'bar',
      data: {
        labels: diasSemana,
        datasets: [{
          label: 'Agendamentos',
          data: contagemDias,
          backgroundColor: 'rgba(54, 162, 235, 0.6)'
        }]
      },
      options: {
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } }
        }
      }
    });

    // Contagem de atendimentos por mês
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai'];
    const contagemMeses = [0, 0, 0, 0, 0];

    agendamentos.forEach(agendamento => {
      const data = new Date(agendamento.data);
      const mes = data.getMonth(); // 0 (Jan) a 11 (Dez)
      if (mes >= 0 && mes <= 4) { // Considera apenas Jan-Mai
        contagemMeses[mes]++;
      }
    });

    // Gráfico de atendimentos por mês
    const ctxAt = document.getElementById('grafico-atendimentos').getContext('2d');
    new Chart(ctxAt, {
      type: 'line',
      data: {
        labels: meses,
        datasets: [{
          label: 'Atendimentos',
          data: contagemMeses,
          borderColor: 'rgba(75, 192, 192, 1)',
          fill: false
        }]
      },
      options: {
        scales: {
          y: { beginAtZero: true, ticks: { stepSize: 1 } }
        }
      }
    });
  }

  // Inicializa a página
  await atualizarGraficos();
});