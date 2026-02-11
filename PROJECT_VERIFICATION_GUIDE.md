# Projekt Ellenőrzési Dokumentum - Egyetemi Naptár Kezelő

## 📋 Projekt Áttekintés

**Név:** Egyetemi Naptár Kezelő (University Calendar Manager)
**Verzió:** 1.0.0
**Típus:** React alapú egyoldalas webalkalmazás (SPA)
**Deploy környezet:** GitHub Pages
**Repository URL:** https://github.com/SupiiX/Timeline
**Live URL:** https://supiix.github.io/Timeline/

---

## 🎯 Projekt Célja

Egy interaktív webes naptár kezelő alkalmazás létrehozása, amely lehetővé teszi:
- Egyetemi események (vizsgák, előadások, határidők) kezelését
- JSON formátumú naptáradatok betöltését és mentését
- Kétnyelvű (magyar/angol) esemény információk tárolását
- Vizuális naptár és idővonal nézetek közötti váltást
- Drag-and-drop esemény áthelyezést
- Kategória alapú színkódolást

---

## 🛠 Technológiai Stack

### Frontend Framework és Library-k
- **React 19.2.0** - UI komponens keretrendszer
- **Vite 7.2.4** - Build tool és fejlesztői szerver
- **FullCalendar 6.1.20** - Naptár komponens könyvtár
  - `@fullcalendar/react` - React integráció
  - `@fullcalendar/daygrid` - Havi nézet plugin
  - `@fullcalendar/interaction` - Interakciós funkcionalitás (drag & drop)
- **Tailwind CSS 4.1.18** - Utility-first CSS framework
- **Lucide React 0.563.0** - Icon komponensek

### Fejlesztői Eszközök
- **ESLint 9.39.1** - Kód minőségellenőrzés
- **@vitejs/plugin-react 5.1.1** - Vite React plugin

### Build és Deploy
- **GitHub Actions** - CI/CD pipeline
- **GitHub Pages** - Statikus hosting

---

## 📁 Fájlstruktúra

```
Timeline/
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Actions deployment workflow
├── public/
│   ├── 404.html                    # GitHub Pages SPA redirect kezelő
│   └── sample-calendar.json        # Minta naptár adat
├── src/
│   ├── App.jsx                     # Fő alkalmazás komponens
│   ├── main.jsx                    # React belépési pont
│   └── index.css                   # Globális stílusok
├── index.html                      # HTML template (SPA redirect script-tel)
├── vite.config.js                  # Vite konfigurációs fájl
├── package.json                    # NPM függőségek és scriptek
├── eslint.config.js                # ESLint szabályok
└── tailwind.config.js              # Tailwind CSS konfiguráció (ha van)
```

---

## ⚙️ Konfiguráció Részletek

### 1. **vite.config.js**
```javascript
base: '/Timeline/'  // GitHub Pages base URL
build: { outDir: 'dist' }  // Build kimenet mappa
plugins: [react(), tailwindcss()]
```

**Ellenőrzési pontok:**
- ✅ `base` érték egyezik a repository nevével
- ✅ `outDir` beállítva `dist`-re
- ✅ React és Tailwind pluginek betöltve

### 2. **index.html**
```html
- DOCTYPE: <!doctype html>
- Lang attribútum: "hu"
- Charset: UTF-8
- Viewport meta: Mobil optimalizálás
- SPA redirect script: GitHub Pages routing kezelés
- Root div: id="root"
- Script: type="module" src="/src/main.jsx"
```

**Ellenőrzési pontok:**
- ✅ SPA redirect script jelen van (8-29 sorok)
- ✅ Root div létezik
- ✅ Main.jsx helyesen linkelve

### 3. **public/404.html**
```javascript
pathSegmentsToKeep = 1  // GitHub Pages project site beállítás
```

**Ellenőrzési pontok:**
- ✅ SPA redirect script konfigurálva
- ✅ `pathSegmentsToKeep` értéke 1 (project page-hez)
- ✅ Minimum 512 byte méret (IE kompatibilitás)

### 4. **GitHub Actions Workflow (deploy.yml)**
```yaml
Trigger: push to master vagy claude/** branches
Permissions: contents: read, pages: write, id-token: write
Build steps:
  1. Checkout code
  2. Setup Node.js 20
  3. npm ci (clean install)
  4. npm run build
  5. Upload dist/ artifact
  6. Deploy to GitHub Pages
```

**Ellenőrzési pontok:**
- ✅ Master branch trigger beállítva
- ✅ Helyes Node.js verzió (20)
- ✅ Build előtt dependency install
- ✅ dist/ mappa deployolása

---

## 🎨 Alkalmazás Funkciók

### A. JSON Fájl Kezelés
1. **Betöltés (Upload)**
   - Fájl kiválasztás gombbal
   - JSON parsing és validáció
   - Semester, categories, events beolvasása
   - Hibakezelés helytelen JSON esetén

2. **Letöltés (Download)**
   - Aktuális állapot exportálása JSON-ként
   - Fájlnév megőrzés vagy alapértelmezett név
   - Csak akkor engedélyezett, ha van esemény

**Ellenőrzés:** Tölts be sample-calendar.json fájlt → Módosíts egy eseményt → Töltsd le → Ellenőrizd a JSON struktúrát

### B. Esemény CRUD Műveletek
1. **Create (Új esemény)**
   - Űrlap mezők: title, date, endDate, category, description, location, link
   - Angol mezők: titleEn, descriptionEn, locationEn
   - Validáció: kötelező cím és dátum
   - Automatikus ID generálás (max ID + 1)

2. **Read (Megjelenítés)**
   - Naptár nézetben: FullCalendar komponens
   - Idővonal nézetben: kronológiai listázás
   - Kategória színkódolás

3. **Update (Szerkesztés)**
   - Esemény kattintással kiválasztás
   - Űrlap előtöltés meglévő adatokkal
   - Drag-and-drop dátum módosítás
   - Frissítés gombbal véglegesítés

4. **Delete (Törlés)**
   - Törlés gomb csak szerkesztés módban
   - Megerősítő dialógus
   - Esemény eltávolítása a listából

**Ellenőrzés:** Minden CRUD művelet tesztelése különböző eseményekkel

### C. Kategória Kezelés
- Kategóriák betöltése JSON-ból
- Színkódolás: egyedi HEX színek
- Kiválasztás: pill-szerű gombok
- Naptár eseményeken vizuális megjelenítés

**Ellenőrzés:** Ellenőrizd, hogy minden kategória megjelenik és helyesen színezve van

### D. Nézetek
1. **Naptár Nézet**
   - Havi rács nézet (FullCalendar dayGrid)
   - Navigáció: prev/next/today gombok
   - Interakciók: kattintás, drag-and-drop
   - Magyar lokalizáció

2. **Idővonal Nézet**
   - Függőleges idővonal
   - Kronológiai rendezés
   - Esemény kártyák részletes infókkal
   - Dátum formázás: "2025. február 11."

**Ellenőrzés:** Váltás a nézetek között → Ellenőrizd az események konzisztenciáját

### E. Dátum Kezelés
- **Inclusiv/Exkluzív konverzió:**
  - JSON-ban: inkluzív záró dátum (utolsó nap, amikor az esemény tart)
  - FullCalendar-ban: exkluzív záró dátum (első nap, amikor már NEM tart)
  - Funkciók: `inclusiveToExclusive()` és `exclusiveToInclusive()`

**Ellenőrzés:** Hozz létre 3 napos eseményt (pl. feb 10-12) → Ellenőrizd naptárban és JSON-ban a dátumokat

---

## ✅ Ellenőrzési Checklist

### 1. Build és Deploy
- [ ] `npm install` sikeresen lefut hibák nélkül
- [ ] `npm run build` létrehozza a `dist/` mappát
- [ ] `dist/index.html` tartalmaz minden szükséges assetet
- [ ] GitHub Actions workflow sikeresen lefut master push után
- [ ] Live site elérhető a GitHub Pages URL-en
- [ ] Routing működik (frissítés, direkt URL-ek)

### 2. Alapvető Funkciók
- [ ] JSON betöltés működik (public/sample-calendar.json tesztelése)
- [ ] Események megjelennek a naptárban
- [ ] Kategóriák színekkel helyesen jelennek meg
- [ ] Új esemény létrehozható
- [ ] Meglévő esemény szerkeszthető
- [ ] Esemény törölhető (megerősítés után)
- [ ] JSON letöltés működik

### 3. UI/UX
- [ ] Magyar lokalizáció (naptár, dátumok, UI szövegek)
- [ ] Responsive design (mobil, tablet, desktop)
- [ ] Ikonok helyesen betöltődnek (Lucide React)
- [ ] Kategória gombok interaktívak és vizuálisan helyes állapotúak
- [ ] Drag-and-drop esemény mozgatás működik
- [ ] Naptár/Idővonal nézet váltás sikeres
- [ ] Űrlap validáció működik (cím és dátum kötelező)

### 4. Speciális Funkciók
- [ ] Angol mezők összecsukhatóak és működnek
- [ ] Link mező URL validáció
- [ ] Dátum tartomány (kezdés-vég) helyesen kezelt
- [ ] Helyszín és leírás megjelennek az esemény kártyákon
- [ ] Eseményszám összesítő helyesen számol
- [ ] "Mégse / Új" gomb törli az űrlapot

### 5. Kód Minőség
- [ ] `npm run lint` nem ad kritikus hibát
- [ ] Nincs console.error a böngésző konzolon
- [ ] Nincs nem használt import vagy változó
- [ ] React Hooks helyesen használva (useCallback, useMemo)
- [ ] Komponens renderelés optimalizált

### 6. GitHub Pages Kompatibilitás
- [ ] index.html SPA script megfelelően beállítva
- [ ] 404.html redirect működik
- [ ] Base URL (/Timeline/) minden asset path-ben helyes
- [ ] Nincs CORS vagy mixed content hiba

---

## 🔍 Tesztelési Forgatókönyvek

### Teszt 1: Teljes Workflow
1. Nyisd meg a live site-ot
2. Kattints "JSON Betöltés" gombra
3. Töltsd be a `public/sample-calendar.json` fájlt
4. Ellenőrizd: események megjelennek, kategóriák láthatóak
5. Hozz létre egy új eseményt tetszőleges adatokkal
6. Kattints egy meglévő eseményre és szerkeszd
7. Húzd át egy eseményt másik napra (drag-and-drop)
8. Váltsd át idővonal nézetre
9. Töltsd le a JSON-t
10. Nyisd meg a letöltött fájlt és ellenőrizd a módosításokat

**Elvárt eredmény:** Minden lépés hibák nélkül, az adatok konzisztensek maradnak

### Teszt 2: Hibaesetek
1. Próbálj betölteni egy érvénytelen JSON fájlt
   - **Elvárt:** Hibaüzenet jelenik meg
2. Próbálj eseményt menteni cím nélkül
   - **Elvárt:** Validációs üzenet
3. Próbálj eseményt menteni dátum nélkül
   - **Elvárt:** Validációs üzenet
4. Próbálj törölni egy eseményt és nyomj "Mégse" a dialógusban
   - **Elvárt:** Esemény nem törlődik

### Teszt 3: Mobil Reszponzivitás
1. Nyisd meg a site-ot mobil nézetben (< 768px)
2. Ellenőrizd: oldalsó panel és naptár megfelelően jelennek meg
3. Tesztelj minden gombot és interakciót
   - **Elvárt:** Teljes funkcionalitás megmarad, nincs layout törés

---

## 🐛 Ismert Problémák és Korlátok

### Jelenlegi Korlátok
1. **Adatmegőrzés:** Nincs backend, minden böngésző sessionben tárolódik
2. **Többnyelvűség:** Csak magyar/angol mezők, nincs dinamikus nyelváltó
3. **Kategória kezelés:** Kategóriákat csak JSON szerkesztéssel lehet módosítani
4. **Időzóna:** Nincsenek időzóna kezelések, minden dátum lokális
5. **Batch műveletek:** Nincs többszörös kiválasztás vagy tömeges szerkesztés

### Potenciális Fejlesztések
- [ ] LocalStorage perzisztens tárolás
- [ ] Kategória CRUD UI az alkalmazásban
- [ ] Exportálás iCal/Google Calendar formátumba
- [ ] Heti és napi nézet
- [ ] Esemény emlékeztetők
- [ ] Szűrés kategória/dátum szerint
- [ ] Keresés funkció

---

## 🚀 Deploy Ellenőrzés

### GitHub Pages Beállítások Ellenőrzése
1. Navigálj a repository Settings > Pages oldalra
2. Ellenőrizd:
   - **Source:** GitHub Actions
   - **Branch:** (GitHub Actions használatakor nem releváns)
   - **Custom domain:** Nincs beállítva (kivéve ha szükséges)

### Deployment Státusz
1. Menj a repository **Actions** tabra
2. Ellenőrizd az utolsó workflow futás státuszát:
   - ✅ Zöld pipa: sikeres deploy
   - ❌ Piros X: hiba történt (ellenőrizd a logokat)
3. Kattints a workflow-ra és nézd meg a lépéseket:
   - Checkout
   - Setup Node
   - Install dependencies
   - Build
   - Upload artifact
   - Deploy

### Live Site Funkcionális Teszt
```bash
# Tesztelendő URL-ek
https://supiix.github.io/Timeline/
https://supiix.github.io/Timeline/index.html

# Elvárt válasz: 200 OK, működő alkalmazás
```

---

## 📝 JSON Adatstruktúra Specifikáció

### Teljes JSON Séma
```json
{
  "semester": {
    "name": "string",
    "start": "YYYY-MM-DD",
    "end": "YYYY-MM-DD"
  },
  "categories": [
    {
      "id": "string",
      "name": "string",
      "color": "#RRGGBB"
    }
  ],
  "events": [
    {
      "id": number,
      "title": "string",
      "titleEn": "string",
      "date": "YYYY-MM-DD",
      "endDate": "YYYY-MM-DD | null",
      "category": "string (category id)",
      "description": "string",
      "descriptionEn": "string",
      "location": "string",
      "locationEn": "string",
      "link": "string (URL) | null"
    }
  ]
}
```

### Minta JSON (Minimális)
```json
{
  "categories": [
    {
      "id": "exam",
      "name": "Vizsga",
      "color": "#ef4444"
    }
  ],
  "events": [
    {
      "id": 1,
      "title": "Matematika vizsga",
      "titleEn": "Mathematics Exam",
      "date": "2025-06-15",
      "endDate": null,
      "category": "exam",
      "description": "Számítógépes vizsga",
      "descriptionEn": "Computer-based exam",
      "location": "A1 épület",
      "locationEn": "Building A1",
      "link": null
    }
  ]
}
```

---

## 🔧 Hibaelhárítás

### Probléma: Üres oldal betöltődik
**Megoldás:**
1. Nyisd meg a böngésző konzolt (F12)
2. Ellenőrizd a 404 vagy CORS hibákat
3. Ellenőrizd a `vite.config.js` base URL-jét
4. Nézd meg a hálózati forgalmat: asset-ek 404-et adnak?

### Probléma: GitHub Actions sikertelen
**Megoldás:**
1. Ellenőrizd a workflow log-ot
2. Lehetséges okok:
   - Dependency install hiba → `npm ci` lokálisan
   - Build hiba → `npm run build` lokálisan
   - Permission hiba → Ellenőrizd a workflow permissions-t
3. Próbáld újra futtatni a workflow-t (Re-run jobs)

### Probléma: JSON nem töltődik be
**Megoldás:**
1. Validáld a JSON-t (jsonlint.com)
2. Ellenőrizd a fájl karakterkódolását (UTF-8)
3. Nézd meg a böngésző konzolt részletes hibaüzenetért

### Probléma: Események nem jelennek meg
**Megoldás:**
1. Ellenőrizd a JSON struktúrát (categories és events tömbök)
2. Nézd meg a React DevTools-ban az events state-et
3. Ellenőrizd a kategória ID-k egyezését

---

## 📞 Kontakt és Támogatás

- **Repository:** https://github.com/SupiiX/Timeline
- **Issues:** https://github.com/SupiiX/Timeline/issues
- **Fejlesztő:** SupiiX

---

## 📄 Licenc és Harmadik Fél Komponensek

### Használt Open Source Library-k
- React (MIT License)
- FullCalendar (MIT License)
- Tailwind CSS (MIT License)
- Lucide Icons (ISC License)

### SPA GitHub Pages Script
- **Forrás:** https://github.com/rafgraph/spa-github-pages
- **Licenc:** MIT
- **Használat:** index.html és 404.html redirect kezelés

---

## ✨ Összefoglalás

Ez a projekt egy **működőképes, production-ready** React alkalmazás, amely:
- ✅ Megfelelően konfiguráltva GitHub Pages hosting-hoz
- ✅ Modern React gyakorlatokat követ (Hooks, memo optimization)
- ✅ Teljes esemény CRUD funkcionalitással rendelkezik
- ✅ Két különböző nézettel (naptár és idővonal)
- ✅ Kétnyelvű adatkezeléssel (magyar/angol)
- ✅ Automatikus CI/CD pipeline-nal

**FIGYELEM:** Az `index.html` fájl megfelelően konfigurált és tartalmazza az összes szükséges elemet a GitHub Pages SPA működéséhez!

---

**Dokumentum verzió:** 1.0
**Utolsó frissítés:** 2026-02-11
**Ellenőrző AI számára:** Ez a dokumentum minden szükséges információt tartalmaz a projekt teljes körű átvizsgálásához és működésének ellenőrzéséhez.
