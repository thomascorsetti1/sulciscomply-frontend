CREATE TABLE Studio (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT
);

CREATE TABLE User (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    studio_id INTEGER NOT NULL,
    username TEXT NOT NULL UNIQUE,
    email TEXT UNIQUE,
    role TEXT NOT NULL,
    FOREIGN KEY (studio_id) REFERENCES Studio(id)
);

CREATE TABLE Client (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    studio_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    address TEXT,
    tax_id TEXT UNIQUE,
    fiscal_context TEXT,
    FOREIGN KEY (studio_id) REFERENCES Studio(id)
);

CREATE TABLE AMLFile (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    status TEXT NOT NULL,
    risk_rating TEXT,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES Client(id)
);

CREATE TABLE GDPRRegister (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL,
    data_subject_name TEXT,
    data_category TEXT,
    processing_purpose TEXT,
    gdpr_status TEXT,
    FOREIGN KEY (client_id) REFERENCES Client(id)
);

CREATE TABLE Task (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    assigned_to_user_id INTEGER NOT NULL,
    client_id INTEGER,
    description TEXT NOT NULL,
    due_date DATETIME,
    status TEXT NOT NULL,
    FOREIGN KEY (assigned_to_user_id) REFERENCES User(id),
    FOREIGN KEY (client_id) REFERENCES Client(id)
);
