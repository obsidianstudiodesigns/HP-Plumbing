(function () {
  var nav = document.querySelector('.nav');
  var burger = document.getElementById('burger');
  var links = document.getElementById('navLinks');

  function onScroll() { nav.classList.toggle('scrolled', window.scrollY > 20); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  function setMenu(open) {
    links.classList.toggle('open', open);
    nav.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  burger.addEventListener('click', function () { setMenu(!links.classList.contains('open')); });
  links.addEventListener('click', function (e) { if (e.target.tagName === 'A') setMenu(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });

  // Reveal on scroll
  var items = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el, i) {
      el.style.transitionDelay = (i % 4) * 70 + 'ms';
      io.observe(el);
    });
  } else {
    items.forEach(function (el) { el.classList.add('in'); });
  }

  // Quote form -> WhatsApp
  var form = document.getElementById('quoteForm');
  var error = document.getElementById('formError');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = form.elements;
    var name = f.name.value.trim();
    var phone = f.phone.value.trim();
    f.name.classList.toggle('invalid', !name);
    f.phone.classList.toggle('invalid', !phone);
    if (!name || !phone) { error.textContent = 'Please add your name and phone number.'; return; }
    error.textContent = '';
    var lines = [
      'Hi Pierre, I would like a quote from HP Plumbing.',
      '',
      'Name: ' + name,
      'Phone: ' + phone,
      f.suburb.value.trim() ? 'Suburb: ' + f.suburb.value.trim() : '',
      'Service: ' + f.service.value,
      f.message.value.trim() ? 'Details: ' + f.message.value.trim() : ''
    ].filter(function (l, i) { return l !== '' || i === 1; });
    window.open('https://wa.me/27827705064?text=' + encodeURIComponent(lines.join('\n')), '_blank', 'noopener');
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
