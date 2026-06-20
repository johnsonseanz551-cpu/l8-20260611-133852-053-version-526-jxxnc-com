(function () {
    var players = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));

    players.forEach(function (player) {
        var video = player.querySelector('[data-player-video]');
        var overlay = player.querySelector('[data-player-overlay]');
        var startButton = player.querySelector('[data-player-start]');
        var stream = player.getAttribute('data-stream');
        var hlsInstance = null;
        var isReady = false;

        function attachStream() {
            if (!video || !stream || isReady) {
                return;
            }
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = stream;
                isReady = true;
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
                isReady = true;
                return;
            }
            video.src = stream;
            isReady = true;
        }

        function startPlayback() {
            attachStream();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            if (video) {
                video.controls = true;
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {});
                }
            }
        }

        if (startButton) {
            startButton.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                startPlayback();
            });
        }
        if (overlay) {
            overlay.addEventListener('click', startPlayback);
        }
        if (video) {
            video.addEventListener('click', function () {
                if (!isReady) {
                    startPlayback();
                }
            });
        }
        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
}());
