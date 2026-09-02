



document.addEventListener('DOMContentLoaded', () => {
    // Reveal Animasyonları
    const io = new IntersectionObserver( entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('vis'); }), { threshold: 0.1 } );
    document.querySelectorAll('.reveal').forEach(el => io.observe(el));

    /* ══════════════════════════════════
       ÖZEL İMLEÇ & YILDIZ TOZU (STARDUST)
    ══════════════════════════════════ */
    const isFine = window.matchMedia('(pointer: fine)').matches;
    let stardust = [];

    if (isFine && document.getElementById('cur-wrap')) {
      const wrap = document.getElementById('cur-wrap');
      const dot  = document.getElementById('cur-dot');
      const ring = document.getElementById('cur-ring');
      const rc   = document.getElementById('cur-ripple-canvas');
      const rctx = rc.getContext('2d');

      rc.width  = window.innerWidth;
      rc.height = window.innerHeight;
      window.addEventListener('resize', () => { rc.width = window.innerWidth; rc.height = window.innerHeight; });

      let mx = -200, my = -200, rx = -200, ry = -200, lastMx = -200, lastMy = -200;
      document.addEventListener('mousemove', e => {
        lastMx = mx; lastMy = my;
        mx = e.clientX; my = e.clientY;

        if(Math.abs(mx - lastMx) > 2 || Math.abs(my - lastMy) > 2) {
            stardust.push({
                x: mx + (Math.random() - 0.5) * 10,
                y: my + (Math.random() - 0.5) * 10,
                size: Math.random() * 2 + 0.5,
                life: 1,
                decay: Math.random() * 0.03 + 0.015
            });
        }
      });

      (function tick() {
        dot.style.left  = mx + 'px';
        dot.style.top   = my + 'px';
        rx += (mx - rx) * 0.15;
        ry += (my - ry) * 0.15;
        ring.style.left = rx + 'px';
        ring.style.top  = ry + 'px';

        rctx.clearRect(0, 0, rc.width, rc.height);
        const isLightMode = document.documentElement.getAttribute('data-theme') === 'light';
        const particleColor = wrap.classList.contains('hov') ? (isLightMode ? '184, 113, 10' : '255, 184, 48') : (isLightMode ? '0, 131, 163' : '0, 229, 255');

        stardust = stardust.filter(p => p.life > 0);
        stardust.forEach(p => {
            p.life -= p.decay;
            p.y += 0.5; 
            rctx.beginPath();
            rctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            rctx.fillStyle = `rgba(${particleColor}, ${p.life})`;
            rctx.fill();
        });

        requestAnimationFrame(tick);
      })();

      // Hover olayları için dinleyicileri gecikmeli ekle (Web components yüklensin diye)
      setTimeout(() => {
          document.querySelectorAll('a, button, .proj-card, .c-card, .gi, .tag, .btn, .theme-toggle').forEach(el => {
            el.addEventListener('mouseenter', () => wrap.classList.add('hov'));
            el.addEventListener('mouseleave', () => wrap.classList.remove('hov'));
          });
      }, 500);

      document.addEventListener('mousedown', () => {
        dot.style.transform = 'translate(-50%,-50%) scale(0.4)';
        setTimeout(() => { dot.style.transform = 'translate(-50%,-50%) scale(1)'; }, 120);
      });
    }

    /* ══════════════════════════════════════════
       NEFES ALAN YILDIZLAR
    ══════════════════════════════════════════ */
    const spaceCanvas = document.getElementById('space-canvas');
    if(spaceCanvas) {
        const sCtx = spaceCanvas.getContext('2d');
        function resizeSpace() { spaceCanvas.width = window.innerWidth; spaceCanvas.height = window.innerHeight; }
        resizeSpace();
        window.addEventListener('resize', resizeSpace);

        let scrollYPos = window.scrollY;
        window.addEventListener('scroll', () => { scrollYPos = window.scrollY; }, { passive: true });

        let stars = [];
        const starCount = 150;
        for (let i = 0; i < starCount; i++) {
          stars.push({
            x: Math.random() * spaceCanvas.width,
            y: Math.random() * spaceCanvas.height,
            size: Math.random() * 2 + 0.5,
            baseAlpha: Math.random() * 0.4 + 0.1,
            speedMultiplier: Math.random() * 0.3 + 0.05,
            twinkleSpeed: Math.random() * 0.0008 + 0.0003,
            twinkleOffset: Math.random() * Math.PI * 2,
            colorType: Math.random() > 0.85 ? 'amber' : (Math.random() > 0.7 ? 'cyan' : 'white')
          });
        }

        function animateSpace(time) {
          sCtx.clearRect(0, 0, spaceCanvas.width, spaceCanvas.height);
          const isLightMode = document.documentElement.getAttribute('data-theme') === 'light';

          const bgGrad = sCtx.createRadialGradient(
            spaceCanvas.width * 0.5, spaceCanvas.height * 0.3 + scrollYPos * 0.1, 50,
            spaceCanvas.width * 0.5, spaceCanvas.height * 0.5, Math.max(spaceCanvas.width, spaceCanvas.height)
          );
          if (isLightMode) { bgGrad.addColorStop(0, '#f8fafc'); bgGrad.addColorStop(1, '#e2e8f0'); }
          else { bgGrad.addColorStop(0, '#090e17'); bgGrad.addColorStop(0.5, '#05070a'); bgGrad.addColorStop(1, '#020305'); }
          sCtx.fillStyle = bgGrad;
          sCtx.fillRect(0, 0, spaceCanvas.width, spaceCanvas.height);

          stars.forEach(star => {
            let currentY = (star.y - scrollYPos * star.speedMultiplier) % spaceCanvas.height;
            if (currentY < 0) currentY += spaceCanvas.height;

            const sineWave = (Math.sin(time * star.twinkleSpeed + star.twinkleOffset) + 1) / 2;
            const currentAlpha = star.baseAlpha + (sineWave * 0.6);
            const glowSize = star.size + (sineWave * 3);

            sCtx.beginPath();
            sCtx.arc(star.x, currentY, star.size, 0, Math.PI * 2);

            let rgbCol = isLightMode ? '15, 23, 42' : '255, 255, 255';
            if (star.colorType === 'cyan') rgbCol = isLightMode ? '0, 131, 163' : '0, 229, 255';
            if (star.colorType === 'amber') rgbCol = isLightMode ? '184, 113, 10' : '255, 184, 48';

            sCtx.fillStyle = `rgba(${rgbCol}, ${currentAlpha})`;
            sCtx.fill();

            if (star.size > 1.2 && !isLightMode) {
              sCtx.beginPath();
              sCtx.arc(star.x, currentY, glowSize * 2, 0, Math.PI * 2);
              sCtx.fillStyle = `rgba(${rgbCol}, ${currentAlpha * 0.15})`;
              sCtx.fill();
            }
          });
          requestAnimationFrame(animateSpace);
        }
        requestAnimationFrame(animateSpace);
    }

    /* ══════════════════════════════════════════
       SCROLL DEPTH / PARALLAX
    ══════════════════════════════════════════ */
    const progressBar = document.querySelector('.scroll-progress span');
    const sideStars = document.querySelectorAll('.side-stars');
    const motionOK = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let targetScroll = window.scrollY;
    let visualScroll = window.scrollY;

    function updateScrollMotion() {
      targetScroll = window.scrollY;
      const doc = document.documentElement;
      const maxScroll = Math.max(1, doc.scrollHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, targetScroll / maxScroll));
      if (progressBar) progressBar.style.height = (progress * 100) + '%';
    }

    window.addEventListener('scroll', updateScrollMotion, { passive: true });
    window.addEventListener('resize', updateScrollMotion);
    updateScrollMotion();

    if (motionOK) {
      const parallaxSections = [...document.querySelectorAll('.section')];
      function animateScrollDepth() {
        visualScroll += (targetScroll - visualScroll) * 0.075;
        parallaxSections.forEach(section => {
          const rect = section.getBoundingClientRect();
          const center = rect.top + rect.height / 2;
          const distance = center - window.innerHeight / 2;
          const shift = Math.max(-14, Math.min(14, -distance * 0.012));
          section.style.transform = `translate3d(0, ${shift}px, 0)`;
        });
        sideStars.forEach((rail, index) => {
          const drift = visualScroll * (index === 0 ? 0.055 : -0.045);
          rail.style.transform = `translate3d(0, ${drift}px, 0)`;
        });
        requestAnimationFrame(animateScrollDepth);
      }
      requestAnimationFrame(animateScrollDepth);
    }
});
/* ══════════════════════════════════════════
 K APSA*MLI ÇEVİRİ SÖZLÜĞÜ (İÇERİK + MASTER)
 ══════════════════════════════════════════ */
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
    if (dict[lang] && dict[lang][key]) {
      el.innerHTML = dict[lang][key];
    }
  });

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
  });
}

setTimeout(() => {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => setLanguage(e.target.getAttribute('data-lang')));
  });

  const savedLang = localStorage.getItem('lang') || 'tr';
  setLanguage(savedLang);
}, 150);


/* ══════════════════════════════════════════
   KUSURSUZ VE HIZI AYarlanMış ARCADE MOTORU
══════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  const termBody = document.querySelector('.hero-terminal .term-body');
  if (!termBody) return;

  termBody.querySelectorAll('.cursor-blink, .interactive-row').forEach(el => {
    const parentLine = el.closest('.tl');
    if (parentLine) parentLine.remove();
  });

  const inputRow = document.createElement('div');
  inputRow.className = 'tl interactive-row';
  inputRow.style.display = 'flex';
  inputRow.style.alignItems = 'center';
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

  termBody.addEventListener('click', () => {
    if (!isTerminalLocked) inputField.focus();
  });

  inputField.addEventListener('input', () => {
    if (!isTerminalLocked) typedTextSpan.textContent = inputField.value;
  });

  inputField.addEventListener('keydown', (e) => {
    if (isTerminalLocked) {
      e.preventDefault();
      return;
    }

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
      }
      else if (lowerCmd === 'whoami') {
        outputRow.innerHTML = `<span class="tl-out">volkan_tuncer — Mekatronik Mühendisi</span>`;
      }
      else if (lowerCmd === 'skills') {
        outputRow.innerHTML = `<span class="tl-out">Linux (92%), Python (90%), SolidWorks (85%), KiCad (75%), C (65%)</span>`;
      }
      else if (lowerCmd === 'contact') {
        outputRow.innerHTML = `<span class="tl-ok">İletişim paneline gidiliyor...</span>`;
        setTimeout(() => { document.getElementById('contact').scrollIntoView({ behavior: 'smooth' }); }, 400);
      }
      else if (lowerCmd === 'matrix') {
        outputRow.innerHTML = `<span class="tl-ok">Matrix protokolü çalıştırılıyor...</span>`;
        runMatrixRainSmooth();
      }
      else if (lowerCmd === 'hack') {
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
      }
      else if (lowerCmd === 'pacman') {
        outputRow.innerHTML = `<span class="tl-ok">Waka waka! Pacman avı başladı... 🟡</span>`;
        runBalancedPacman();
      }
      else if (lowerCmd === 'date') {
        outputRow.innerHTML = `<span class="tl-out">${new Date().toLocaleString()}</span>`;
      }
      else if (lowerCmd === 'clear') {
        termBody.querySelectorAll('.tl:not(.interactive-row)').forEach(el => el.remove());
        outputRow.remove();
      }
      else if (lowerCmd === 'reboot') {
        outputRow.innerHTML = `<span class="tl-ok">Sistem yeniden başlatılıyor...</span>`;
        setTimeout(() => location.reload(), 1000);
      }
      else if (cmd === '') {
        outputRow.remove();
      }
      else {
        outputRow.innerHTML = `<span style="color:var(--red)">Komut bulunamadı: ${cmd}, deneyebilirsiniz: help</span>`;
      }

      if (cmd !== 'clear' && cmd !== '') {
        termBody.insertBefore(outputRow, inputRow);
      }

      inputField.value = '';
      typedTextSpan.textContent = '';
      termBody.scrollTop = termBody.scrollHeight;
    }
  });

  // MATRIX YAĞMURU
  function runMatrixRainSmooth() {
    const canvas = document.createElement('canvas');
    canvas.style.position = 'fixed';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = '99999';
    canvas.style.pointerEvents = 'none';
    canvas.style.transition = 'opacity 2s ease';
    canvas.style.opacity = '1';
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^*()+-<>?アカサタナハマヤラワ';
    const fontSize = 16;
    const columns = canvas.width / fontSize;
    const rainDrops = [];

    for (let x = 0; x < columns; x++) rainDrops[x] = 1;

    const matrixInterval = setInterval(() => {
      ctx.fillStyle = 'rgba(5, 7, 10, 0.08)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#00ff88';
      ctx.font = fontSize + 'px monospace';

      for (let i = 0; i < rainDrops.length; i++) {
        const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        ctx.fillText(text, i * fontSize, rainDrops[i] * fontSize);

        if (rainDrops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          rainDrops[i] = 0;
        }
        rainDrops[i]++;
      }
    }, 30);

    setTimeout(() => {
      canvas.style.opacity = '0';
      setTimeout(() => {
        clearInterval(matrixInterval);
        canvas.remove();
      }, 2000);
    }, 5000);
  }

  // İDEAL HIZDA, HİZALI VE DÜZGÜN PACMAN
  function runBalancedPacman() {
    // 1. Noktaları tam aynı hizada oluştur
    const dotContainer = document.createElement('div');
    dotContainer.style.position = 'fixed';
    dotContainer.style.top = '43vh';
    dotContainer.style.left = '5vw';
    dotContainer.style.width = '90vw';
    dotContainer.style.display = 'flex';
    dotContainer.style.justifyContent = 'space-between';
    dotContainer.style.zIndex = '99997';
    dotContainer.style.pointerEvents = 'none';

    let dots = [];
    for (let i = 0; i < 25; i++) {
      const dot = document.createElement('span');
      dot.innerHTML = '·';
      dot.style.color = 'var(--amber)';
      dot.style.fontSize = '45px';
      dot.style.textShadow = '0 0 10px var(--amber)';
      dotContainer.appendChild(dot);
      dots.push(dot);
    }
    document.body.appendChild(dotContainer);

    // 2. Pacman ve Hayalet (Hızı düşürüldü, geçiş süresi 6 saniye yapıldı)
    const wrapper = document.createElement('div');
    wrapper.style.position = 'fixed';
    wrapper.style.top = '41vh';
    wrapper.style.left = '-180px';
    wrapper.style.fontSize = '75px';
    wrapper.style.zIndex = '99999';
    wrapper.style.display = 'flex';
    wrapper.style.alignItems = 'center';
    wrapper.style.gap = '20px';
    wrapper.style.pointerEvents = 'none';
    wrapper.style.transition = 'left 6s linear'; // Daha dengeli ve keyifli hız

    wrapper.innerHTML = `
      <span style="font-size:55px; filter:drop-shadow(0 0 10px #ff4444);">👻</span>
      <span class="pac-face" style="color:#ffb830; text-shadow:0 0 20px #ffb830; font-weight:bold; line-height:1;">C</span>
    `;
    document.body.appendChild(wrapper);

    const face = wrapper.querySelector('.pac-face');
    let isOpen = false;
    let chompTimer = setInterval(() => {
      face.innerHTML = isOpen ? 'O' : 'C';
      isOpen = !isOpen;
    }, 180);

    setTimeout(() => {
      wrapper.style.left = '105vw';
    }, 50);

    // Nokta yutma hassasiyeti
    let logicInterval = setInterval(() => {
      const pacRect = face.getBoundingClientRect();
      dots.forEach(dot => {
        const dotRect = dot.getBoundingClientRect();
        if (dotRect.right >= pacRect.left && dotRect.left <= pacRect.right) {
          dot.style.opacity = '0';
        }
      });
    }, 30);

    setTimeout(() => {
      clearInterval(chompTimer);
      clearInterval(logicInterval);
      wrapper.remove();
      dotContainer.remove();
    }, 6200);
  }
});

/* ══════════════════════════════════════════
 * HEADER ORTASINDA İNTERAKTİF MECHA-BOT
 ═ ══*═══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('nav');
  if (!nav) return;

  // Eski robotları temizle
  document.querySelectorAll('.draggable-robot').forEach(el => el.remove());

  // Robot Elementi (Header ortasında)
  const robot = document.createElement('div');
  robot.className = 'draggable-robot';
  robot.style.position = 'absolute';
  robot.style.left = '50%';
  robot.style.top = '50%';
  robot.style.transform = 'translate(-50%, -50%)';
  robot.style.zIndex = '300';
  robot.style.cursor = 'grab';
  robot.style.display = 'flex';
  robot.style.flexDirection = 'column';
  robot.style.alignItems = 'center';
  robot.style.userSelect = 'none';
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
    if (!isDragging) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    robot.style.left = (initialX + dx) + 'px';
    robot.style.top = (initialY + dy) + 'px';
    robot.style.transform = 'none'; // Sürüklerken ortalama transformunu kaldır
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      robot.style.cursor = 'grab';
      robot.style.transition = 'transform 0.3s ease';
      robot.style.transform = 'scale(1.1)';
      setTimeout(() => { robot.style.transform = 'none'; }, 200);
    }
  });

  // Gözlerin fareyi takip etmesi
  document.addEventListener('mousemove', (e) => {
    const eyes = robot.querySelectorAll('.r-eye');
    eyes.forEach(eye => {
      const rect = eye.getBoundingClientRect();
      const eyeX = rect.left + rect.width / 2;
      const eyeY = rect.top + rect.height / 2;
      const angle = Math.atan2(e.clientY - eyeY, e.clientX - eyeX);
      const moveX = Math.cos(angle) * 2;
      const moveY = Math.sin(angle) * 2;
      eye.style.transform = `translate(${moveX}px, ${moveY}px)`;
    });
  });
});
