# Compliance Dashboard Backend

Backend API per la dashboard di compliance SaaS per studi legali e commercialisti.

## Tecnologie

- **Node.js** con Express.js
- **SQLite** per il database
- **CORS** per la comunicazione cross-origin
- **Body-parser** per il parsing JSON

## Installazione

1. Installare le dipendenze:
```bash
npm install
```

2. Il database SQLite verrà creato automaticamente al primo avvio.

## Avvio

### Modalità Sviluppo
```bash
npm run dev
```

### Modalità Produzione
```bash
npm start
```

Il server sarà disponibile su `http://localhost:3000`

## Endpoint API

### Studios
- `GET /api/studios` - Ottieni tutti gli studi
- `GET /api/studios/:id` - Ottieni uno studio
- `POST /api/studios` - Crea uno studio
- `PUT /api/studios/:id` - Aggiorna uno studio
- `DELETE /api/studios/:id` - Elimina uno studio

### Users
- `GET /api/users` - Ottieni tutti gli utenti
- `GET /api/users/:id` - Ottieni un utente
- `GET /api/users/studio/:studio_id` - Ottieni utenti di uno studio
- `POST /api/users` - Crea un utente
- `PUT /api/users/:id` - Aggiorna un utente
- `DELETE /api/users/:id` - Elimina un utente

### Clients
- `GET /api/clients` - Ottieni tutti i clienti
- `GET /api/clients/:id` - Ottieni un cliente con AML, GDPR, Task
- `GET /api/clients/studio/:studio_id` - Ottieni clienti di uno studio
- `POST /api/clients` - Crea un cliente
- `PUT /api/clients/:id` - Aggiorna un cliente
- `DELETE /api/clients/:id` - Elimina un cliente

### AML Files
- `GET /api/aml` - Ottieni tutti i file AML
- `GET /api/aml/:id` - Ottieni un file AML
- `GET /api/aml/client/:client_id` - Ottieni file AML di un cliente
- `POST /api/aml` - Crea un file AML
- `PUT /api/aml/:id` - Aggiorna un file AML
- `DELETE /api/aml/:id` - Elimina un file AML

### GDPR Registers
- `GET /api/gdpr` - Ottieni tutti i registri GDPR
- `GET /api/gdpr/:id` - Ottieni un registro GDPR
- `GET /api/gdpr/client/:client_id` - Ottieni registri GDPR di un cliente
- `POST /api/gdpr` - Crea un registro GDPR
- `PUT /api/gdpr/:id` - Aggiorna un registro GDPR
- `DELETE /api/gdpr/:id` - Elimina un registro GDPR

### Tasks
- `GET /api/tasks` - Ottieni tutti i task
- `GET /api/tasks/:id` - Ottieni un task
- `GET /api/tasks/client/:client_id` - Ottieni task di un cliente
- `GET /api/tasks/user/:user_id` - Ottieni task di un utente
- `POST /api/tasks` - Crea un task
- `PUT /api/tasks/:id` - Aggiorna un task
- `DELETE /api/tasks/:id` - Elimina un task

## Health Check

```bash
curl http://localhost:3000/api/health
```

## Struttura del Progetto

```
backend/
├── server.js          # Entry point principale
├── db.js              # Configurazione database
├── routes/            # Route API
│   ├── studios.js
│   ├── users.js
│   ├── clients.js
│   ├── aml.js
│   ├── gdpr.js
│   └── tasks.js
├── package.json
└── database.db        # Database SQLite (creato automaticamente)
```

## Note

- Il database SQLite viene creato automaticamente nella cartella `backend/` al primo avvio
- Tutti gli endpoint ritornano JSON
- Gli errori vengono gestiti con status HTTP appropriati
- CORS è abilitato per permettere richieste dal frontend su `http://localhost:5173`
