(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');
  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var show = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    };
    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        show(i);
      });
    });
    if (slides.length > 1) {
      setInterval(function () {
        show(current + 1);
      }, 5200);
    }
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var regionFilter = document.querySelector('[data-region-filter]');
  var typeFilter = document.querySelector('[data-type-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var emptyState = document.querySelector('[data-empty-state]');
  var params = new URLSearchParams(window.location.search);
  if (filterInput && params.get('q')) {
    filterInput.value = params.get('q');
  }
  var runFilter = function () {
    if (!cards.length) {
      return;
    }
    var query = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var region = regionFilter ? regionFilter.value : '';
    var type = typeFilter ? typeFilter.value : '';
    var shown = 0;
    cards.forEach(function (card) {
      var text = (card.getAttribute('data-search') || '').toLowerCase();
      var sameRegion = !region || card.getAttribute('data-region') === region;
      var sameType = !type || card.getAttribute('data-type') === type;
      var matched = (!query || text.indexOf(query) !== -1) && sameRegion && sameType;
      card.style.display = matched ? '' : 'none';
      if (matched) {
        shown += 1;
      }
    });
    if (emptyState) {
      emptyState.classList.toggle('is-visible', shown === 0);
    }
  };
  [filterInput, regionFilter, typeFilter].forEach(function (node) {
    if (node) {
      node.addEventListener('input', runFilter);
      node.addEventListener('change', runFilter);
    }
  });
  runFilter();
})();

function setupPlayer(videoId, buttonId, streamUrl) {
  var video = document.getElementById(videoId);
  var button = document.getElementById(buttonId);
  var loaded = false;
  var hls = null;
  if (!video) {
    return;
  }
  var load = function () {
    if (loaded) {
      return;
    }
    loaded = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    } else if (window.Hls && window.Hls.isSupported()) {
      hls = new Hls({ enableWorker: true });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
    } else {
      video.src = streamUrl;
    }
    video.load();
  };
  var play = function (event) {
    if (event) {
      event.preventDefault();
    }
    load();
    if (button) {
      button.classList.add('is-hidden');
    }
    video.controls = true;
    var request = video.play();
    if (request && request.catch) {
      request.catch(function () {});
    }
  };
  if (button) {
    button.addEventListener('click', play);
  }
  video.addEventListener('click', function () {
    if (!loaded) {
      play();
    }
  });
  video.addEventListener('play', function () {
    if (button) {
      button.classList.add('is-hidden');
    }
  });
  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
      hls = null;
    }
  });
}
