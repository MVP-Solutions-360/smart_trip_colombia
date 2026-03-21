// Basic scroll reveal animation
const observerOptions = {
  threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
  const animatedElements = document.querySelectorAll('.destination-card, .step-item, .package-card, .dashboard-text, .mockup-display');

  animatedElements.forEach(el => {
    el.classList.add('reveal');
    observer.observe(el);
  });

  updateNavigation();
});

// Actualizar navegación según estado de autenticación
function updateNavigation() {
  const token = localStorage.getItem('crm_auth_token') || localStorage.getItem('crm_client_token');
  const loginLink = document.querySelector('a[href="login.html"]');

  if (token && loginLink) {
    loginLink.innerHTML = '<span class="material-symbols-outlined" style="vertical-align: middle; margin-right: 4px;">account_circle</span> Mi Cuenta';
    loginLink.href = 'dashboard.html'; // O a un perfil real

    // Agregar botón de cerrar sesión
    const navActions = loginLink.parentElement;
    const logoutBtn = document.createElement('a');
    logoutBtn.href = "#";
    logoutBtn.className = "btn-ghost";
    logoutBtn.style.padding = "4px 8px";
    logoutBtn.style.fontSize = "12px";
    logoutBtn.textContent = "(Salir)";
    logoutBtn.onclick = (e) => {
      e.preventDefault();
      if (confirm('¿Cerrar sesión?')) {
        window.CRM.logout();
        window.location.reload();
      }
    };
    navActions.appendChild(logoutBtn);
  }
}


// Add CSS for reveal
const style = document.createElement('style');
style.textContent = `
  .reveal {
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  }
  .reveal.visible {
    opacity: 1;
    transform: translateY(0);
  }
`;
document.head.appendChild(style);
