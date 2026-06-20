(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var toggle = document.querySelector(".menu-toggle");
        var mobileNav = document.querySelector(".mobile-nav");
        if (toggle && mobileNav) {
            toggle.addEventListener("click", function () {
                var opened = mobileNav.classList.toggle("is-open");
                toggle.setAttribute("aria-expanded", opened ? "true" : "false");
            });
        }

        document.querySelectorAll("[data-hero]").forEach(function (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
            var prev = hero.querySelector("[data-hero-prev]");
            var next = hero.querySelector("[data-hero-next]");
            var current = Math.max(0, slides.findIndex(function (slide) {
                return slide.classList.contains("is-active");
            }));

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, position) {
                    slide.classList.toggle("is-active", position === current);
                    slide.setAttribute("aria-hidden", position === current ? "false" : "true");
                });
                dots.forEach(function (dot, position) {
                    dot.classList.toggle("is-active", position === current);
                });
            }

            if (prev) {
                prev.addEventListener("click", function () {
                    show(current - 1);
                });
            }
            if (next) {
                next.addEventListener("click", function () {
                    show(current + 1);
                });
            }
            dots.forEach(function (dot, position) {
                dot.addEventListener("click", function () {
                    show(position);
                });
            });
            if (slides.length > 1) {
                window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            }
            show(current);
        });

        document.querySelectorAll("[data-search-input]").forEach(function (input) {
            var scope = input.closest("main") || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));
            var empty = scope.querySelector(".no-results");
            input.addEventListener("input", function () {
                var query = input.value.trim().toLowerCase();
                var shown = 0;
                cards.forEach(function (card) {
                    var haystack = [
                        card.getAttribute("data-title") || "",
                        card.getAttribute("data-region") || "",
                        card.getAttribute("data-year") || "",
                        card.getAttribute("data-keywords") || ""
                    ].join(" ").toLowerCase();
                    var matched = !query || haystack.indexOf(query) !== -1;
                    card.style.display = matched ? "" : "none";
                    if (matched) {
                        shown += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", shown === 0);
                }
            });
        });
    });

    window.setupMoviePlayer = function (video, overlay, source) {
        if (!video || !source) {
            return;
        }

        var prepared = false;
        var hls = null;

        function prepare() {
            if (prepared) {
                return;
            }
            prepared = true;
            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }
        }

        function play() {
            prepare();
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var request = video.play();
            if (request && typeof request.catch === "function") {
                request.catch(function () {});
            }
        }

        if (overlay) {
            overlay.addEventListener("click", play);
        }
        video.addEventListener("click", function () {
            if (video.paused) {
                play();
            }
        });
        video.addEventListener("play", function () {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
        });
        video.addEventListener("ended", function () {
            if (overlay) {
                overlay.classList.remove("is-hidden");
            }
        });
    };
})();
