// ─── MASTER PAGE SİSTEMİ VE DİL DESTEĞİ ───

const headerTemplate = `
<nav>
<div class="nav-id">
<div class="nav-chip" data-i18n="nav_chip">MKT · ENG</div>

<a href="index.html" class="nav-name">
Volkan Tuncer
</a>

<a href="enterprise.html" class="nav-cta-enterprise">
<span class="cta-main">Fikrimiz</span>
<span class="cta-sub">Enterprise</span>
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

<svg class="icon-sun"
viewBox="0 0 24 24"
fill="none"
stroke="currentColor"
stroke-width="2"
stroke-linecap="round">

<circle cx="12" cy="12" r="4"/>
<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>

</svg>

<svg class="icon-moon"
viewBox="0 0 24 24"
fill="none"
stroke="currentColor"
stroke-width="2"
stroke-linecap="round"
stroke-linejoin="round">

<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>

</svg>

</button>

<button class="nav-hamburger" id="hamburger" aria-label="Menü">
<span></span>
<span></span>
<span></span>
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

<div class="pcb-trace trace-1">
<div class="data-packet dp-1"></div>
</div>

<div class="pcb-trace trace-2">
<div class="data-packet dp-2"></div>
</div>

<div class="pcb-trace trace-3"></div>

<div class="pcb-trace trace-4">
<div class="data-packet dp-3"></div>
</div>

<div class="pcb-trace trace-5"></div>

<div class="pcb-trace trace-6">
<div class="data-packet dp-5"></div>
</div>

<div class="pcb-trace trace-7"></div>

<div class="pcb-trace trace-8">
<div class="data-packet dp-4"></div>
</div>

<div class="pcb-node n-1"></div>
<div class="pcb-node n-2"></div>
<div class="pcb-node n-3"></div>
<div class="pcb-node n-4"></div>
<div class="pcb-node n-5"></div>
<div class="pcb-node n-6"></div>
<div class="pcb-node n-7"></div>
<div class="pcb-node n-8"></div>

<div class="footer-content">

<div
class="foot-l"
data-i18n="footer_copy"
style="position: relative; z-index: 10;">

© 2026 Volkan Tuncer — Karabük Üniversitesi · Mekatronik Mühendisliği

</div>

<div
class="foot-r"
style="position: relative; z-index: 10;">

<span class="foot-dot"></span>

<span data-i18n="footer_sys">
Canlı
</span>

</div>

</div>

</footer>
`;


/* ==========================================================================
 * ENTERPRISE CTA — ÇAPRAZ IŞIK EFEKTİ
 *
 * Işık şeridi butonun sol üst tarafından girer,
 * sağ alt tarafına doğru çapraz şekilde geçer.
 * ========================================================================== */

const enterpriseShineStyles = document.createElement("style");

enterpriseShineStyles.textContent = `

.nav-cta-enterprise {

  position: relative;

  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  gap: 1px;

  margin-left: 14px;

  padding: 6px 20px;

  line-height: 1.15;

  text-decoration: none !important;

  border-radius: 14px;

  /*
   * Mevcut Enterprise gradient'in korunması
   */
  background:
  linear-gradient(
    120deg,
    var(--cyan),
                  var(--amber),
                  var(--cyan)
  );

  background-size: 200% 200%;

  /*
   * Mevcut dış parlama
   */
  box-shadow:
  0 0 18px
  color-mix(
    in srgb,
    var(--cyan) 55%,
            transparent
  ),

  0 0 8px
  color-mix(
    in srgb,
    var(--amber) 40%,
            transparent
  );

  /*
   * Katmanları düzgün ayırıyoruz.
   */
  isolation: isolate;

  overflow: hidden;

  animation:
  navCtaShine 4s ease infinite;

  transition:
  transform 0.25s cubic-bezier(0.16,1,0.3,1),
  box-shadow 0.25s ease;
}


/*
 * ÇAPRAZ IŞIK ŞERİDİ
 */
.nav-cta-enterprise::after {

  content: "";

  position: absolute;

  z-index: 5;

  /*
   * Butonun dışından başlatıyoruz.
   */
  top: -90%;

  left: -65%;

  width: 28%;

  height: 280%;

  pointer-events: none;

  /*
   * İnce merkezli beyaz parlama.
   */
  background:
  linear-gradient(
    90deg,
    transparent 0%,
    rgba(255,255,255,0.03) 20%,
                  rgba(255,255,255,0.18) 38%,
                  rgba(255,255,255,0.95) 50%,
                  rgba(255,255,255,0.18) 62%,
                  rgba(255,255,255,0.03) 80%,
                  transparent 100%
  );

  /*
   * Çapraz yön.
   */
  transform:
  rotate(28deg)
  translateZ(0);

  /*
   * GPU compositing.
   */
  will-change: left, opacity, transform;

  /*
   * Sürekli tekrar eden tarama.
   */
  animation:
  enterpriseLightSweep 3.8s
  cubic-bezier(0.45,0,0.25,1)
  infinite;
}


/*
 * Işığın butonun üzerinden geçişi.
 *
 * 0 - 12%   : bekleme / giriş
 * 12 - 52%  : ışık geçiyor
 * 52 - 100% : bekleme
 */
@keyframes enterpriseLightSweep {

  0% {

    left: -65%;

    opacity: 0;

  }

  8% {

    opacity: 1;

  }

  48% {

    left: 145%;

    opacity: 1;

  }

  54% {

    left: 145%;

    opacity: 0;

  }

  100% {

    left: 145%;

    opacity: 0;

  }

}


/*
 * Butonun mevcut renk hareketi.
 */
@keyframes navCtaShine {

  0%,
  100% {

    background-position: 0% 50%;

  }

  50% {

    background-position: 100% 50%;

  }

}


/*
 * Ana başlık
 */
.nav-cta-enterprise .cta-main {

  position: relative;

  z-index: 6;

  font-family: var(--head);

  font-size: 0.94rem;

  font-weight: 800;

  letter-spacing: 0.01em;

  color: #ffffff;

  text-shadow:
  0 0 10px var(--red),
  0 0 3px rgba(255,255,255,0.9);

}


/*
 * Enterprise alt başlık
 */
.nav-cta-enterprise .cta-sub {

  position: relative;

  z-index: 6;

  font-family: var(--mono);

  font-size: 0.52rem;

  font-weight: 650;

  letter-spacing: 0.2em;

  text-transform: uppercase;

  color: rgba(255,255,255,0.78);

}


/*
 * Hover
 */
.nav-cta-enterprise:hover {

  transform:
  translateY(-2px)
  scale(1.05);

  box-shadow:

  0 0 26px
  color-mix(
    in srgb,
    var(--cyan) 70%,
            transparent
  ),

  0 0 14px
  color-mix(
    in srgb,
    var(--amber) 55%,
            transparent
  );

}


/*
 * Kullanıcı sisteminde hareket azaltma açıksa
 * animasyonu kapat.
 */
@media (prefers-reduced-motion: reduce) {

  .nav-cta-enterprise,
  .nav-cta-enterprise::after {

    animation: none !important;

  }

}


/*
 * Mobil
 */
@media (max-width: 900px) {

  .nav-cta-enterprise {

    margin-left: 6px;

    padding: 5px 14px;

  }

  .nav-cta-enterprise .cta-main {

    font-size: 0.82rem;

  }

  .nav-cta-enterprise .cta-sub {

    font-size: 0.46rem;

  }

}

`;

document.head.appendChild(enterpriseShineStyles);


/* ==========================================================================
 * SITE HEADER
 * ========================================================================== */

class SiteHeader extends HTMLElement {

  connectedCallback() {

    this.innerHTML = headerTemplate;


    /* ----------------------------------------------------------------------
     * 1. AKTİF LİNKİ BELİRLEME
     * ---------------------------------------------------------------------- */

    const currentPage =
    window.location.pathname.split("/").pop() ||
    "index.html";

  const links =
  this.querySelectorAll(
    "nav ul a, .nav-mobile-menu a"
  );

  links.forEach((link) => {

    const href =
    link.getAttribute("href");

    if (
      href === currentPage ||
      (
        currentPage === "index.html" &&
        href === "index.html"
      )
    ) {

      link.classList.add("active");

    }

  });


  /* ----------------------------------------------------------------------
   * 2. MOBİL MENÜ
   * ---------------------------------------------------------------------- */

  const hamburger =
  this.querySelector("#hamburger");

  const mobileMenu =
  this.querySelector("#mobile-menu");

  if (
    hamburger &&
    mobileMenu
  ) {

    hamburger.addEventListener(
      "click",
      () => {

        hamburger.classList.toggle("open");

        mobileMenu.classList.toggle("open");

      }
    );


    const mobileLinks =
    this.querySelectorAll(
      ".nav-mobile-menu a"
    );

    mobileLinks.forEach((link) => {

      link.addEventListener(
        "click",
        () => {

          hamburger.classList.remove("open");

          mobileMenu.classList.remove("open");

        }
      );

    });

  }


  /* ----------------------------------------------------------------------
   * 3. TEMA DEĞİŞTİRİCİ
   * ---------------------------------------------------------------------- */

  const root =
  document.documentElement;

  const themeToggle =
  this.querySelector("#theme-toggle");


  const setTheme = (theme) => {

    if (theme === "light") {

      root.setAttribute(
        "data-theme",
        "light"
      );

    } else {

      root.removeAttribute(
        "data-theme"
      );

    }

    try {

      localStorage.setItem(
        "theme",
        theme
      );

    } catch (e) {}

  };


  if (themeToggle) {

    themeToggle.addEventListener(
      "click",
      () => {

        const isLight =
        root.getAttribute(
          "data-theme"
        ) === "light";

        setTheme(
          isLight
          ? "dark"
          : "light"
        );

      }
    );

  }


  /* ----------------------------------------------------------------------
   * KAYITLI TEMAYI UYGULA
   * ---------------------------------------------------------------------- */

  try {

    const savedTheme =
    localStorage.getItem(
      "theme"
    );

    if (
      savedTheme === "light"
    ) {

      root.setAttribute(
        "data-theme",
        "light"
      );

    }

  } catch (e) {}


  /* ----------------------------------------------------------------------
   * 4. DİL DEĞİŞTİRİCİ
   * ---------------------------------------------------------------------- */

  const langBtns =
  this.querySelectorAll(
    ".lang-btn"
  );


  const setLanguage = (lang) => {

    langBtns.forEach((btn) => {

      btn.classList.toggle(
        "active",
        btn.getAttribute(
          "data-lang"
        ) === lang
      );

    });


    try {

      localStorage.setItem(
        "preferred_lang",
        lang
      );

    } catch (e) {}


    /*
     * Eğer ana i18n sistemi mevcutsa
     * dili ona gönder.
     */
    if (
      typeof window.changeLanguage ===
      "function"
    ) {

      window.changeLanguage(
        lang
      );

    }

  };


  langBtns.forEach((btn) => {

    btn.addEventListener(
      "click",
      () => {

        const selectedLang =
        btn.getAttribute(
          "data-lang"
        );

        setLanguage(
          selectedLang
        );

      }
    );

  });


  /* ----------------------------------------------------------------------
   * KAYITLI DİLİ YÜKLE
   * ---------------------------------------------------------------------- */

  try {

    const savedLang =
    localStorage.getItem(
      "preferred_lang"
    ) || "tr";

    setLanguage(
      savedLang
    );

  } catch (e) {}

  }

}


/* ==========================================================================
 * SITE FOOTER
 * ========================================================================== */

class SiteFooter extends HTMLElement {

  connectedCallback() {

    this.innerHTML =
    footerTemplate;

  }

}


/* ==========================================================================
 * BİLEŞENLERİ SİSTEME TANIT
 * ========================================================================== */

customElements.define(
  "site-header",
  SiteHeader
);

customElements.define(
  "site-footer",
  SiteFooter
);
