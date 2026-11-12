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

  // project demo videos: open in a native dialog, always paused and muted until the viewer acts
  document.querySelectorAll('[data-video-dialog]').forEach(trigger => {
    const dialog = document.getElementById(trigger.dataset.videoDialog);
    const video = dialog.querySelector('video');
    trigger.addEventListener('click', () => {
      video.muted = true;
      dialog.showModal();
    });
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) dialog.close();
    });
    // load() stops playback and returns the player to its start and poster
    dialog.addEventListener('close', () => video.load());
  });

  // project galleries: real screens only, ordered as a product story
  const galleries = {
    receptionist: { title: 'Receptionist Demo screens', base: 'receptionist', shots: [
      ['Reception dashboard: today’s bookings, pending confirmations, and front-desk actions.', 'CareBridge Dental receptionist dashboard showing appointments, patient details, and guided front-desk workflows.'],
      ['Guided chat assistant: answers approved clinic questions, then starts a consultation request.', 'CareBridge Dental AI Appointment Assistant chat answering clinic hours and asking whether the patient has visited before.'],
      ['Voice call simulation: a Hinglish demo call beside what the clinic team would see.', 'AI Voice Receptionist call screen with a Hinglish transcript and a side panel showing workflow state and an offered callback.'],
      ['Doctor workspace: the next patient, today’s schedule, and arrival status.', 'Doctor workspace showing Dr. Anika Rao’s consultations today, the next demo patient, and the day’s appointment list.'],
      ['Doctor calendar: a week of open and booked consultation slots.', 'Weekly schedule for Dr. Anika Rao with available, pending, and confirmed slots from 2 to 8 November.'],
      ['Outcome: a booking request that stays pending until front-desk staff confirm it.', 'Chat confirmation showing a saved booking request with reference, visit, doctor, time, and pending status.']
    ] },
    'switch-on': { title: 'Switch On screens', base: 'switch-on', shots: [
      ['Landing experience: know the fault and the price before booking a repair.', 'Switch On landing page with the headline “Know the fault. Know the price.” beside a red octopus technician holding repair tools and devices.'],
      ['Estimate: choose a device and problem to see a base price and repair time.', 'Switch On “Start your repair” estimator with device and fault options and a phone screen estimate of ₹1,499.'],
      ['Service journey: five steps from describing the problem to delivery back home.', 'Red “Five steps. You stay home for all of them.” section listing the five numbered stages of a doorstep repair.'],
      ['Transparent pricing: every base price, on one page.', 'Switch On pricing page with a table of base prices by repair type and device, and a list of what each repair includes.'],
      ['Operations console: live bookings, revenue, delays, and repairs by status.', 'Switch On admin overview with operations and money metrics, a delayed repairs table, and repair counts by status.'],
      ['Partner network: verified repair shops, capacity, and technicians.', 'Switch On admin partners page listing verified repair shops with ratings, job capacity, supported devices, and technicians.']
    ] },
    zenith: { title: 'Zenith screens', base: 'zenith', shots: [
      ['Workspace: describe a startup idea and start validation.', 'Zenith workspace with the headline “Build products people actually want”, a startup idea input, and an eight-stage strategy journey.'],
      ['Strategy board: the next move, narrowed to three focused steps.', 'Zenith strategy board headed “Make the next move the right one” with three numbered steps and a 30-day focus panel.'],
      ['AI Founder Team: eight specialist agents across the workflow.', 'Zenith AI Founder Team page listing eight numbered agents, from research and competitors to the final report.'],
      ['Knowledge base: indexed playbooks that ground the agents.', 'Zenith knowledge base listing indexed market reports, startup frameworks, business models, and case studies.']
    ] },
    cafe: { title: 'Café Demo screens', base: 'cafe', shots: [
      ['Hero: a bold, food-first first impression.', 'Café landing page hero with the headline “Come hungry.” beside a toasted sandwich and floating ingredients.'],
      ['Ingredient story: tap a layer to see why it made the cut.', '“Built to crave.” section with a sandwich surrounded by cheese, lettuce, tomato, and chili ingredient labels.'],
      ['Menu: pick a craving across five food categories.', '“Pick your craving.” section with cards for sandwiches, burgers, fries, shakes, and pizza.'],
      ['Experience: the case for staying at the table.', '“More than a takeout counter.” section on a dark background beside photos of the café interior and food.']
    ] },
    dotfiles: { title: 'Linux Dotfiles screens', base: 'dotfiles', shots: [
      ['Daily workspace: tiled system monitor, terminal, browser, editor, and media.', 'Arch Linux Hyprland desktop with tiled terminal, system monitor, browser, editor, and music windows under a slim Waybar.'],
      ['App launcher: a minimal Wofi menu over the desktop.', 'Wofi application launcher open in the centre of a dark desktop with a chrome figure wallpaper.'],
      ['Control center: quick toggles, brightness, and pinned apps from Waybar.', 'Monochrome desktop wallpaper with a control center panel showing Wi-Fi, Bluetooth, audio, brightness, and pinned apps.'],
      ['Developer setup: system details in Kitty beside the browser.', 'Kitty terminal showing system information beside browser windows with the Linux-DotFiles repository and Hacker News.']
    ] },
    crm: { title: 'Internal CRM Workspace screens', path: 'assets/crm-demo', extension: 'png', thumbnails: false, shots: [
      ['CEO dashboard: tasks, growth pipeline, approvals, quality, and organisation signals in one role-specific view. Fictional demo data.', 'Dark Internal CRM Workspace CEO dashboard with task, growth pipeline, approval, quality, and organisation summaries.'],
      ['Task operations: a role-aware list of work, assignees, priority, status, and due dates. Fictional demo data.', 'Dark Internal CRM Workspace task list with projects, assignees, priorities, workflow statuses, and due dates.'],
      ['Quality overview: release readiness, defects by severity, and delivery risks for operational review. Fictional demo data.', 'Dark Internal CRM Workspace quality dashboard with release readiness, defect severity, and defect status charts.'],
      ['Defect management: audit-focused issue tracking with severity, ownership, status, and updated time. Fictional demo data.', 'Dark Internal CRM Workspace defects table with severity, status, project, assignee, and update columns.'],
      ['Growth pipeline: pipeline stages, follow-ups, proposals, and recorded outcomes. Fictional demo data.', 'Dark Internal CRM Workspace growth overview with pipeline, follow-up, proposal, and attribution metrics.'],
      ['Marketing operations: channel reach, content planning, campaigns, and recorded performance. Fictional demo data.', 'Dark Internal CRM Workspace marketing overview with channel reach, content status, campaign status, and outcome tables.'],
      ['Content calendar: a role-specific publishing schedule across LinkedIn, Instagram, and YouTube. Fictional demo data.', 'Dark Internal CRM Workspace content calendar with scheduled and published social content across multiple channels.'],
      ['Engineering operations: incidents, releases, and automation health in one operational view. Fictional demo data.', 'Dark Internal CRM Workspace engineering operations dashboard with incident severity, release completion, and automation status.']
    ] }
  };

  const galleryDialog = document.getElementById('project-gallery');
  const galleryImage = document.getElementById('project-gallery-image');
  const galleryThumbs = document.getElementById('project-gallery-thumbs');
  const galleryCounter = document.getElementById('project-gallery-counter');
  const galleryCaption = document.getElementById('project-gallery-caption');
  let activeGallery = null;
  let activeShot = 0;
  const shotPath = (n, suffix = '') => {
    if (activeGallery.path) return `${activeGallery.path}/${n + 1}${suffix}.${activeGallery.extension || 'webp'}`;
    return `assets/projects/portfolio/gallery/${activeGallery.base}-${n + 1}${suffix}.webp`;
  };
  const thumbnailPath = (n) => activeGallery.thumbnails === false ? shotPath(n) : shotPath(n, '-thumb');

  const showShot = (index) => {
    const total = activeGallery.shots.length;
    activeShot = (index + total) % total;
    const [caption, alt] = activeGallery.shots[activeShot];
    galleryImage.src = shotPath(activeShot);
    galleryImage.alt = alt;
    galleryCaption.textContent = caption;
    galleryCounter.textContent = `${activeShot + 1} / ${total}`;
    galleryThumbs.querySelectorAll('button').forEach((thumb, i) => {
      if (i === activeShot) {
        thumb.setAttribute('aria-current', 'true');
        thumb.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      } else {
        thumb.removeAttribute('aria-current');
      }
    });
    new Image().src = shotPath((activeShot + 1) % total);
  };

  document.querySelectorAll('[data-gallery]').forEach(trigger => {
    trigger.addEventListener('click', () => {
      activeGallery = galleries[trigger.dataset.gallery];
      document.getElementById('project-gallery-title').textContent = activeGallery.title;
      galleryThumbs.replaceChildren(...activeGallery.shots.map(([caption], i) => {
        const item = document.createElement('li');
        const thumb = document.createElement('button');
        const image = document.createElement('img');
        thumb.type = 'button';
        thumb.setAttribute('aria-label', `Screen ${i + 1}: ${caption}`);
        thumb.addEventListener('click', () => showShot(i));
        image.src = thumbnailPath(i);
        image.alt = '';
        image.loading = 'lazy';
        image.decoding = 'async';
        image.width = 88;
        image.height = 54;
        thumb.append(image);
        item.append(thumb);
        return item;
      }));
      galleryDialog.showModal();
      showShot(0);
    });
  });
  galleryDialog.querySelector('.gallery-nav--prev').addEventListener('click', () => showShot(activeShot - 1));
  galleryDialog.querySelector('.gallery-nav--next').addEventListener('click', () => showShot(activeShot + 1));
  galleryDialog.addEventListener('click', (e) => {
    if (e.target === galleryDialog) galleryDialog.close();
  });
  galleryDialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') showShot(activeShot - 1);
    if (e.key === 'ArrowRight') showShot(activeShot + 1);
  });

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
