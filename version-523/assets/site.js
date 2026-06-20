(function () {
    var header = document.querySelector('[data-site-header]');
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    function refreshHeader() {
        if (!header) {
            return;
        }
        if (window.scrollY > 12) {
            header.classList.add('is-scrolled');
        } else {
            header.classList.remove('is-scrolled');
        }
    }

    refreshHeader();
    window.addEventListener('scroll', refreshHeader, { passive: true });

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var carousel = document.querySelector('[data-hero-carousel]');
    if (carousel) {
        var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
        var previous = carousel.querySelector('[data-hero-prev]');
        var next = carousel.querySelector('[data-hero-next]');
        var activeIndex = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, itemIndex) {
                slide.classList.toggle('is-active', itemIndex === activeIndex);
            });
            dots.forEach(function (dot, itemIndex) {
                dot.classList.toggle('is-active', itemIndex === activeIndex);
            });
        }

        function startTimer() {
            stopTimer();
            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, itemIndex) {
            dot.addEventListener('click', function () {
                showSlide(itemIndex);
                startTimer();
            });
        });
        if (previous) {
            previous.addEventListener('click', function () {
                showSlide(activeIndex - 1);
                startTimer();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                showSlide(activeIndex + 1);
                startTimer();
            });
        }
        carousel.addEventListener('mouseenter', stopTimer);
        carousel.addEventListener('mouseleave', startTimer);
        startTimer();
    }

    var grids = Array.prototype.slice.call(document.querySelectorAll('[data-card-grid]'));
    if (grids.length) {
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';
        var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-search-input]'));
        var regionFilter = document.querySelector('[data-region-filter]');
        var typeFilter = document.querySelector('[data-type-filter]');
        var yearFilter = document.querySelector('[data-year-filter]');
        var sortSelects = Array.prototype.slice.call(document.querySelectorAll('[data-sort-select]'));

        searchInputs.forEach(function (input) {
            if (initialQuery && !input.value) {
                input.value = initialQuery;
            }
            input.addEventListener('input', applyFilters);
        });
        [regionFilter, typeFilter, yearFilter].forEach(function (select) {
            if (select) {
                select.addEventListener('change', applyFilters);
            }
        });
        sortSelects.forEach(function (select) {
            select.addEventListener('change', applyFilters);
        });

        function getQuery() {
            var input = searchInputs.find(function (item) {
                return item.value.trim();
            });
            return input ? input.value.trim().toLowerCase() : '';
        }

        function sortCards(cards, mode) {
            return cards.slice().sort(function (a, b) {
                if (mode === 'year-desc') {
                    return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
                }
                if (mode === 'year-asc') {
                    return Number(a.dataset.year || 0) - Number(b.dataset.year || 0);
                }
                if (mode === 'title-asc') {
                    return (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-Hans-CN');
                }
                return Number(a.dataset.index || 0) - Number(b.dataset.index || 0);
            });
        }

        function applyFilters() {
            var query = getQuery();
            var region = regionFilter ? regionFilter.value : '';
            var type = typeFilter ? typeFilter.value : '';
            var year = yearFilter ? yearFilter.value : '';
            var sortMode = sortSelects[0] ? sortSelects[0].value : 'default';

            grids.forEach(function (grid) {
                var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-card]'));
                var sorted = sortCards(cards, sortMode);
                sorted.forEach(function (card) {
                    grid.appendChild(card);
                    var haystack = (card.dataset.search || '').toLowerCase();
                    var matchQuery = !query || haystack.indexOf(query) !== -1;
                    var matchRegion = !region || card.dataset.region === region;
                    var matchType = !type || card.dataset.type === type;
                    var matchYear = !year || card.dataset.year === year;
                    card.classList.toggle('is-hidden', !(matchQuery && matchRegion && matchType && matchYear));
                });
            });
        }

        applyFilters();
    }

    var scrollPlayerLinks = Array.prototype.slice.call(document.querySelectorAll('[data-scroll-player]'));
    scrollPlayerLinks.forEach(function (link) {
        link.addEventListener('click', function (event) {
            event.preventDefault();
            var player = document.querySelector('.player-shell');
            if (player) {
                player.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    });
}());
