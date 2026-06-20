(function () {
    function selectAll(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function setupMenu() {
        var button = document.querySelector('[data-menu-button]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!button || !nav) {
            return;
        }
        button.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var slides = selectAll('[data-hero-slide]');
        if (!slides.length) {
            return;
        }
        var dots = selectAll('[data-hero-dot]');
        var previous = document.querySelector('[data-hero-prev]');
        var next = document.querySelector('[data-hero-next]');
        var current = Math.max(0, slides.findIndex(function (slide) {
            return slide.classList.contains('is-active');
        }));

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        if (previous) {
            previous.addEventListener('click', function () {
                show(current - 1);
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
            });
        });
        window.setInterval(function () {
            show(current + 1);
        }, 5000);
    }

    function renderSearchCard(item) {
        var tags = (item.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');
        return [
            '<article class="movie-card movie-card-compact">',
            '<a class="movie-cover" href="' + escapeHtml(item.href) + '">',
            '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">',
            '<span class="rating-badge">' + escapeHtml(item.rating) + '</span>',
            '<span class="play-badge">▶</span>',
            '</a>',
            '<div class="movie-card-body">',
            '<div class="movie-tags">' + tags + '</div>',
            '<h3><a href="' + escapeHtml(item.href) + '">' + escapeHtml(item.title) + '</a></h3>',
            '<p class="card-meta">' + escapeHtml(item.year) + ' · ' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + '</p>',
            '<p class="card-line">' + escapeHtml(item.line) + '</p>',
            '</div>',
            '</article>'
        ].join('');
    }

    function setupSearch() {
        var input = document.getElementById('site-search-input');
        var button = document.getElementById('site-search-button');
        var results = document.getElementById('search-results');
        var filters = selectAll('[data-filter]');
        var data = window.SEARCH_MOVIES || [];
        if (!input || !results || !data.length) {
            return;
        }
        var activeFilter = '';
        var params = new URLSearchParams(window.location.search);
        var queryValue = params.get('q') || '';
        if (queryValue) {
            input.value = queryValue;
        }

        function match(item, query) {
            var haystack = [
                item.title,
                item.year,
                item.region,
                item.type,
                item.genre,
                (item.tags || []).join(' '),
                item.line
            ].join(' ').toLowerCase();
            var queryOk = !query || haystack.indexOf(query.toLowerCase()) !== -1;
            var filterOk = !activeFilter || haystack.indexOf(activeFilter.toLowerCase()) !== -1;
            return queryOk && filterOk;
        }

        function render() {
            var query = input.value.trim();
            var matched = data.filter(function (item) {
                return match(item, query);
            }).slice(0, 120);
            if (!matched.length) {
                results.innerHTML = '<div class="empty-state">没有匹配到影片，请更换关键词。</div>';
                return;
            }
            results.innerHTML = matched.map(renderSearchCard).join('');
        }

        input.addEventListener('input', render);
        input.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                event.preventDefault();
                render();
            }
        });
        if (button) {
            button.addEventListener('click', render);
        }
        filters.forEach(function (filterButton) {
            filterButton.addEventListener('click', function () {
                filters.forEach(function (item) {
                    item.classList.remove('is-active');
                });
                filterButton.classList.add('is-active');
                activeFilter = filterButton.getAttribute('data-filter') || '';
                render();
            });
        });
        if (queryValue) {
            render();
        }
    }

    function setupPlayer() {
        var video = document.getElementById('movie-player');
        var overlay = document.querySelector('[data-player-button]');
        if (!video || !overlay) {
            return;
        }
        var stream = video.getAttribute('data-stream');
        var attached = false;
        var hlsInstance = null;

        function attachStream() {
            if (attached || !stream) {
                return;
            }
            attached = true;
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls();
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
                return;
            }
            video.src = stream;
        }

        function start() {
            attachStream();
            overlay.classList.add('is-hidden');
            video.controls = true;
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    overlay.classList.remove('is-hidden');
                });
            }
        }

        overlay.addEventListener('click', start);
        video.addEventListener('click', function () {
            if (video.paused) {
                start();
            }
        });
        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        setupMenu();
        setupHero();
        setupSearch();
        setupPlayer();
    });
})();
