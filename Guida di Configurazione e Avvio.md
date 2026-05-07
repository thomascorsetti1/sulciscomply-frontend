# Guida di Configurazione e Avvio

Questa guida ti aiuterà a configurare e avviare l'MVP della Dashboard di Compliance in locale.

## Prerequisiti

- **Node.js** versione 16 o superiore
- **npm** (incluso con Node.js)
- Un terminale/command prompt

Verifica i prerequisiti:
```bash
node --version
npm --version
```

## Step 1: Clonare o Scaricare il Progetto

Se non hai ancora il progetto, scaricalo o clonalo:
```bash
cd ~/
# Se hai git
git clone <repository-url> dashboard-compliance-mvp
# Oppure estrai il file ZIP
unzip dashboard-compliance-mvp.zip
cd dashboard-compliance-mvp
```

## Step 2: Configurare il Backend

### 2.1 Installare le dipendenze del backend

```bash
cd backend
npm install
```

Questo installerà:
- Express.js
- SQLite3
- CORS
- Body-parser
- Nodemon (per lo sviluppo)

### 2.2 Avviare il backend

```bash
npm run dev
```

Dovresti vedere:
```
Compliance Dashboard Backend running on http://localhost:3000
Connected to SQLite database at /path/to/database.db
```

### 2.3 (Opzionale) Popolare il database con dati di test

In un nuovo terminale, nella cartella backend:
```bash
npm run seed
```

Questo creerà:
- 2 studi
- 3 utenti
- 3 clienti
- 3 file AML
- 3 registri GDPR
- 4 task

## Step 3: Configurare il Frontend

### 3.1 Installare le dipendenze del frontend

In un nuovo terminale:
```bash
cd frontend
npm install
```

Questo installerà:
- React 18
- Vite
- React Router
- TailwindCSS
- PostCSS e Autoprefixer

### 3.2 Avviare il frontend

```bash
npm run dev
```

Dovresti vedere:
```
VITE v4.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
```

## Step 4: Accedere all'Applicazione

1. Apri il browser
2. Vai a `http://localhost:5173`
3. Dovresti vedere la Dashboard di Compliance

## Struttura della Navigazione

- **Dashboard** (`/`) - Visualizza KPI dello studio
- **Clienti** (`/clients`) - Gestione clienti
- **Dettaglio Cliente** (`/clients/:id`) - Visualizza AML, GDPR, Task di un cliente
- **Task** (`/tasks`) - Gestione task

## Test dell'Applicazione

### Con Dati di Test
Se hai eseguito lo script seed, puoi:
1. Andare su Clienti e vedere i 3 clienti di test
2. Cliccare su un cliente per vedere i dettagli
3. Andare su Task per vedere i 4 task di test

### Senza Dati di Test
1. Andare su Clienti
2. Cliccare "Nuovo Cliente"
3. Compilare il form e salvare
4. Cliccare su "Dettagli" per visualizzare il cliente

## Comandi Utili

### Backend
```bash
cd backend

# Avviare in modalità sviluppo (con auto-reload)
npm run dev

# Avviare in modalità produzione
npm start

# Popolare il database con dati di test
npm run seed
```

### Frontend
```bash
cd frontend

# Avviare dev server
npm run dev

# Build per produzione
npm run build

# Preview della build
npm run preview
```

## Troubleshooting

### Errore: "Port 3000 is already in use"
Il backend non può avviarsi perché la porta 3000 è già occupata.

**Soluzione:**
- Chiudi altre applicazioni che usano la porta 3000
- Oppure modifica la porta in `backend/server.js`:
  ```javascript
  const PORT = process.env.PORT || 3001; // Cambia 3000 in 3001
  ```

### Errore: "Port 5173 is already in use"
Il frontend non può avviarsi perché la porta 5173 è già occupata.

**Soluzione:**
- Chiudi altre applicazioni che usano la porta 5173
- Oppure modifica la porta in `frontend/vite.config.js`:
  ```javascript
  server: {
    port: 5174, // Cambia 5173 in 5174
  }
  ```

### Errore: "Cannot find module 'express'"
Le dipendenze non sono state installate.

**Soluzione:**
```bash
cd backend
npm install
```

### Il frontend non carica i dati
Il backend potrebbe non essere in esecuzione o su una porta diversa.

**Soluzione:**
1. Verifica che il backend sia in esecuzione su `http://localhost:3000`
2. Apri la console del browser (F12) e cerca errori CORS
3. Se il backend è su una porta diversa, modifica `frontend/src/api.js`:
   ```javascript
   const API_BASE_URL = 'http://localhost:3001/api'; // Cambia la porta
   ```

### Database corrotto o vuoto
Se il database è corrotto o vuoi ricominciare da zero.

**Soluzione:**
```bash
cd backend
rm database.db  # Elimina il database
npm run dev     # Riavvia il server (creerà un nuovo database)
npm run seed    # (Opzionale) Popola con dati di test
```

## Architettura

```
Frontend (React)          Backend (Express)         Database (SQLite)
http://localhost:5173  <-> http://localhost:3000 <-> database.db
```

## Prossimi Passi

1. **Esplora il codice** - Leggi i file README in `backend/` e `frontend/`
2. **Aggiungi dati** - Crea nuovi clienti, task, ecc.
3. **Personalizza** - Modifica i colori, layout, funzionalità
4. **Sviluppa** - Aggiungi nuove pagine e funzionalità

## Supporto

Se incontri problemi:
1. Controlla i log della console (terminale e browser)
2. Verifica che Node.js e npm siano installati correttamente
3. Assicurati che le porte 3000 e 5173 siano disponibili
4. Leggi i README specifici in `backend/` e `frontend/`

Buon lavoro! 🚀
