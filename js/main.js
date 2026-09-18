(() => {
  const nav = document.getElementById('siteNav');
  const toggle = document.getElementById('navToggle');
  const menu = document.getElementById('mobileMenu');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  toggle.addEventListener('click', () => {
    const isOpen = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!isOpen));
    menu.classList.toggle('open', !isOpen);
  });

  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggle.setAttribute('aria-expanded', 'false');
      menu.classList.remove('open');
    });
  });

  // nav scrollspy: switch nav theme (dark/light) based on the scene behind it
  const scenes = document.querySelectorAll('.scene');
  if ('IntersectionObserver' in window && scenes.length) {
    const navSpy = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          nav.dataset.theme = entry.target.classList.contains('scene-navy') ? 'dark' : 'light';
        }
      });
    }, { rootMargin: '-1px 0px -97% 0px', threshold: 0 });
    scenes.forEach(scene => navSpy.observe(scene));
  }

  // scroll-triggered reveals: fades (.reveal), word-staggered statements (.stagger), project scenes (.project-reveal)
  const revealTargets = document.querySelectorAll('.reveal, .stagger, .project-reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -60px 0px' });
    revealTargets.forEach(el => io.observe(el));
  } else {
    revealTargets.forEach(el => el.classList.add('in-view'));
  }

  // project index count-up (00 -> target) as each case scene enters view
  const counters = document.querySelectorAll('.project-num[data-target]');
  if ('IntersectionObserver' in window && counters.length) {
    const countIo = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.target, 10);
        countIo.unobserve(el);
        if (reduceMotion) { el.textContent = el.dataset.target; return; }
        const duration = 500;
        const start = performance.now();
        const step = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const value = Math.round(progress * target);
          el.textContent = String(value).padStart(2, '0');
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.4 });
    counters.forEach(el => countIo.observe(el));
  }

  // hero: restrained scroll parallax on the visual panel
  const heroVisual = document.getElementById('heroVisual');
  if (heroVisual && !reduceMotion) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = Math.min(window.scrollY, 700);
        heroVisual.style.setProperty('--parallax', `${y * 0.06}px`);
        ticking = false;
      });
    }, { passive: true });
  }

  // project ghost numbers: subtle depth parallax as they drift through the viewport
  const ghostEls = document.querySelectorAll('.ghost-number, .ghost-number-vertical');
  if (ghostEls.length && !reduceMotion) {
    let ghostTicking = false;
    const updateGhosts = () => {
      const vh = window.innerHeight;
      ghostEls.forEach(el => {
        const rect = el.getBoundingClientRect();
        const progress = (rect.top + rect.height / 2 - vh / 2) / vh;
        el.style.setProperty('--gparallax', `${progress * -36}px`);
      });
      ghostTicking = false;
    };
    window.addEventListener('scroll', () => {
      if (ghostTicking) return;
      ghostTicking = true;
      requestAnimationFrame(updateGhosts);
    }, { passive: true });
    updateGhosts();
  }

  // project visuals: subtle cursor-follow tilt (pointer devices only)
  const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (supportsHover && !reduceMotion) {
    document.querySelectorAll('.project-visual').forEach(visual => {
      visual.addEventListener('pointermove', (e) => {
        const rect = visual.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width - 0.5;
        const py = (e.clientY - rect.top) / rect.height - 0.5;
        visual.style.setProperty('--rx', `${px * 6}deg`);
        visual.style.setProperty('--ry', `${py * -6}deg`);
      });
      visual.addEventListener('pointerleave', () => {
        visual.style.setProperty('--rx', '0deg');
        visual.style.setProperty('--ry', '0deg');
      });
    });
  }
})();
