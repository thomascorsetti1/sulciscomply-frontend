# Compliance Dashboard MVP

Dashboard SaaS minima per la gestione della compliance in studi legali e commercialisti.

## Panoramica

Questo MVP fornisce una piattaforma unificata per:
- **Gestione Clienti**: Archivio centralizzato di clienti con contesto fiscale
- **Compliance AML**: Tracciamento dello stato Anti-Riciclaggio e risk rating
- **Registri GDPR**: Gestione del trattamento dati personali
- **Task Management**: Assegnazione e tracciamento di attività
- **Dashboard KPI**: Visualizzazione metrica dello stato dello studio

## Stack Tecnologico

### Backend
- **Node.js** + **Express.js** - Server API REST
- **SQLite** - Database file-based
- **CORS** - Cross-origin resource sharing

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool moderno
- **React Router** - Routing client-side
- **TailwindCSS** - Styling utility-first

### Database
- **SQLite** - Database relazionale leggero

## Struttura del Progetto

```
dashboard-compliance-mvp/
├── schema.sql              # Schema database SQLite
├── backend/
│   ├── server.js           # Entry point Express
│   ├── db.js               # Configurazione database
│   ├── routes/             # API endpoints
│   │   ├── studios.js
│   │   ├── users.js
│   │   ├── clients.js
│   │   ├── aml.js
│   │   ├── gdpr.js
│   │   └── tasks.js
│   ├── package.json
│   ├── README.md
│   └── database.db         # SQLite database (creato automaticamente)
├── frontend/
│   ├── src/
│   │   ├── pages/          # Pagine React
│   │   ├── api.js          # Client API
│   │   ├── App.jsx
│   │   └── index.jsx
│   ├── public/
│   │   └── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   ├── README.md
│   └── node_modules/
├── docs/                   # Documentazione
└── README.md              # Questo file
```

## Installazione e Avvio

### Prerequisiti
- Node.js 16+ e npm

### Backend

1. Navigare nella cartella backend:
```bash
cd backend
```

2. Installare le dipendenze:
```bash
npm install
```

3. Avviare il server:
```bash
npm run dev
```

Il server sarà disponibile su `http://localhost:3000`

### Frontend

In un nuovo terminale:

1. Navigare nella cartella frontend:
```bash
cd frontend
```

2. Installare le dipendenze:
```bash
npm install
```

3. Avviare il dev server:
```bash
npm run dev
```

L'applicazione sarà disponibile su `http://localhost:5173`

## Utilizzo

1. Aprire il browser su `http://localhost:5173`
2. Navigare tramite il menu laterale
3. Creare uno studio (opzionale, se non esiste)
4. Aggiungere clienti
5. Gestire AML, GDPR, Task

## Entità Principali

### Studio
Studio legale o commercialista che utilizza la piattaforma.

**Campi**: id, name, address

### User
Utente che opera all'interno dello studio.

**Campi**: id, studio_id, username, email, role

### Client
Cliente dello studio.

**Campi**: id, studio_id, name, address, tax_id, fiscal_context

### AMLFile
File di compliance Anti-Riciclaggio per un cliente.

**Campi**: id, client_id, status, risk_rating, last_updated

### GDPRRegister
Registro di trattamento dati GDPR per un cliente.

**Campi**: id, client_id, data_subject_name, data_category, processing_purpose, gdpr_status

### Task
Attività assegnata a un utente, potenzialmente collegata a un cliente.

**Campi**: id, assigned_to_user_id, client_id, description, due_date, status

## API Endpoints

Consultare i README specifici:
- [Backend API Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)

## Funzionalità MVP

✅ Dashboard con KPI
✅ Gestione Clienti (CRUD)
✅ Gestione AML (CRUD)
✅ Gestione GDPR (CRUD)
✅ Gestione Task (CRUD)
✅ Gestione Utenti (CRUD)
✅ Gestione Studi (CRUD)
✅ Routing frontend
✅ API REST completa

## Sviluppi Futuri

- Autenticazione e autorizzazione
- Caricamento file (documenti AML, registri GDPR)
- Notifiche per task in scadenza
- Export report PDF
- Filtri avanzati
- Paginazione
- Ricerca full-text
- Audit log
- Multi-tenancy migliorato

## Note Importanti

- Il database SQLite viene creato automaticamente al primo avvio
- CORS è abilitato per permettere la comunicazione tra frontend e backend
- Tutti i dati sono memorizzati localmente nel file `database.db`
- Per resettare il database, eliminare il file `backend/database.db` e riavviare il server

## Troubleshooting

### Backend non si connette
- Verificare che la porta 3000 sia disponibile
- Controllare i log della console per errori

### Frontend non carica i dati
- Verificare che il backend sia in esecuzione su `http://localhost:3000`
- Controllare la console del browser per errori CORS
- Verificare che l'URL dell'API in `frontend/src/api.js` sia corretto

### Database corrotto
- Eliminare `backend/database.db`
- Riavviare il server

## Licenza

MIT

## Supporto

Per problemi o domande, consultare la documentazione nei file README specifici o verificare i log della console.
