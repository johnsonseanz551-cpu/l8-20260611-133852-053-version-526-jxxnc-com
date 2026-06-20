document.addEventListener("DOMContentLoaded", function() {
  var menuButton = document.querySelector("[data-menu-button]");
  var mobilePanel = document.querySelector("[data-mobile-panel]");
  if (menuButton && mobilePanel) {
    menuButton.addEventListener("click", function() {
      mobilePanel.classList.toggle("is-open");
    });
  }

  var carousel = document.querySelector("[data-hero-carousel]");
  if (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hero-dot"));
    var sideLinks = Array.prototype.slice.call(document.querySelectorAll(".hero-list-item"));
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, currentIndex) {
        slide.classList.toggle("is-active", currentIndex === index);
      });
      dots.forEach(function(dot, currentIndex) {
        dot.classList.toggle("is-active", currentIndex === index);
      });
    }

    function startTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function() {
        showSlide(index + 1);
      }, 5200);
    }

    dots.forEach(function(dot) {
      dot.addEventListener("click", function() {
        var nextIndex = Number(dot.getAttribute("data-hero-target") || 0);
        showSlide(nextIndex);
        startTimer();
      });
    });

    sideLinks.forEach(function(link) {
      link.addEventListener("mouseenter", function() {
        var nextIndex = Number(link.getAttribute("data-hero-target") || 0);
        showSlide(nextIndex);
        startTimer();
      });
    });

    showSlide(0);
    startTimer();
  }

  var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
  var searchInput = document.querySelector("[data-search-input]");
  var yearFilter = document.querySelector("[data-filter-year]");
  var typeFilter = document.querySelector("[data-filter-type]");
  var regionFilter = document.querySelector("[data-filter-region]");
  var categoryFilter = document.querySelector("[data-filter-category]");
  var emptyState = document.querySelector("[data-empty-state]");
  var params = new URLSearchParams(window.location.search);
  var query = params.get("q");

  if (searchInput && query) {
    searchInput.value = query;
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function runFilters() {
    if (!cards.length) {
      return;
    }
    var keyword = normalize(searchInput ? searchInput.value : "");
    var year = normalize(yearFilter ? yearFilter.value : "");
    var type = normalize(typeFilter ? typeFilter.value : "");
    var region = normalize(regionFilter ? regionFilter.value : "");
    var category = normalize(categoryFilter ? categoryFilter.value : "");
    var visible = 0;

    cards.forEach(function(card) {
      var haystack = normalize(card.innerText + " " + card.getAttribute("data-title") + " " + card.getAttribute("data-region") + " " + card.getAttribute("data-type") + " " + card.getAttribute("data-category"));
      var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
      var matchesYear = !year || normalize(card.getAttribute("data-year")).indexOf(year) !== -1;
      var matchesType = !type || normalize(card.getAttribute("data-type")) === type;
      var matchesRegion = !region || normalize(card.getAttribute("data-region")) === region;
      var matchesCategory = !category || normalize(card.getAttribute("data-category")) === category;
      var show = matchesKeyword && matchesYear && matchesType && matchesRegion && matchesCategory;
      card.hidden = !show;
      if (show) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.hidden = visible !== 0;
    }
  }

  [searchInput, yearFilter, typeFilter, regionFilter, categoryFilter].forEach(function(control) {
    if (control) {
      control.addEventListener("input", runFilters);
      control.addEventListener("change", runFilters);
    }
  });

  runFilters();
});
