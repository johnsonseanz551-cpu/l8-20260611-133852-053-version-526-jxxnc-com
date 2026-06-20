(function () {
  var input = document.querySelector('[data-search-input]');
  var result = document.querySelector('[data-search-results]');
  var title = document.querySelector('[data-search-title]');
  var empty = document.querySelector('[data-search-empty]');
  var params = new URLSearchParams(window.location.search);
  var initial = params.get('q') || '';

  function makeCard(movie) {
    var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return [
      '<article class="movie-card">',
      '<a class="poster-link" href="' + escapeHtml(movie.url) + '">',
      '<img src="' + escapeHtml(movie.image) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy" decoding="async">',
      '<span class="poster-shine"></span>',
      '</a>',
      '<div class="movie-card-body">',
      '<div class="movie-meta"><span>' + escapeHtml(movie.year) + '</span><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
      '<h2><a href="' + escapeHtml(movie.url) + '">' + escapeHtml(movie.title) + '</a></h2>',
      '<p>' + escapeHtml(movie.oneLine) + '</p>',
      '<div class="tag-list">' + tags + '</div>',
      '</div>',
      '</article>'
    ].join('');
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"]/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;'
      }[char];
    });
  }

  function search(value) {
    var keyword = value.trim().toLowerCase();
    var source = Array.isArray(MovieCatalog) ? MovieCatalog : [];
    var matched = keyword ? source.filter(function (movie) {
      return [
        movie.title,
        movie.year,
        movie.region,
        movie.type,
        movie.genre,
        movie.category,
        movie.oneLine,
        (movie.tags || []).join(' ')
      ].join(' ').toLowerCase().indexOf(keyword) !== -1;
    }) : source.slice(0, 40);

    var visible = matched.slice(0, 120);
    result.innerHTML = visible.map(makeCard).join('');
    empty.style.display = visible.length ? 'none' : 'block';
    title.textContent = keyword ? '搜索结果：' + value.trim() : '热门影片';
  }

  if (!input || !result) {
    return;
  }

  input.value = initial;
  search(initial);
  input.addEventListener('input', function () {
    search(input.value);
  });
})();
