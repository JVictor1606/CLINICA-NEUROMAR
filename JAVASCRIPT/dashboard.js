const ctxAg = document.getElementById('grafico-agendamentos').getContext('2d');
new Chart(ctxAg, {
  type: 'bar',
  data: {
    labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'],
    datasets: [{
      label: 'Agendamentos',
      data: [5, 10, 8, 6, 7],
      backgroundColor: 'rgba(54, 162, 235, 0.6)'
    }]
  }
});

const ctxAt = document.getElementById('grafico-atendimentos').getContext('2d');
new Chart(ctxAt, {
  type: 'line',
  data: {
    labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai'],
    datasets: [{
      label: 'Atendimentos',
      data: [20, 25, 22, 30, 28],
      borderColor: 'rgba(75, 192, 192, 1)',
      fill: false
    }]
  }
});
