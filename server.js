const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const PUBLIC_DIR = path.join(__dirname); // serve files from current directory (where server.js is)
const DATA_DIR = path.join(__dirname, 'data');

// ensure data dir exists
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

// helper functions to read/write JSON in DATA_DIR
const readJSON = (name, fallback = '[]') => {
  const fp = path.join(DATA_DIR, name);
  if (!fs.existsSync(fp)) return JSON.parse(fallback);
  return JSON.parse(fs.readFileSync(fp, 'utf8'));
};
const writeJSON = (name, obj) => {
  fs.writeFileSync(path.join(DATA_DIR, name), JSON.stringify(obj, null, 2), 'utf8');
};

// Serve frontend static files from PUBLIC_DIR
app.use('/', express.static(PUBLIC_DIR));

// API: GET products (optional search q)
app.get('/api/products', (req, res) => {
  const products = readJSON('products.json', '[]');
  const q = (req.query.q || '').toLowerCase().trim();
  if (q) {
    const filtered = products.filter(p => (p.name + ' ' + (p.description||'') + ' ' + (p.category||'')).toLowerCase().includes(q));
    return res.json(filtered);
  }
  res.json(products);
});

// GET customers (optional q)
app.get('/api/customers', (req, res) => {
  const arr = readJSON('customers.json', '[]');
  const q = (req.query.q || '').toLowerCase().trim();
  if (q) return res.json(arr.filter(c => (c.name + ' ' + (c.email||'') + ' ' + (c.phone||'')).toLowerCase().includes(q)));
  res.json(arr);
});

// GET messages (optional q)
app.get('/api/messages', (req, res) => {
  const arr = readJSON('messages.json', '[]');
  const q = (req.query.q || '').toLowerCase().trim();
  if (q) return res.json(arr.filter(m => (m.name + ' ' + (m.email||'') + ' ' + (m.message||'')).toLowerCase().includes(q)));
  res.json(arr);
});

// POST message (contact form)
app.post('/api/messages', (req, res) => {
  const { name, phone, email, message, platform, platformsSelected } = req.body || {};
  const arr = readJSON('messages.json', '[]');
  const newMsg = {
    id: 'm' + Date.now(),
    name: name || 'Anonymous',
    phone: phone || '',
    email: email || '',
    message: message || '',
    platform: platform || 'email',
    platformsSelected: platformsSelected || [],
    date_sent: new Date().toISOString()
  };
  arr.unshift(newMsg); // latest first
  writeJSON('messages.json', arr);
  return res.json({ success: true, message: newMsg });
});

// Fallback static serve for any other assets
// POST product
app.post('/api/products', (req, res) => {
  const arr = readJSON('products.json', '[]');
  const newProduct = {
    id: 'p' + Date.now(),
    ...req.body,
    price: parseFloat(req.body.price) || 0
  };
  arr.push(newProduct);
  writeJSON('products.json', arr);
  return res.json({ success: true, product: newProduct });
});

// PUT product
app.put('/api/products/:id', (req, res) => {
  const arr = readJSON('products.json', '[]');
  const idx = arr.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, error: 'Product not found' });
  arr[idx] = { ...arr[idx], ...req.body, id: req.params.id };
  writeJSON('products.json', arr);
  return res.json({ success: true, product: arr[idx] });
});

// DELETE product
app.delete('/api/products/:id', (req, res) => {
  const arr = readJSON('products.json', '[]');
  const filtered = arr.filter(p => p.id !== req.params.id);
  if (filtered.length === arr.length) return res.status(404).json({ success: false, error: 'Product not found' });
  writeJSON('products.json', filtered);
  return res.json({ success: true, message: 'Product deleted' });
});

// POST customer
app.post('/api/customers', (req, res) => {
  const arr = readJSON('customers.json', '[]');
  const newCustomer = {
    id: 'c' + Date.now(),
    ...req.body,
    joined: new Date().toISOString().split('T')[0],
    loyalty_points: parseInt(req.body.loyalty_points) || 0
  };
  arr.push(newCustomer);
  writeJSON('customers.json', arr);
  return res.json({ success: true, customer: newCustomer });
});

// PUT customer
app.put('/api/customers/:id', (req, res) => {
  const arr = readJSON('customers.json', '[]');
  const idx = arr.findIndex(c => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, error: 'Customer not found' });
  arr[idx] = { ...arr[idx], ...req.body, id: req.params.id };
  writeJSON('customers.json', arr);
  return res.json({ success: true, customer: arr[idx] });
});

// DELETE customer
app.delete('/api/customers/:id', (req, res) => {
  const arr = readJSON('customers.json', '[]');
  const filtered = arr.filter(c => c.id !== req.params.id);
  if (filtered.length === arr.length) return res.status(404).json({ success: false, error: 'Customer not found' });
  writeJSON('customers.json', filtered);
  return res.json({ success: true, message: 'Customer deleted' });
});

// PUT message
app.put('/api/messages/:id', (req, res) => {
  const arr = readJSON('messages.json', '[]');
  const idx = arr.findIndex(m => m.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, error: 'Message not found' });
  arr[idx] = { ...arr[idx], ...req.body, id: req.params.id };
  writeJSON('messages.json', arr);
  return res.json({ success: true, message: arr[idx] });
});

// DELETE message
app.delete('/api/messages/:id', (req, res) => {
  const arr = readJSON('messages.json', '[]');
  const filtered = arr.filter(m => m.id !== req.params.id);
  if (filtered.length === arr.length) return res.status(404).json({ success: false, error: 'Message not found' });
  writeJSON('messages.json', filtered);
  return res.json({ success: true, message: 'Message deleted' });
});app.use(express.static(PUBLIC_DIR));

// start
app.listen(PORT, () => console.log(`Server running: http://localhost:${PORT}`));
