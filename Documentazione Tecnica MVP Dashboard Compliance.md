# Documentazione Tecnica MVP Dashboard Compliance

## 1. Schema Entità-Relazione (ER) Minimo

Di seguito è presentato lo schema ER minimo per l'MVP della dashboard di compliance, che include le entità fondamentali e le loro relazioni. Questo schema è stato progettato per supportare le funzionalità principali relative alla gestione di clienti, file AML, registri GDPR, task e utenti all'interno di uno studio legale o commercialista.

![Schema ER Minimo](https://private-us-east-1.manuscdn.com/sessionFile/vGBo2RPZ0Mr86Tf06cMwmz/sandbox/IUfRyh1RJD1MHAoPSPiHqm-images_1777475471264_na1fn_L2hvbWUvdWJ1bnR1L2VyX3NjaGVtYQ.png?Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvdkdCbzJSUFowTXI4NlRmMDZjTXdtei9zYW5kYm94L0lVZlJ5aDFSSkQxTUhBb1BTUGlIcW0taW1hZ2VzXzE3Nzc0NzU0NzEyNjRfbmExZm5fTDJodmJXVXZkV0oxYm5SMUwyVnlYM05qYUdWdFlRLnBuZyIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=NCXnmlmpNJCpvPJj555BMf8DGkzRq0cTUQCOyXD68Meh1O4fUiVwM5BpzZObv1AxxuInL90kIq~H0h3MEfxyaioViR8OZnohIwU~J~aC7-8tRs3awgbKa7ejlUtwhga9psxAJRpqVdu~ryA5cc9cIZ4~hPnh5VdXFJxHFK50GAgDCYmY5CkjlzBpFEvxoJGxFW5UkSyKEwUgDlR5pZ3ub4GnfGWPeE9WteScsZ730YMImzhA1FNIvTyfxs9F7bgStxoIyjqF4YLIg4YYXewXjSXDUa2D-u3cRabgSS7aSPnGuKpi4DWasZvsVDCLXj70WxgsDjVo-hpgMCFkKf1~kg__)

### Descrizione delle Entità:

*   **Client**: Rappresenta il cliente dello studio. Contiene informazioni anagrafiche essenziali.
    *   `id`: Identificatore univoco del cliente (chiave primaria).
    *   `name`: Nome completo del cliente.
    *   `address`: Indirizzo del cliente.
    *   `tax_id`: Codice fiscale o partita IVA del cliente.

*   **AMLFile**: Rappresenta un fascicolo relativo alle normative Anti-Riciclaggio (AML) per un cliente specifico.
    *   `id`: Identificatore univoco del fascicolo AML (chiave primaria).
    *   `client_id`: Chiave esterna che collega al `Client` a cui si riferisce il fascicolo.
    *   `status`: Stato attuale del fascicolo (es. 'In revisione', 'Approvato', 'Rifiutato').
    *   `last_updated`: Data e ora dell'ultimo aggiornamento del fascicolo.

*   **GDPRRegister**: Rappresenta una voce nel registro GDPR per un cliente, dettagliando il trattamento dei dati personali.
    *   `id`: Identificatore univoco della voce del registro GDPR (chiave primaria).
    *   `client_id`: Chiave esterna che collega al `Client` a cui si riferisce la voce.
    *   `data_subject_name`: Nome dell'interessato ai dati.
    *   `data_category`: Categoria di dati personali trattati (es. 'Dati comuni', 'Dati sensibili').
    *   `processing_purpose`: Scopo del trattamento dei dati.

*   **Task**: Rappresenta un'attività o un compito da svolgere, assegnato a un utente e potenzialmente collegato a un cliente.
    *   `id`: Identificatore univoco del task (chiave primaria).
    *   `assigned_to_user_id`: Chiave esterna che collega all'utente (`User`) a cui è assegnato il task.
    *   `client_id`: Chiave esterna che collega al `Client` a cui si riferisce il task (opzionale).
    *   `description`: Descrizione dettagliata del task.
    *   `due_date`: Data di scadenza del task.
    *   `status`: Stato attuale del task (es. 'In corso', 'Completato', 'In attesa').

*   **Studio**: Rappresenta lo studio legale o commercialista.
    *   `id`: Identificatore univoco dello studio (chiave primaria).
    *   `name`: Nome dello studio.
    *   `address`: Indirizzo dello studio.

*   **User**: Rappresenta un utente che opera all'interno dello studio (es. avvocato, commercialista, segretario).
    *   `id`: Identificatore univoco dell'utente (chiave primaria).
    *   `studio_id`: Chiave esterna che collega allo `Studio` a cui appartiene l'utente.
    *   `username`: Nome utente per l'accesso.
    *   `email`: Indirizzo email dell'utente.
    *   `role`: Ruolo dell'utente all'interno dello studio (es. 'Admin', 'Avvocato', 'Commercialista').

## 2. Struttura di Progetto Consigliata (Backend/Frontend)

Per l'MVP, si consiglia un'architettura a microservizi per il backend e un'applicazione a pagina singola (SPA) per il frontend, comunicanti tramite API RESTful. Questa struttura offre scalabilità, manutenibilità e una chiara separazione delle responsabilità.

### Backend (Microservizi con Python/FastAPI o Node.js/Express.js)

Si suggerisce l'uso di Python con FastAPI per la sua velocità e validazione automatica dei dati, oppure Node.js con Express.js per la sua flessibilità e l'ecosistema JavaScript.

```
backend/
├── src/
│   ├── auth/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── routes.py
│   ├── clients/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── routes.py
│   ├── aml_files/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── routes.py
│   ├── gdpr_registers/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── routes.py
│   ├── tasks/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── routes.py
│   ├── studios/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── routes.py
│   ├── users/
│   │   ├── __init__.py
│   │   ├── models.py
│   │   ├── schemas.py
│   │   └── routes.py
│   ├── core/
│   │   ├── config.py
│   │   ├── database.py
│   │   └── dependencies.py
│   └── main.py
├── tests/
│   ├── test_auth.py
│   ├── test_clients.py
│   └── ...
├── .env
├── requirements.txt (Python) / package.json (Node.js)
├── Dockerfile
└── README.md
```

### Frontend (React con TypeScript e TailwindCSS)

React offre un'ottima esperienza utente e un vasto ecosistema. TypeScript migliora la robustezza del codice, mentre TailwindCSS facilita lo sviluppo rapido di interfacce utente moderne e responsive.

```
frontend/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── assets/
│   │   ├── images/
│   │   └── styles/
│   │       └── index.css
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   └── Input.tsx
│   │   ├── layout/
│   │   │   ├── Header.tsx
│   │   │   └── Sidebar.tsx
│   │   └── specific/
│   │       ├── ClientList.tsx
│   │       ├── AMLFileDetail.tsx
│   │       └── ...
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Clients.tsx
│   │   ├── AMLFiles.tsx
│   │   ├── GDPRRegisters.tsx
│   │   ├── Tasks.tsx
│   │   ├── Users.tsx
│   │   └── Settings.tsx
│   ├── services/
│   │   └── api.ts
│   ├── hooks/
│   │   └── useAuth.ts
│   ├── contexts/
│   │   └── AuthContext.tsx
│   ├── App.tsx
│   ├── index.tsx
│   └── react-app-env.d.ts
├── tests/
│   ├── App.test.tsx
│   └── ...
├── .env
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## 3. Elenco dei File da Creare

Questo elenco dettagliato include i file essenziali per l'implementazione dell'MVP, suddivisi per backend e frontend, seguendo la struttura di progetto consigliata.

### Backend (Esempio con Python/FastAPI)

*   `backend/src/main.py`: Punto di ingresso dell'applicazione FastAPI.
*   `backend/src/core/config.py`: Gestione delle configurazioni dell'applicazione (es. variabili d'ambiente).
*   `backend/src/core/database.py`: Connessione al database e gestione delle sessioni.
*   `backend/src/core/dependencies.py`: Dipendenze comuni (es. autenticazione, sessione DB).
*   `backend/src/auth/models.py`: Modelli SQLAlchemy/ORM per l'autenticazione (es. User).
*   `backend/src/auth/schemas.py`: Schemi Pydantic per la validazione dei dati di autenticazione.
*   `backend/src/auth/routes.py`: Endpoint API per l'autenticazione (login, registrazione).
*   `backend/src/clients/models.py`: Modello per l'entità `Client`.
*   `backend/src/clients/schemas.py`: Schemi Pydantic per `Client`.
*   `backend/src/clients/routes.py`: Endpoint API per la gestione dei clienti.
*   `backend/src/aml_files/models.py`: Modello per l'entità `AMLFile`.
*   `backend/src/aml_files/schemas.py`: Schemi Pydantic per `AMLFile`.
*   `backend/src/aml_files/routes.py`: Endpoint API per la gestione dei fascicoli AML.
*   `backend/src/gdpr_registers/models.py`: Modello per l'entità `GDPRRegister`.
*   `backend/src/gdpr_registers/schemas.py`: Schemi Pydantic per `GDPRRegister`.
*   `backend/src/gdpr_registers/routes.py`: Endpoint API per la gestione dei registri GDPR.
*   `backend/src/tasks/models.py`: Modello per l'entità `Task`.
*   `backend/src/tasks/schemas.py`: Schemi Pydantic per `Task`.
*   `backend/src/tasks/routes.py`: Endpoint API per la gestione dei task.
*   `backend/src/studios/models.py`: Modello per l'entità `Studio`.
*   `backend/src/studios/schemas.py`: Schemi Pydantic per `Studio`.
*   `backend/src/studios/routes.py`: Endpoint API per la gestione degli studi.
*   `backend/src/users/models.py`: Modello per l'entità `User` (se separato da auth).
*   `backend/src/users/schemas.py`: Schemi Pydantic per `User`.
*   `backend/src/users/routes.py`: Endpoint API per la gestione degli utenti.
*   `backend/tests/test_*.py`: File per i test unitari e di integrazione.
*   `backend/.env`: Variabili d'ambiente (es. credenziali DB, chiavi segrete).
*   `backend/requirements.txt`: Dipendenze Python.
*   `backend/Dockerfile`: Definizione per la containerizzazione dell'applicazione.
*   `backend/README.md`: Descrizione del backend e istruzioni per l'installazione/esecuzione.

### Frontend (Esempio con React/TypeScript/TailwindCSS)

*   `frontend/public/index.html`: Pagina HTML principale.
*   `frontend/src/index.tsx`: Punto di ingresso dell'applicazione React.
*   `frontend/src/App.tsx`: Componente principale dell'applicazione.
*   `frontend/src/react-app-env.d.ts`: Dichiarazioni di tipi per React.
*   `frontend/src/assets/styles/index.css`: File CSS principale (con direttive Tailwind).
*   `frontend/src/components/common/Button.tsx`: Componente riutilizzabile per i bottoni.
*   `frontend/src/components/common/Input.tsx`: Componente riutilizzabile per i campi di input.
*   `frontend/src/components/layout/Header.tsx`: Componente per l'intestazione della dashboard.
*   `frontend/src/components/layout/Sidebar.tsx`: Componente per la barra laterale di navigazione.
*   `frontend/src/components/specific/ClientList.tsx`: Componente per visualizzare l'elenco dei clienti.
*   `frontend/src/components/specific/AMLFileDetail.tsx`: Componente per visualizzare i dettagli di un fascicolo AML.
*   `frontend/src/pages/Dashboard.tsx`: Pagina principale della dashboard.
*   `frontend/src/pages/Clients.tsx`: Pagina per la gestione dei clienti.
*   `frontend/src/pages/AMLFiles.tsx`: Pagina per la gestione dei fascicoli AML.
*   `frontend/src/pages/GDPRRegisters.tsx`: Pagina per la gestione dei registri GDPR.
*   `frontend/src/pages/Tasks.tsx`: Pagina per la gestione dei task.
*   `frontend/src/pages/Users.tsx`: Pagina per la gestione degli utenti.
*   `frontend/src/pages/Settings.tsx`: Pagina per le impostazioni.
*   `frontend/src/services/api.ts`: Modulo per le chiamate API al backend.
*   `frontend/src/hooks/useAuth.ts`: Hook personalizzato per la gestione dell'autenticazione.
*   `frontend/src/contexts/AuthContext.tsx`: Contesto React per la gestione dello stato di autenticazione.
*   `frontend/tests/App.test.tsx`: File per i test unitari dei componenti React.
*   `frontend/.env`: Variabili d'ambiente per il frontend (es. URL del backend API).
*   `frontend/package.json`: Dipendenze Node.js/npm.
*   `frontend/tsconfig.json`: Configurazione TypeScript.
*   `frontend/tailwind.config.js`: Configurazione TailwindCSS.
*   `frontend/postcss.config.js`: Configurazione PostCSS.
*   `frontend/README.md`: Descrizione del frontend e istruzioni per l'installazione/esecuzione.

Questo documento fornisce una base solida per l'avvio dello sviluppo dell'MVP, garantendo una chiara comprensione dello schema dati e dell'architettura applicativa proposta.
