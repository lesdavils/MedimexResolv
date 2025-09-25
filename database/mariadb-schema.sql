-- Base de données MediResolv - MariaDB Production
-- Optimisé pour MariaDB 10.11+ sur Debian 12
-- Sécurité niveau entreprise

-- Suppression et création de la base de données
DROP DATABASE IF EXISTS mediresolv;
CREATE DATABASE IF NOT EXISTS mediresolv CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE mediresolv;

-- Configuration MariaDB pour sécurité
SET sql_mode = 'STRICT_TRANS_TABLES,ERROR_FOR_DIVISION_BY_ZERO,NO_AUTO_CREATE_USER,NO_ENGINE_SUBSTITUTION';

-- =====================================================
-- TABLE DES UTILISATEURS AVEC SÉCURITÉ RENFORCÉE
-- =====================================================
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(36) UNIQUE NOT NULL DEFAULT (UUID()),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    role ENUM('admin','superviseur','technicien','referent','constructeur') NOT NULL DEFAULT 'technicien',
    telephone VARCHAR(20),
    photo_profil VARCHAR(255),
    statut ENUM('actif','inactif','suspendu') DEFAULT 'actif',
    derniere_connexion TIMESTAMP NULL,
    tentatives_connexion INT DEFAULT 0,
    bloque_jusqu TIMESTAMP NULL,
    mot_passe_expire_le TIMESTAMP NULL,
    doit_changer_mot_passe BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,
    updated_by INT,

    -- Index pour performance
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role),
    INDEX idx_statut (statut),
    INDEX idx_uuid (uuid),

    -- Clés étrangères
    CONSTRAINT fk_user_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_user_updater FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE DES CLIENTS AVEC DONNÉES COMPLÈTES
-- =====================================================
CREATE TABLE clients (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(36) UNIQUE NOT NULL DEFAULT (UUID()),
    nom VARCHAR(200) NOT NULL,
    type_etablissement ENUM('hopital','clinique','cabinet','laboratoire','autre') DEFAULT 'hopital',
    adresse TEXT,
    ville VARCHAR(100),
    code_postal VARCHAR(10),
    pays VARCHAR(100) DEFAULT 'France',
    contact_principal VARCHAR(100),
    telephone VARCHAR(20),
    email VARCHAR(100),
    siret VARCHAR(14),
    notes TEXT,
    statut ENUM('actif','inactif','prospect','suspendu') DEFAULT 'actif',
    date_creation_contrat DATE,
    date_fin_contrat DATE,
    niveau_service ENUM('standard','premium','enterprise') DEFAULT 'standard',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,

    -- Index pour performance
    INDEX idx_nom (nom),
    INDEX idx_email (email),
    INDEX idx_statut (statut),
    INDEX idx_type_etablissement (type_etablissement),
    INDEX idx_uuid (uuid),

    -- Clés étrangères
    CONSTRAINT fk_client_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE DES MACHINES/ÉQUIPEMENTS
-- =====================================================
CREATE TABLE machines (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(36) UNIQUE NOT NULL DEFAULT (UUID()),
    nom VARCHAR(200) NOT NULL,
    marque VARCHAR(100),
    modele VARCHAR(100),
    numero_serie VARCHAR(100) UNIQUE,
    client_id INT NOT NULL,
    categorie ENUM('imagerie','laboratoire','chirurgie','monitoring','ventilation','autre') DEFAULT 'autre',
    sous_categorie VARCHAR(100),
    statut ENUM('actif','maintenance','hors_service','retire') DEFAULT 'actif',
    date_installation DATE,
    date_mise_service DATE,
    date_derniere_maintenance DATE,
    date_prochaine_maintenance DATE,
    frequence_maintenance_jours INT DEFAULT 365,
    garantie_fin DATE,
    localisation VARCHAR(200),
    etage VARCHAR(50),
    service_medical VARCHAR(100),
    valeur_acquisition DECIMAL(12,2),
    notes TEXT,
    manuel_utilisateur_url VARCHAR(500),
    photos JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,

    -- Index pour performance
    INDEX idx_numero_serie (numero_serie),
    INDEX idx_client (client_id),
    INDEX idx_categorie (categorie),
    INDEX idx_statut (statut),
    INDEX idx_uuid (uuid),
    INDEX idx_date_prochaine_maintenance (date_prochaine_maintenance),

    -- Clés étrangères
    CONSTRAINT fk_machine_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    CONSTRAINT fk_machine_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE DES TICKETS AVEC WORKFLOW AVANCÉ
-- =====================================================
CREATE TABLE tickets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(36) UNIQUE NOT NULL DEFAULT (UUID()),
    numero_ticket VARCHAR(20) UNIQUE NOT NULL,
    titre VARCHAR(200) NOT NULL,
    description TEXT,
    client_id INT NOT NULL,
    machine_id INT,
    technicien_id INT,
    createur_id INT NOT NULL,
    superviseur_id INT,
    statut ENUM('ouvert','assigne','en_cours','en_attente','resolu','ferme','annule') DEFAULT 'ouvert',
    priorite ENUM('faible','normale','elevee','critique','urgente') DEFAULT 'normale',
    type_intervention ENUM('installation','maintenance_preventive','maintenance_curative','reparation','depannage','formation','autre') DEFAULT 'reparation',
    criticite_metier ENUM('faible','moyenne','forte','critique') DEFAULT 'moyenne',
    impact_utilisateur ENUM('aucun','faible','moyen','fort','bloquant') DEFAULT 'moyen',
    date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_assignation TIMESTAMP NULL,
    date_planifiee TIMESTAMP NULL,
    date_debut_intervention TIMESTAMP NULL,
    date_fin_prevue TIMESTAMP NULL,
    date_cloture TIMESTAMP NULL,
    temps_estime_minutes INT,
    temps_realise_minutes INT,
    cout_estime DECIMAL(10,2),
    cout_final DECIMAL(10,2),
    pieces_necessaires JSON,
    competences_requises JSON,
    notes_internes TEXT,
    notes_client TEXT,
    satisfaction_client INT CHECK (satisfaction_client >= 1 AND satisfaction_client <= 5),
    commentaire_satisfaction TEXT,
    tags JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Index pour performance
    INDEX idx_numero (numero_ticket),
    INDEX idx_statut (statut),
    INDEX idx_priorite (priorite),
    INDEX idx_client (client_id),
    INDEX idx_machine (machine_id),
    INDEX idx_technicien (technicien_id),
    INDEX idx_createur (createur_id),
    INDEX idx_date_planifiee (date_planifiee),
    INDEX idx_date_creation (date_creation),
    INDEX idx_uuid (uuid),

    -- Clés étrangères
    CONSTRAINT fk_ticket_client FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    CONSTRAINT fk_ticket_machine FOREIGN KEY (machine_id) REFERENCES machines(id) ON DELETE SET NULL,
    CONSTRAINT fk_ticket_technicien FOREIGN KEY (technicien_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_ticket_createur FOREIGN KEY (createur_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_ticket_superviseur FOREIGN KEY (superviseur_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE DES INTERVENTIONS AVEC DÉTAILS COMPLETS
-- =====================================================
CREATE TABLE interventions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(36) UNIQUE NOT NULL DEFAULT (UUID()),
    ticket_id INT NOT NULL,
    technicien_id INT NOT NULL,
    numero_intervention VARCHAR(20) UNIQUE,
    date_debut TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_fin TIMESTAMP NULL,
    statut ENUM('en_cours','terminee','suspendue','annulee') DEFAULT 'en_cours',
    type_travaux ENUM('diagnostic','reparation','maintenance','installation','formation','autre') DEFAULT 'reparation',
    description_travaux TEXT NOT NULL,
    actions_realisees TEXT,
    probleme_identifie TEXT,
    solution_appliquee TEXT,
    temps_passe_minutes INT,
    km_parcourus DECIMAL(8,2),
    frais_deplacement DECIMAL(8,2),
    photos_avant JSON,
    photos_apres JSON,
    documents_joints JSON,
    pieces_utilisees JSON,
    outils_utilises JSON,
    tests_effectues TEXT,
    resultats_tests TEXT,
    recommandations TEXT,
    signature_client LONGTEXT,
    nom_signataire VARCHAR(100),
    fonction_signataire VARCHAR(100),
    date_signature TIMESTAMP NULL,
    satisfaction_client INT CHECK (satisfaction_client >= 1 AND satisfaction_client <= 5),
    commentaire_client TEXT,
    commentaire_interne TEXT,
    cout_main_oeuvre DECIMAL(10,2),
    cout_pieces DECIMAL(10,2),
    cout_deplacement DECIMAL(10,2),
    cout_total DECIMAL(10,2),
    facturable BOOLEAN DEFAULT TRUE,
    facture BOOLEAN DEFAULT FALSE,
    numero_facture VARCHAR(50),
    conditions_particulieres TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Index pour performance
    INDEX idx_ticket (ticket_id),
    INDEX idx_technicien (technicien_id),
    INDEX idx_date_debut (date_debut),
    INDEX idx_statut (statut),
    INDEX idx_numero_intervention (numero_intervention),
    INDEX idx_uuid (uuid),

    -- Clés étrangères
    CONSTRAINT fk_intervention_ticket FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    CONSTRAINT fk_intervention_technicien FOREIGN KEY (technicien_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE DES PIÈCES DÉTACHÉES AVEC GESTION AVANCÉE
-- =====================================================
CREATE TABLE pieces_detachees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(36) UNIQUE NOT NULL DEFAULT (UUID()),
    nom VARCHAR(200) NOT NULL,
    reference_interne VARCHAR(100) UNIQUE,
    reference_fabricant VARCHAR(100),
    code_barre VARCHAR(100),
    numero_serie_fabricant VARCHAR(100),
    marque VARCHAR(100),
    modele VARCHAR(100),
    categorie VARCHAR(100),
    sous_categorie VARCHAR(100),
    description TEXT,
    specifications_techniques TEXT,
    compatibilite_machines JSON,
    stock_actuel INT DEFAULT 0,
    stock_minimum INT DEFAULT 0,
    stock_maximum INT DEFAULT 1000,
    seuil_alerte INT DEFAULT 5,
    prix_achat_unitaire DECIMAL(10,2),
    prix_vente_unitaire DECIMAL(10,2),
    cout_transport DECIMAL(8,2),
    fournisseur_principal VARCHAR(100),
    fournisseurs_alternatifs JSON,
    delai_livraison_jours INT DEFAULT 7,
    emplacement_stock VARCHAR(100),
    emplacement_detail VARCHAR(200),
    unite_mesure ENUM('piece','kg','litre','metre','paquet') DEFAULT 'piece',
    poids_unitaire DECIMAL(8,3),
    dimensions VARCHAR(100),
    date_peremption DATE,
    lot_fabrication VARCHAR(50),
    certificat_qualite VARCHAR(255),
    statut ENUM('actif','obsolete','rupture','commande') DEFAULT 'actif',
    photos JSON,
    documentation_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_by INT,

    -- Index pour performance
    INDEX idx_reference_interne (reference_interne),
    INDEX idx_code_barre (code_barre),
    INDEX idx_categorie (categorie),
    INDEX idx_fournisseur_principal (fournisseur_principal),
    INDEX idx_statut (statut),
    INDEX idx_stock_actuel (stock_actuel),
    INDEX idx_uuid (uuid),

    -- Clés étrangères
    CONSTRAINT fk_piece_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE DES MOUVEMENTS DE STOCK AVEC TRAÇABILITÉ COMPLÈTE
-- =====================================================
CREATE TABLE mouvements_stock (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(36) UNIQUE NOT NULL DEFAULT (UUID()),
    piece_id INT NOT NULL,
    type_mouvement ENUM('entree','sortie','ajustement','transfert','retour','perte','vol') NOT NULL,
    quantite INT NOT NULL,
    stock_avant INT NOT NULL,
    stock_apres INT NOT NULL,
    prix_unitaire DECIMAL(10,2),
    valeur_totale DECIMAL(10,2),
    motif VARCHAR(200),
    document_reference VARCHAR(100),
    intervention_id INT,
    fournisseur VARCHAR(100),
    bon_commande VARCHAR(50),
    bon_livraison VARCHAR(50),
    facture_numero VARCHAR(50),
    emplacement_origine VARCHAR(100),
    emplacement_destination VARCHAR(100),
    utilisateur_id INT NOT NULL,
    valide_par INT,
    date_validation TIMESTAMP NULL,
    commentaires TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Index pour performance
    INDEX idx_piece (piece_id),
    INDEX idx_type_mouvement (type_mouvement),
    INDEX idx_date (created_at),
    INDEX idx_utilisateur (utilisateur_id),
    INDEX idx_intervention (intervention_id),
    INDEX idx_uuid (uuid),

    -- Clés étrangères
    CONSTRAINT fk_mouvement_piece FOREIGN KEY (piece_id) REFERENCES pieces_detachees(id) ON DELETE CASCADE,
    CONSTRAINT fk_mouvement_utilisateur FOREIGN KEY (utilisateur_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_mouvement_validateur FOREIGN KEY (valide_par) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_mouvement_intervention FOREIGN KEY (intervention_id) REFERENCES interventions(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE DES LOGS DE SÉCURITÉ ET AUDIT
-- =====================================================
CREATE TABLE security_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(36) UNIQUE NOT NULL DEFAULT (UUID()),
    user_id INT,
    session_id VARCHAR(100),
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id INT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    success BOOLEAN DEFAULT TRUE,
    error_code VARCHAR(20),
    error_message TEXT,
    request_data JSON,
    response_data JSON,
    execution_time_ms INT,
    severity ENUM('low','medium','high','critical') DEFAULT 'low',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Index pour performance
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_date (created_at),
    INDEX idx_ip_address (ip_address),
    INDEX idx_success (success),
    INDEX idx_severity (severity),
    INDEX idx_uuid (uuid),

    -- Clés étrangères
    CONSTRAINT fk_security_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLE DES SESSIONS UTILISATEUR
-- =====================================================
CREATE TABLE user_sessions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    uuid VARCHAR(36) UNIQUE NOT NULL DEFAULT (UUID()),
    user_id INT NOT NULL,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    refresh_token VARCHAR(255) UNIQUE,
    ip_address VARCHAR(45),
    user_agent TEXT,
    device_info JSON,
    location_info JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    logout_reason VARCHAR(100),

    -- Index pour performance
    INDEX idx_user (user_id),
    INDEX idx_session_token (session_token),
    INDEX idx_expires_at (expires_at),
    INDEX idx_is_active (is_active),
    INDEX idx_uuid (uuid),

    -- Clés étrangères
    CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- VUES POUR OPTIMISER LES REQUÊTES FRÉQUENTES
-- =====================================================

-- Vue des statistiques des techniciens
CREATE VIEW technicien_stats AS
SELECT
    u.id,
    u.uuid,
    u.nom,
    u.prenom,
    u.username,
    COUNT(t.id) as total_tickets,
    COUNT(CASE WHEN t.statut = 'ferme' THEN 1 END) as tickets_fermes,
    COUNT(CASE WHEN t.statut IN ('en_cours','assigne') THEN 1 END) as tickets_actifs,
    AVG(CASE WHEN i.temps_passe_minutes IS NOT NULL THEN i.temps_passe_minutes END) as temps_moyen_intervention,
    SUM(CASE WHEN i.temps_passe_minutes IS NOT NULL THEN i.temps_passe_minutes END) as temps_total_interventions,
    AVG(CASE WHEN i.satisfaction_client IS NOT NULL THEN i.satisfaction_client END) as satisfaction_moyenne,
    COUNT(DISTINCT i.id) as total_interventions
FROM users u
LEFT JOIN tickets t ON u.id = t.technicien_id
LEFT JOIN interventions i ON t.id = i.ticket_id
WHERE u.role = 'technicien' AND u.statut = 'actif'
GROUP BY u.id, u.uuid, u.nom, u.prenom, u.username;

-- Vue des machines nécessitant une maintenance
CREATE VIEW machines_maintenance_due AS
SELECT
    m.*,
    c.nom as client_nom,
    DATEDIFF(CURDATE(), COALESCE(m.date_derniere_maintenance, m.date_installation)) as jours_depuis_maintenance,
    CASE
        WHEN m.date_prochaine_maintenance < CURDATE() THEN 'En retard'
        WHEN m.date_prochaine_maintenance <= DATE_ADD(CURDATE(), INTERVAL 7 DAY) THEN 'Urgent'
        WHEN m.date_prochaine_maintenance <= DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'Bientôt'
        ELSE 'Normal'
    END as statut_maintenance
FROM machines m
LEFT JOIN clients c ON m.client_id = c.id
WHERE m.statut IN ('actif', 'maintenance')
AND (
    m.date_prochaine_maintenance IS NULL
    OR m.date_prochaine_maintenance <= DATE_ADD(CURDATE(), INTERVAL 30 DAY)
);

-- Vue du dashboard avec KPI
CREATE VIEW dashboard_kpi AS
SELECT
    (SELECT COUNT(*) FROM tickets WHERE statut IN ('ouvert','assigne','en_cours')) as tickets_ouverts,
    (SELECT COUNT(*) FROM tickets WHERE priorite = 'critique' AND statut != 'ferme') as tickets_critiques,
    (SELECT COUNT(*) FROM interventions WHERE DATE(created_at) = CURDATE()) as interventions_aujourd_hui,
    (SELECT COUNT(*) FROM machines WHERE statut = 'hors_service') as machines_hors_service,
    (SELECT COUNT(*) FROM pieces_detachees WHERE stock_actuel <= seuil_alerte) as pieces_en_rupture,
    (SELECT AVG(satisfaction_client) FROM interventions WHERE satisfaction_client IS NOT NULL AND created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as satisfaction_30j;

-- =====================================================
-- INDEX DE PERFORMANCE SPÉCIAUX
-- =====================================================
CREATE INDEX idx_tickets_dashboard ON tickets(statut, priorite, date_creation);
CREATE INDEX idx_interventions_stats ON interventions(technicien_id, date_debut, satisfaction_client);
CREATE INDEX idx_pieces_stock_alert ON pieces_detachees(stock_actuel, seuil_alerte, statut);

-- =====================================================
-- PROCÉDURES STOCKÉES POUR LES OPÉRATIONS CRITIQUES
-- =====================================================

DELIMITER //

-- Procédure de création automatique du numéro de ticket
CREATE PROCEDURE GenerateTicketNumber(OUT ticketNumber VARCHAR(20))
BEGIN
    DECLARE nextId INT;
    DECLARE currentDate VARCHAR(8);

    SET currentDate = DATE_FORMAT(NOW(), '%Y%m%d');

    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_ticket, 10) AS UNSIGNED)), 0) + 1
    INTO nextId
    FROM tickets
    WHERE DATE(created_at) = CURDATE();

    SET ticketNumber = CONCAT('TK', currentDate, LPAD(nextId, 4, '0'));
END //

-- Procédure de mise à jour automatique du stock
CREATE PROCEDURE UpdateStock(
    IN p_piece_id INT,
    IN p_quantite_utilisee INT,
    IN p_intervention_id INT,
    IN p_utilisateur_id INT
)
BEGIN
    DECLARE current_stock INT;
    DECLARE new_stock INT;

    -- Vérifier le stock actuel
    SELECT stock_actuel INTO current_stock
    FROM pieces_detachees
    WHERE id = p_piece_id;

    IF current_stock >= p_quantite_utilisee THEN
        SET new_stock = current_stock - p_quantite_utilisee;

        -- Mettre à jour le stock
        UPDATE pieces_detachees
        SET stock_actuel = new_stock,
            updated_at = NOW()
        WHERE id = p_piece_id;

        -- Enregistrer le mouvement
        INSERT INTO mouvements_stock (
            piece_id, type_mouvement, quantite, stock_avant, stock_apres,
            motif, intervention_id, utilisateur_id
        ) VALUES (
            p_piece_id, 'sortie', p_quantite_utilisee, current_stock, new_stock,
            'Utilisation en intervention', p_intervention_id, p_utilisateur_id
        );

        -- Vérifier si stock critique
        IF new_stock <= (SELECT seuil_alerte FROM pieces_detachees WHERE id = p_piece_id) THEN
            UPDATE pieces_detachees
            SET statut = 'rupture'
            WHERE id = p_piece_id AND new_stock <= 0;
        END IF;

    ELSE
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Stock insuffisant';
    END IF;
END //

DELIMITER ;

-- =====================================================
-- CONFIGURATION SYSTÈME
-- =====================================================
CREATE TABLE system_config (
    id INT PRIMARY KEY AUTO_INCREMENT,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Paramètres système par défaut
INSERT INTO system_config (config_key, config_value, description) VALUES
('app_name', 'MediResolv', 'Nom de l'application'),
('app_version', '1.0.0', 'Version de l'application'),
('session_timeout_hours', '8', 'Durée de session en heures'),
('max_login_attempts', '3', 'Nombre maximum de tentatives de connexion'),
('backup_retention_days', '30', 'Rétention des sauvegardes en jours'),
('maintenance_mode', 'false', 'Mode maintenance activé');

-- =====================================================
-- DONNÉES INITIALES SÉCURISÉES
-- =====================================================

-- Création du compte administrateur unique
INSERT INTO users (
    username, email, password_hash, nom, prenom, role,
    statut, created_at, doit_changer_mot_passe
) VALUES (
    'admin',
    'admin@mediresolv.com',
    '$2b$12$LQv3c1yqBWVHxkd0LQ4YCOQEj5k4L0KbQ8n5YvZ2q9L0yF9xZ0wZ2', -- Hash de 'Admin123!@#'
    'Administrateur',
    'Système',
    'admin',
    'actif',
    NOW(),
    TRUE
);

-- =====================================================
-- COMMIT FINAL
-- =====================================================
COMMIT;

-- Message de confirmation
SELECT 'Base de données MediResolv installée avec succès!' as status;
