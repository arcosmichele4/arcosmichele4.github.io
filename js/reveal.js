/* Fades/slides ".reveal" elements up into place the first time they enter the
   viewport. Items inside a ".reveal-group" (e.g. a grid of cards) reveal with a
   small stagger between them, like a deck of cards landing one after another. */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var groups = document.querySelectorAll('.reveal-group');
  for (var g = 0; g < groups.length; g++) {
    var items = groups[g].querySelectorAll(':scope > .reveal');
    for (var i = 0; i < items.length; i++) items[i].style.setProperty('--rd', (i * 0.08) + 's');
  }

  var els = document.querySelectorAll('.reveal');

  if (reduce || !('IntersectionObserver' in window)) {
    for (var j = 0; j < els.length; j++) els[j].classList.add('is-in');
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    for (var k = 0; k < entries.length; k++) {
      if (entries[k].isIntersecting) {
        entries[k].target.classList.add('is-in');
        io.unobserve(entries[k].target);
      }
    }
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  for (var m = 0; m < els.length; m++) io.observe(els[m]);
})();
