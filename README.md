# Brew Haven Coffee

Website for **Brew Haven**, a neighborhood coffee shop in Manila. Built with HTML, CSS and vanilla JavaScript, plus an optional Node.js/Express backend.

**Live site:** https://adrianm16.github.io/BrewHavenCoffee/

## Pages

| Page | What it does |
|---|---|
| `index.html` | Home: hero, about, customer favorites, testimonials |
| `products.html` | Full menu with category filters, search, sort, bean ratings and cart |
| `features.html` | Our story / why Brew Haven |
| `contact.html` | Hours, map, contact form, marketing preview form |
| `login.html`, `register.html`, `profile.html` | Accounts, order history, edit details, change password |
| `admin.html` | Staff dashboard: add/edit/delete products and customers, read and delete messages |
| `customers.html`, `messages.html` | Staff card views of customers and the inbox |
| `mock_email.html`, `mock_social.html` | Campaign previews generated from the marketing form |

## Demo accounts

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| Customer | `customer` | `customer123` |

## How data works

`store.js` picks a mode automatically:

- **Static hosting (GitHub Pages):** there is no server, so menu, customers and messages are saved in the visitor's browser (localStorage), starting from `data/seed.js`. Everything works for every visitor, including the admin dashboard. Changes stay in that browser. Use **Reset demo data** in the dashboard to start over.
- **With the Node server:** reads and writes the JSON files in `data/` through the `/api` routes in `server.js`.

If you edit the JSON files in `data/`, regenerate the static seed so GitHub Pages picks up the change:

```bash
node -e "const fs=require('fs');const s={products:require('./data/products.json'),customers:require('./data/customers.json'),messages:require('./data/messages.json')};fs.writeFileSync('data/seed.js','window.BH_SEED = '+JSON.stringify(s,null,1)+';\n')"
```

## Run locally with the server

```bash
npm install
npm start          # http://localhost:3000
```

## Design

- **Palette:** Espresso `#23150F`, Crema `#F7F1E7`, Oat `#EDE3D2`, Terracotta `#B3522B`, Sage `#56644A`, Honey `#E0A95B`
- **Type:** Fraunces (headings) + Work Sans (body)
- Responsive from 320px phones to wide desktops. Keyboard accessible, with skip link, visible focus and screen reader labels. All animations respect the "reduce motion" setting.
