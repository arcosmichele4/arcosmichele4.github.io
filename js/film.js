/* XOKO film: real chocolate footage plays while in view, and the logo fades in over its last seconds */
(function () {
  var film = document.querySelector('[data-film]');
  if (!film) return;
  var video = film.querySelector('video');
  var LOGO_SECONDS = 3;

  function sync() {
    var d = video.duration;
    if (d && video.currentTime > d - LOGO_SECONDS) film.classList.add('show-logo');
    else film.classList.remove('show-logo');
  }
  video.addEventListener('timeupdate', sync);
  video.addEventListener('seeked', sync);

  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    video.controls = true;
    return;
  }
  if (!('IntersectionObserver' in window)) { video.play(); return; }
  new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { var p = video.play(); if (p && p.catch) p.catch(function () {}); }
      else video.pause();
    });
  }, { threshold: 0.35 }).observe(film);
})();