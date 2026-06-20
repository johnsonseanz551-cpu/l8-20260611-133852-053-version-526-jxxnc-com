(function () {
  var header = document.querySelector('[data-header]');
  var toggle = document.querySelector('[data-menu-toggle]');
  var menu = document.querySelector('[data-mobile-menu]');

  function onScroll() {
    if (!header) {
      return;
    }
    if (window.scrollY > 16) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var active = 0;

    function setHero(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        setHero(index);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        setHero(active + 1);
      }, 5200);
    }
  }

  var quickSearch = document.querySelector('[data-quick-search]');
  if (quickSearch) {
    quickSearch.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = quickSearch.querySelector('input');
      var value = input ? input.value.trim() : '';
      var target = './search.html';
      if (value) {
        target += '?q=' + encodeURIComponent(value);
      }
      window.location.href = target;
    });
  }

  var lists = Array.prototype.slice.call(document.querySelectorAll('[data-card-list]'));
  lists.forEach(function (list) {
    var scope = list.closest('[data-catalog]') || document;
    var search = scope.querySelector('.catalog-search');
    var region = scope.querySelector('.catalog-region');
    var type = scope.querySelector('.catalog-type');
    var sort = scope.querySelector('.catalog-sort');
    var empty = scope.querySelector('.empty-state');
    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));

    function cardText(card) {
      return [
        card.dataset.title || '',
        card.dataset.year || '',
        card.dataset.region || '',
        card.dataset.type || '',
        card.dataset.genre || '',
        card.dataset.tags || ''
      ].join(' ').toLowerCase();
    }

    function applyFilters() {
      var keyword = search ? search.value.trim().toLowerCase() : '';
      var regionValue = region ? region.value : '';
      var typeValue = type ? type.value : '';
      var visible = 0;

      cards.forEach(function (card) {
        var passKeyword = !keyword || cardText(card).indexOf(keyword) !== -1;
        var passRegion = !regionValue || card.dataset.region === regionValue;
        var passType = !typeValue || card.dataset.type === typeValue;
        var show = passKeyword && passRegion && passType;
        card.style.display = show ? '' : 'none';
        if (show) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    }

    function applySort() {
      var mode = sort ? sort.value : 'default';
      var sorted = cards.slice();
      if (mode === 'year-desc') {
        sorted.sort(function (a, b) {
          return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
        });
      }
      if (mode === 'year-asc') {
        sorted.sort(function (a, b) {
          return Number(a.dataset.year || 0) - Number(b.dataset.year || 0);
        });
      }
      if (mode === 'title-asc') {
        sorted.sort(function (a, b) {
          return (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-Hans-CN');
        });
      }
      sorted.forEach(function (card) {
        list.appendChild(card);
      });
      cards = sorted;
      applyFilters();
    }

    if (search) {
      search.addEventListener('input', applyFilters);
    }
    if (region) {
      region.addEventListener('change', applyFilters);
    }
    if (type) {
      type.addEventListener('change', applyFilters);
    }
    if (sort) {
      sort.addEventListener('change', applySort);
    }
  });
})();
