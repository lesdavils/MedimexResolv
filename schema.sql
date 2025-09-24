-- Base de données Medimex - Schéma complet
CREATE DATABASE IF NOT EXISTS medimex_interventions;
USE medimex_interventions;

-- Table des utilisateurs
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    role ENUM('admin','superviseur','technicien','referent','constructeur') NOT NULL DEFAULT 'technicien',
    telephone VARCHAR(20),
    photo_profil VARCHAR(255),
    statut ENUM('actif','inactif') DEFAULT 'actif',
    derniere_connexion TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Table des clients
CREATE TABLE clients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(200) NOT NULL,
    adresse TEXT,
    ville VARCHAR(100),
    code_postal VARCHAR(10),
    contact_principal VARCHAR(100),
    telephone VARCHAR(20),
    email VARCHAR(100),
    notes TEXT,
    statut ENUM('actif','inactif') DEFAULT 'actif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_nom (nom),
    INDEX idx_email (email)
);

-- Table des machines/équipements
CREATE TABLE machines (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(200) NOT NULL,
    modele VARCHAR(100),
    numero_serie VARCHAR(100) UNIQUE,
    client_id INT,
    categorie VARCHAR(100),
    statut ENUM('actif','maintenance','hors_service','retire') DEFAULT 'actif',
    date_installation DATE,
    date_derniere_maintenance DATE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    INDEX idx_numero_serie (numero_serie),
    INDEX idx_client (client_id),
    INDEX idx_categorie (categorie)
);

-- Table des tickets
CREATE TABLE tickets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    numero_ticket VARCHAR(20) UNIQUE NOT NULL,
    titre VARCHAR(200) NOT NULL,
    description TEXT,
    client_id INT,
    machine_id INT,
    technicien_id INT,
    createur_id INT,
    statut ENUM('ouvert','assigne','en_cours','en_attente','termine','annule') DEFAULT 'ouvert',
    priorite ENUM('faible','normale','elevee','critique') DEFAULT 'normale',
    type_intervention ENUM('installation','maintenance_preventive','maintenance_curative','reparation','autre') DEFAULT 'maintenance_curative',
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_assignation TIMESTAMP NULL,
    date_planifiee TIMESTAMP NULL,
    date_debut_intervention TIMESTAMP NULL,
    date_cloture TIMESTAMP NULL,
    temps_estime INT, -- en minutes
    cout_estime DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE SET NULL,
    FOREIGN KEY (technicien_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (createur_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_numero (numero_ticket),
    INDEX idx_statut (statut),
    INDEX idx_priorite (priorite),
    INDEX idx_client (client_id),
    INDEX idx_technicien (technicien_id),
    INDEX idx_date_planifiee (date_planifiee)
);

-- Table des interventions
CREATE TABLE interventions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    ticket_id INT,
    technicien_id INT,
    date_debut TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_fin TIMESTAMP NULL,
    description_travaux TEXT,
    temps_passe INT, -- en minutes
    km_parcourus INT,
    photos JSON, -- URLs des photos
    pieces_utilisees JSON, -- IDs et quantités des pièces
    signature_client TEXT, -- Signature base64 ou URL
    nom_signataire VARCHAR(100),
    satisfaction_client INT CHECK (satisfaction_client >= 1 AND satisfaction_client <= 5),
    commentaire_client TEXT,
    commentaire_interne TEXT,
    cout_final DECIMAL(10,2),
    facturable BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (technicien_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_ticket (ticket_id),
    INDEX idx_technicien (technicien_id),
    INDEX idx_date_debut (date_debut)
);

-- Table des pièces détachées
CREATE TABLE pieces_detachees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(200) NOT NULL,
    reference VARCHAR(100) UNIQUE,
    code_barre VARCHAR(100),
    numero_serie_fabricant VARCHAR(100),
    categorie VARCHAR(100),
    description TEXT,
    stock_actuel INT DEFAULT 0,
    stock_minimum INT DEFAULT 0,
    stock_maximum INT DEFAULT 1000,
    prix_achat DECIMAL(10,2),
    prix_vente DECIMAL(10,2),
    fournisseur VARCHAR(100),
    emplacement VARCHAR(100),
    statut ENUM('actif','obsolete','rupture') DEFAULT 'actif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_reference (reference),
    INDEX idx_code_barre (code_barre),
    INDEX idx_categorie (categorie),
    INDEX idx_fournisseur (fournisseur)
);

-- Table des mouvements de stock
CREATE TABLE mouvements_stock (
    id INT PRIMARY KEY AUTO_INCREMENT,
    piece_id INT,
    type_mouvement ENUM('entree','sortie','ajustement'),
    quantite INT,
    prix_unitaire DECIMAL(10,2),
    motif VARCHAR(200),
    document_reference VARCHAR(100), -- bon de commande, intervention, etc.
    utilisateur_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (piece_id) REFERENCES pieces_detachees(id) ON DELETE CASCADE,
    FOREIGN KEY (utilisateur_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_piece (piece_id),
    INDEX idx_type_mouvement (type_mouvement),
    INDEX idx_date (created_at)
);

-- Table des logs de sécurité
CREATE TABLE security_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    action VARCHAR(100),
    ip_address VARCHAR(45),
    user_agent TEXT,
    details JSON,
    success BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_date (created_at)
);

-- Vue pour les statistiques des techniciens
CREATE VIEW technicien_stats AS
SELECT 
    u.id,
    u.nom,
    u.prenom,
    COUNT(t.id) as total_tickets,
    COUNT(CASE WHEN t.statut = 'termine' THEN 1 END) as tickets_termines,
    COUNT(CASE WHEN t.statut = 'en_cours' THEN 1 END) as tickets_en_cours,
    AVG(CASE WHEN i.temps_passe IS NOT NULL THEN i.temps_passe END) as temps_moyen_intervention
FROM users u
LEFT JOIN tickets t ON u.id = t.technicien_id
LEFT JOIN interventions i ON t.id = i.ticket_id
WHERE u.role = 'technicien' AND u.statut = 'actif'
GROUP BY u.id, u.nom, u.prenom;