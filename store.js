// uses the express api if server.js is running, otherwise localStorage
(function () {
  const KINDS = ['products', 'customers', 'messages'];
  const LS_PREFIX = 'bh_db_v2_';
  let modePromise = null;

  function safeGet(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function safeSet(key, val) { try { localStorage.setItem(key, val); } catch (e) {} }

  function seedFor(kind) {
    const seed = (window.BH_SEED && window.BH_SEED[kind]) || [];
    return JSON.parse(JSON.stringify(seed));
  }

  function localRead(kind) {
    const raw = safeGet(LS_PREFIX + kind);
    if (raw) { try { return JSON.parse(raw); } catch (e) {} }
    const seeded = seedFor(kind);
    safeSet(LS_PREFIX + kind, JSON.stringify(seeded));
    return seeded;
  }
  function localWrite(kind, arr) { safeSet(LS_PREFIX + kind, JSON.stringify(arr)); }

  function detectMode() {
    if (modePromise) return modePromise;
    if (location.protocol === 'file:') return (modePromise = Promise.resolve('local'));
    modePromise = fetch('api/products', { headers: { Accept: 'application/json' } })
      .then(r => (r.ok && (r.headers.get('content-type') || '').includes('json')) ? 'api' : 'local')
      .catch(() => 'local');
    return modePromise;
  }

  function matches(item, q) {
    if (!q) return true;
    return Object.values(item).join(' ').toLowerCase().includes(q.toLowerCase().trim());
  }

  function normalizeProduct(p) {
    return Object.assign({}, p, {
      image: p.image || p.img || 'logo.svg',
      price: Number(p.price) || 0,
      tags: Array.isArray(p.tags) ? p.tags : String(p.tags || '').split(',').map(t => t.trim()).filter(Boolean)
    });
  }
  function normalize(kind, arr) { return kind === 'products' ? arr.map(normalizeProduct) : arr; }

  async function api(method, path, body) {
    const res = await fetch(path, {
      method,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    });
    if (!res.ok) throw new Error('Server responded ' + res.status);
    return res.json();
  }

  const prefix = { products: 'p', customers: 'c', messages: 'm' };

  const Store = {
    mode: detectMode,

    async list(kind, q) {
      if (!KINDS.includes(kind)) throw new Error('Unknown collection ' + kind);
      if (await detectMode() === 'api') {
        try { return normalize(kind, await api('GET', 'api/' + kind + (q ? '?q=' + encodeURIComponent(q) : ''))); }
        catch (e) { console.warn('API failed, using local data', e); }
      }
      return normalize(kind, localRead(kind).filter(i => matches(i, q)));
    },

    async get(kind, id) {
      const all = await this.list(kind);
      return all.find(i => i.id === id) || null;
    },

    async create(kind, data) {
      if (await detectMode() === 'api') {
        const r = await api('POST', 'api/' + kind, data);
        return r.product || r.customer || r.message || r;
      }
      const arr = localRead(kind);
      const item = Object.assign({ id: prefix[kind] + Date.now() }, data);
      if (kind === 'customers') {
        item.joined = item.joined || new Date().toISOString().split('T')[0];
        item.loyalty_points = parseInt(item.loyalty_points, 10) || 0;
      }
      if (kind === 'products') item.price = parseFloat(item.price) || 0;
      if (kind === 'messages') { item.date_sent = new Date().toISOString(); arr.unshift(item); }
      else arr.push(item);
      localWrite(kind, arr);
      return item;
    },

    async update(kind, id, data) {
      if (await detectMode() === 'api') {
        const r = await api('PUT', 'api/' + kind + '/' + encodeURIComponent(id), data);
        return r.product || r.customer || r.message || r;
      }
      const arr = localRead(kind);
      const idx = arr.findIndex(i => i.id === id);
      if (idx === -1) throw new Error('Not found');
      arr[idx] = Object.assign({}, arr[idx], data, { id });
      localWrite(kind, arr);
      return arr[idx];
    },

    async remove(kind, id) {
      if (await detectMode() === 'api') return api('DELETE', 'api/' + kind + '/' + encodeURIComponent(id));
      localWrite(kind, localRead(kind).filter(i => i.id !== id));
      return { success: true };
    },

    resetLocal() { KINDS.forEach(k => localWrite(k, seedFor(k))); }
  };

  window.Store = Store;
})();
