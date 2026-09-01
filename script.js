document.addEventListener('DOMContentLoaded', () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------
     Footer year
  --------------------------------------------------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------------------------------------------------
     Sticky navbar background on scroll
  --------------------------------------------------------- */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    if (window.scrollY > 12) {
      nav.classList.add('is-scrolled');
    } else {
      nav.classList.remove('is-scrolled');
    }
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------------------------------------------------------
     Mobile hamburger menu
  --------------------------------------------------------- */
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');

  const closeMenu = () => {
    navToggle.classList.remove('is-open');
    navLinks.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
    navToggle.setAttribute('aria-label', 'Open navigation menu');
  };

  const openMenu = () => {
    navToggle.classList.add('is-open');
    navLinks.classList.add('is-open');
    navToggle.setAttribute('aria-expanded', 'true');
    navToggle.setAttribute('aria-label', 'Close navigation menu');
  };

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.contains('is-open');
    isOpen ? closeMenu() : openMenu();
  });

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeMenu();
  });

  /* ---------------------------------------------------------
     Active nav link on scroll (scroll-spy)
  --------------------------------------------------------- */
  const sections = document.querySelectorAll('main section[id]');
  const navAnchors = document.querySelectorAll('.nav-links a');

  const spyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navAnchors.forEach((a) => {
            a.classList.toggle('is-active', a.getAttribute('href') === `#${id}`);
          });
        }
      });
    },
    { rootMargin: '-45% 0px -50% 0px', threshold: 0 }
  );
  sections.forEach((s) => spyObserver.observe(s));

  /* ---------------------------------------------------------
     Scroll reveal for section headings and cards
  --------------------------------------------------------- */
  const revealTargets = document.querySelectorAll(
    '.section-head, .skill-group, .project-card, .timeline-item, .edu-card, .cert-item, .about-body, .featured, .contact-grid'
  );

  if (prefersReducedMotion) {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
  } else {
    revealTargets.forEach((el) => el.classList.add('reveal'));

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealTargets.forEach((el) => revealObserver.observe(el));
  }

  /* ---------------------------------------------------------
     Project filter
  --------------------------------------------------------- */
  const filterButtons = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');
  const emptyState = document.getElementById('project-empty');

  filterButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      filterButtons.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');

      const filter = btn.dataset.filter;
      let visibleCount = 0;

      projectCards.forEach((card) => {
        const tags = card.dataset.tags || '';
        const matches = filter === 'all' || tags.includes(filter);
        card.classList.toggle('is-hidden', !matches);
        if (matches) visibleCount += 1;
      });

      emptyState.hidden = visibleCount !== 0;
    });
  });

  /* ---------------------------------------------------------
     Resume download fallback (no fake PDF is shipped)
  --------------------------------------------------------- */
  const resumeBtn = document.getElementById('resume-btn');
  const toast = document.getElementById('toast');
  let toastTimer;

  const showToast = (message) => {
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 3200);
  };

  if (resumeBtn) {
    resumeBtn.addEventListener('click', (e) => {
      fetch(resumeBtn.getAttribute('href'), { method: 'HEAD' })
        .then((res) => {
          if (!res.ok) throw new Error('missing');
        })
        .catch(() => {
          e.preventDefault();
          showToast('Resume coming soon — add resume.pdf to the assets folder to enable this button.');
        });
    });
  }

  /* ---------------------------------------------------------
     Hero canvas — subtle animated dot grid (signature moment)
  --------------------------------------------------------- */
  const canvas = document.getElementById('hero-canvas');
  if (canvas && !prefersReducedMotion) {
    const ctx = canvas.getContext('2d');
    let width, height, dots;
    const spacing = 42;

    const buildDots = () => {
      dots = [];
      const cols = Math.ceil(width / spacing) + 1;
      const rows = Math.ceil(height / spacing) + 1;
      for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
          dots.push({
            x: x * spacing,
            y: y * spacing,
            baseAlpha: Math.random() * 0.35 + 0.05,
            phase: Math.random() * Math.PI * 2,
          });
        }
      }
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildDots();
    };

    let start = null;
    const draw = (t) => {
      if (start === null) start = t;
      const elapsed = (t - start) / 1000;
      ctx.clearRect(0, 0, width, height);
      dots.forEach((d) => {
        const alpha = d.baseAlpha + Math.sin(elapsed * 0.6 + d.phase) * 0.08;
        ctx.fillStyle = `rgba(201, 168, 118, ${Math.max(alpha, 0)})`;
        ctx.beginPath();
        ctx.arc(d.x, d.y, 1.4, 0, Math.PI * 2);
        ctx.fill();
      });
      requestAnimationFrame(draw);
    };

    resize();
    requestAnimationFrame(draw);
    window.addEventListener('resize', resize, { passive: true });
  }
});
