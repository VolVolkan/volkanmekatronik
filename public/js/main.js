document.addEventListener('DOMContentLoaded', () => {



  // Header ve mobil menüdeki anchor (#) linkleri için performanslı JS scroll
  document.querySelectorAll('a[href*="#"]').forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (!href) return;

      // Linki sayfa kısmı ve ID kısmı olarak böl (örn: "index.html" ve "about")
      const [pagePath, targetId] = href.split('#');

      // Geçerli sayfada mıyız kontrol et (href="#about" veya href="index.html#about")
      const isSamePage = !pagePath ||
      window.location.pathname.endsWith(pagePath) ||
      (pagePath === 'index.html' && (window.location.pathname === '/' || window.location.pathname === ''));

      if (isSamePage && targetId) {
        const targetElement = document.getElementById(targetId);

        // Hedef element sayfada varsa müdahale et
        if (targetElement) {
          e.preventDefault(); // Varsayılan CSS/HTML zıplamasını engelle

          // Terminaldeki aynı performanslı scroll fonksiyonu
          targetElement.scrollIntoView({ behavior: 'smooth' });

          // Mobil menü açıksa tıkladıktan sonra otomatik kapat
          const hamburger = document.getElementById('hamburger');
          const mobileMenu = document.getElementById('mobile-menu');
          if (hamburger && hamburger.classList.contains('open')) {
            hamburger.classList.remove('open');
            mobileMenu.classList.remove('open');
          }
        }
      }
    });
  });
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

  /* ══════════════════════════════════
   *    2. ÖZEL İMLEÇ & YILDIZ TOZU (STARDUST)
   * ══════════════════════════════════ */
  const isFine = window.matchMedia('(pointer: fine)').matches;
  let stardust = [];
  let cursorRAF = null;
  let spaceRAF = null;
  let scrollDepthRAF = null;

  if (isFine && document.getElementById('cur-wrap')) {
    const wrap = document.getElementById('cur-wrap');
    const dot  = document.getElementById('cur-dot');
    const ring = document.getElementById('cur-ring');
    const rc   = document.getElementById('cur-ripple-canvas');
    const rctx = rc.getContext('2d');

    const updateCanvasSize = () => {
      rc.width  = window.innerWidth;
      rc.height = window.innerHeight;
    };
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize, { passive: true });

    let mx = -200, my = -200, rx = -200, ry = -200, lastMx = -200, lastMy = -200;
    let isMouseDown = false;
    const MAX_PARTICLES = 90; // Performans: hızlı fare hareketinde patlamayı önle

    document.addEventListener('mousemove', e => {
      lastMx = mx; lastMy = my;
      mx = e.clientX; my = e.clientY;

      if (stardust.length < MAX_PARTICLES && (Math.abs(mx - lastMx) > 2 || Math.abs(my - lastMy) > 2)) {
        stardust.push({
          x: mx + (Math.random() - 0.5) * 10,
                      y: my + (Math.random() - 0.5) * 10,
                      size: Math.random() * 2 + 0.5,
                      life: 1,
                      decay: Math.random() * 0.03 + 0.015
        });
      }
    }, { passive: true });

    let canvasWasCleared = true; // Boşken tekrar tekrar clearRect çağırmamak için

    (function tick() {
      if (document.hidden) {
        cursorRAF = requestAnimationFrame(tick);
        return;
      }
      // GPU hızlandırmalı transform kullanımı (left/top yerine)
      dot.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%) scale(${isMouseDown ? 0.4 : 1})`;

      rx += (mx - rx) * 0.15;
      ry += (my - ry) * 0.15;
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%, -50%)`;

      // Performans: parçacık yoksa canvas zaten temizse tekrar çizim/temizleme yapma
      if (stardust.length === 0) {
        if (!canvasWasCleared) {
          rctx.clearRect(0, 0, rc.width, rc.height);
          canvasWasCleared = true;
        }
        cursorRAF = requestAnimationFrame(tick);
        return;
      }

      rctx.clearRect(0, 0, rc.width, rc.height);
      canvasWasCleared = false;
      const isLightMode = document.documentElement.getAttribute('data-theme') === 'light';
      const particleColor = wrap.classList.contains('hov')
      ? (isLightMode ? '184, 113, 10' : '255, 184, 48')
      : (isLightMode ? '0, 131, 163' : '0, 229, 255');

      for (let i = stardust.length - 1; i >= 0; i--) {
        const p = stardust[i];
        p.life -= p.decay;
        if (p.life <= 0) {
          stardust.splice(i, 1);
          continue;
        }
        p.y += 0.5;
        rctx.beginPath();
        rctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        rctx.fillStyle = `rgba(${particleColor}, ${p.life})`;
        rctx.fill();
      }

      cursorRAF = requestAnimationFrame(tick);
    })();

    // Event Delegation ile performanslı hover yönetimi
    // PERF: nav (header) hariç tutuluyor — navigasyon elemanlarının
    // hiçbirinde artık hiçbir JS tetiklemesi/durum değişikliği yok.
    const hoverSelectors = 'a, button, .proj-card, .c-card, .gi, .tag, .btn, .theme-toggle';
    document.body.addEventListener('mouseover', e => {
      if (e.target.closest('nav')) return;
      if (e.target.closest(hoverSelectors)) wrap.classList.add('hov');
    }, { passive: true });

      document.body.addEventListener('mouseout', e => {
        if (e.target.closest('nav')) return;
        if (e.target.closest(hoverSelectors)) wrap.classList.remove('hov');
      }, { passive: true });

        document.addEventListener('mousedown', () => { isMouseDown = true; }, { passive: true });
        document.addEventListener('mouseup', () => { isMouseDown = false; }, { passive: true });
  }

  /* ══════════════════════════════════════════
   *    3. NEFES ALAN YILDIZLAR (SPACE CANVAS)
   * ══════════════════════════════════════════ */
  const spaceCanvas = document.getElementById('space-canvas');
  if (spaceCanvas) {
    const sCtx = spaceCanvas.getContext('2d');
    let w = spaceCanvas.width = window.innerWidth;
    let h = spaceCanvas.height = window.innerHeight;

    function resizeSpace() {
      w = spaceCanvas.width = window.innerWidth;
      h = spaceCanvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeSpace, { passive: true });

    let scrollYPos = window.scrollY;
    window.addEventListener('scroll', () => { scrollYPos = window.scrollY; }, { passive: true });

    const starCount = 80; // Performans: iGPU'larda fill-rate maliyetini azaltmak için düşürüldü
    const stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * w,
                                                           y: Math.random() * h,
                                                           size: Math.random() * 2 + 0.5,
                                                           baseAlpha: Math.random() * 0.4 + 0.1,
                                                           speedMultiplier: Math.random() * 0.3 + 0.05,
                                                           twinkleSpeed: Math.random() * 0.0008 + 0.0003,
                                                           twinkleOffset: Math.random() * Math.PI * 2,
                                                           colorType: Math.random() > 0.85 ? 'amber' : (Math.random() > 0.7 ? 'cyan' : 'white')
    }));

    // Performans: pahalı radyal gradyanı her karede yeniden hesaplamak yerine
    // ayrı, hareket etmeyen bir arka plan katmanına önceden çiziyoruz.
    // Sadece boyut/tema/scroll gerçekten değiştiğinde yeniden üretilir.
    const bgCanvas = document.createElement('canvas');
    const bgCtx = bgCanvas.getContext('2d');
    let lastBgKey = '';

    function drawBackgroundLayer() {
      bgCanvas.width = w;
      bgCanvas.height = h;
      const isLightMode = document.documentElement.getAttribute('data-theme') === 'light';
      const bgGrad = bgCtx.createRadialGradient(
        w * 0.5, h * 0.3 + scrollYPos * 0.1, 50,
        w * 0.5, h * 0.5, Math.max(w, h)
      );
      if (isLightMode) { bgGrad.addColorStop(0, '#f8fafc'); bgGrad.addColorStop(1, '#e2e8f0'); }
      else { bgGrad.addColorStop(0, '#090e17'); bgGrad.addColorStop(0.5, '#05070a'); bgGrad.addColorStop(1, '#020305'); }
      bgCtx.fillStyle = bgGrad;
      bgCtx.fillRect(0, 0, w, h);
    }
    drawBackgroundLayer();

    // ~20fps hedefi + boşta tamamen durdurma: yıldız titreşimi çok yavaş
    // olduğu için göze fark etmez, ama canvas pikselleri değişmeyince
    // arkasındaki backdrop-filter (#about, hero-terminal vb.) da boşuna
    // yeniden hesaplanmaz — asıl sürekli "kasma" kaynağı buydu.
    const FRAME_INTERVAL = 1000 / 20;
    const IDLE_TIMEOUT = 2200; // ms — bu süre etkileşim olmazsa yıldızlar donar
    let lastFrameTime = 0;
    let isTabVisible = !document.hidden;
    let lastActivityTime = performance.now();
    const markSpaceActivity = () => { lastActivityTime = performance.now(); };
    window.addEventListener('scroll', markSpaceActivity, { passive: true });
    window.addEventListener('mousemove', markSpaceActivity, { passive: true });
    window.addEventListener('touchstart', markSpaceActivity, { passive: true });
    window.addEventListener('keydown', markSpaceActivity, { passive: true });

    function animateSpace(time) {
      spaceRAF = requestAnimationFrame(animateSpace);
      if (!isTabVisible) return;
      if (time - lastActivityTime > IDLE_TIMEOUT) return; // boşta: son kareyi koru, hiç çizme
      if (time - lastFrameTime < FRAME_INTERVAL) return;
      lastFrameTime = time;

      const isLightMode = document.documentElement.getAttribute('data-theme') === 'light';
      // Scroll'u kabaca 40px'lik adımlara yuvarlayarak gereksiz yeniden çizimi önle
      const bgKey = isLightMode + '|' + Math.round(scrollYPos / 40) + '|' + w + '|' + h;
      if (bgKey !== lastBgKey) {
        drawBackgroundLayer();
        lastBgKey = bgKey;
      }

      sCtx.clearRect(0, 0, w, h);
      sCtx.drawImage(bgCanvas, 0, 0);

      stars.forEach(star => {
        let currentY = (star.y - scrollYPos * star.speedMultiplier) % h;
        if (currentY < 0) currentY += h;

        const sineWave = (Math.sin(time * star.twinkleSpeed + star.twinkleOffset) + 1) / 2;
        const currentAlpha = star.baseAlpha + (sineWave * 0.6);

        let rgbCol = isLightMode ? '15, 23, 42' : '255, 255, 255';
        if (star.colorType === 'cyan') rgbCol = isLightMode ? '0, 131, 163' : '0, 229, 255';
        if (star.colorType === 'amber') rgbCol = isLightMode ? '184, 113, 10' : '255, 184, 48';

        sCtx.beginPath();
        sCtx.arc(star.x, currentY, star.size, 0, Math.PI * 2);
        sCtx.fillStyle = `rgba(${rgbCol}, ${currentAlpha})`;
        sCtx.fill();

        if (star.size > 1.2 && !isLightMode) {
          const glowSize = star.size + (sineWave * 3);
          sCtx.beginPath();
          sCtx.arc(star.x, currentY, glowSize * 2, 0, Math.PI * 2);
          sCtx.fillStyle = `rgba(${rgbCol}, ${currentAlpha * 0.15})`;
          sCtx.fill();
        }
      });
    }
    spaceRAF = requestAnimationFrame(animateSpace);

    document.addEventListener('visibilitychange', () => {
      isTabVisible = !document.hidden;
    });
  }

  /* ══════════════════════════════════════════
   *    4. SCROLL DEPTH / PARALLAX (SIFIR REFLOW)
   * ══════════════════════════════════════════ */
  const progressBar = document.querySelector('.scroll-progress span');
  const sideStars = document.querySelectorAll('.side-stars');
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

      sideStars.forEach((rail, index) => {
        const drift = visualScroll * (index === 0 ? 0.055 : -0.045);
        rail.style.transform = `translate3d(0, ${drift}px, 0)`;
      });

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
    if (cursorRAF) cancelAnimationFrame(cursorRAF);
    if (spaceRAF) cancelAnimationFrame(spaceRAF);
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
