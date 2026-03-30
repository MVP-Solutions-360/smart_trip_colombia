/**
 * SmartTrip Colombia — Componente Navbar Reutilizable
 * Uso: incluir este script en cualquier página y llamar SmartTripNavbar.init()
 * Opcionalmente: SmartTripNavbar.init({ activeLink: 'destinations' })
 *
 * activeLink opciones: 'destinations' | 'packages' | 'about' | 'support'
 */

(function (window) {
  'use strict';

  // ─── Utilidad: calcular la ruta base relativa al proyecto ───────────────
  function getBasePath() {
    const path = window.location.pathname.replace(/\\/g, '/');
    // Para entornos como XAMPP (/laravel/smart_trip_colombia/...), 
    // necesitamos saber qué tan lejos estamos de la carpeta 'smart_trip_colombia'
    // o simplemente detectar si estamos dentro de carpetas específicas.
    
    if (path.includes('/destinations/')) {
        // Estamos en destinations/ciudad/archivo.html -> 2 niveles (../../)
        return '../../';
    }
    // Si no estamos en una subcarpeta conocida, asumimos que estamos en el root
    return '';
  }

  // ─── HTML del navbar ──────────────────────────────────────────────────────
  function buildNavHTML(base, activeLink) {
    const links = [
      { key: 'destinations', href: `${base}destinations.html`, label: 'Destinos' },
      { key: 'packages', href: `${base}packages.html`, label: 'Planes de Viaje' },
      { key: 'about', href: `${base}about.html`, label: 'Nosotros' },
      { key: 'support', href: `${base}support.html`, label: 'Soporte' },
    ];

    const navItems = links
      .map((l) => {
          if (l.key === 'destinations') {
              return `
          <li class="nav-item-dropdown">
            <a href="${l.href}" class="nav-link-main${l.key === activeLink ? ' active' : ''}">
              ${l.label}
              <span class="material-symbols-outlined nav-item-chevron">expand_more</span>
            </a>
            <div class="nav-submenu">
              <a href="${base}caribe.html" class="nav-submenu-item">
                <span class="material-symbols-outlined">beach_access</span>
                Caribe Colombiano
              </a>
              <a href="${base}cancun.html" class="nav-submenu-item">
                <span class="material-symbols-outlined">waves</span>
                Cancún
              </a>
              <a href="${base}punta-cana.html" class="nav-submenu-item">
                <span class="material-symbols-outlined">palm_tree</span>
                Punta Cana
              </a>
            </div>
          </li>`;
          }
          return `<li><a href="${l.href}" class="nav-link-main${l.key === activeLink ? ' active' : ''}">${l.label}</a></li>`;
      })
      .join('\n        ');

    return `
<nav class="navbar" id="smarttrip-navbar">
  <div class="container">

    <!-- Lado Izquierdo: Logo -->
    <div class="nav-left">
        <a href="${base}index.html" class="logo">
          <img src="${base}assets/logos/icono.png" alt="" class="logo-img">
          <div class="logo-text">SmartTrip<span>Colombia</span></div>
        </a>
    </div>

    <!-- Centro: Links de navegación -->
    <ul class="nav-links">
      ${navItems}
    </ul>

    <!-- Lado Derecho: Acciones de usuario -->
    <div class="nav-right">
        <div class="nav-actions">
          <button class="nav-user-btn" id="navUserBtn" aria-haspopup="true" aria-expanded="false">
            <span class="material-symbols-outlined nav-user-icon">account_circle</span>
            <span class="nav-user-label" id="navUserLabel">Mi cuenta</span>
            <span class="material-symbols-outlined nav-chevron" id="navChevron">expand_more</span>
          </button>

          <div class="nav-dropdown" id="navDropdown" role="menu" aria-hidden="true">
            <!-- Estado: no autenticado -->
            <div id="navGuestSection">
              <a href="${base}login.html" class="nav-dropdown-item" role="menuitem" id="navLoginLink">
                <span class="material-symbols-outlined">login</span>
                Iniciar Sesión
              </a>
              <div class="nav-dropdown-divider"></div>
              <a href="${base}quote.html" class="nav-dropdown-item nav-dropdown-cta" role="menuitem">
                <span class="material-symbols-outlined">request_quote</span>
                Solicitar Cotización
              </a>
            </div>

            <!-- Estado: autenticado (oculto por defecto) -->
            <div id="navAuthSection" style="display:none;">
              <a href="${base}dashboard.html" class="nav-dropdown-item" role="menuitem">
                <span class="material-symbols-outlined">dashboard</span>
                Mi Dashboard
              </a>
              <a href="${base}quote.html" class="nav-dropdown-item nav-dropdown-cta" role="menuitem">
                <span class="material-symbols-outlined">request_quote</span>
                Solicitar Cotización
              </a>
              <div class="nav-dropdown-divider"></div>
              <button class="nav-dropdown-item nav-dropdown-logout" id="navLogoutBtn" role="menuitem">
                <span class="material-symbols-outlined">logout</span>
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>

        <!-- Hamburger (móvil) -->
        <button class="nav-hamburger" id="navHamburger" aria-label="Menú">
          <span></span><span></span><span></span>
        </button>
    </div>

  </div>

  <!-- Menú móvil -->
  <div class="nav-mobile-menu" id="navMobileMenu">
    <ul>
      ${links.map((l) => {
          if (l.key === 'destinations') {
              return `
              <li class="mobile-nav-group">
                <a href="${l.href}" class="${l.key === activeLink ? 'active' : ''}">${l.label}</a>
                <div class="mobile-submenu">
                  <a href="${base}caribe.html">Caribe Colombiano</a>
                  <a href="${base}cancun.html">Cancún</a>
                  <a href="${base}punta-cana.html">Punta Cana</a>
                </div>
              </li>`;
          }
          return `<li><a href="${l.href}"${l.key === activeLink ? ' class="active"' : ''}>${l.label}</a></li>`;
      }).join('\n      ')}
    </ul>
    <div class="nav-mobile-actions">
      <a href="${base}login.html" class="btn-ghost" id="navMobileLoginLink">Iniciar Sesión</a>
      <a href="${base}quote.html" class="btn-primary">Solicitar Cotización</a>
    </div>
  </div>
</nav>`;
  }

  // ─── CSS del navbar (se inyecta una sola vez) ─────────────────────────────
  const NAVBAR_CSS = `
/* ── Navbar Component Styles ───────────────────────────────────────────── */

/* Ajustes del contenedor para centrado */
.navbar .container {
  display: flex !important;
  justify-content: space-between !important;
  align-items: center !important;
  width: 100% !important;
  max-width: 1300px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Áreas de los extremos */
.nav-left, .nav-right {
  flex: 1;
  display: flex;
  align-items: center;
}
.nav-right {
  justify-content: flex-end;
  gap: 15px;
}

/* Logo container */
.logo {
  display: flex !important;
  align-items: center !important;
  gap: 10px;
  text-decoration: none;
}

/* Logo imagen y texto */
.logo-img { height: 38px !important; width: auto !important; flex-shrink: 0; }
.logo-text {
  font-size: 24px;
  font-weight: 800;
  color: #0A2540; /* Color azul oscuro premium */
  line-height: 1;
  display: flex !important;
  align-items: center !important;
  white-space: nowrap;
}
.logo-text span { color: #00D4FF; font-weight: 700; }

/* Centro: Links de navegación */
.nav-links {
  flex: 0 1 auto;
  display: flex !important;
  justify-content: center !important;
  list-style: none !important;
  gap: 35px !important;
  margin: 0 !important;
  padding: 0 !important;
}
.nav-link-main {
  text-decoration: none;
  color: #4F566B;
  font-weight: 600;
  font-size: 15px;
  padding: 10px 0;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}
.nav-link-main:hover, .nav-link-main.active {
  color: #00D4FF !important;
}

/* Dropdown de Destinos (Desktop) */
.nav-item-dropdown {
  position: relative;
}
.nav-item-chevron {
  font-size: 18px;
  transition: transform 0.2s ease;
  color: #A3ACB9;
}
.nav-item-dropdown:hover .nav-item-chevron {
  transform: rotate(180deg);
  color: #00D4FF;
}
.nav-submenu {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(10px);
  min-width: 240px;
  background: #ffffff;
  border: 1px solid #E6E9EF;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  padding: 12px 0;
  opacity: 0;
  visibility: hidden;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 2000;
}
.nav-item-dropdown:hover .nav-submenu {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0);
}
.nav-submenu-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  text-decoration: none;
  color: #4F566B;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
}
.nav-submenu-item:hover {
  background: #F6F9FC;
  color: #0A2540;
}
.nav-submenu-item .material-symbols-outlined {
  font-size: 20px;
  color: #00D4FF;
}

/* Botón de usuario (acordeón trigger) */
.nav-user-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: 1.5px solid #E6E9EF;
  border-radius: 999px;
  padding: 6px 14px 6px 10px;
  font-family: inherit;
  font-size: 14px;
  font-weight: 600;
  color: #0A2540;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}
.nav-user-btn:hover {
  border-color: #00D4FF;
  background: rgba(0,212,255,0.05);
}
.nav-user-btn.open {
  border-color: #00D4FF;
  box-shadow: 0 0 0 3px rgba(0,212,255,0.1);
}
.nav-user-icon { font-size: 22px; color: #00D4FF; }
.nav-chevron { font-size: 18px; transition: transform 0.2s ease; color: #A3ACB9; }
.nav-user-btn.open .nav-chevron { transform: rotate(180deg); }

/* Dropdown de Usuario */
.nav-dropdown {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  min-width: 240px;
  background: #ffffff;
  border: 1px solid #E6E9EF;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  overflow: hidden;
  z-index: 2000;
  opacity: 0;
  transform: translateY(-8px);
  pointer-events: none;
  transition: all 0.2s ease;
}
.nav-dropdown.open {
  opacity: 1;
  transform: translateY(0);
  pointer-events: all;
}
.nav-dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  font-size: 14px;
  font-weight: 600;
  color: #4F566B;
  text-decoration: none;
  transition: background 0.2s;
}
.nav-dropdown-item:hover { background: #F6F9FC; color: #00D4FF; }
.nav-dropdown-cta { color: #00D4FF; }
.nav-dropdown-logout { color: #E11D48; }
.nav-dropdown-divider { height: 1px; background: #E6E9EF; margin: 4px 0; }

/* Hamburger (móvil) */
.nav-hamburger {
  display: none;
  flex-direction: column; gap: 5px; cursor: pointer; border: none; background: transparent; padding: 5px;
}
.nav-hamburger span {
  display: block; width: 24px; height: 2px; background: #0A2540; border-radius: 2px; transition: 0.3s;
}
.nav-hamburger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.nav-hamburger.open span:nth-child(2) { opacity: 0; }
.nav-hamburger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

/* Menú móvil */
.nav-mobile-menu {
  display: none; background: #ffffff; border-top: 1px solid #E6E9EF; padding: 20px;
}
.nav-mobile-menu.open { display: block; }
.nav-mobile-menu ul { list-style: none; }
.nav-mobile-menu li { border-bottom: 1px solid #F6F9FC; }
.nav-mobile-menu a {
  display: block; padding: 15px 0; font-weight: 600; color: #4F566B; text-decoration: none;
}
.nav-mobile-menu a.active { color: #00D4FF; }

.mobile-submenu {
  padding-left: 20px;
  background: #F6F9FC;
  border-radius: 8px;
  margin-bottom: 10px;
}
.mobile-submenu a {
  padding: 10px 0;
  font-size: 14px;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 992px) {
  .nav-links { display: none !important; }
  .nav-actions { display: none !important; }
  .nav-hamburger { display: flex !important; }
  .nav-left { flex: 1; }
  .nav-right { flex: 0; }
}
@media (min-width: 993px) {
  .nav-mobile-menu { display: none !important; }
}

`;

  // ─── Lógica del componente ────────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById('smarttrip-navbar-styles')) return;
    const style = document.createElement('style');
    style.id = 'smarttrip-navbar-styles';
    style.textContent = NAVBAR_CSS;
    document.head.appendChild(style);
  }

  function detectActiveLink() {
    const path = window.location.pathname.replace(/\\/g, '/');
    if (path.includes('destinations')) return 'destinations';
    if (path.includes('packages') || path.includes('packages')) return 'packages';
    if (path.includes('about')) return 'about';
    if (path.includes('support')) return 'support';
    return '';
  }

  function setupDropdown() {
    const btn = document.getElementById('navUserBtn');
    const dropdown = document.getElementById('navDropdown');
    const chevron = document.getElementById('navChevron');
    if (!btn || !dropdown) return;

    function openDropdown() {
      btn.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
      dropdown.classList.add('open');
      dropdown.setAttribute('aria-hidden', 'false');
    }
    function closeDropdown() {
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      dropdown.classList.remove('open');
      dropdown.setAttribute('aria-hidden', 'true');
    }

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.contains('open');
      isOpen ? closeDropdown() : openDropdown();
    });

    // Cerrar al hacer click fuera
    document.addEventListener('click', (e) => {
      if (!btn.contains(e.target) && !dropdown.contains(e.target)) {
        closeDropdown();
      }
    });

    // Cerrar con Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeDropdown();
    });
  }

  function setupHamburger() {
    const hamburger = document.getElementById('navHamburger');
    const mobileMenu = document.getElementById('navMobileMenu');
    if (!hamburger || !mobileMenu) return;

    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open', isOpen);
    });
  }

  function setupAuthState() {
    const token = localStorage.getItem('crm_auth_token') || localStorage.getItem('crm_client_token');
    const guestSection = document.getElementById('navGuestSection');
    const authSection = document.getElementById('navAuthSection');
    const userLabel = document.getElementById('navUserLabel');
    const mobileLogin = document.getElementById('navMobileLoginLink');

    if (token) {
      if (guestSection) guestSection.style.display = 'none';
      if (authSection) authSection.style.display = 'block';
      if (userLabel) userLabel.textContent = 'Mi cuenta';
      if (mobileLogin) {
        mobileLogin.href = 'dashboard.html';
        mobileLogin.textContent = 'Mi Dashboard';
      }

      const logoutBtn = document.getElementById('navLogoutBtn');
      if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
          if (confirm('¿Cerrar sesión?')) {
            localStorage.removeItem('crm_auth_token');
            localStorage.removeItem('crm_client_token');
            if (window.CRM && typeof window.CRM.logout === 'function') window.CRM.logout();
            window.location.href = 'index.html';
          }
        });
      }
    }
  }

  // ─── API pública ──────────────────────────────────────────────────────────
  const SmartTripNavbar = {
    /**
     * Monta el navbar en el primer elemento <nav class="navbar"> vacío que encuentre,
     * o lo prepende al <body> si no existe ninguno.
     *
     * @param {object} options
     * @param {string} [options.activeLink] - clave del link activo ('destinations', 'packages', 'about', 'support')
     */
    init: function (options = {}) {
      injectStyles();

      const base = getBasePath();
      const activeLink = options.activeLink || detectActiveLink();
      const html = buildNavHTML(base, activeLink);

      // Reemplazar el <nav class="navbar"> existente o insertar antes del primer hijo del body
      let target = document.querySelector('nav.navbar');
      if (target) {
        target.outerHTML = html;
      } else {
        document.body.insertAdjacentHTML('afterbegin', html);
      }

      setupDropdown();
      setupHamburger();
      setupAuthState();
    },
  };

  window.SmartTripNavbar = SmartTripNavbar;
})(window);
