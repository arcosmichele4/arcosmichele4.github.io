/* XOKO film: a short loop of real chocolate footage while in view, with the logo fading in over its last seconds */
(function () {
  var film = document.querySelector('[data-film]');
  if (!film) return;
  var video = film.querySelector('video');
  var START = 0.5;        // the clip is a long, repetitive shot: only this window is played
  var END = 6.5;
  var LOGO_SECONDS = 2;
  var raf = 0;

  function frame() {
    if (video.currentTime >= END || video.currentTime < START - 0.05) video.currentTime = START;
    if (video.currentTime > END - LOGO_SECONDS) film.classList.add('show-logo');
    else film.classList.remove('show-logo');
    raf = video.paused ? 0 : requestAnimationFrame(frame);
  }
  video.addEventListener('play', function () { if (!raf) raf = requestAnimationFrame(frame); });
  video.addEventListener('seeked', frame);
  function cue() { if (video.currentTime < START) video.currentTime = START; }
  if (video.readyState >= 1) cue(); else video.addEventListener('loadedmetadata', cue);

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