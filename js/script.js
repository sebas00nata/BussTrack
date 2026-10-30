/* =========================================================
   BUSSTRACK - script.js

   Navegação por secções: destaca a secção que estás a ver
   enquanto fazes scroll, tanto no menu de cima (.nav) como
   nos pontos laterais (.dots). Clicar num link ou num ponto
   leva à secção (o scroll suave está no CSS).
   ========================================================= */

(function () {
    var navbar = document.querySelector('.navbar');
    var nav = document.querySelector('.nav');
    var links = Array.prototype.slice.call(
        document.querySelectorAll('.nav a[href^="#"], .dots a[href^="#"]')
    );

    // Agrupa os links por secção: o mesmo id tem um link no menu e um ponto
    var items = [];
    links.forEach(function (link) {
        var id = link.getAttribute('href');
        var item = items.filter(function (i) { return i.id === id; })[0];

        if (!item) {
            var section = document.querySelector(id);
            if (!section) return;
            item = { id: id, section: section, links: [] };
            items.push(item);
        }
        item.links.push(link);
    });

    if (!items.length) return;

    // Ordem real das secções na página
    items.sort(function (a, b) {
        return a.section.offsetTop - b.section.offsetTop;
    });

    var current = null;
    var ticking = false;

    function setActive(item) {
        if (item === current) return;
        current = item;

        items.forEach(function (i) {
            var isActive = i === item;
            i.links.forEach(function (link) {
                link.classList.toggle('active', isActive);
                if (isActive) link.setAttribute('aria-current', 'true');
                else link.removeAttribute('aria-current');
            });
        });

        // No telemóvel o menu de cima desliza: mantém o link ativo visível
        var navLink = item.links.filter(function (l) { return nav && nav.contains(l); })[0];
        if (navLink && nav.scrollWidth > nav.clientWidth) {
            nav.scrollTo({
                left: navLink.offsetLeft - (nav.clientWidth - navLink.clientWidth) / 2,
                behavior: 'smooth'
            });
        }
    }

    function update() {
        ticking = false;

        // A secção ativa é a última cujo topo já passou desta linha
        // (um pouco abaixo da barra de navegação)
        var line = navbar.offsetHeight + window.innerHeight * 0.25;
        var active = items[0];

        items.forEach(function (item) {
            if (item.section.getBoundingClientRect().top <= line) active = item;
        });

        // No fim da página, ativa sempre a última secção (Contactos)
        var atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
        if (atBottom) active = items[items.length - 1];

        setActive(active);
    }

    function onScroll() {
        if (!ticking) {
            ticking = true;
            window.requestAnimationFrame(update);
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    window.addEventListener('load', update);
    update();
})();


/* =========================================================
   Menu hambúrguer (telemóvel)
   Abre/fecha com o botão; fecha ao escolher um link,
   ao carregar fora do menu ou com a tecla Esc.
   ========================================================= */
(function () {
    var toggle = document.querySelector('.menu-toggle');
    var menu = document.getElementById('menu');
    if (!toggle || !menu) return;

    function setOpen(open) {
        menu.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    }

    toggle.addEventListener('click', function () {
        setOpen(!menu.classList.contains('is-open'));
    });

    menu.addEventListener('click', function (e) {
        if (e.target.closest('a')) setOpen(false);
    });

    document.addEventListener('click', function (e) {
        if (!menu.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') setOpen(false);
    });

    // Se o ecrã crescer para desktop, o menu volta ao normal
    window.matchMedia('(min-width: 701px)').addEventListener('change', function () {
        setOpen(false);
    });
})();


/* =========================================================
   Animações ao fazer scroll
   Os blocos ganham a classe .reveal e, quando entram no ecrã,
   .is-visible (o efeito está no style.css, secção 5c).
   ========================================================= */
(function () {
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Quem pediu menos movimento: sem efeitos de entrada.
    // O autocarro no mapa continua a andar, porque é o que mostra o produto.
    if (reduceMotion || !('IntersectionObserver' in window)) {
        document.documentElement.classList.remove('js');
        return;
    }

    // O que deve aparecer com animação
    var selector = [
        '.hero__content',
        '.phone',
        '.section-header',
        '.grid > .card',
        '.stack > .card',
        '.plans > .plan',
        '.split__media',
        '#sobre-nos .split__text',
        '.contact-card'
    ].join(',');

    // Ignora elementos que já estão dentro de outro bloco animado
    var elements = Array.prototype.filter.call(document.querySelectorAll(selector), function (el) {
        return !el.parentElement.closest(selector);
    });

    // Atraso escalonado entre irmãos (cards a aparecer um a seguir ao outro)
    var counters = new Map();
    elements.forEach(function (el) {
        var parent = el.parentElement;
        var index = counters.get(parent) || 0;
        counters.set(parent, index + 1);
        el.style.setProperty('--delay', Math.min(index, 5) * 0.12 + 's');
        el.classList.add('reveal');
    });

    var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

    elements.forEach(function (el) { observer.observe(el); });
})();
