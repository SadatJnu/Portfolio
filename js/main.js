(function () {
  var root = document.documentElement;

  /* ---------- theme (light/dark) ---------- */
  var themeBtn = document.getElementById('themeBtn');
  var savedTheme = localStorage.getItem('sa-theme');
  if (savedTheme) root.setAttribute('data-theme', savedTheme);
  function currentTheme() {
    return root.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light');
  }
  function applyThemeIcon() {
    var t = currentTheme();
    themeBtn.querySelector('.i-sun').style.display = t === 'dark' ? 'block' : 'none';
    themeBtn.querySelector('.i-moon').style.display = t === 'dark' ? 'none' : 'block';
  }
  applyThemeIcon();
  themeBtn.addEventListener('click', function () {
    var next = currentTheme() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('sa-theme', next);
    applyThemeIcon();
  });

  /* ---------- accent color switcher ---------- */
  var accentDock = document.getElementById('accentDock');
  var accentBtn = document.getElementById('accentBtn');
  var savedAccent = localStorage.getItem('sa-accent');
  if (savedAccent) root.setAttribute('data-accent', savedAccent);
  document.querySelectorAll('.swatch').forEach(function (sw) {
    if (sw.dataset.a === (savedAccent || 'indigo')) sw.classList.add('active');
    sw.addEventListener('click', function () {
      document.querySelectorAll('.swatch').forEach(function (s) { s.classList.remove('active'); });
      sw.classList.add('active');
      root.setAttribute('data-accent', sw.dataset.a);
      localStorage.setItem('sa-accent', sw.dataset.a);
    });
  });
  if (accentDock && accentBtn) {
    accentBtn.addEventListener('click', function (e) { e.stopPropagation(); accentDock.classList.toggle('open'); });
    document.addEventListener('click', function (e) { if (!accentDock.contains(e.target)) accentDock.classList.remove('open'); });
  }

  /* ---------- mobile menu ---------- */
  var menuBtn = document.getElementById('menuBtn');
  var navLinks = document.getElementById('navLinks');
  if (menuBtn) menuBtn.addEventListener('click', function () { navLinks.classList.toggle('open'); });

  /* ---------- smooth scroll + active link ---------- */
  document.querySelectorAll('a.scroll').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      window.scrollTo({ top: target.offsetTop - 66, behavior: 'smooth' });
      navLinks.classList.remove('open');
    });
  });
  var sections = document.querySelectorAll('section[id]');
  var navA = document.querySelectorAll('.nav-links a.scroll');
  window.addEventListener('scroll', function () {
    var y = window.scrollY + 120;
    sections.forEach(function (s) {
      if (y >= s.offsetTop && y < s.offsetTop + s.offsetHeight) {
        navA.forEach(function (a) { a.classList.remove('active'); });
        var match = document.querySelector('.nav-links a[href="#' + s.id + '"]');
        if (match) match.classList.add('active');
      }
    });
  });

  /* ---------- reveal on scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.classList.add('in');
        if (en.target.querySelectorAll) {
          en.target.querySelectorAll('.skill-fill').forEach(function (f) { f.style.width = f.dataset.w + '%'; });
        }
        io.unobserve(en.target);
      }
    });
  }, { threshold: .15 });
  revealEls.forEach(function (el) { io.observe(el); });

  /* ---------- about image slider ---------- */
  var aboutImg = document.getElementById('aboutImg');
  if (aboutImg) {
    var slides = ['myself-1.jpg', 'myself-2.jpg', 'myself-3.jpg', 'myself-4.jpg', 'myself-5.jpg', 'myself-6.jpg', 'myself-7.jpg', 'myself-8.jpg'];
    var si = 0;
    setInterval(function () {
      si = (si + 1) % slides.length;
      aboutImg.style.opacity = 0;
      setTimeout(function () { aboutImg.src = 'images/' + slides[si]; aboutImg.style.opacity = 1; }, 300);
    }, 3200);
  }

  /* ---------- accordions (education + certifications) ---------- */
  document.querySelectorAll('.acc-item .acc-head').forEach(function (head) {
    head.addEventListener('click', function () {
      var item = head.parentElement;
      var body = item.querySelector('.acc-body');
      var wasOpen = item.classList.contains('open');
      item.parentElement.querySelectorAll('.acc-item').forEach(function (i) {
        i.classList.remove('open');
        i.querySelector('.acc-body').style.maxHeight = null;
      });
      if (!wasOpen) {
        item.classList.add('open');
        body.style.maxHeight = body.scrollHeight + 'px';
      }
    });
  });

  /* ---------- gallery lightbox ---------- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxCap = document.getElementById('lightboxCap');
  if (lightbox) {
    document.querySelectorAll('.gal-item').forEach(function (item) {
      item.addEventListener('click', function () {
        lightboxImg.src = item.querySelector('img').src;
        lightboxCap.textContent = item.dataset.cap || '';
        lightbox.classList.add('open');
      });
    });
    var closeLightbox = function () { lightbox.classList.remove('open'); };
    document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLightbox(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLightbox(); });
  }

  /* ---------- contact form (client-side only) ---------- */
  var toast = document.getElementById('toast');
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(function () { toast.classList.remove('show'); }, 3000);
  }
  var form = document.getElementById('mailing');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = document.getElementById('name').value.trim();
      var email = document.getElementById('email').value.trim();
      var subject = document.getElementById('subject').value.trim();
      var message = document.getElementById('message').value.trim();
      if (!name || !email || !subject || !message) { showToast('Please fill in every field.'); return; }
      var body = encodeURIComponent(message + '\n\n— ' + name + ' (' + email + ')');
      window.location.href = 'mailto:sadatjnu9@gmail.com?subject=' + encodeURIComponent(subject) + '&body=' + body;
      showToast('Opening your email client…');
      form.reset();
    });
  }

  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- back to top ---------- */
  var backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', function () {
      backToTop.classList.toggle('show', window.scrollY > 400);
    });
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();
