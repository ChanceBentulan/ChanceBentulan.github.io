'use strict';

/* ------------------------------------------------------------
   Navbar: shadow on scroll + mobile menu toggle
------------------------------------------------------------ */
const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

const scrollProgress = document.getElementById('scrollProgress');
const toTop = document.getElementById('toTop');

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  nav.classList.toggle('is-scrolled', y > 10);

  // Scroll progress bar
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (y / docHeight) * 100 : 0;
  scrollProgress.style.width = pct + '%';

  // Back-to-top visibility
  toTop.classList.toggle('is-visible', y > 600);
}, { passive: true });

toTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('is-open');
  navToggle.classList.toggle('is-open', open);
  navToggle.setAttribute('aria-expanded', String(open));
});

// Close the mobile menu after tapping a link
navLinks.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('is-open');
    navToggle.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

/* ------------------------------------------------------------
   Reveal sections / cards on scroll
------------------------------------------------------------ */
const revealEls = document.querySelectorAll('.section, .card, .skills__group');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealEls.forEach((el) => observer.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('is-visible'));
}

/* ------------------------------------------------------------
   Hero: rotating role text
------------------------------------------------------------ */
const heroRotate = document.getElementById('heroRotate');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (heroRotate && !reduceMotion) {
  const phrases = [
    'full-stack web apps',
    'pixel-perfect UIs',
    'APIs & integrations',
    'production-ready apps',
  ];
  let i = 0;
  setInterval(() => {
    i = (i + 1) % phrases.length;
    heroRotate.classList.add('is-swapping');
    setTimeout(() => {
      heroRotate.textContent = phrases[i];
      heroRotate.classList.remove('is-swapping');
    }, 300);
  }, 2800);
}

/* ------------------------------------------------------------
   Projects: subtle 3D tilt toward the cursor (pointer devices only)
------------------------------------------------------------ */
if (!reduceMotion && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  const MAX_TILT = 7; // degrees
  document.querySelectorAll('.card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;   // 0 → 1
      const py = (e.clientY - r.top) / r.height;   // 0 → 1
      const rx = (0.5 - py) * MAX_TILT;
      const ry = (px - 0.5) * MAX_TILT;
      card.style.transform =
        `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ------------------------------------------------------------
   Contact: copy email to clipboard
------------------------------------------------------------ */
const copyEmail = document.getElementById('copyEmail');

if (copyEmail) {
  const defaultLabel = copyEmail.textContent.trim();
  copyEmail.addEventListener('click', async () => {
    const email = copyEmail.dataset.email;
    try {
      await navigator.clipboard.writeText(email);
    } catch (err) {
      // Fallback for browsers without the async clipboard API
      const tmp = document.createElement('textarea');
      tmp.value = email;
      document.body.appendChild(tmp);
      tmp.select();
      document.execCommand('copy');
      document.body.removeChild(tmp);
    }
    copyEmail.textContent = 'Copied to clipboard ✓';
    copyEmail.classList.add('is-copied');
    setTimeout(() => {
      copyEmail.textContent = defaultLabel;
      copyEmail.classList.remove('is-copied');
    }, 2000);
  });
}

/* ------------------------------------------------------------
   Scrollspy: highlight the nav link for the section in view
------------------------------------------------------------ */
const linkMap = new Map();
navLinks.querySelectorAll('a[href^="#"]').forEach((link) => {
  const section = document.querySelector(link.getAttribute('href'));
  if (section) linkMap.set(section, link);
});

function setActiveLink(active) {
  linkMap.forEach((link) => link.classList.toggle('is-active', link === active));
}

if ('IntersectionObserver' in window && linkMap.size) {
  const visible = new Set();
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) visible.add(entry.target);
      else visible.delete(entry.target);
    });
    // Of the sections currently on screen, highlight the topmost one.
    let topmost = null;
    visible.forEach((section) => {
      if (!topmost || section.offsetTop < topmost.offsetTop) topmost = section;
    });
    setActiveLink(topmost ? linkMap.get(topmost) : null);
  }, { rootMargin: '-45% 0px -45% 0px' });
  linkMap.forEach((_, section) => spy.observe(section));
}

