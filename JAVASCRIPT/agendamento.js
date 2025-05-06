document.addEventListener('DOMContentLoaded', function() {
    // Mapeamento de médico para serviço (pode ser substituído por dados do localStorage)
    const medicoServicoMap = {};
    const funcionarios = JSON.parse(localStorage.getItem('funcionarios')) || [];
    
    // Preenche o mapeamento automaticamente
    funcionarios.forEach(func => {
        medicoServicoMap[func.nome] = func.departamento;
    });

    // Preenche os selects
    const medicoSelect = document.getElementById('doutor');
    const servicoSelect = document.getElementById('servico');
    
    // Limpa opções existentes
    medicoSelect.innerHTML = '';
    servicoSelect.innerHTML = '';
    
    // Adiciona opções baseadas nos funcionários cadastrados
    funcionarios.forEach(func => {
        const option = document.createElement('option');
        option.value = func.nome;
        option.textContent = func.nome;
        medicoSelect.appendChild(option);
        
        // Verifica se o serviço já existe no select
        if (!Array.from(servicoSelect.options).some(opt => opt.value === func.departamento)) {
            const servOption = document.createElement('option');
            servOption.value = func.departamento;
            servOption.textContent = func.departamento;
            servicoSelect.appendChild(servOption);
        }
    });

    // Função para atualizar o serviço baseado no médico selecionado
    function atualizarServico() {
        const medicoSelecionado = medicoSelect.value;
        servicoSelect.value = medicoServicoMap[medicoSelecionado] || '';
    }

    // Event listener para mudança no select de médicos
    medicoSelect.addEventListener('change', atualizarServico);

    // Preenche com parâmetros da URL se existirem
    const urlParams = new URLSearchParams(window.location.search);
    const medicoUrl = urlParams.get('medico');
    const servicoUrl = urlParams.get('servico');
    
    if (medicoUrl) {
        medicoSelect.value = medicoUrl;
        atualizarServico();
    }
    
    if (servicoUrl) {
        servicoSelect.value = servicoUrl;
    }

    // Configura data mínima para hoje
    const hoje = new Date();
    const dia = String(hoje.getDate()).padStart(2, '0');
    const mes = String(hoje.getMonth() + 1).padStart(2, '0');
    const ano = hoje.getFullYear();
    document.getElementById('data').min = `${ano}-${mes}-${dia}`;

    // Submit do formulário
    const form = document.querySelector('.form');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        // Aqui você pode adicionar a lógica para salvar o agendamento
        alert('Agendamento realizado com sucesso!');
        // form.reset();
    });
});