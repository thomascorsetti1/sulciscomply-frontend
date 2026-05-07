# Compliance Dashboard Backend API

Backend API per una dashboard di compliance SaaS per studi legali e commercialisti, con autenticazione, RBAC, isolamento per studio e audit logging.

## Tecnologie

- **Node.js** con Express.js
- **SQLite** per il database
- **bcryptjs** per l'hashing delle password
- **jsonwebtoken** per l'autenticazione JWT
- **dotenv** per la gestione delle variabili d'ambiente
- **CORS** per la comunicazione cross-origin
- **Body-parser** per il parsing JSON

## Installazione

1.  Clonare il repository (o scaricare i file):
    ```bash
    git clone <repository-url>
    cd compliance-dashboard-backend
    ```

2.  Installare le dipendenze:
    ```bash
    npm install
    ```

3.  Creare un file `.env` nella root del progetto con le seguenti variabili:
    ```
    JWT_SECRET=la_tua_chiave_segreta_jwt
    PORT=3000
    ```
    *Sostituire `la_tua_chiave_segreta_jwt` con una stringa casuale e complessa.*

4.  Il database SQLite (`database.db`) verrà creato automaticamente al primo avvio del server, basandosi su `schema.sql`.

## Avvio

### Modalità Sviluppo
```bash
npm run dev
```

### Modalità Produzione
```bash
npm start
```

Il server sarà disponibile su `http://localhost:3000` (o sulla porta specificata in `.env`).

## Popolamento del Database (Dati di Test)

Per popolare il database con dati di esempio (studi, utenti, clienti, AML, GDPR, task):
```bash
npm run seed
```

Questo creerà:
-   2 studi
-   4 utenti (Admin, Professional, Staff per Studio 1; Admin per Studio 2)
-   3 clienti
-   3 file AML
-   3 registri GDPR
-   3 task

**Credenziali di test:**
-   **Studio 1 Admin:** `username: admin_rossi`, `password: admin123`
-   **Studio 1 Professional:** `username: prof_mario`, `password: user123`
-   **Studio 1 Staff:** `username: staff_anna`, `password: user123`
-   **Studio 2 Admin:** `username: admin_bianchi`, `password: admin123`

## Architettura e Funzionalità Chiave

-   **Autenticazione JWT**: Login e registrazione utenti con token JWT.
-   **RBAC (Role-Based Access Control)**: Ruoli definiti (`Admin`, `Professional`, `Staff`, `Viewer`) con permessi granulari.
-   **Isolamento per Studio (Multi-tenant)**: Ogni richiesta API è filtrata per `studio_id` dell'utente autenticato, garantendo che gli utenti possano accedere solo ai dati del proprio studio.
-   **CRUD Completo**: Operazioni Create, Read, Update, Delete per tutte le entità.
-   **Audit Logging**: Tutte le modifiche importanti (creazione, aggiornamento, eliminazione) sono registrate nella tabella `AuditLog`.

## Endpoint API

### Autenticazione (`/api/auth`)
-   `POST /api/auth/register`
    -   **Request:** `{"studio_id": 1, "username": "nuovo_utente", "email": "nuovo@studio.it", "password": "passwordSicura123", "role": "Staff"}`
    -   **Response (Success):** `{"id": 5, "studio_id": 1, "username": "nuovo_utente", "email": "nuovo@studio.it", "role": "Staff"}`
    -   **Response (Error):** `{"error": "Username or email already exists"}`
-   `POST /api/auth/login`
    -   **Request:** `{"username": "admin_rossi", "password": "admin123"}`
    -   **Response (Success):** `{"token": "eyJ...", "user": {"id": 1, "studio_id": 1, "username": "admin_rossi", "email": "admin@studio.it", "role": "Admin"}}`
    -   **Response (Error):** `{"error": "Invalid credentials"}`

### Studios (`/api/studios`)
-   `GET /api/studios/:id` (Richiede autenticazione, isolato per studio)
    -   **Response:** `{"id": 1, "name": "Studio Legale Rossi", "address": "Via Roma 1, Milano"}`
-   `PUT /api/studios/:id` (Richiede autenticazione, permesso `update`)
    -   **Request:** `{"name": "Studio Legale Rossi Aggiornato", "address": "Nuovo Indirizzo"}`
    -   **Response:** `{"id": 1, "name": "Studio Legale Rossi Aggiornato", "address": "Nuovo Indirizzo"}`

### Users (`/api/users`)
-   `GET /api/users` (Richiede autenticazione, isolato per studio)
    -   **Response:** `[{"id": 1, "studio_id": 1, "username": "admin_rossi", "email": "admin@studio.it", "role": "Admin"}, ...]`
-   `GET /api/users/:id` (Richiede autenticazione, isolato per studio)
-   `POST /api/users` (Richiede autenticazione, permesso `manage_users`)
    -   **Request:** `{"username": "nuovo_staff", "email": "staff@studio.it", "role": "Staff"}`
    -   **Response:** `{"id": 5, "studio_id": 1, "username": "nuovo_staff", "email": "staff@studio.it", "role": "Staff"}`
-   `PUT /api/users/:id` (Richiede autenticazione, permesso `update`)
-   `DELETE /api/users/:id` (Richiede autenticazione, permesso `manage_users`)

### Clients (`/api/clients`)
-   `GET /api/clients` (Richiede autenticazione, isolato per studio)
-   `GET /api/clients/:id` (Richiede autenticazione, isolato per studio)
-   `POST /api/clients` (Richiede autenticazione, permesso `create`)
    -   **Request:** `{"name": "Nuovo Cliente Srl", "address": "Via Nuova 1, Città", "tax_id": "00000000000", "fiscal_context": "Grande Azienda"}`
    -   **Response:** `{"id": 4, "studio_id": 1, "name": "Nuovo Cliente Srl", ...}`
-   `PUT /api/clients/:id` (Richiede autenticazione, permesso `update`)
-   `DELETE /api/clients/:id` (Richiede autenticazione, permesso `delete`)

### AML Files (`/api/aml`)
-   `GET /api/aml` (Richiede autenticazione, isolato per studio)
-   `GET /api/aml/:id` (Richiede autenticazione, isolato per studio)
-   `GET /api/aml/client/:client_id` (Richiede autenticazione, isolato per studio)
-   `POST /api/aml` (Richiede autenticazione, permesso `create`)
    -   **Request:** `{"client_id": 1, "status": "In verifica", "risk_rating": "Alto"}`
    -   **Response:** `{"id": 4, "client_id": 1, "status": "In verifica", "risk_rating": "Alto", "last_updated": "2024-04-29T..."}`
-   `PUT /api/aml/:id` (Richiede autenticazione, permesso `update`)
-   `DELETE /api/aml/:id` (Richiede autenticazione, permesso `delete`)

### GDPR Registers (`/api/gdpr`)
-   `GET /api/gdpr` (Richiede autenticazione, isolato per studio)
-   `GET /api/gdpr/:id` (Richiede autenticazione, isolato per studio)
-   `GET /api/gdpr/client/:client_id` (Richiede autenticazione, isolato per studio)
-   `POST /api/gdpr` (Richiede autenticazione, permesso `create`)
    -   **Request:** `{"client_id": 1, "data_subject_name": "Marketing", "data_category": "Contatti", "processing_purpose": "Newsletter", "gdpr_status": "In attesa"}`
    -   **Response:** `{"id": 4, "client_id": 1, "data_subject_name": "Marketing", ...}`
-   `PUT /api/gdpr/:id` (Richiede autenticazione, permesso `update`)
-   `DELETE /api/gdpr/:id` (Richiede autenticazione, permesso `delete`)

### Tasks (`/api/tasks`)
-   `GET /api/tasks` (Richiede autenticazione, isolato per studio)
-   `GET /api/tasks/:id` (Richiede autenticazione, isolato per studio)
-   `GET /api/tasks/user/:user_id` (Richiede autenticazione, isolato per studio)
-   `GET /api/tasks/client/:client_id` (Richiede autenticazione, isolato per studio)
-   `POST /api/tasks` (Richiede autenticazione, permesso `create`)
    -   **Request:** `{"assigned_to_user_id": 2, "client_id": 1, "description": "Preparare report trimestrale", "due_date": "2024-05-15T23:59:59Z", "status": "In corso"}`
    -   **Response:** `{"id": 5, "assigned_to_user_id": 2, "client_id": 1, ...}`
-   `PUT /api/tasks/:id` (Richiede autenticazione, permesso `update`)
-   `DELETE /api/tasks/:id` (Richiede autenticazione, permesso `delete`)

### Audit Logs (`/api/audit-logs`)
-   `GET /api/audit-logs` (Richiede autenticazione, permesso `read`, isolato per studio)
    -   **Response:** `[{"id": 1, "user_id": 1, "studio_id": 1, "action": "CREATE", "entity_type": "Client", "entity_id": 1, "old_value": null, "new_value": "{\"name\":\"Azienda XYZ Srl\"...}", "timestamp": "2024-04-29T..."}, ...]`
-   `GET /api/audit-logs/user/:user_id` (Richiede autenticazione, permesso `read`, isolato per studio)
-   `GET /api/audit-logs/entity/:entity_type/:entity_id` (Richiede autenticazione, permesso `read`, isolato per studio)

## Struttura del Progetto

```
compliance-dashboard-backend/
├── server.js               # Entry point principale dell'applicazione Express
├── db.js                   # Configurazione e inizializzazione del database SQLite
├── schema.sql              # Definizione dello schema del database
├── seed.js                 # Script per popolare il database con dati di test
├── package.json            # Dipendenze e script di Node.js
├── .env                    # Variabili d'ambiente (es. JWT_SECRET, PORT)
├── middleware/
│   ├── auth.js             # Middleware per la verifica del token JWT
│   ├── rbac.js             # Middleware per il controllo degli accessi basato sui ruoli
│   └── tenantIsolation.js  # Middleware per l'isolamento dei dati per studio
├── routes/
│   ├── auth.js             # Route per registrazione e login
│   ├── studios.js          # Route per la gestione degli studi
│   ├── users.js            # Route per la gestione degli utenti
│   ├── clients.js          # Route per la gestione dei clienti
│   ├── aml.js              # Route per la gestione dei file AML
│   ├── gdpr.js             # Route per la gestione dei registri GDPR
│   ├── tasks.js            # Route per la gestione dei task
│   └── auditLog.js         # Route per la consultazione dei log di audit
├── utils/
│   └── auth.js             # Funzioni di utilità per hashing password e JWT
│   └── auditLog.js         # Funzioni di utilità per la registrazione degli audit log
└── database.db             # File del database SQLite (generato automaticamente)
```

## Troubleshooting

-   **`npm install` fallisce**: Assicurati di avere Node.js e npm installati correttamente. Controlla la versione di Node.js (dovrebbe essere 16+).
-   **Server non si avvia**: Controlla la console per eventuali messaggi di errore. Assicurati che la porta 3000 non sia già in uso. Se lo è, puoi cambiarla nel file `.env`.
-   **Errore database**: Se riscontri problemi con il database, puoi provare a eliminare il file `database.db` nella cartella `compliance-dashboard-backend/` e riavviare il server (`npm run dev`). Questo ricreerà il database da zero. Puoi poi usare `npm run seed` per ripopolarlo.
-   **Autenticazione fallisce**: Verifica che `JWT_SECRET` sia impostato nel file `.env` e che sia lo stesso utilizzato per generare e verificare i token. Controlla le credenziali di login (username e password) e i ruoli assegnati agli utenti.
-   **Accesso negato (403 Forbidden)**: Questo indica un problema di RBAC o isolamento per studio. Assicurati che l'utente autenticato abbia il ruolo e i permessi necessari per l'azione richiesta e che stia tentando di accedere a risorse del proprio studio.

## Note Importanti

-   Questo backend è un MVP e non include funzionalità avanzate come la gestione delle password dimenticate, la validazione completa degli input, la gestione degli errori più granulare o la paginazione/filtri avanzati per le liste.
-   La gestione dei ruoli è basata su un semplice oggetto `rolePermissions` nel middleware `rbac.js`. Per un sistema di RBAC più robusto, si potrebbe considerare una gestione dei permessi basata su database.
-   Le password degli utenti di test create con `npm run seed` sono `admin123` per gli Admin e `user123` per gli altri ruoli. In un ambiente di produzione, gli utenti dovrebbero impostare le proprie password complesse al momento della registrazione.

Questo backend fornisce una base solida e funzionale per l'MVP della dashboard di compliance, con le funzionalità di sicurezza e isolamento richieste. Ora è pronto per essere integrato con un frontend.
