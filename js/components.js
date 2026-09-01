// ─── MASTER PAGE SİSTEMİ VE DİL DESTEĞİ ───

const headerTemplate = `
<nav>
<div class="mech-overlay"></div>
<div class="hud-scanner"></div>
<div class="gear-container">
<svg class="gear-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
<svg class="gear-svg reverse" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
</div>
<div class="mech-bar"></div>
<div class="nav-id">
<div class="nav-chip" data-i18n="nav_chip">MKT · ENG</div>
<a href="index.html" class="nav-name">
<svg class="gear-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
Volkan Tuncer
</a>
</div>
<div class="nav-right">
<div class="lang-switch">
<button class="lang-btn active" data-lang="tr">TR</button>
<button class="lang-btn" data-lang="en">EN</button>
<button class="lang-btn" data-lang="de">DE</button>
<button class="lang-btn" data-lang="zh">ZH</button>
</div>
<ul id="main-nav-links">
<li><a href="index.html" data-i18n="nav_home">Anasayfa</a></li>
<li><a href="index.html#about" data-i18n="nav_about">Hakkımda</a></li>
<li><a href="projeler.html" data-i18n="nav_projects">Projeler</a></li>
<li><a href="galeri.html" data-i18n="nav_gallery">Galeri</a></li>
<li><a href="blog.html" data-i18n="nav_blog">Blog</a></li>
<li><a href="index.html#contact" data-i18n="nav_contact">İletişim</a></li>
</ul>
<button class="theme-toggle" id="theme-toggle" aria-label="Açık/koyu temayı değiştir">
<svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
<svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
</button>
<button class="nav-hamburger" id="hamburger" aria-label="Menü">
<span></span><span></span><span></span>
</button>
</div>
</nav>

<div class="nav-mobile-menu" id="mobile-menu">
<a href="index.html" data-i18n="nav_home">Anasayfa</a>
<a href="index.html#about" data-i18n="nav_about">Hakkımda</a>
<a href="projeler.html" data-i18n="nav_projects">Projeler</a>
<a href="galeri.html" data-i18n="nav_gallery">Galeri</a>
<a href="blog.html" data-i18n="nav_blog">Blog</a>
<a href="index.html#contact" data-i18n="nav_contact">İletişim</a>
</div>
`;

const footerTemplate = `
<footer>
<div class="footer-ruler"></div>
<div class="footer-coords">
<span>0.00</span>
<span>X-AXIS // PCB GRID</span>
<span>100.00</span>
</div>
<div class="pcb-bg"></div>
<div class="pcb-trace trace-1"><div class="data-packet dp-1"></div></div>
<div class="pcb-trace trace-2"><div class="data-packet dp-2"></div></div>
<div class="pcb-trace trace-3"></div>
<div class="pcb-trace trace-4"><div class="data-packet dp-3"></div></div>
<div class="pcb-trace trace-5"></div>
<div class="pcb-trace trace-6"><div class="data-packet dp-5"></div></div>
<div class="pcb-trace trace-7"></div>
<div class="pcb-trace trace-8"><div class="data-packet dp-4"></div></div>
<div class="pcb-node n-1"></div>
<div class="pcb-node n-2"></div>
<div class="pcb-node n-3"></div>
<div class="pcb-node n-4"></div>
<div class="pcb-node n-5"></div>
<div class="pcb-node n-6"></div>
<div class="pcb-node n-7"></div>
<div class="pcb-node n-8"></div>

<div class="footer-content">
<div class="foot-l" data-i18n="footer_copy" style="position: relative; z-index: 10;">© 2026 Volkan Tuncer — Karabük Üniversitesi · Mekatronik Mühendisliği</div>
<div class="foot-r" style="position: relative; z-index: 10;"><span class="foot-dot"></span> <span data-i18n="footer_sys">sistem aktif</span></div>
</div>
</footer>
`;

class SiteHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = headerTemplate;

    // Aktif linki belirleme
    const currentPage = window.location.pathname.split("/").pop();
    const links = this.querySelectorAll('nav ul a');
    links.forEach(link => {
      if(link.getAttribute('href') === currentPage || (currentPage === '' && link.getAttribute('href') === 'index.html')) {
        link.classList.add('active');
      }
    });

    // Mobil Menü
    const hamburger = this.querySelector('#hamburger');
    const mobileMenu = this.querySelector('#mobile-menu');
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      mobileMenu.classList.toggle('open');
    });

    const mobileLinks = this.querySelectorAll('.nav-mobile-menu a');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileMenu.classList.remove('open');
      });
    });

    // Tema Değiştirici
    const root = document.documentElement;
    const themeToggle = this.querySelector('#theme-toggle');
    function setTheme(theme) {
      if (theme === 'light') root.setAttribute('data-theme', 'light');
      else root.removeAttribute('data-theme');
      try { localStorage.setItem('theme', theme); } catch (e) {}
    }
    themeToggle.addEventListener('click', () => {
      const isLight = root.getAttribute('data-theme') === 'light';
      setTheme(isLight ? 'dark' : 'light');
    });

    // Kayıtlı Temayı Yükle
    (function () {
      try {
        var saved = localStorage.getItem('theme');
        if (saved === 'light') document.documentElement.setAttribute('data-theme', 'light');
      } catch (e) {}
    })();
  }
}

class SiteFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = footerTemplate;
  }
}

// BİLEŞENLERİ SİSTEME TANITMA (Bunlar silinirse Header/Footer yok olur)
customElements.define('site-header', SiteHeader);
customElements.define('site-footer', SiteFooter);
