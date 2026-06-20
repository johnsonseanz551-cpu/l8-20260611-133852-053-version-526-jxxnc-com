(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-main-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var slider = document.querySelector("[data-hero-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-dot]"));
        var thumbs = Array.prototype.slice.call(slider.querySelectorAll("[data-hero-thumb]"));
        var prev = slider.querySelector("[data-hero-prev]");
        var next = slider.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function activate(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
            thumbs.forEach(function (thumb, thumbIndex) {
                thumb.classList.toggle("is-active", thumbIndex === current);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                activate(current + 1);
            }, 5600);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                activate(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });

        thumbs.forEach(function (thumb) {
            thumb.addEventListener("mouseenter", function () {
                activate(Number(thumb.getAttribute("data-hero-thumb")) || 0);
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                activate(current - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                activate(current + 1);
                restart();
            });
        }

        activate(0);
        restart();
    }

    function setupFiltering() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]"));
        panels.forEach(function (panel) {
            var input = panel.querySelector("[data-search-input]");
            var chips = Array.prototype.slice.call(panel.querySelectorAll("[data-category-filter]"));
            var scope = panel.parentElement || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
            var activeCategory = "all";

            function apply() {
                var term = input ? input.value.trim().toLowerCase() : "";
                cards.forEach(function (card) {
                    var text = card.getAttribute("data-search") || "";
                    var category = card.getAttribute("data-category") || "";
                    var matchText = !term || text.indexOf(term) !== -1;
                    var matchCategory = activeCategory === "all" || category === activeCategory;
                    card.classList.toggle("is-filtered", !(matchText && matchCategory));
                });
            }

            if (input) {
                input.addEventListener("input", apply);
            }

            chips.forEach(function (chip) {
                chip.addEventListener("click", function () {
                    activeCategory = chip.getAttribute("data-category-filter") || "all";
                    chips.forEach(function (item) {
                        item.classList.toggle("is-active", item === chip);
                    });
                    apply();
                });
            });
        });
    }

    window.initMoviePlayer = function (videoId, buttonId, streamUrl) {
        var video = document.getElementById(videoId);
        var button = document.getElementById(buttonId);
        var started = false;

        if (!video || !button || !streamUrl) {
            return;
        }

        function load() {
            if (started) {
                return;
            }
            started = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(streamUrl);
                hls.attachMedia(video);
            } else {
                video.src = streamUrl;
            }
        }

        function play() {
            load();
            button.classList.add("is-hidden");
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {
                    button.classList.remove("is-hidden");
                });
            }
        }

        button.addEventListener("click", play);
        video.addEventListener("click", function () {
            if (!started) {
                play();
            }
        });
        video.addEventListener("play", function () {
            button.classList.add("is-hidden");
        });
    };

    ready(function () {
        setupMenu();
        setupHero();
        setupFiltering();
    });
})();
