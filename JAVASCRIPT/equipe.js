import { db } from './firebase-config.js';
import { collection, getDocs } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async function () {
    const equipeContainer = document.getElementById('equipe-container');
    const botoesFiltro = document.querySelectorAll('.filtro-btn');

    try {
        const querySnapshot = await getDocs(collection(db, "funcionarios"));

        const equipePublica = [];
        querySnapshot.forEach(doc => {
            const funcionario = doc.data();
            if (funcionario.mostrarEquipe) {
                equipePublica.push(funcionario);
            }
        });

        if (equipePublica.length === 0) {
            equipeContainer.innerHTML = '<p class="sem-equipe">Nenhum profissional cadastrado na equipe ainda.</p>';
            return;
        }

        equipePublica.forEach(funcionario => {
            const card = document.createElement('div');
            card.className = 'profissional-card';
            card.dataset.categoria = funcionario.departamento;

            card.innerHTML = `
                <div class="profissional-foto-container">
                    <img src="${funcionario.fotoBase64 || '../imagens/placeholder.jpg'}" 
                         alt="${funcionario.nome}" class="profissional-foto">
                </div>

                <div class="profissional-info">
                    <h2>${funcionario.nome}</h2>
                    <p class="registro-profissional">${funcionario.registro}</p>
                    <p class="especialidade">${funcionario.departamento}</p>
                    <p class="descricao">${funcionario.descricao || 'Profissional especializado'}</p>

                    <div class="profissional-acoes">
                        <a href="${funcionario.linkedin}" target="_blank" class="linkedin-btn">
                            <i class="fab fa-linkedin"></i> LinkedIn
                        </a>
                        <a href="../html/agendamento.html?medico=${encodeURIComponent(funcionario.nome)}&servico=${encodeURIComponent(funcionario.departamento)}" 
                           class="agendar-btn">
                            <i class="fas fa-calendar-alt"></i> Agendar Consulta
                        </a>
                    </div>
                </div>
            `;

            equipeContainer.appendChild(card);
        });

        // Filtros por especialidade
        botoesFiltro.forEach(botao => {
            botao.addEventListener('click', function () {
                botoesFiltro.forEach(b => b.classList.remove('active'));
                this.classList.add('active');

                const filtro = this.dataset.filter;
                const cards = document.querySelectorAll('.profissional-card');

                cards.forEach(card => {
                    card.style.display = (filtro === 'todos' || card.dataset.categoria === filtro) ? 'block' : 'none';
                });
            });
        });

    } catch (error) {
        console.error("Erro ao carregar equipe:", error);
        equipeContainer.innerHTML = '<p class="sem-equipe">Erro ao carregar a equipe.</p>';
    }
});
