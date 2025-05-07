import { auth } from './firebase-config.js';
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

// LOGIN
export async function login() {
  const email = document.getElementById("loginEmail").value;
  const senha = document.getElementById("loginSenha").value;
  try {
    await signInWithEmailAndPassword(auth, email, senha);
    window.location.href = "../html/admarea.html"; 
  } catch (error) {
    alert("Erro no login: " + error.message);
  }
}

// LOGOUT
export function logout() {
  signOut(auth)
    .then(() => window.location.href = "index.html")
    .catch((error) => alert("Erro ao sair: " + error.message));
}

// PROTEGE O DASHBOARD
export function protegerDashboard() {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const span = document.getElementById("usuario");
      if (span) span.textContent = user.email;
    } else {
      window.location.href = "../index.html";
    }
  });
}

// ESQUECEU A SENHA
export async function esquecerSenha() {
  const email = document.getElementById("loginEmail").value;
  if (!email) {
    alert("Informe seu e-mail para redefinir a senha.");
    return;
  }
  try {
    await sendPasswordResetEmail(auth, email);
    alert("E-mail de redefinição de senha enviado.");
  } catch (error) {
    alert("Erro ao enviar e-mail: " + error.message);
  }
}