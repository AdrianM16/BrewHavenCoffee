(function () {
  'use strict';

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));
  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const peso = n => '₱' + Number(n || 0).toLocaleString('en-PH', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  const lsGet = (k, f) => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : f; } catch (e) { return f; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

  const ICON = {
    bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8L5 8z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>',
    bean: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><ellipse cx="12" cy="12" rx="7" ry="9.5" transform="rotate(30 12 12)"/><path d="M8.5 5.5c3 3 .5 7.5 4 13" stroke="#fffcf7" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg>',
    fb: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14 8h3V4h-3c-2.8 0-4.5 1.8-4.5 4.6V11H7v4h2.5v7h4v-7H16l.6-4h-3.1V8.9c0-.6.4-.9.5-.9z"/></svg>',
    ig: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
    tt: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.5 3c.4 2.3 1.9 3.8 4 4v3.2c-1.5 0-2.9-.4-4-1.2v6.3a5.7 5.7 0 1 1-5.7-5.7c.3 0 .6 0 .9.1v3.3a2.5 2.5 0 1 0 1.6 2.3V3h3.2z"/></svg>'
  };
  window.BH_ICON = ICON;

  // toasts
  function toast(message, type) {
    let region = $('.toast-region');
    if (!region) {
      region = document.createElement('div');
      region.className = 'toast-region';
      region.setAttribute('role', 'status');
      region.setAttribute('aria-live', 'polite');
      document.body.appendChild(region);
    }
    const t = document.createElement('div');
    t.className = 'toast' + (type === 'error' ? ' error' : '');
    t.textContent = message;
    region.appendChild(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 400); }, 2800);
  }

  // shared header / footer / cart
  const NAV = [
    { href: 'index.html', label: 'Home', key: 'home' },
    { href: 'products.html', label: 'Menu', key: 'menu' },
    { href: 'features.html', label: 'Our Story', key: 'story' },
    { href: 'contact.html', label: 'Visit Us', key: 'contact' }
  ];

  function accountHTML() {
    const user = window.Auth && Auth.getCurrentUser();
    if (!user) {
      return `<a class="icon-btn" href="login.html" aria-label="Sign in">${ICON.user}<span class="account-label">Sign in</span></a>`;
    }
    const admin = user.role === 'admin';
    return `
      <div class="account">
        <button class="icon-btn" type="button" id="accountBtn" aria-haspopup="true" aria-expanded="false" aria-controls="accountMenu">
          <span class="avatar" style="width:28px;height:28px;font-size:.85rem" aria-hidden="true">${esc((user.firstName || user.username || '?').charAt(0).toUpperCase())}</span>
          <span class="account-label">${esc(user.firstName || user.username)}</span>
          <span class="sr-only">Account menu</span>
        </button>
        <ul class="account-menu" id="accountMenu">
          <li class="who"><strong>${esc((user.firstName || '') + ' ' + (user.lastName || ''))}</strong>${esc(user.email || '')}${admin ? '<span class="role-pill">Admin</span>' : ''}</li>
          <li><a href="profile.html">My profile</a></li>
          ${admin ? '<li><a href="admin.html">Admin dashboard</a></li><li><a href="customers.html">Customers</a></li><li><a href="messages.html">Messages</a></li>' : ''}
          <li><button type="button" data-logout>Sign out</button></li>
        </ul>
      </div>`;
  }

  function buildShell() {
    const page = document.body.dataset.page || '';
    document.documentElement.classList.add('js');

    const skip = document.createElement('a');
    skip.className = 'skip-link';
    skip.href = '#main';
    skip.textContent = 'Skip to main content';

    const header = document.createElement('header');
    header.className = 'site-header';
    header.innerHTML = `
      <div class="container nav-bar">
        <a class="brand" href="index.html" aria-label="Brew Haven home">
          <img src="logo.svg" alt="" width="42" height="42"><span>Brew Haven</span>
        </a>
        <nav class="site-nav" id="siteNav" aria-label="Main">
          <ul>
            ${NAV.map(n => `<li><a href="${n.href}"${n.key === page ? ' aria-current="page"' : ''}>${n.label}</a></li>`).join('')}
          </ul>
        </nav>
        <div class="nav-actions">
          ${accountHTML()}
          <button class="icon-btn" type="button" data-open-cart aria-label="Open cart">
            ${ICON.bag}<span class="cart-count" aria-hidden="true">0</span>
          </button>
          <button class="icon-btn nav-toggle" type="button" aria-expanded="false" aria-controls="siteNav">
            <span class="bars" aria-hidden="true"></span><span class="sr-only">Menu</span>
          </button>
        </div>
      </div>`;

    const footer = document.createElement('footer');
    footer.className = 'site-footer';
    const year = new Date().getFullYear();
    footer.innerHTML = `
      <div class="container">
        <p class="footer-big">Slow mornings,<br><em>strong coffee.</em></p>
        <div class="footer-grid">
          <div>
            <h2>Brew Haven</h2>
            <p>A small neighborhood café in Manila serving thoughtfully roasted coffee, fresh pastries and a quiet corner for whatever your day needs.</p>
            <div class="socials">
              <a href="https://facebook.com" target="_blank" rel="noopener" aria-label="Brew Haven on Facebook">${ICON.fb}</a>
              <a href="https://instagram.com" target="_blank" rel="noopener" aria-label="Brew Haven on Instagram">${ICON.ig}</a>
              <a href="https://tiktok.com" target="_blank" rel="noopener" aria-label="Brew Haven on TikTok">${ICON.tt}</a>
            </div>
          </div>
          <div>
            <h2>Explore</h2>
            <ul>${NAV.map(n => `<li><a href="${n.href}">${n.label}</a></li>`).join('')}<li><a href="login.html">Account</a></li></ul>
          </div>
          <div>
            <h2>Hours</h2>
            <p>Mon – Sat<br>8:00 AM – 8:00 PM</p>
            <p>Sunday<br>9:00 AM – 6:00 PM</p>
          </div>
          <div>
            <h2>Say hello</h2>
            <p>4952 Brew Street<br>Manila, Philippines</p>
            <p><a href="tel:+639123456789">+63 912 345 6789</a></p>
            <p><a href="mailto:hello@brewhaven.ph">hello@brewhaven.ph</a></p>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© ${year} Brew Haven Coffee Shop. Brewed in Manila.</span>
          <a href="admin.html">Staff login</a>
        </div>
      </div>`;

    const backdrop = document.createElement('div');
    backdrop.className = 'drawer-backdrop';
    backdrop.dataset.closeCart = '';

    const drawer = document.createElement('aside');
    drawer.className = 'cart-drawer';
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-modal', 'true');
    drawer.setAttribute('aria-labelledby', 'cartTitle');
    drawer.innerHTML = `
      <div class="cart-head">
        <h2 id="cartTitle">Your order</h2>
        <button class="close-x" type="button" data-close-cart aria-label="Close cart">×</button>
      </div>
      <div class="cart-items"></div>
      <div class="cart-foot">
        <div class="cart-total-row"><span>Total</span><strong class="cart-total">₱0</strong></div>
        <button class="btn btn-block" type="button" data-checkout>Place order <span class="arrow" aria-hidden="true">→</span></button>
        <p class="muted center" style="font-size:.85rem;margin:12px 0 0">Pay at the counter when you pick up.</p>
      </div>`;

    document.body.prepend(header);
    document.body.prepend(skip);
    document.body.append(footer, backdrop, drawer);

    const main = $('main');
    if (main) { main.id = main.id || 'main'; main.tabIndex = -1; main.classList.add('page-enter'); }
  }

  function wireShell() {
    const header = $('.site-header');
    const nav = $('#siteNav');
    const toggle = $('.nav-toggle');

    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    function setNav(open) {
      nav.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('nav-open', open);
    }
    toggle.addEventListener('click', () => setNav(!nav.classList.contains('open')));
    nav.addEventListener('click', e => { if (e.target.closest('a')) setNav(false); });
    window.addEventListener('resize', () => { if (window.innerWidth > 900) setNav(false); });

    const accBtn = $('#accountBtn');
    const accMenu = $('#accountMenu');
    if (accBtn) {
      const setAcc = open => { accMenu.classList.toggle('open', open); accBtn.setAttribute('aria-expanded', String(open)); };
      accBtn.addEventListener('click', e => { e.stopPropagation(); setAcc(!accMenu.classList.contains('open')); });
      document.addEventListener('click', e => { if (!e.target.closest('.account')) setAcc(false); });
    }

    document.addEventListener('click', e => {
      if (e.target.closest('[data-logout]')) Auth.logout();
      if (e.target.closest('[data-open-cart]')) openCart();
      if (e.target.closest('[data-close-cart]')) closeCart();
      if (e.target.closest('[data-checkout]')) checkout();
    });

    document.addEventListener('keydown', e => {
      if (e.key !== 'Escape') return;
      if ($('.cart-drawer').classList.contains('open')) closeCart();
      if (nav.classList.contains('open')) { setNav(false); toggle.focus(); }
      if (accMenu && accMenu.classList.contains('open')) { accMenu.classList.remove('open'); accBtn.setAttribute('aria-expanded', 'false'); accBtn.focus(); }
    });

    if (new URLSearchParams(location.search).get('denied')) toast('That page is for staff accounts only.', 'error');
  }

  // cart
  const CART_KEY = 'bh_cart_v1';
  let PRODUCTS = [];
  let lastFocus = null;

  const cart = {
    items: lsGet(CART_KEY, []).filter(i => i && i.id),
    save() { lsSet(CART_KEY, this.items); updateCartCount(true); renderCart(); },
    add(id, qty = 1) {
      const it = this.items.find(i => i.id === id);
      if (it) it.qty += qty; else this.items.push({ id, qty });
      this.save();
    },
    setQty(id, qty) {
      if (qty < 1) return this.remove(id);
      const it = this.items.find(i => i.id === id);
      if (it) { it.qty = qty; this.save(); }
    },
    remove(id) { this.items = this.items.filter(i => i.id !== id); this.save(); },
    clear() { this.items = []; this.save(); },
    lines() {
      return this.items.map(i => ({ item: i, p: PRODUCTS.find(p => p.id === i.id) })).filter(l => l.p);
    },
    total() { return this.lines().reduce((s, l) => s + l.p.price * l.item.qty, 0); },
    count() { return this.items.reduce((s, i) => s + i.qty, 0); }
  };

  function updateCartCount(animate) {
    const n = cart.count();
    $$('.cart-count').forEach(el => {
      el.textContent = n;
      if (animate) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
    });
    $$('[data-open-cart]').forEach(b => b.setAttribute('aria-label', `Open cart, ${n} item${n === 1 ? '' : 's'}`));
  }

  function renderCart() {
    const list = $('.cart-items');
    if (!list) return;
    const lines = cart.lines();
    const checkoutBtn = $('[data-checkout]');
    if (!lines.length) {
      list.innerHTML = `<div class="cart-empty"><div class="big" aria-hidden="true">☕</div><p>Your cart is empty.</p><a class="btn btn-sm" href="products.html">Browse the menu</a></div>`;
    } else {
      list.innerHTML = lines.map(({ item, p }) => `
        <div class="cart-item">
          <img src="${esc(p.image)}" alt="" loading="lazy">
          <div>
            <div class="name-row"><span>${esc(p.name)}</span><span>${peso(p.price * item.qty)}</span></div>
            <div class="muted" style="font-size:.85rem">${peso(p.price)} each</div>
            <div style="display:flex;align-items:center;flex-wrap:wrap">
              <div class="qty" role="group" aria-label="Quantity for ${esc(p.name)}">
                <button type="button" data-qty="${esc(p.id)}" data-delta="-1" aria-label="Remove one ${esc(p.name)}">−</button>
                <span aria-live="polite">${item.qty}</span>
                <button type="button" data-qty="${esc(p.id)}" data-delta="1" aria-label="Add one more ${esc(p.name)}">+</button>
              </div>
              <button class="remove-link" type="button" data-remove="${esc(p.id)}">Remove<span class="sr-only"> ${esc(p.name)}</span></button>
            </div>
          </div>
        </div>`).join('');
    }
    const totalEl = $('.cart-total');
    if (totalEl) totalEl.textContent = peso(cart.total());
    if (checkoutBtn) checkoutBtn.disabled = !lines.length;
  }

  document.addEventListener('click', e => {
    const q = e.target.closest('[data-qty]');
    if (q) {
      const it = cart.items.find(i => i.id === q.dataset.qty);
      if (it) cart.setQty(it.id, it.qty + Number(q.dataset.delta));
    }
    const r = e.target.closest('[data-remove]');
    if (r) cart.remove(r.dataset.remove);
    const a = e.target.closest('[data-add]');
    if (a) {
      const p = PRODUCTS.find(x => x.id === a.dataset.add);
      if (!p) return;
      cart.add(p.id);
      toast(`${p.name} added to your order`);
      a.classList.add('added');
      const label = a.innerHTML;
      a.innerHTML = 'Added ✓';
      setTimeout(() => { a.classList.remove('added'); a.innerHTML = label; }, 1300);
    }
  });

  function openCart() {
    lastFocus = document.activeElement;
    renderCart();
    $('.cart-drawer').classList.add('open');
    $('.drawer-backdrop').classList.add('open');
    document.body.style.overflow = 'hidden';
    setTimeout(() => $('.cart-drawer .close-x').focus(), 50);
  }
  function closeCart() {
    $('.cart-drawer').classList.remove('open');
    $('.drawer-backdrop').classList.remove('open');
    document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  // trap focus in cart
  document.addEventListener('keydown', e => {
    const drawer = $('.cart-drawer');
    if (e.key !== 'Tab' || !drawer || !drawer.classList.contains('open')) return;
    const f = $$('button:not([disabled]), a[href]', drawer);
    if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  });

  function checkout() {
    const lines = cart.lines();
    if (!lines.length) return;
    const user = window.Auth && Auth.getCurrentUser();
    const order = {
      id: 'BH-' + Math.random().toString(36).slice(2, 7).toUpperCase(),
      user: user ? user.username : null,
      items: lines.map(l => ({ id: l.p.id, name: l.p.name, qty: l.item.qty, price: l.p.price })),
      total: cart.total(),
      date: new Date().toISOString()
    };
    const orders = lsGet('bh_orders', []);
    orders.push(order);
    lsSet('bh_orders', orders);
    cart.items = [];
    lsSet(CART_KEY, []);
    updateCartCount(true);
    $('.cart-items').innerHTML = `
      <div class="order-done" role="status">
        <div class="tick" aria-hidden="true">✓</div>
        <h3>Order placed!</h3>
        <p>Your order number is <strong>${order.id}</strong>.<br>We'll have it ready at the counter in about 10 minutes.</p>
        <p class="muted">Total: ${peso(order.total)}</p>
      </div>`;
    $('.cart-total').textContent = peso(0);
    $('[data-checkout]').disabled = true;
  }

  window.openCart = openCart;
  window.closeCart = closeCart;
  window.cart = cart;

  // product cards + bean ratings
  const RATINGS_KEY = 'bh_ratings_v1';
  const ratings = lsGet(RATINGS_KEY, {});

  function beansHTML(id) {
    const v = Math.round(ratings[id] || 0);
    let out = `<div class="rating" role="group" aria-label="Rate this item">`;
    for (let i = 1; i <= 5; i++) {
      out += `<button type="button" class="${i <= v ? 'on' : ''}" data-rate="${esc(id)}" data-v="${i}" aria-label="${i} of 5 beans" aria-pressed="${i === v}">${ICON.bean}</button>`;
    }
    return out + `<span class="val" aria-hidden="true">${v ? v + '/5' : ''}</span></div>`;
  }

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-rate]');
    if (!b) return;
    const id = b.dataset.rate;
    const v = Number(b.dataset.v);
    ratings[id] = ratings[id] === v ? 0 : v;
    lsSet(RATINGS_KEY, ratings);
    const wrap = b.closest('.rating');
    wrap.outerHTML = beansHTML(id);
    const again = $(`[data-rate="${CSS.escape(id)}"][data-v="${v}"]`);
    if (again) again.focus();
  });

  function productCard(p, i) {
    return `
      <article class="product reveal" style="--i:${i % 4}">
        <div class="product-media">
          <img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy" onerror="this.src='logo.svg'">
          <span class="product-tag">${esc(p.category)}</span>
        </div>
        <div class="product-body">
          <div class="product-top"><h3>${esc(p.name)}</h3><span class="price">${peso(p.price)}</span></div>
          ${p.description ? `<p class="product-desc">${esc(p.description)}</p>` : ''}
          ${p.tags && p.tags.length ? `<div class="tags">${p.tags.map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>` : ''}
          <div class="product-foot">
            ${beansHTML(p.id)}
            <button class="btn btn-sm add-btn" type="button" data-add="${esc(p.id)}" aria-label="Add ${esc(p.name)} to order">Add</button>
          </div>
        </div>
      </article>`;
  }

  // menu page
  function initMenuPage() {
    const list = $('#productList');
    if (!list) return;
    const search = $('#searchBar');
    const sort = $('#sortSelect');
    const count = $('#resultCount');
    const chips = $$('[data-filter]');
    const params = new URLSearchParams(location.search);
    let category = params.get('cat') || 'All';

    function sync() {
      chips.forEach(c => c.setAttribute('aria-pressed', String(c.dataset.filter === category)));
      const q = search.value.trim().toLowerCase();
      let arr = PRODUCTS.filter(p => (category === 'All' || p.category === category) &&
        (!q || (p.name + ' ' + (p.description || '') + ' ' + p.tags.join(' ')).toLowerCase().includes(q)));
      const s = sort.value;
      if (s === 'priceAsc') arr.sort((a, b) => a.price - b.price);
      if (s === 'priceDesc') arr.sort((a, b) => b.price - a.price);
      if (s === 'nameAsc') arr.sort((a, b) => a.name.localeCompare(b.name));
      if (s === 'nameDesc') arr.sort((a, b) => b.name.localeCompare(a.name));
      list.innerHTML = arr.length ? arr.map(productCard).join('')
        : `<div class="empty-state" style="grid-column:1/-1"><div class="big" aria-hidden="true">🫘</div><p>Nothing matches "${esc(search.value)}". Try another word.</p></div>`;
      count.textContent = `Showing ${arr.length} of ${PRODUCTS.length} items`;
      observeReveals(list);
    }
    chips.forEach(c => c.addEventListener('click', () => { category = c.dataset.filter; sync(); }));
    search.addEventListener('input', sync);
    sort.addEventListener('change', sync);
    sync();
  }

  // home page favorites
  function initFavorites() {
    const box = $('#favorites');
    if (!box) return;
    const wanted = ['mac', 'lat', 'che', 'cin'];
    let picks = wanted.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean);
    if (picks.length < 4) picks = picks.concat(PRODUCTS.filter(p => !picks.includes(p)).slice(0, 4 - picks.length));
    box.innerHTML = picks.map(productCard).join('');
    observeReveals(box);
  }

  // open / closed status (manila time)
  function initOpenStatus() {
    const els = $$('[data-open-status]');
    const rows = $$('[data-day]');
    if (!els.length && !rows.length) return;
    let day, mins;
    try {
      const parts = new Intl.DateTimeFormat('en-US', { timeZone: 'Asia/Manila', weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date());
      const get = t => (parts.find(p => p.type === t) || {}).value;
      day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
      mins = (Number(get('hour')) % 24) * 60 + Number(get('minute'));
    } catch (e) { const d = new Date(); day = d.getDay(); mins = d.getHours() * 60 + d.getMinutes(); }
    const open = day === 0 ? 9 * 60 : 8 * 60;
    const close = day === 0 ? 18 * 60 : 20 * 60;
    const isOpen = mins >= open && mins < close;
    els.forEach(el => { el.textContent = isOpen ? 'Open now' : 'Closed right now'; el.classList.toggle('closed', !isOpen); });
    rows.forEach(r => r.classList.toggle('today', Number(r.dataset.day) === day));
  }

  // scroll reveal + counters
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const io = ('IntersectionObserver' in window) ? new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('is-visible');
      if (en.target.hasAttribute('data-count')) countUp(en.target);
      io.unobserve(en.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }) : null;

  function observeReveals(root) {
    $$('.reveal:not(.is-visible), [data-count]', root || document).forEach(el => {
      if (io) io.observe(el); else { el.classList.add('is-visible'); }
    });
  }
  function countUp(el) {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    if (reduce) { el.textContent = target.toLocaleString() + suffix; return; }
    const start = performance.now();
    const dur = 1400;
    (function frame(now) {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased).toLocaleString() + suffix;
      if (t < 1) requestAnimationFrame(frame);
    })(start);
  }

  // boot
  buildShell();
  wireShell();
  updateCartCount(false);
  observeReveals();
  initOpenStatus();

  const productsReady = (window.Store ? Store.list('products') : Promise.resolve([]))
    .then(list => { PRODUCTS = list; })
    .catch(err => { console.error(err); PRODUCTS = []; })
    .then(() => { updateCartCount(false); renderCart(); initMenuPage(); initFavorites(); });

  window.BH = { $, $$, esc, peso, toast, observeReveals, productsReady, getProducts: () => PRODUCTS, ICON, lsGet };
})();
