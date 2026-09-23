(function () {
  var nav = document.querySelector('.nav');
  var burger = document.getElementById('burger');
  var links = document.getElementById('navLinks');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Solid nav once the top sentinel leaves the viewport (no scroll listener)
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (e) {
      nav.classList.toggle('solid', !e[0].isIntersecting);
    }, { rootMargin: '40px 0px 0px 0px' }).observe(document.querySelector('.sentinel'));
  } else {
    nav.classList.add('solid');
  }

  // Mobile menu
  function setMenu(open) {
    links.classList.toggle('open', open);
    nav.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  burger.addEventListener('click', function () { setMenu(!links.classList.contains('open')); });
  links.addEventListener('click', function (e) { if (e.target.tagName === 'A') setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  // Reveal on scroll, staggered within each parent
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) {
      var i = Array.prototype.indexOf.call(el.parentNode.children, el);
      el.style.setProperty('--rd', Math.min(i, 5) * 70 + 'ms');
      io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  // Shield tilt follows the pointer (desktop, motion allowed)
  var tilt = document.querySelector('.tilt');
  if (tilt && !reduce && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    var hero = document.querySelector('.hero');
    var frame = 0;
    hero.addEventListener('pointermove', function (e) {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(function () {
        var r = hero.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width - 0.5;
        var y = (e.clientY - r.top) / r.height - 0.5;
        tilt.style.transform = 'rotateY(' + (x * 18).toFixed(2) + 'deg) rotateX(' + (-y * 14).toFixed(2) + 'deg)';
      });
    });
    hero.addEventListener('pointerleave', function () { tilt.style.transform = ''; });
  }

  // Hero film: loads after the page, skipped for reduced motion or data saver,
  // pauses off-screen, and has a visible pause control (WCAG 2.2.2)
  var video = document.querySelector('.hero-video');
  var vBtn = document.getElementById('videoToggle');
  var saveData = navigator.connection && navigator.connection.saveData;
  if (video && vBtn && !reduce && !saveData) {
    var userPaused = false;
    video.src = window.matchMedia('(max-width: 800px)').matches ? 'assets/video/hero-720.mp4' : 'assets/video/hero-1080.mp4';
    video.addEventListener('playing', function () { video.classList.add('on'); }, { once: true });
    var tryPlay = function () { var p = video.play(); if (p && p.catch) p.catch(function () {}); };
    tryPlay();
    vBtn.hidden = false;
    vBtn.addEventListener('click', function () {
      userPaused = !video.paused ? true : false;
      if (userPaused) video.pause(); else tryPlay();
      vBtn.setAttribute('aria-pressed', String(userPaused));
      vBtn.setAttribute('aria-label', userPaused ? 'Play background video' : 'Pause background video');
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (e) {
        if (userPaused) return;
        if (e[0].isIntersecting) tryPlay(); else video.pause();
      }).observe(document.querySelector('.hero'));
    }
  }

  // Theme toggle: follows the OS until the visitor picks, then remembers the choice
  var root = document.documentElement;
  var themeBtn = document.getElementById('themeToggle');
  var osDark = window.matchMedia('(prefers-color-scheme: dark)');
  function current() { return root.getAttribute('data-theme') || (osDark.matches ? 'dark' : 'light'); }
  function label() { themeBtn.setAttribute('aria-label', current() === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'); }
  if (themeBtn) {
    label();
    themeBtn.addEventListener('click', function () {
      var next = current() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('hp-theme', next); } catch (e) {}
      label();
    });
    osDark.addEventListener && osDark.addEventListener('change', label);
  }

  // Pause control for the suburb marquee (WCAG 2.2.2)
  var toggle = document.getElementById('marqueeToggle');
  var marquee = document.getElementById('areaMarquee');
  if (toggle && marquee) {
    toggle.addEventListener('click', function () {
      var paused = toggle.getAttribute('aria-pressed') !== 'true';
      toggle.setAttribute('aria-pressed', String(paused));
      toggle.querySelector('span').textContent = paused ? 'Play' : 'Pause';
      marquee.classList.toggle('paused', paused);
    });
  }

  // Quote form opens WhatsApp with details filled in
  var form = document.getElementById('quoteForm');
  var error = document.getElementById('formError');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements;
    var name = f.name.value.trim();
    var phone = f.phone.value.trim();
    f.name.classList.toggle('invalid', !name);
    f.phone.classList.toggle('invalid', !phone);
    f.name.setAttribute('aria-invalid', String(!name));
    f.phone.setAttribute('aria-invalid', String(!phone));
    if (!name || !phone) {
      error.textContent = 'Please add your name and phone number so Pierre can get back to you.';
      (name ? f.phone : f.name).focus();
      return;
    }
    error.textContent = '';
    var lines = ['Hi Pierre, I would like a quote from HP Plumbing.', '', 'Name: ' + name, 'Phone: ' + phone];
    if (f.suburb.value.trim()) lines.push('Suburb: ' + f.suburb.value.trim());
    lines.push('Service: ' + f.service.value);
    if (f.message.value.trim()) lines.push('Details: ' + f.message.value.trim());
    window.open('https://wa.me/27827705064?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
