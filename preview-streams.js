(() => {
  const previews = [...document.querySelectorAll('.live-preview')];
  const BASE_WIDTH = 1440;
  const resize = preview => {
    const frame = preview.querySelector('iframe');
    if (!frame) return;
    const scale = preview.getBoundingClientRect().width / BASE_WIDTH;
    frame.style.transform = 'scale(' + Math.max(.1, scale).toFixed(5) + ')';
  };
  const activate = preview => {
    const frame = preview.querySelector('iframe');
    if (!frame || frame.hasAttribute('src')) return;
    frame.src = frame.dataset.previewSrc;
  };
  const deactivate = preview => {
    const frame = preview.querySelector('iframe');
    if (!frame || !frame.hasAttribute('src')) return;
    frame.removeAttribute('src'); // Stoppt Videos und schont Speicher beim Verlassen.
    preview.classList.remove('is-ready');
    const label = preview.querySelector('.live-preview-indicator');
    if (label) label.lastChild.textContent=' VORSCHAU';
  };
  previews.forEach(preview => {
    const frame = preview.querySelector('iframe');
    resize(preview);
    if (!frame) return;
    frame.addEventListener('load', () => {
      // src="about:blank" caused by recycling must never hide the poster.
      if (!frame.hasAttribute('src') || frame.src === 'about:blank') return;
      preview.classList.add('is-ready');
      const label=preview.querySelector('.live-preview-indicator');
      if (label) label.lastChild.textContent=' LIVE-VORSCHAU';
    });
    frame.addEventListener('error', () => preview.classList.remove('is-ready'));
  });
  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(entries => entries.forEach(entry => resize(entry.target)));
    previews.forEach(preview => ro.observe(preview));
  } else window.addEventListener('resize', () => previews.forEach(resize));
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.isIntersecting ? activate(entry.target) : deactivate(entry.target));
    }, {rootMargin:'200px 200px',threshold:0.01});
    previews.forEach(preview => observer.observe(preview));
  } else previews.forEach(activate);
})();
