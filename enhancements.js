(() => {
  // One service is open at a time; all details remain fully keyboard operable.
  const toggles = Array.from(document.querySelectorAll('.service-toggle'));
  const closeServiceDetails = () => {
    toggles.forEach(button => {
      const detail = document.getElementById(button.getAttribute('aria-controls'));
      button.setAttribute('aria-expanded', 'false');
      button.textContent = 'Mehr erfahren +';
      if (detail) detail.hidden = true;
    });
  };
  let serviceOpenedAtY = null;
  let serviceOpenedAtTime = 0;
  toggles.forEach(button => {
    button.addEventListener('click', () => {
      const opened = button.getAttribute('aria-expanded') === 'true';
      closeServiceDetails();
      serviceOpenedAtY = null;
      if (!opened) {
        const detail = document.getElementById(button.getAttribute('aria-controls'));
        button.setAttribute('aria-expanded', 'true');
        button.textContent = 'Weniger anzeigen −';
        if (detail) detail.hidden = false;
        serviceOpenedAtY = window.scrollY;
        serviceOpenedAtTime = performance.now();
      }
    });
  });
  // Closing on the next genuine scroll keeps the overview compact. A short
  // delay prevents the card's own layout shift from immediately closing it.
  addEventListener('scroll', () => {
    if (serviceOpenedAtY === null || performance.now() - serviceOpenedAtTime < 150) return;
    if (Math.abs(window.scrollY - serviceOpenedAtY) < 12) return;
    serviceOpenedAtY = null;
    closeServiceDetails();
  }, { passive: true });

  // The concepts are browseable with touch swipes, mouse drags and arrows.
  const portfolio = document.querySelector('#arbeiten .portfolio-grid');
  const previous = document.getElementById('portfolioPrev');
  const next = document.getElementById('portfolioNext');
  if (portfolio && previous && next) {
    const step = () => {
      const card = portfolio.querySelector('.portfolio-card');
      if (!card) return portfolio.clientWidth;
      const gap = parseFloat(getComputedStyle(portfolio).gap) || 18;
      return card.getBoundingClientRect().width + gap;
    };
    const updateArrows = () => {
      previous.disabled = portfolio.scrollLeft < 4;
      next.disabled = portfolio.scrollLeft + portfolio.clientWidth >= portfolio.scrollWidth - 4;
    };
    previous.addEventListener('click', () => portfolio.scrollBy({ left: -step(), behavior: 'smooth' }));
    next.addEventListener('click', () => portfolio.scrollBy({ left: step(), behavior: 'smooth' }));
    portfolio.addEventListener('scroll', updateArrows, { passive: true });
    addEventListener('resize', updateArrows);

    let down = false;
    let dragged = false;
    let suppressClick = false;
    let startX = 0;
    let startScroll = 0;
    portfolio.addEventListener('pointerdown', event => {
      if (event.pointerType !== 'mouse' || event.button !== 0) return;
      down = true;
      dragged = false;
      startX = event.clientX;
      startScroll = portfolio.scrollLeft;
    });
    portfolio.addEventListener('pointermove', event => {
      if (!down) return;
      const dx = event.clientX - startX;
      if (Math.abs(dx) > 7) dragged = true;
      if (dragged) {
        portfolio.classList.add('is-dragging');
        portfolio.scrollLeft = startScroll - dx;
      }
    });
    const endDrag = () => {
      if (!down) return;
      down = false;
      suppressClick = dragged;
      portfolio.classList.remove('is-dragging');
      if (suppressClick) setTimeout(() => { suppressClick = false; }, 150);
    };
    portfolio.addEventListener('pointerup', endDrag);
    portfolio.addEventListener('pointercancel', endDrag);
    portfolio.addEventListener('pointerleave', endDrag);
    portfolio.addEventListener('click', event => {
      if (!suppressClick) return;
      event.preventDefault();
      event.stopPropagation();
      suppressClick = false;
    }, true);
    updateArrows();
  }

  // A real overhead map, with seven independently identifiable places.
  const mapElement = document.getElementById('brandenburg-map');
  if (mapElement && typeof L !== 'undefined') {
    const points = [
      { name: 'Beelitz-Heilstätten', lat: 52.2618758, lon: 12.9245909, home: true, direction: 'left' },
      { name: 'Beelitz', lat: 52.2288191, lon: 12.9569266, direction: 'right' },
      { name: 'Potsdam', lat: 52.4009309, lon: 13.0591397, direction: 'right' },
      { name: 'Michendorf', lat: 52.2871106, lon: 13.0657683, direction: 'right' },
      { name: 'Werder (Havel)', lat: 52.3715809, lon: 12.9329125, direction: 'left' },
      { name: 'Teltow', lat: 52.3805562, lon: 13.2685278, direction: 'left' },
      { name: 'Schwielowsee', lat: 52.3337227, lon: 12.9812815, direction: 'left' }
    ];
    const map = L.map(mapElement, { scrollWheelZoom: false, zoomControl: false, preferCanvas: false });
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap-Mitwirkende</a>',
      minZoom: 7,
      maxZoom: 18
    }).addTo(map);
    L.control.zoom({ position: 'bottomright' }).addTo(map);
    const center = [points[0].lat, points[0].lon];
    points.slice(1).forEach(point => {
      L.polyline([center,[point.lat,point.lon]], {
        color:'#3d8c5d',weight:1.7,opacity:.28,interactive:false,
        className:'juli-map-connection'
      }).addTo(map);
    });
    points.forEach((point,index) => {
      const icon = L.divIcon({
        className: 'juli-map-icon',
        html: `<span class="juli-map-marker${point.home ? ' home' : ''}"></span>`,
        iconSize: point.home ? [27,27] : [21,21],
        iconAnchor: point.home ? [13,13] : [10,10]
      });
      L.marker([point.lat,point.lon], { icon, title: point.name })
        .addTo(map)
        .bindTooltip(point.name, { permanent: true, direction: point.direction, offset: point.direction === 'left' ? [-12,0] : [12,0], className: 'juli-map-tooltip' });
    });
    const bounds = L.latLngBounds(points.map(point => [point.lat,point.lon]));
    map.fitBounds(bounds, { padding: [65,86], maxZoom: 11.1 });
    const overviewZoom=map.getZoom();
    const overviewCenter=map.getCenter();
    map.setView(overviewCenter,overviewZoom-.7,{animate:false});
    let mapStarted=false;
    const animateRegionMap=()=>{
      if(mapStarted)return;
      mapStarted=true;
      mapElement.classList.add('is-animated');
      if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
        map.flyTo(overviewCenter,overviewZoom,{duration:2.25,easeLinearity:.16});
      }else map.setView(overviewCenter,overviewZoom,{animate:false});
    };
    if('IntersectionObserver' in window){
      const observer=new IntersectionObserver(entries=>{
        if(entries.some(entry=>entry.isIntersecting)){
          animateRegionMap();
          observer.disconnect();
        }
      },{threshold:.22});
      observer.observe(mapElement);
    }else animateRegionMap();
    if ('ResizeObserver' in window) {
      new ResizeObserver(() => map.invalidateSize({ pan: false })).observe(mapElement);
    }
    addEventListener('load', () => map.invalidateSize({ pan: false }), { once: true });
  } else if (mapElement) {
    mapElement.innerHTML = '<p class="map-fallback">Die Karte konnte nicht geladen werden. Unsere Region: Beelitz-Heilstätten, Beelitz, Potsdam, Michendorf, Werder, Teltow und Schwielowsee.</p>';
  }

})();
