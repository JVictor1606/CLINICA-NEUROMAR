const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');


const app = express();
const PORT = 3000;

app.use(cors()); 
app.use(express.json());

app.post('/enviar-email', async (req, res) => {
    const { email, assunto, mensagem } = req.body;
  
    if (!email || !assunto || !mensagem) {
      return res.status(400).json({ success: false, error: 'Preencha todos os campos.' });
    }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'jvictorsousa2015@gmail.com',
      pass: 'cfpj ydet acjz ulfu', 
    },
  });

  const emailTemplate = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Contato - Clínica NEUROMAR</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f4;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden;">
              <!-- Cabeçalho -->
              <tr>
                <td style="background-color: #007bff; padding: 20px; text-align: center;">
                  <img src="https://seusite.com/imagens/logo-neuromar.png" alt="Clínica NEUROMAR" style="max-width: 200px;">
                  <h1 style="color: #ffffff; font-size: 24px; margin: 10px 0;">Nova Mensagem de Contato</h1>
                </td>
              </tr>
              <!-- Corpo -->
              <tr>
                <td style="padding: 30px;">
                  <h2 style="color: #333333; font-size: 20px; margin-top: 0;">Olá, equipe NEUROMAR!</h2>
                  <p style="color: #555555; font-size: 16px; line-height: 1.5;">
                    Você recebeu uma nova mensagem através do formulário de contato do site:
                  </p>
                  <table width="100%" cellpadding="10" cellspacing="0" style="border: 1px solid #e0e0e0; border-radius: 4px; margin: 20px 0;">
                    <tr>
                      <td style="background-color: #f9f9f9; font-weight: bold; color: #333333; width: 30%;">Email:</td>
                      <td style="color: #555555;">${email}</td>
                    </tr>
                    <tr>
                      <td style="background-color: #f9f9f9; font-weight: bold; color: #333333; width: 30%;">Assunto:</td>
                      <td style="color: #555555;">${assunto}</td>
                    </tr>
                    <tr>
                      <td style="background-color: #f9f9f9; font-weight: bold; color: #333333; width: 30%;">Mensagem:</td>
                      <td style="color: #555555; white-space: pre-wrap;">${mensagem}</td>
                    </tr>
                  </table>
                  <p style="color: #555555; font-size: 16px; line-height: 1.5;">
                    Entre em contato com o remetente o mais breve possível.
                  </p>
                </td>
              </tr>
              <!-- Rodapé -->
              <tr>
                <td style="background-color: #f4f4f4; padding: 20px; text-align: center; color: #777777; font-size: 14px;">
                  <p style="margin: 0;">Clínica NEUROMAR - Colares Moreira, UNDB, São Luis - MA</p>
                  <p style="margin: 5px 0;">Telefone: (21) 96995-5197 | Email: contato@neuromar.com.br</p>
                  <p style="margin: 5px 0;">
                    <a href="https://www.facebook.com" style="color: #007bff; text-decoration: none; margin: 0 10px;">Facebook</a> |
                    <a href="https://www.instagram.com" style="color: #007bff; text-decoration: none; margin: 0 10px;">Instagram</a> |
                    <a href="https://www.linkedin.com/in/raphael-belfort-3b479a264/" style="color: #007bff; text-decoration: none; margin: 0 10px;">LinkedIn</a>
                  </p>
                  <p style="margin: 10px 0;">© 2025 Clínica NEUROMAR - Todos os direitos reservados</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const mailOptions = {
    from: email,
    to: 'neuromarclinica@gmail.com',
    html: emailTemplate,
    subject: assunto,
    text: `De: ${email}\n\n${mensagem}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'Email enviado com sucesso!' });
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    res.status(500).json({ success: false, error: 'Erro ao enviar email.' });
  }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
