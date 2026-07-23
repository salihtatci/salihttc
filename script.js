/* =====================================================================
   Salih Tatcı — Portfolyo etkileşimleri
   Saf Vanilla JS. Bağımlılık yok.
   ---------------------------------------------------------------------
   1. Reduced-motion kontrolü
   2. Scroll reveal (Intersection Observer)
   3. Hero parallax (rAF ile throttle)
   4. Sticky nav gölgesi
   5. Aktif menü linki (Intersection Observer)
   6. Mobil menü aç/kapat
   ===================================================================== */

(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------------------------------------------------------------
     2. SCROLL REVEAL
     [data-reveal] işaretli her öğe görünür alana girince .is-visible
     sınıfı eklenir. CSS geçişi ve --reveal-delay ile stagger yapılır.
  --------------------------------------------------------------- */
  const revealEls = document.querySelectorAll("[data-reveal]");

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    // Animasyon istenmiyorsa ya da destek yoksa hepsini anında göster
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            obs.unobserve(entry.target); // bir kez tetiklenir
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -8% 0px",
      }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  }

  /* ---------------------------------------------------------------
     3. HERO PARALLAX
     data-depth taşıyan katmanlar scroll'a göre hafifçe kayar.
     rAF ile performans dostu; reduced-motion'da kapalı.
  --------------------------------------------------------------- */
  const layers = document.querySelectorAll(".hero__layer[data-depth]");
  const hero = document.querySelector(".hero");

  if (!prefersReducedMotion && layers.length && hero) {
    let ticking = false;

    const applyParallax = () => {
      const y = window.scrollY;
      // Hero ekrandan çıktıysa hesaplama yapma
      if (y < hero.offsetHeight) {
        layers.forEach((layer) => {
          const depth = parseFloat(layer.getAttribute("data-depth")) || 0;
          layer.style.transform = "translate3d(0," + y * depth + "px,0)";
        });
      }
      ticking = false;
    };

    window.addEventListener(
      "scroll",
      () => {
        if (!ticking) {
          window.requestAnimationFrame(applyParallax);
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  /* ---------------------------------------------------------------
     4. STICKY NAV — kaydırınca arka plan/gölge
  --------------------------------------------------------------- */
  const nav = document.getElementById("nav");
  if (nav) {
    const onScroll = () => {
      nav.classList.toggle("scrolled", window.scrollY > 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------------------------------------------------------------
     5. AKTİF MENÜ LİNKİ
     Görünür bölüme karşılık gelen nav linki .active olur.
  --------------------------------------------------------------- */
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll('.nav__links a[href^="#"]');

  if (sections.length && navLinks.length && "IntersectionObserver" in window) {
    const linkByHash = {};
    navLinks.forEach((a) => {
      linkByHash[a.getAttribute("href")] = a;
    });

    const setActive = (id) => {
      navLinks.forEach((a) => a.classList.remove("active"));
      const active = linkByHash["#" + id];
      if (active) active.classList.add("active");
    };

    const spyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      {
        // Bölümün üst kısmı ekranın ortasına gelince aktifleşir
        rootMargin: "-45% 0px -50% 0px",
        threshold: 0,
      }
    );
    sections.forEach((s) => spyObserver.observe(s));
  }

  /* ---------------------------------------------------------------
     6. MOBİL MENÜ
  --------------------------------------------------------------- */
  const toggle = document.getElementById("navToggle");

  if (toggle && nav) {
    const closeMenu = () => {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    };

    toggle.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    // Menüden bir linke tıklayınca kapat
    nav.querySelectorAll(".nav__menu a").forEach((a) => {
      a.addEventListener("click", closeMenu);
    });

    // Dışarı tıklayınca / Esc ile kapat
    document.addEventListener("click", (e) => {
      if (nav.classList.contains("open") && !nav.contains(e.target)) {
        closeMenu();
      }
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
  }
  /* ---------------------------------------------------------------
     7. TEMA DEĞİŞTİRİCİ (koyu / açık)
     Tema, sayfa çizilmeden <head> içindeki satır içi betikle uygulanır.
     Burada yalnızca butonun davranışı ve kaydetme işi var.
     localStorage engelliyse sessizce devam eder (try/catch).
  --------------------------------------------------------------- */
  const themeBtn = document.getElementById("themeToggle");
  const root = document.documentElement;

  const temaKaydet = (t) => {
    try {
      localStorage.setItem("tema", t);
    } catch (e) {
      /* gizli sekme / depolama kapalı — sorun değil */
    }
  };

  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const yeni = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", yeni);
      temaKaydet(yeni);
    });
  }

  // Kullanıcı kendi seçimini yapmadıysa sistem temasını takip et
  try {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const sistemDegisti = (e) => {
      let kayitli = null;
      try {
        kayitli = localStorage.getItem("tema");
      } catch (err) {}
      if (!kayitli) root.setAttribute("data-theme", e.matches ? "dark" : "light");
    };
    if (mq.addEventListener) mq.addEventListener("change", sistemDegisti);
    else if (mq.addListener) mq.addListener(sistemDegisti); // eski tarayıcılar
  } catch (e) {}
})();
