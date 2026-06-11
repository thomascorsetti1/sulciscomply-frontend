# SulcisComply — Frontend

Interfaccia utente per SulcisComply, dashboard di compliance per studi legali e commercialisti.

## Tecnologie
- React + Vite
- Tailwind CSS
- Deploy: Render

## Installazione locale

```bash
git clone https://github.com/thomascorsetti1/sulciscomply-frontend
cd sulciscomply-frontend
yarn install
```

Crea un file `.env` nella root:
Avvia il server di sviluppo:

```bash
yarn dev
```

L'app gira su `http://localhost:5173`.

## Architettura
## Pagine principali

| Pagina | Descrizione |
|--------|-------------|
| Dashboard | KPI generali, grafici, scadenze imminenti, clienti ad alto rischio |
| Clienti | Lista clienti con ricerca e filtri |
| Dettaglio cliente | Scheda unificata con tab AML, GDPR, Profilo Fiscale, Task |
| Task | Lista task con priorità, assegnazione, filtri e badge scadenza |
| Report | Semaforo rischio, scadenze 30 giorni, task suggeriti, export CSV |
| Audit Trail | Storico modifiche con filtri per cliente ed entità |

## Connessione al backend

Tutte le chiamate API passano per `src/api.js` che punta a `VITE_API_URL`. In produzione l'URL è `https://sulciscomply-api.onrender.com`.

## Deploy

Il frontend è deployato su Render come Static Site. Ogni push su GitHub trigghera automaticamente un nuovo build.
