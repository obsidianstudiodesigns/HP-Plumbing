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
