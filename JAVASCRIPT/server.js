const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors()); // Libera o acesso de qualquer origem (local)
app.use(express.json()); // Permite receber JSON no body

// Configuração do transporte de email
const transporter = nodemailer.createTransport({
    service: 'gmail', // Pode ser 'hotmail', 'yahoo', etc. Ou SMTP customizado
    auth: {
        user: 'vlographa@gmail.com',    // SEU EMAIL
        pass: 'rapha2004' // SENHA DO APLICATIVO, não sua senha normal
    }
});

// Rota que recebe o formulário
app.post('/enviar-email', (req, res) => {
    const { email, assunto, mensagem } = req.body;

    const mailOptions = {
        from: email, // Email do cliente
        to: 'dev.raphaelbelfort@gmail.com', // Email da empresa
        subject: assunto,
        text: mensagem
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Erro ao enviar:', error);
            res.status(500).send('Erro ao enviar o email.');
        } else {
            console.log('Email enviado:', info.response);
            res.send('Email enviado com sucesso!');
        }
    });
});

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});