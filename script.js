document.addEventListener('DOMContentLoaded', function() {
    loadTicker();
    initHeroSlideshow();
    initCardAnimations();
    highlightActiveNav();
    setupHeaderWrap();
});

function setupHeaderWrap() {
    var header = document.querySelector('.header-content');
    if (!header) return;
    var logo = header.querySelector('.logo');
    var nav = header.querySelector('nav');
    if (!logo || !nav) return;

    function check() {
        var logoRect = logo.getBoundingClientRect();
        var navRect = nav.getBoundingClientRect();
        if (navRect.top > logoRect.bottom - 1) {
            header.classList.add('wrapped');
        } else {
            header.classList.remove('wrapped');
        }
    }
    check();
    window.addEventListener('resize', check);
}

function loadTicker() {
    fetch('./ticker.json')
        .then(function(r) { return r.json(); })
        .then(function(data) {
            if (!data.items) return;

            var tickers = document.querySelectorAll('.ticker-content');
            if (tickers.length) {
                var html = data.items.map(function(item) {
                    return '<span>' + item + '</span>';
                }).join('');
                tickers.forEach(function(t) {
                    if (t.dataset.filled === 'true') return;
                    t.innerHTML = html;
                    t.dataset.filled = 'true';
                });
                tickers.forEach(function(t) {
                    if (t.dataset.cloned === 'true') return;
                    var clone = t.cloneNode(true);
                    clone.setAttribute('aria-hidden', 'true');
                    t.parentNode.appendChild(clone);
                    t.dataset.cloned = 'true';
                });
            }

            var noticeList = document.getElementById('notice-board-list');
            if (noticeList) {
                data.items.forEach(function(item) {
                    var li = document.createElement('li');
                    li.textContent = item;
                    noticeList.appendChild(li);
                });
            }
        })
        .catch(function() {});
}

function initHeroSlideshow() {
    var container = document.getElementById('hero-slideshow');
    if (!container) return;

    var track = container.querySelector('.hero-track');
    var prevBtn = container.querySelector('.hero-prev');
    var nextBtn = container.querySelector('.hero-next');
    var captionEl = container.querySelector('.hero-caption-text');
    var startImage = container.dataset.startImage || './images/16.jpg';

    fetch('./gallery.json')
        .then(function(r) { return r.json(); })
        .then(function(images) {
            if (!images.length) return;

            var startIndex = 0;
            for (var i = 0; i < images.length; i++) {
                if (images[i].image === startImage) { startIndex = i; break; }
            }

            var slidesHtml = images.map(function(img) {
                return '<div class="hero-slide"><img src="' + img.image + '" alt="' + (img.caption || '') + '"></div>';
            }).join('');
            track.innerHTML = slidesHtml;

            var current = startIndex;
            var total = images.length;
            var autoplayMs = parseInt(container.dataset.autoplayMs, 10) || 5000;

            function show(index) {
                current = ((index % total) + total) % total;
                track.style.transform = 'translateX(-' + (current * 100) + '%)';
                if (captionEl) captionEl.textContent = images[current].caption || '';
            }

            function go(delta) {
                show(current + delta);
                resetAutoplay();
            }

            var timer = null;
            function resetAutoplay() {
                if (timer) clearInterval(timer);
                timer = setInterval(function() { show(current + 1); }, autoplayMs);
            }

            if (prevBtn) prevBtn.addEventListener('click', function() { go(-1); });
            if (nextBtn) nextBtn.addEventListener('click', function() { go(1); });

            show(current);
            resetAutoplay();

            container.addEventListener('mouseenter', function() {
                if (timer) { clearInterval(timer); timer = null; }
            });
            container.addEventListener('mouseleave', function() {
                resetAutoplay();
            });
        })
        .catch(function() {});
}

function initCardAnimations() {
    var cards = document.querySelectorAll('.card');
    if (!cards.length) return;
    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    cards.forEach(function(card) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

function highlightActiveNav() {
    var currentPage = window.location.pathname.split('/').pop() || 'index.html';
    var navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(function(link) {
        var href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        }
    });
}
