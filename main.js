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
  // Nota: La gestión del estado de autenticación en el navbar
  // ahora la maneja components/navbar.js (SmartTripNavbar.init())
});

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
