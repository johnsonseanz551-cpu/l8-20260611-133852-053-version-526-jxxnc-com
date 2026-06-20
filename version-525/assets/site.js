(function () {
    var menuButton = document.querySelector('.menu-toggle');
    var mobilePanel = document.querySelector('.mobile-panel');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            var expanded = menuButton.getAttribute('aria-expanded') === 'true';
            menuButton.setAttribute('aria-expanded', String(!expanded));
            mobilePanel.hidden = expanded;
        });
    }

    var hero = document.querySelector('.hero');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dots button'));
        var active = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === active);
            });
        }

        function startTimer() {
            if (slides.length < 2) {
                return;
            }
            timer = window.setInterval(function () {
                showSlide(active + 1);
            }, 5600);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                if (timer) {
                    window.clearInterval(timer);
                }
                showSlide(index);
                startTimer();
            });
        });

        showSlide(0);
        startTimer();
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var sortableGrid = document.querySelector('[data-sortable-grid]');
    var sortSelect = document.querySelector('[data-sort-select]');

    function getCards() {
        if (!sortableGrid) {
            return [];
        }
        return Array.prototype.slice.call(sortableGrid.querySelectorAll('.movie-card, .rank-item'));
    }

    function filterCards() {
        var keyword = filterInput ? filterInput.value.trim().toLowerCase() : '';
        getCards().forEach(function (card) {
            var text = (card.textContent + ' ' + (card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-keywords') || '')).toLowerCase();
            card.classList.toggle('hidden-card', keyword && text.indexOf(keyword) === -1);
        });
    }

    function sortCards() {
        if (!sortSelect || !sortableGrid) {
            return;
        }
        var mode = sortSelect.value;
        var cards = getCards();
        cards.sort(function (a, b) {
            if (mode === 'year') {
                return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
            }
            if (mode === 'hot') {
                return Number(b.getAttribute('data-hot') || 0) - Number(a.getAttribute('data-hot') || 0);
            }
            if (mode === 'title') {
                return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
            }
            return Number(b.getAttribute('data-score') || 0) - Number(a.getAttribute('data-score') || 0);
        });
        cards.forEach(function (card) {
            sortableGrid.appendChild(card);
        });
    }

    if (filterInput) {
        filterInput.addEventListener('input', filterCards);
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q');
        if (q) {
            filterInput.value = q;
            filterCards();
        }
    }

    if (sortSelect) {
        sortSelect.addEventListener('change', function () {
            sortCards();
            filterCards();
        });
    }
})();

function initMoviePlayer(url) {
    var video = document.getElementById('movieVideo');
    var overlay = document.getElementById('playerOverlay');
    var stage = document.getElementById('videoStage');
    var hlsInstance = null;
    var ready = false;

    if (!video || !url) {
        return;
    }

    function bindVideo() {
        if (ready) {
            return;
        }
        ready = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });
            hlsInstance.loadSource(url);
            hlsInstance.attachMedia(video);
        } else {
            video.src = url;
        }
    }

    function playVideo() {
        bindVideo();
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
                if (overlay) {
                    overlay.classList.remove('is-hidden');
                }
            });
        }
    }

    if (overlay) {
        overlay.addEventListener('click', playVideo);
    }

    if (stage) {
        stage.addEventListener('click', function (event) {
            if (event.target === stage) {
                playVideo();
            }
        });
    }

    video.addEventListener('play', function () {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
    });

    video.addEventListener('pause', function () {
        if (video.currentTime === 0 && overlay) {
            overlay.classList.remove('is-hidden');
        }
    });

    video.addEventListener('error', function () {
        if (overlay) {
            overlay.classList.remove('is-hidden');
        }
    });
}
