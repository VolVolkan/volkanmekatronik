document.addEventListener('DOMContentLoaded', () => {
  /* ══════════════════════════════════
   *    1. REVEAL ANIMASYONLARI
   * ══════════════════════════════════ */
  const io = new IntersectionObserver((entries, observer) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('vis');
        observer.unobserve(e.target); // Performans: İşlem bitince izlemeyi bırak
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  /* ══════════════════════════════════
   *    1b. FOOTER ANİMASYONLARI SADECE GÖRÜNÜRKEN ÇALIŞSIN
   *    (PCB paket animasyonları sayfanın en altında ama görünmese
   *    bile sürekli GPU'yu meşgul ediyordu)
   * ══════════════════════════════════ */
  const footerEl = document.querySelector('footer');
  if (footerEl) {
    const footerIO = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        footerEl.style.setProperty('--footer-anim-state', entry.isIntersecting ? 'running' : 'paused');
        footerEl.classList.toggle('footer-in-view', entry.isIntersecting);
      });
    }, { threshold: 0 });
    footerIO.observe(footerEl);
  }

  let scrollDepthRAF = null;

  /* ══════════════════════════════════════════
   *    3. SABİT UZAY YILDIZLARI (TEK SEFERLİK, STATİK)
   *    Not: Artık animasyon/scroll döngüsü yok. Sayfa yüklenince ve
   *    pencere yeniden boyutlandığında/tema değiştiğinde bir kez
   *    çizilip öylece kalıyor — fotoğraf gibi sabit.
   * ══════════════════════════════════════════ */
  const spaceCanvas = document.getElementById('space-canvas');
  if (spaceCanvas) {
    const sCtx = spaceCanvas.getContext('2d');
    let w, h, stars;

    function buildStars() {
      const starCount = 80;
      return Array.from({ length: starCount }, () => {
        const r = Math.random();
        // Yıldızların %15'i dört köşeli, %25'i dörtgen, kalanı yuvarlak
        let shape = 'circle';
        if (r > 0.85) shape = 'fourPoint';
        else if (r > 0.6) shape = 'rect';

        return {
          x: Math.random() * w,
                        y: Math.random() * h,
                        size: Math.random() * 2 + 0.5,
                        baseAlpha: Math.random() * 0.5 + 0.3,
                        colorType: Math.random() > 0.85 ? 'amber' : (Math.random() > 0.7 ? 'cyan' : 'white'),
                        shape: shape
        };
      });
    }

    function drawSpaceOnce() {
      w = spaceCanvas.width = window.innerWidth;
      h = spaceCanvas.height = window.innerHeight;
      if (!stars) stars = buildStars();

      const isLightMode = document.documentElement.getAttribute('data-theme') === 'light';

      // Arka plan gradyanı
      const bgGrad = sCtx.createRadialGradient(
        w * 0.5, h * 0.3, 50,
        w * 0.5, h * 0.5, Math.max(w, h)
      );
      if (isLightMode) { bgGrad.addColorStop(0, '#f8fafc'); bgGrad.addColorStop(1, '#e2e8f0'); }
      else { bgGrad.addColorStop(0, '#090e17'); bgGrad.addColorStop(0.5, '#05070a'); bgGrad.addColorStop(1, '#020305'); }
      sCtx.fillStyle = bgGrad;
      sCtx.fillRect(0, 0, w, h);

      stars.forEach(star => {
        const currentY = star.y;
        const currentAlpha = star.baseAlpha;

        let rgbCol = isLightMode ? '15, 23, 42' : '255, 255, 255';
        if (star.colorType === 'cyan') rgbCol = isLightMode ? '0, 131, 163' : '0, 229, 255';
        if (star.colorType === 'amber') rgbCol = isLightMode ? '184, 113, 10' : '255, 184, 48';

        sCtx.beginPath();
        if (star.shape === 'fourPoint') {
          const s = star.size * 2; // Dört köşeli yıldız için uzantı boyutu
          sCtx.moveTo(star.x, currentY - s);
          sCtx.quadraticCurveTo(star.x, currentY, star.x + s, currentY);
          sCtx.quadraticCurveTo(star.x, currentY, star.x, currentY + s);
          sCtx.quadraticCurveTo(star.x, currentY, star.x - s, currentY);
          sCtx.quadraticCurveTo(star.x, currentY, star.x, currentY - s);
        } else if (star.shape === 'rect') {
          sCtx.rect(star.x - star.size, currentY - star.size, star.size * 2, star.size * 2);
        } else {
          sCtx.arc(star.x, currentY, star.size, 0, Math.PI * 2);
        }
        sCtx.fillStyle = `rgba(${rgbCol}, ${currentAlpha})`;
        sCtx.fill();

        // Büyük yıldızlar için sabit arka plan parlaması (glow)
        if (star.size > 1.2 && !isLightMode) {
          const glowSize = star.size * 2.5;
          sCtx.beginPath();
          if (star.shape === 'fourPoint') {
            const gs = glowSize * 1.5;
            sCtx.moveTo(star.x, currentY - gs);
            sCtx.quadraticCurveTo(star.x, currentY, star.x + gs, currentY);
            sCtx.quadraticCurveTo(star.x, currentY, star.x, currentY + gs);
            sCtx.quadraticCurveTo(star.x, currentY, star.x - gs, currentY);
            sCtx.quadraticCurveTo(star.x, currentY, star.x, currentY - gs);
          } else if (star.shape === 'rect') {
            sCtx.rect(star.x - glowSize, currentY - glowSize, glowSize * 2, glowSize * 2);
          } else {
            sCtx.arc(star.x, currentY, glowSize * 2, 0, Math.PI * 2);
          }
          sCtx.fillStyle = `rgba(${rgbCol}, ${currentAlpha * 0.15})`;
          sCtx.fill();
        }
      });
    }

    drawSpaceOnce();

    // Yalnızca pencere yeniden boyutlandığında tekrar çiz (debounce'lu).
    // Scroll veya mousemove artık tetiklemiyor — tamamen statik.
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        stars = null; // yeni boyuta göre yıldızları yeniden dağıt
        drawSpaceOnce();
      }, 200);
    }, { passive: true });

    // Tema değişince renkleri güncellemek için tek seferlik yeniden çizim
    const themeObserver = new MutationObserver(() => drawSpaceOnce());
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }
  /* ══════════════════════════════════════════
   *    4. SCROLL DEPTH / PARALLAX (SIFIR REFLOW)
   * ══════════════════════════════════════════ */
  const progressBar = document.querySelector('.scroll-progress span');
  const motionOK = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let targetScroll = window.scrollY;
  let visualScroll = window.scrollY;
  let maxScroll = 1;
  let windowHeight = window.innerHeight;

  // Element koordinatlarını önceden hesapla
  let sectionsData = [];
  function cacheSectionMetrics() {
    windowHeight = window.innerHeight;
    const doc = document.documentElement;
    maxScroll = Math.max(1, doc.scrollHeight - windowHeight);

    sectionsData = Array.from(document.querySelectorAll('.section')).map(el => ({
      el,
      centerTop: el.offsetTop + el.offsetHeight / 2
    }));
  }

  cacheSectionMetrics();
  window.addEventListener('resize', cacheSectionMetrics, { passive: true });

  function updateScrollMotion() {
    const newScroll = window.scrollY;
    // Büyük sıçramalarda (header'daki #about/#contact linkleri, "git" tuşu vb.)
    // parallax'ın saniyelerce süren yavaş "yakalama" animasyonuna girmesini
    // engelle — efekt zaten en fazla ±14px kaydırdığı için sıçrama fark
    // edilmeden anında hedefe oturtulabilir. Asıl kasma buradaydı.
    if (Math.abs(newScroll - targetScroll) > 250) {
      visualScroll = newScroll;
    }
    targetScroll = newScroll;
    const progress = Math.min(1, Math.max(0, targetScroll / maxScroll));
    if (progressBar) progressBar.style.height = (progress * 100) + '%';
  }

  window.addEventListener('scroll', updateScrollMotion, { passive: true });
  updateScrollMotion();

  if (motionOK) {
    let scrollDepthRunning = false;

    function animateScrollDepth() {
      visualScroll += (targetScroll - visualScroll) * 0.075;

      // DOM okuması (getBoundingClientRect) yapmadan direkt matematiksel parallax
      for (let i = 0; i < sectionsData.length; i++) {
        const sec = sectionsData[i];
        const distance = (sec.centerTop - visualScroll) - windowHeight / 2;
        const shift = Math.max(-14, Math.min(14, -distance * 0.012));
        sec.el.style.transform = `translate3d(0, ${shift}px, 0)`;
      }

      // Performans: hedefe ulaşılınca döngüyü durdur, sonsuza kadar
      // gereksiz yere CPU/GPU (blur/composite) tüketmesin. Yeni bir scroll
      // olduğunda otomatik olarak tekrar başlar.
      if (Math.abs(targetScroll - visualScroll) < 0.3) {
        visualScroll = targetScroll;
        scrollDepthRunning = false;
        for (let i = 0; i < sectionsData.length; i++) sectionsData[i].el.style.willChange = 'auto';
        return;
      }
      scrollDepthRAF = requestAnimationFrame(animateScrollDepth);
    }

    function ensureScrollDepthRunning() {
      if (!scrollDepthRunning) {
        scrollDepthRunning = true;
        // Yalnızca aktif hareket sırasında GPU katmanı iste; sürekli açık
        // bırakmak (özellikle backdrop-filter içeren bölümlerde) sayfa
        // kapanışını/geçişini de gereksiz yere ağırlaştırıyordu.
        for (let i = 0; i < sectionsData.length; i++) sectionsData[i].el.style.willChange = 'transform';
        scrollDepthRAF = requestAnimationFrame(animateScrollDepth);
      }
    }

    window.addEventListener('scroll', ensureScrollDepthRunning, { passive: true });
    ensureScrollDepthRunning();
  }

  /* ══════════════════════════════════════════
   *    5. SAYFADAN ÇIKARKEN ANİMASYONLARI ANINDA DURDUR
   *    (Header'daki linkler tıklanınca "kasma" hissi buradan geliyordu:
   *    tıklama anında hâlâ arka planda çalışan canvas/parallax döngüleri
   *    ana thread'i meşgul edip yeni sayfaya geçişi geciktiriyordu.)
   * ══════════════════════════════════════════ */
  function stopAllLoops() {
    if (scrollDepthRAF) cancelAnimationFrame(scrollDepthRAF);
  }

  // Sayfa içi (#) linkler hariç, gerçek bir sayfa geçişi yapan her tıklamada
  // ağır döngüleri hemen durdur ki tarayıcı geçişi anında/akıcı yapabilsin.
  document.addEventListener('click', e => {
    const link = e.target.closest('a[href]');
    if (!link) return;
    const href = link.getAttribute('href');
    if (!href || link.target === '_blank') return;
    // Sayfayı yenilemeyen bağlantı türleri (mail, telefon, js) dokunma
    if (/^(mailto:|tel:|javascript:)/i.test(href)) return;
    // "index.html#contact" gibi linkler aslında AYNI sayfada kalıp sadece
    // kaydırıyor — gerçekten farklı bir belgeye gidilmiyorsa döngüleri
    // durdurma (bu, mouse'un kaybolmasına sebep olan hataydı).
    const normalize = p => p.replace(/\/index\.html$/i, '/').replace(/\/+$/, '') || '/';
    if (link.host === location.host && normalize(link.pathname) === normalize(location.pathname)) {
      return;
    }
    stopAllLoops();
  }, { capture: true });

  window.addEventListener('pagehide', stopAllLoops);
});

/* ══════════════════════════════════════════
 * 5. ÇEVİRİ SÖZLÜĞÜ (i18n)
 ═ **══*═══════════════════════════════════════ */
const dict = {
  tr: {
    nav_chip: "MKT · ENG",
    nav_home: "Anasayfa",
    nav_about: "Hakkımda",
    nav_projects: "Projeler",
    nav_gallery: "Galeri",
    nav_blog: "Blog",
    nav_contact: "İletişim",
    hero_status: "Hoşgeldiniz &nbsp;—&nbsp; KARABÜK ÜNİVERSİTESİ",
    hero_desc: "Teknolojinin yalnızca nasıl çalıştığını değil, nasıl bir sisteme dönüştürülebileceğini anlamaya odaklanıyorum. Devrelerden yazılıma, otomasyondan sistem entegrasyonuna kadar farklı disiplinleri bir araya getirerek teknik çözümleri yönetilebilir ve sürdürülebilir yapılara dönüştürüyorum. Benim için mühendislik, yalnızca üretmek değil; doğru teknolojiyi seçmek, doğru insan ve kaynakları bir araya getirmek ve ortaya ölçülebilir bir sonuç çıkarmaktır.",
    hero_btn1: "Projeleri İncele",
    hero_btn2: "İletişim Kur &rarr;",
    about_label: "01 / Hakkımda",
    about_title: "Nasıl <em>Biri?</em>",
    about_p1: "Küçüklüğümden beri bir şeylerin nasıl çalıştığına dair merakım hiç bitmedi. Mekatronik mühendisliği bu merakın doğal karşılığı — elektronik, mekanik ve yazılımın kesişiminde çalışmak bana hem mantıklı hem doğal geliyor.",
    about_p2: "Multidisipliner bir yaklaşımla; gömülü sistemler, donanım tasarımı ve yazılım geliştirme alanlarını uçtan uca entegre eden sistem odaklı bir mühendisim.<ul class='about-highlights'><li><strong>Yazılım &amp; Sistemler:</strong> C ve Python odaklı mimariler, ileri seviye Linux ekosistemi ve Selenium otomasyonları.</li><li><strong>Gömülü &amp; Tasarım:</strong> KiCad ile PCB tasarımı, SolidWorks ile mekanik modelleme, gömülü C programlama, Arduino ve Raspberry Pi mimarileri.</li><li><strong>Sistem Entegrasyonu:</strong> Münferit teknolojileri tek başına kullanmak yerine; donanım, gömülü yazılım ve otomasyon katmanlarını ihtiyaca uygun şekilde bir araya getirerek uçtan uca çalışan çözümler üretme yaklaşımı.</li><li><strong>Dil Yeterlilikleri:</strong> Türkçe (Ana Dil), İngilizce (B2 / İş Düzeyi), Almanca (Öğrenim Aşamasında).</li></ul>",
    proj_sec_label: "02 / Projeler (Özet)",
    proj_sec_title: "Öne Çıkan <em>Çalışmalar</em>",
    proj_all_btn: "Tüm Projeleri Gör &rarr;",
    gal_sec_label: "03 / Galeri (Özet)",
    gal_sec_title: "Anlık <em>Kareler</em>",
    gal_all_btn: "Galerinin Tamamına Git &rarr;",
    contact_label: "04 / İletişim",
    contact_title: "Bağlantı <em>Kurun</em>",
    contact_lead: "Proje fikri, teknik soru veya sadece merhaba — aşağıdaki kanallardan ulaşabilirsiniz.",
    footer_copy: "© 2026 Volkan Tuncer — Karabük Üniversitesi · Mekatronik Mühendisliği",
    footer_sys: "sistem aktif"
  },
  en: {
    nav_chip: "MCH · ENG",
    nav_home: "Home",
    nav_about: "About",
    nav_projects: "Projects",
    nav_gallery: "Gallery",
    nav_blog: "Blog",
    nav_contact: "Contact",
    hero_status: "SYSTEM ACTIVE &nbsp;—&nbsp; KARABUK UNIVERSITY",
    hero_desc: "Understanding circuits, writing code, connecting systems. Working at the intersection of hardware and software is both a profession and an instinct for me.",
    hero_btn1: "View Projects",
    hero_btn2: "Get in Touch &rarr;",
    about_label: "01 / About",
    about_title: "Who am <em>I?</em>",
    about_p1: "Ever since I was a kid, my curiosity about how things work has never stopped. Mechatronics engineering is the natural answer to this curiosity — working at the intersection of electronics, mechanics, and software feels both logical and natural to me.",
    about_p2: "My native language is Turkish, I speak good English, and I am learning German. I focus on Linux, SolidWorks, C, and Python. PCB design (KiCad), Arduino, Raspberry Pi, embedded C programming, and Telegram bot development are my core fields.",
    proj_sec_label: "02 / Projects (Summary)",
    proj_sec_title: "Featured <em>Works</em>",
    proj_all_btn: "View All Projects &rarr;",
    gal_sec_label: "03 / Gallery (Summary)",
    gal_sec_title: "Instant <em>Frames</em>",
    gal_all_btn: "Go to Full Gallery &rarr;",
    contact_label: "04 / Contact",
    contact_title: "Establish <em>Connection</em>",
    contact_lead: "Project ideas, technical questions, or just a hello — you can reach out via the channels below.",
    footer_copy: "© 2026 Volkan Tuncer — Karabuk University · Mechatronics Engineering",
    footer_sys: "system active"
  },
  de: {
    nav_chip: "MCH · ING",
    nav_home: "Startseite",
    nav_about: "Über mich",
    nav_projects: "Projekte",
    nav_gallery: "Galerie",
    nav_blog: "Blog",
    nav_contact: "Kontakt",
    hero_status: "SYSTEM AKTIV &nbsp;—&nbsp; UNIVERSITÄT KARABÜK",
    hero_desc: "Schaltungen verstehen, Code schreiben, Systeme verbinden. An der Schnittstelle von Hardware und Software zu arbeiten ist für mich Beruf und Instinkt zugleich.",
    hero_btn1: "Projekte Ansehen",
    hero_btn2: "Kontakt Aufnehmen &rarr;",
    about_label: "01 / Über mich",
    about_title: "Wer bin <em>ich?</em>",
    about_p1: "Schon als Kind war meine Neugier, wie Dinge funktionieren, ungestillt. Mechatronik-Ingenieurwesen ist die natürliche Antwort darauf — an der Schnittstelle von Elektronik, Mechanik und Software zu arbeiten fühlt sich logisch und natürlich an.",
    about_p2: "Meine Muttersprache ist Türkisch, ich spreche gut Englisch und lerne Deutsch. Ich arbeite schwerpunktmäßig mit Linux, SolidWorks, C und Python. PCB-Design (KiCad), Arduino, Raspberry Pi, Embedded C und Telegram-Bot-Entwicklung sind meine Kernbereiche.",
    proj_sec_label: "02 / Projekte (Zusammenfassung)",
    proj_sec_title: "Ausgewählte <em>Arbeiten</em>",
    proj_all_btn: "Alle Projekte Ansehen &rarr;",
    gal_sec_label: "03 / Galerie (Zusammenfassung)",
    gal_sec_title: "Schnappschüsse",
    gal_all_btn: "Zur Vollständigen Galerie &rarr;",
    contact_label: "04 / Kontakt",
    contact_title: "Verbindung <em>Herstellen</em>",
    contact_lead: "Projektideen, technische Fragen oder einfach Hallo — Sie erreichen mich über die folgenden Kanäle.",
    footer_copy: "© 2026 Volkan Tuncer — Universität Karabuk · Mechatronik",
    footer_sys: "system aktiv"
  },
  zh: {
    nav_chip: "机电 · 工程",
    nav_home: "主页",
    nav_about: "关于我",
    nav_projects: "项目",
    nav_gallery: "画廊",
    nav_blog: "博客",
    nav_contact: "联系",
    hero_status: "系统运行中 &nbsp;—&nbsp; 卡拉比克大学",
    hero_desc: "理解电路，编写代码，连接系统。在硬件和软件的交汇处工作对我而言既是职业也是本能。",
    hero_btn1: "查看项目",
    hero_btn2: "取得联系 &rarr;",
    about_label: "01 / 关于我",
    about_title: "我是 <em>谁？</em>",
    about_p1: "从小到大，我对事物运作原理的好奇心从未停止。机电工程正是这种好奇心的自然解答——在电子、机械和软件的交汇处工作对我来说既合乎逻辑又自然。",
    about_p2: "我的母语是土耳其语，英语流利，目前正在学习德语。我专注于 Linux、SolidWorks、C 和 Python。PCB设计 (KiCad)、Arduino、Raspberry Pi、嵌入式 C 编程以及 Telegram 机器人开发是我的核心领域。",
    proj_sec_label: "02 / 项目（摘要）",
    proj_sec_title: "精选 <em>作品</em>",
    proj_all_btn: "查看所有项目 &rarr;",
    gal_sec_label: "03 / 画廊（摘要）",
    gal_sec_title: "即时 <em>镜头</em>",
    gal_all_btn: "前往完整画廊 &rarr;",
    contact_label: "04 / 联系",
    contact_title: "建立 <em>连接</em>",
    contact_lead: "项目想法、技术问题或只是打个招呼——您可以通过以下渠道与我联系。",
    footer_copy: "© 2026 Volkan Tuncer — 卡拉比克大学 · 机电工程",
    footer_sys: "系统在线"
  }
};

function setLanguage(lang) {
  localStorage.setItem('lang', lang);
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[lang] && dict[lang][key]) el.innerHTML = dict[lang][key];
  });
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });
}

document.addEventListener('DOMContentLoaded', () => {
  document.body.addEventListener('click', e => {
    const btn = e.target.closest('.lang-btn');
    if (btn) setLanguage(btn.getAttribute('data-lang'));
  });
    const savedLang = localStorage.getItem('lang') || 'tr';
    setLanguage(savedLang);
});

/* ══════════════════════════════════════════
 * 6. TERMINAL & ARCADE MOTORU
 ═ **══*═══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  const termBody = document.querySelector('.hero-terminal .term-body');
  if (!termBody) return;

  termBody.querySelectorAll('.cursor-blink, .interactive-row').forEach(el => {
    const parentLine = el.closest('.tl');
    if (parentLine) parentLine.remove();
  });

    const inputRow = document.createElement('div');
    inputRow.className = 'tl interactive-row';
    inputRow.style.cssText = 'display:flex; align-items:center;';
    inputRow.innerHTML = `
    <span class="tl-prompt">volkan@kbu:~$</span>
    <div class="term-input-container" style="display:flex; align-items:center; flex:1; margin-left:6px; position:relative;">
    <span class="term-typed-text" style="color:var(--fg); font-family:var(--mono); font-size:0.7rem; white-space:pre;"></span>
    <span class="term-custom-cursor" style="display:inline-block; width:7px; height:13px; background:var(--cyan); margin-left:1px; vertical-align:text-bottom; box-shadow:0 0 10px var(--cyan); animation: cblink 1s step-start infinite;"></span>
    <input type="text" class="term-input" autofocus autocomplete="off" spellcheck="false" style="position:absolute; opacity:0; width:100%; height:100%; border:none; outline:none; cursor:text;" />
    </div>
    `;
    termBody.appendChild(inputRow);

    const inputField = inputRow.querySelector('.term-input');
    const typedTextSpan = inputRow.querySelector('.term-typed-text');
    let isTerminalLocked = false;

    termBody.addEventListener('click', () => { if (!isTerminalLocked) inputField.focus(); });
    inputField.addEventListener('input', () => { if (!isTerminalLocked) typedTextSpan.textContent = inputField.value; });

    inputField.addEventListener('keydown', (e) => {
      if (isTerminalLocked) { e.preventDefault(); return; }

      if (e.key === 'Enter') {
        const cmd = inputField.value.trim();
        const executedRow = document.createElement('div');
        executedRow.className = 'tl';
        executedRow.innerHTML = `<span class="tl-prompt">volkan@kbu:~$</span>&nbsp;<span class="tl-cmd" style="color:var(--fg);">${cmd}</span>`;
        termBody.insertBefore(executedRow, inputRow);

        const outputRow = document.createElement('div');
        outputRow.className = 'tl';
        outputRow.style.color = 'var(--fg2)';
        const lowerCmd = cmd.toLowerCase();

        if (lowerCmd === 'help') {
          outputRow.innerHTML = `<span class="tl-out">Komutlar: <span style="color:var(--amber)">contact, pacman, matrix, hack, whoami, skills, clear, reboot</span></span>`;
        } else if (lowerCmd === 'whoami') {
          outputRow.innerHTML = `<span class="tl-out">volkan_tuncer — Mekatronik Mühendisi</span>`;
        } else if (lowerCmd === 'skills') {
          outputRow.innerHTML = `<span class="tl-out">Linux (92%), Python (90%), SolidWorks (85%), KiCad (75%), C (65%)</span>`;
        } else if (lowerCmd === 'contact') {
          outputRow.innerHTML = `<span class="tl-ok">İletişim paneline gidiliyor...</span>`;
          setTimeout(() => { document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }); }, 400);
        } else if (lowerCmd === 'matrix') {
          outputRow.innerHTML = `<span class="tl-ok">Matrix protokolü çalıştırılıyor...</span>`;
          runMatrixRainSmooth();
        } else if (lowerCmd === 'hack') {
          isTerminalLocked = true;
          inputField.disabled = true;
          outputRow.innerHTML = `<span style="color:var(--red)">[ UYARI ] NASA ana sunucusuna sızılıyor... Uydu kodları indiriliyor...</span>`;
          termBody.insertBefore(outputRow, inputRow);
          termBody.scrollTop = termBody.scrollHeight;

          setTimeout(() => {
            const jokeRow = document.createElement('div');
            jokeRow.className = 'tl';
            jokeRow.style.color = 'var(--fg2)';
            jokeRow.innerHTML = `<span style="color:var(--amber)">[ BİLGİ ] Şaka şaka, sistem güvende! 🤖</span>`;
            termBody.insertBefore(jokeRow, inputRow);
            termBody.scrollTop = termBody.scrollHeight;
            isTerminalLocked = false;
            inputField.disabled = false;
            inputField.focus();
          }, 2500);

          inputField.value = '';
          typedTextSpan.textContent = '';
          return;
        } else if (lowerCmd === 'pacman') {
          outputRow.innerHTML = `<span class="tl-ok">Waka waka! Pacman avı başladı... 🟡</span>`;
          runBalancedPacman();
        } else if (lowerCmd === 'date') {
          outputRow.innerHTML = `<span class="tl-out">${new Date().toLocaleString()}</span>`;
        } else if (lowerCmd === 'clear') {
          termBody.querySelectorAll('.tl:not(.interactive-row)').forEach(el => el.remove());
          outputRow.remove();
        } else if (lowerCmd === 'reboot') {
          outputRow.innerHTML = `<span class="tl-ok">Sistem yeniden başlatılıyor...</span>`;
          setTimeout(() => location.reload(), 1000);
        } else if (cmd === '') {
          outputRow.remove();
        } else {
          outputRow.innerHTML = `<span style="color:var(--red)">Komut bulunamadı: ${cmd}, deneyebilirsiniz: help</span>`;
        }

        if (cmd !== 'clear' && cmd !== '') termBody.insertBefore(outputRow, inputRow);
        inputField.value = '';
        typedTextSpan.textContent = '';
        termBody.scrollTop = termBody.scrollHeight;
      }
    });

    function runMatrixRainSmooth() {
      const canvas = document.createElement('canvas');
      canvas.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:99999;pointer-events:none;transition:opacity 2s ease;opacity:1;';
      document.body.appendChild(canvas);

      const ctx = canvas.getContext('2d');
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^*()+-<>?アカサタナハマヤラワ';
      const fontSize = 16;
      const columns = canvas.width / fontSize;
      const rainDrops = new Array(Math.floor(columns)).fill(1);

      const matrixInterval = setInterval(() => {
        ctx.fillStyle = 'rgba(5, 7, 10, 0.08)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#00ff88';
        ctx.font = fontSize + 'px monospace';

        for (let i = 0; i < rainDrops.length; i++) {
          const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
          ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);
          if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975) rainDrops[i] = 0;
          rainDrops[i]++;
        }
      }, 30);

      setTimeout(() => {
        canvas.style.opacity = '0';
        setTimeout(() => { clearInterval(matrixInterval); canvas.remove(); }, 2000);
      }, 5000);
    }

    function runBalancedPacman() {
      const dotContainer = document.createElement('div');
      dotContainer.style.cssText = 'position:fixed;top:43vh;left:5vw;width:90vw;display:flex;justify-content:space-between;z-index:99997;pointer-events:none;';

      const dots = [];
      for (let i = 0; i < 25; i++) {
        const dot = document.createElement('span');
        dot.innerHTML = '·';
        dot.style.cssText = 'color:var(--amber);font-size:45px;text-shadow:0 0 10px var(--amber);';
        dotContainer.appendChild(dot);
        dots.push(dot);
      }
      document.body.appendChild(dotContainer);

      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'position:fixed;top:41vh;left:-180px;font-size:75px;z-index:99999;display:flex;align-items:center;gap:20px;pointer-events:none;transition:left 6s linear;';
      wrapper.innerHTML = `
      <span style="font-size:55px; filter:drop-shadow(0 0 10px #ff4444);">👻</span>
      <span class="pac-face" style="color:#ffb830; text-shadow:0 0 20px #ffb830; font-weight:bold; line-height:1;">C</span>
      `;
      document.body.appendChild(wrapper);

      const face = wrapper.querySelector('.pac-face');
      let isOpen = false;
      const chompTimer = setInterval(() => {
        face.innerHTML = isOpen ? 'O' : 'C';
        isOpen = !isOpen;
      }, 180);

      setTimeout(() => { wrapper.style.left = '105vw'; }, 50);

      const logicInterval = setInterval(() => {
        const pacRect = face.getBoundingClientRect();
        dots.forEach(dot => {
          const dotRect = dot.getBoundingClientRect();
          if (dotRect.right >= pacRect.left && dotRect.left <= pacRect.right) {
            dot.style.opacity = '0';
          }
        });
      }, 40);

      setTimeout(() => {
        clearInterval(chompTimer);
        clearInterval(logicInterval);
        wrapper.remove();
        dotContainer.remove();
      }, 6200);
    }
});

/* ══════════════════════════════════════════
 * 7. HEADER MECHA-BOT (SITELER ARASI OPTİMİZE)
 ═ **══*═══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('nav');
  if (!nav) return;

  document.querySelectorAll('.draggable-robot').forEach(el => el.remove());

  const robot = document.createElement('div');
  robot.className = 'draggable-robot';
  robot.style.cssText = 'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);z-index:300;cursor:grab;display:flex;flex-direction:column;align-items:center;user-select:none;';
  robot.innerHTML = `
  <div style="width: 12px; height: 2px; background: var(--amber); margin-bottom: 2px; box-shadow: 0 0 6px var(--amber);"></div>
  <div style="width: 38px; height: 26px; background: var(--surface); border: 1px solid var(--cyan); border-radius: 6px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 12px color-mix(in srgb, var(--cyan) 40%, transparent);">
  <div style="display: flex; gap: 6px;">
  <span class="r-eye" style="width: 6px; height: 6px; background: var(--cyan); border-radius: 50%; box-shadow: 0 0 8px var(--cyan);"></span>
  <span class="r-eye" style="width: 6px; height: 6px; background: var(--cyan); border-radius: 50%; box-shadow: 0 0 8px var(--cyan);"></span>
  </div>
  </div>
  <div style="font-family: var(--mono); font-size: 0.45rem; color: var(--fg3); margin-top: 2px; letter-spacing: 0.1em;">MECHA-BOT</div>
  `;

  nav.appendChild(robot);

  let eyeCenters = [];
  function updateEyeCenters() {
    const eyes = robot.querySelectorAll('.r-eye');
    eyeCenters = Array.from(eyes).map(eye => {
      const rect = eye.getBoundingClientRect();
      return { el: eye, x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    });
  }

  setTimeout(updateEyeCenters, 200);
  window.addEventListener('resize', updateEyeCenters, { passive: true });
  window.addEventListener('scroll', updateEyeCenters, { passive: true });

  let isDragging = false;
  let startX, startY, initialX, initialY;

  robot.addEventListener('mousedown', (e) => {
    isDragging = true;
    robot.style.cursor = 'grabbing';
    robot.style.transition = 'none';

    startX = e.clientX;
    startY = e.clientY;

    const rect = robot.getBoundingClientRect();
    const navRect = nav.getBoundingClientRect();

    initialX = rect.left - navRect.left;
    initialY = rect.top - navRect.top;

    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      robot.style.left = (initialX + dx) + 'px';
      robot.style.top = (initialY + dy) + 'px';
      robot.style.transform = 'none';
      return;
    }

    // Göz takibi optimizasyonu
    if (!eyeCenters.length) return;
    for (let i = 0; i < eyeCenters.length; i++) {
      const eye = eyeCenters[i];
      const angle = Math.atan2(e.clientY - eye.y, e.clientX - eye.x);
      const moveX = Math.cos(angle) * 2;
      const moveY = Math.sin(angle) * 2;
      eye.el.style.transform = `translate3d(${moveX}px, ${moveY}px, 0)`;
    }
  }, { passive: true });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      robot.style.cursor = 'grab';
      robot.style.transition = 'transform 0.3s ease';
      robot.style.transform = 'scale(1.1)';
      setTimeout(() => { robot.style.transform = 'none'; updateEyeCenters(); }, 200);
    }
  });
});
