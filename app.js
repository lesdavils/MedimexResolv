/**
 * Medimex - Système de Gestion d'Interventions
 * Application complète de gestion d'interventions techniques
 */

class MedimexApp {
    constructor() {
        // Configuration de l'application
        this.config = {
            version: '1.0.0',
            apiUrl: '/api',
            maxFileSize: 5 * 1024 * 1024, // 5MB
            allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif'],
            sessionTimeout: 8 * 60 * 60 * 1000, // 8 heures
        };

        // État de l'application
        this.state = {
            currentUser: null,
            currentSection: 'dashboard',
            currentWeek: new Date(),
            filters: {},
            charts: {},
            sidebarCollapsed: false,
        };

        // Données de démonstration (simulant une base de données)
        this.data = this.initializeData();

        // Initialisation
        this.init();
    }

    /**
     * Initialisation des données de démonstration
     */
    initializeData() {
        return {
            users: [
                {
                    id: 1,
                    username: 'admin',
                    email: 'admin@medimex.fr',
                    nom: 'Administrateur',
                    prenom: 'Système',
                    role: 'admin',
                    telephone: '01 23 45 67 89',
                    statut: 'actif',
                    password_hash: 'admin123', // En production: hash bcrypt
                    photo_profil: null,
                    derniere_connexion: new Date(),
                    created_at: new Date('2025-01-01')
                },
                {
                    id: 2,
                    username: 'supervisor',
                    email: 'j.dupont@medimex.fr',
                    nom: 'Dupont',
                    prenom: 'Jean',
                    role: 'superviseur',
                    telephone: '01 23 45 67 90',
                    statut: 'actif',
                    password_hash: 'super123',
                    photo_profil: null,
                    derniere_connexion: new Date(),
                    created_at: new Date('2025-01-01')
                },
                {
                    id: 3,
                    username: 'technicien',
                    email: 'm.martin@medimex.fr',
                    nom: 'Martin',
                    prenom: 'Marie',
                    role: 'technicien',
                    telephone: '01 23 45 67 91',
                    statut: 'actif',
                    password_hash: 'tech123',
                    photo_profil: null,
                    derniere_connexion: new Date(),
                    created_at: new Date('2025-01-01')
                },
                {
                    id: 4,
                    username: 'referent',
                    email: 'p.durand@athlex.fr',
                    nom: 'Durand',
                    prenom: 'Pierre',
                    role: 'referent',
                    telephone: '01 23 45 67 92',
                    statut: 'actif',
                    password_hash: 'ref123',
                    photo_profil: null,
                    derniere_connexion: new Date(),
                    created_at: new Date('2025-01-01')
                },
                {
                    id: 5,
                    username: 'constructeur',
                    email: 's.leblanc@medimex.fr',
                    nom: 'Leblanc',
                    prenom: 'Sophie',
                    role: 'constructeur',
                    telephone: '01 23 45 67 93',
                    statut: 'actif',
                    password_hash: 'const123',
                    photo_profil: null,
                    derniere_connexion: new Date(),
                    created_at: new Date('2025-01-01')
                }
            ],
            clients: [
                {
                    id: 1,
                    nom: 'Hôpital Saint-Louis',
                    adresse: '123 Rue de la Santé, Paris',
                    ville: 'Paris',
                    code_postal: '75010',
                    contact_principal: 'Dr. Bernard',
                    telephone: '01 42 34 56 78',
                    email: 'bernard@hopital-st-louis.fr',
                    statut: 'actif',
                    created_at: new Date('2025-01-01')
                },
                {
                    id: 2,
                    nom: 'Clinique du Parc',
                    adresse: '45 Avenue des Fleurs, Lyon',
                    ville: 'Lyon',
                    code_postal: '69003',
                    contact_principal: 'Mme Rousseau',
                    telephone: '04 78 45 67 89',
                    email: 'contact@clinique-parc.fr',
                    statut: 'actif',
                    created_at: new Date('2025-01-01')
                },
                {
                    id: 3,
                    nom: 'Centre Médical Sud',
                    adresse: '78 Boulevard Victor Hugo, Marseille',
                    ville: 'Marseille',
                    code_postal: '13001',
                    contact_principal: 'M. Gonzalez',
                    telephone: '04 91 23 45 67',
                    email: 'info@centre-medical-sud.fr',
                    statut: 'actif',
                    created_at: new Date('2025-01-01')
                }
            ],
            machines: [
                {
                    id: 1,
                    nom: 'Scanner IRM',
                    modele: 'Siemens Magnetom',
                    numero_serie: 'SM12345',
                    client_id: 1,
                    categorie: 'Imagerie',
                    statut: 'actif',
                    date_installation: '2023-01-15',
                    created_at: new Date('2023-01-15')
                },
                {
                    id: 2,
                    nom: 'Échographe',
                    modele: 'Philips EPIQ',
                    numero_serie: 'PH67890',
                    client_id: 2,
                    categorie: 'Échographie',
                    statut: 'maintenance',
                    date_installation: '2023-03-20',
                    created_at: new Date('2023-03-20')
                },
                {
                    id: 3,
                    nom: 'Moniteur Patient',
                    modele: 'GE Dash',
                    numero_serie: 'GE11111',
                    client_id: 3,
                    categorie: 'Monitoring',
                    statut: 'actif',
                    date_installation: '2023-05-10',
                    created_at: new Date('2023-05-10')
                }
            ],
            tickets: [
                {
                    id: 1,
                    numero_ticket: 'TK25-001',
                    titre: 'Panne scanner IRM',
                    description: 'Le scanner ne s\'allume plus depuis ce matin. Voyant rouge affiché.',
                    client_id: 1,
                    machine_id: 1,
                    technicien_id: 3,
                    createur_id: 2,
                    statut: 'en_cours',
                    priorite: 'critique',
                    type_intervention: 'reparation',
                    date_creation: new Date('2025-09-24T08:00:00'),
                    date_planifiee: new Date('2025-09-24T14:00:00'),
                    temps_estime: 120
                },
                {
                    id: 2,
                    numero_ticket: 'TK25-002',
                    titre: 'Maintenance préventive échographe',
                    description: 'Maintenance trimestrielle programmée selon le contrat.',
                    client_id: 2,
                    machine_id: 2,
                    technicien_id: 3,
                    createur_id: 2,
                    statut: 'assigne',
                    priorite: 'normale',
                    type_intervention: 'maintenance_preventive',
                    date_creation: new Date('2025-09-23T10:00:00'),
                    date_planifiee: new Date('2025-09-26T09:00:00'),
                    temps_estime: 180
                },
                {
                    id: 3,
                    numero_ticket: 'TK25-003',
                    titre: 'Installation nouveau moniteur',
                    description: 'Installation et configuration d\'un nouveau moniteur patient.',
                    client_id: 1,
                    machine_id: null,
                    technicien_id: 3,
                    createur_id: 1,
                    statut: 'termine',
                    priorite: 'normale',
                    type_intervention: 'installation',
                    date_creation: new Date('2025-09-22T09:00:00'),
                    date_planifiee: new Date('2025-09-23T10:00:00'),
                    date_cloture: new Date('2025-09-23T12:30:00'),
                    temps_estime: 90
                }
            ],
            interventions: [
                {
                    id: 1,
                    ticket_id: 3,
                    technicien_id: 3,
                    date_debut: new Date('2025-09-23T10:00:00'),
                    date_fin: new Date('2025-09-23T12:30:00'),
                    description_travaux: 'Installation et configuration du moniteur patient GE Dash. Vérification des paramètres, formation du personnel.',
                    temps_passe: 150,
                    photos: ['intervention_1_1.jpg', 'intervention_1_2.jpg'],
                    signature_client: 'data:image/svg+xml;base64,signature_base64_example',
                    nom_signataire: 'Dr. Bernard',
                    satisfaction_client: 5,
                    commentaire_client: 'Installation parfaite, équipe très professionnelle',
                    facturable: true,
                    created_at: new Date('2025-09-23T12:30:00')
                }
            ],
            pieces_detachees: [
                {
                    id: 1,
                    nom: 'Batterie Li-Ion 12V',
                    reference: 'BAT-LI-12V-001',
                    code_barre: '1234567890123',
                    categorie: 'Batteries',
                    stock_actuel: 15,
                    stock_minimum: 5,
                    prix_achat: 89.50,
                    prix_vente: 125.00,
                    fournisseur: 'TechMed',
                    statut: 'actif'
                },
                {
                    id: 2,
                    nom: 'Câble USB-C 2m',
                    reference: 'CAB-USBC-2M-001',
                    code_barre: '1234567890124',
                    categorie: 'Câbles',
                    stock_actuel: 8,
                    stock_minimum: 10,
                    prix_achat: 25.00,
                    prix_vente: 35.00,
                    fournisseur: 'ElectroPlus',
                    statut: 'actif'
                },
                {
                    id: 3,
                    nom: 'Capteur température',
                    reference: 'CAP-TEMP-001',
                    code_barre: '1234567890125',
                    categorie: 'Capteurs',
                    stock_actuel: 3,
                    stock_minimum: 5,
                    prix_achat: 156.75,
                    prix_vente: 220.00,
                    fournisseur: 'SensorTech',
                    statut: 'actif'
                }
            ]
        };
    }

    /**
     * Initialisation de l'application
     */
    init() {
        this.bindEvents();
        this.checkAuthStatus();
    }

    /**
     * Liaison des événements
     */
    bindEvents() {
        // Événements de connexion
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Boutons de démonstration
        const demoBtns = document.querySelectorAll('.demo-btn');
        demoBtns.forEach(btn => {
            btn.addEventListener('click', (e) => this.fillDemoCredentials(e));
        });

        // Déconnexion
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => this.handleLogout(e));
        }

        // Navigation sidebar
        const sidebarLinks = document.querySelectorAll('.sidebar-link');
        sidebarLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleNavigation(e));
        });

        // Toggle sidebar
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }
    }

    /**
     * Vérification du statut d'authentification
     */
    checkAuthStatus() {
        const token = localStorage.getItem('medimex_token');
        const userData = localStorage.getItem('medimex_user');
        
        if (token && userData) {
            try {
                this.state.currentUser = JSON.parse(userData);
                this.showMainApp();
            } catch (e) {
                this.showLoginPage();
            }
        } else {
            this.showLoginPage();
        }
    }

    /**
     * Afficher la page de connexion
     */
    showLoginPage() {
        const loginPage = document.getElementById('loginPage');
        const mainApp = document.getElementById('mainApp');
        
        if (loginPage && mainApp) {
            loginPage.classList.remove('hidden');
            mainApp.classList.add('hidden');
        }
        
        // Vider les champs
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        
        if (usernameInput) usernameInput.value = '';
        if (passwordInput) passwordInput.value = '';
    }

    /**
     * Afficher l'application principale
     */
    showMainApp() {
        const loginPage = document.getElementById('loginPage');
        const mainApp = document.getElementById('mainApp');
        
        if (loginPage && mainApp) {
            loginPage.classList.add('hidden');
            mainApp.classList.remove('hidden');
        }
        
        // Mettre à jour l'interface utilisateur
        this.updateUserInterface();
        this.loadDashboard();
    }

    /**
     * Gestion de la connexion
     */
    async handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        
        if (!username || !password) {
            this.showAlert('Veuillez remplir tous les champs', 'error');
            return;
        }

        // Simulation de l'authentification (en production, appel API)
        const user = this.data.users.find(u => 
            u.username === username && u.password_hash === password
        );

        if (user && user.statut === 'actif') {
            // Succès de la connexion
            this.state.currentUser = user;
            
            // Stockage sécurisé (en production, utiliser des tokens JWT)
            const token = this.generateSimpleToken(user);
            localStorage.setItem('medimex_token', token);
            localStorage.setItem('medimex_user', JSON.stringify(user));
            
            // Mise à jour de la dernière connexion
            user.derniere_connexion = new Date();
            
            this.showAlert('Connexion réussie', 'success');
            
            // Redirection vers l'application principale
            setTimeout(() => {
                this.showMainApp();
            }, 1000);
            
        } else {
            this.showAlert('Nom d\'utilisateur ou mot de passe incorrect', 'error');
        }
    }

    /**
     * Gestion de la déconnexion
     */
    handleLogout(e) {
        e.preventDefault();
        
        // Nettoyage des données de session
        localStorage.removeItem('medimex_token');
        localStorage.removeItem('medimex_user');
        this.state.currentUser = null;
        
        this.showAlert('Déconnexion réussie', 'success');
        
        // Redirection vers la page de connexion
        setTimeout(() => {
            this.showLoginPage();
        }, 1000);
    }

    /**
     * Remplissage automatique des identifiants de démonstration
     */
    fillDemoCredentials(e) {
        e.preventDefault();
        
        const username = e.target.dataset.username;
        const password = e.target.dataset.password;
        
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        
        if (usernameInput && passwordInput) {
            usernameInput.value = username;
            passwordInput.value = password;
        }
    }

    /**
     * Génération d'un token simple (pour démo)
     */
    generateSimpleToken(user) {
        const tokenData = {
            userId: user.id,
            username: user.username,
            role: user.role,
            timestamp: Date.now()
        };
        return btoa(JSON.stringify(tokenData));
    }

    /**
     * Mise à jour de l'interface utilisateur
     */
    updateUserInterface() {
        const currentUserElement = document.getElementById('currentUser');
        const userAvatar = document.getElementById('userAvatar');
        
        if (currentUserElement && this.state.currentUser) {
            currentUserElement.textContent = `${this.state.currentUser.prenom} ${this.state.currentUser.nom}`;
        }
        
        // Mise à jour de l'avatar
        if (userAvatar && this.state.currentUser) {
            const initials = `${this.state.currentUser.prenom.charAt(0)}${this.state.currentUser.nom.charAt(0)}`;
            userAvatar.textContent = initials;
            userAvatar.title = `${this.state.currentUser.prenom} ${this.state.currentUser.nom} (${this.state.currentUser.role})`;
        }
        
        // Adaptation selon le rôle
        this.adaptInterfaceToRole();
    }

    /**
     * Adaptation de l'interface selon le rôle utilisateur
     */
    adaptInterfaceToRole() {
        const role = this.state.currentUser?.role;
        const adminOnlyElements = document.querySelectorAll('.admin-only');
        const supervisorOnlyElements = document.querySelectorAll('.supervisor-only');
        const technicianOnlyElements = document.querySelectorAll('.technician-only');
        
        // Masquer tous les éléments spécifiques par défaut
        [...adminOnlyElements, ...supervisorOnlyElements, ...technicianOnlyElements].forEach(el => {
            el.style.display = 'none';
        });
        
        // Afficher selon le rôle
        switch (role) {
            case 'admin':
                adminOnlyElements.forEach(el => el.style.display = '');
                supervisorOnlyElements.forEach(el => el.style.display = '');
                break;
            case 'superviseur':
                supervisorOnlyElements.forEach(el => el.style.display = '');
                break;
            case 'technicien':
                technicianOnlyElements.forEach(el => el.style.display = '');
                break;
        }
    }

    /**
     * Chargement du tableau de bord
     */
    loadDashboard() {
        this.state.currentSection = 'dashboard';
        const mainContent = document.getElementById('mainContent');
        
        if (!mainContent) return;
        
        const stats = this.calculateDashboardStats();
        
        mainContent.innerHTML = `
            <div class="dashboard">
                <div class="dashboard-header">
                    <h1>Tableau de bord</h1>
                    <p class="dashboard-subtitle">Vue d'ensemble de vos interventions</p>
                </div>
                
                <div class="stats-grid">
                    <div class="stat-card stat-card--primary">
                        <div class="stat-card__icon">🎯</div>
                        <div class="stat-card__content">
                            <h3>${stats.ticketsEnCours}</h3>
                            <p>Tickets en cours</p>
                        </div>
                    </div>
                    
                    <div class="stat-card stat-card--success">
                        <div class="stat-card__icon">✅</div>
                        <div class="stat-card__content">
                            <h3>${stats.ticketsTermines}</h3>
                            <p>Interventions terminées</p>
                        </div>
                    </div>
                    
                    <div class="stat-card stat-card--warning">
                        <div class="stat-card__icon">⚠️</div>
                        <div class="stat-card__content">
                            <h3>${stats.ticketsCritiques}</h3>
                            <p>Tickets critiques</p>
                        </div>
                    </div>
                    
                    <div class="stat-card stat-card--info">
                        <div class="stat-card__icon">📊</div>
                        <div class="stat-card__content">
                            <h3>${stats.totalClients}</h3>
                            <p>Clients actifs</p>
                        </div>
                    </div>
                </div>
                
                <div class="dashboard-grid">
                    <div class="dashboard-card">
                        <h2>Tickets récents</h2>
                        <div class="ticket-list">
                            ${this.renderRecentTickets()}
                        </div>
                    </div>
                    
                    <div class="dashboard-card">
                        <h2>Planning de la semaine</h2>
                        <div class="planning-preview">
                            ${this.renderWeeklyPlanning()}
                        </div>
                    </div>
                </div>
                
                <div class="dashboard-actions">
                    <button class="btn btn--primary" onclick="app.showNewTicketModal()">
                        <span class="btn__icon">➕</span>
                        Nouveau ticket
                    </button>
                    <button class="btn btn--secondary" onclick="app.navigateToSection('tickets')">
                        <span class="btn__icon">📋</span>
                        Voir tous les tickets
                    </button>
                </div>
            </div>
        `;
        
        // Mise à jour de la navigation active
        this.updateActiveNavigation('dashboard');
    }

    /**
     * Calcul des statistiques du tableau de bord
     */
    calculateDashboardStats() {
        const tickets = this.data.tickets;
        
        return {
            ticketsEnCours: tickets.filter(t => ['en_cours', 'assigne'].includes(t.statut)).length,
            ticketsTermines: tickets.filter(t => t.statut === 'termine').length,
            ticketsCritiques: tickets.filter(t => t.priorite === 'critique').length,
            totalClients: this.data.clients.filter(c => c.statut === 'actif').length
        };
    }

    /**
     * Rendu des tickets récents
     */
    renderRecentTickets() {
        const recentTickets = this.data.tickets
            .sort((a, b) => new Date(b.date_creation) - new Date(a.date_creation))
            .slice(0, 5);
            
        return recentTickets.map(ticket => {
            const client = this.data.clients.find(c => c.id === ticket.client_id);
            const technicien = this.data.users.find(u => u.id === ticket.technicien_id);
            
            return `
                <div class="ticket-item ticket-item--${ticket.priorite}">
                    <div class="ticket-item__header">
                        <span class="ticket-number">${ticket.numero_ticket}</span>
                        <span class="ticket-priority ticket-priority--${ticket.priorite}">
                            ${ticket.priorite}
                        </span>
                    </div>
                    <h4>${ticket.titre}</h4>
                    <p class="ticket-client">${client?.nom || 'Client non défini'}</p>
                    <p class="ticket-tech">${technicien?.prenom} ${technicien?.nom || 'Non assigné'}</p>
                    <div class="ticket-status">
                        <span class="status-badge status-badge--${ticket.statut}">
                            ${this.getStatusLabel(ticket.statut)}
                        </span>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Rendu du planning hebdomadaire
     */
    renderWeeklyPlanning() {
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay() + 1); // Lundi
        
        const plannedTickets = this.data.tickets
            .filter(t => t.date_planifiee && t.statut !== 'termine')
            .sort((a, b) => new Date(a.date_planifiee) - new Date(b.date_planifiee));
            
        if (plannedTickets.length === 0) {
            return '<p class="no-data">Aucune intervention planifiée cette semaine</p>';
        }
        
        return plannedTickets.slice(0, 3).map(ticket => {
            const client = this.data.clients.find(c => c.id === ticket.client_id);
            const date = new Date(ticket.date_planifiee);
            
            return `
                <div class="planning-item">
                    <div class="planning-date">
                        ${date.toLocaleDateString('fr-FR', { 
                            weekday: 'short', 
                            day: 'numeric', 
                            month: 'short' 
                        })}
                        <span class="planning-time">
                            ${date.toLocaleTimeString('fr-FR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                            })}
                        </span>
                    </div>
                    <div class="planning-details">
                        <h4>${ticket.titre}</h4>
                        <p>${client?.nom || 'Client non défini'}</p>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Navigation entre les sections
     */
    handleNavigation(e) {
        e.preventDefault();
        const section = e.target.closest('.sidebar-link').dataset.section;
        this.navigateToSection(section);
    }

    /**
     * Naviguer vers une section
     */
    navigateToSection(section) {
        this.state.currentSection = section;
        
        switch (section) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'tickets':
                this.loadTicketsSection();
                break;
            case 'clients':
                this.loadClientsSection();
                break;
            case 'machines':
                this.loadMachinesSection();
                break;
            case 'interventions':
                this.loadInterventionsSection();
                break;
            case 'pieces':
                this.loadPiecesSection();
                break;
            case 'users':
                this.loadUsersSection();
                break;
            case 'reports':
                this.loadReportsSection();
                break;
            default:
                this.loadDashboard();
        }
    }

    /**
     * Mise à jour de la navigation active
     */
    updateActiveNavigation(activeSection) {
        const sidebarLinks = document.querySelectorAll('.sidebar-link');
        sidebarLinks.forEach(link => {
            const section = link.dataset.section;
            if (section === activeSection) {
                link.classList.add('sidebar-link--active');
            } else {
                link.classList.remove('sidebar-link--active');
            }
        });
    }

    /**
     * Basculer la sidebar
     */
    toggleSidebar() {
        this.state.sidebarCollapsed = !this.state.sidebarCollapsed;
        const sidebar = document.getElementById('sidebar');
        
        if (sidebar) {
            sidebar.classList.toggle('sidebar--collapsed', this.state.sidebarCollapsed);
        }
    }

    /**
     * Charger la section des tickets
     */
    loadTicketsSection() {
        const mainContent = document.getElementById('mainContent');
        if (!mainContent) return;
        
        mainContent.innerHTML = `
            <div class="section-header">
                <h1>Gestion des tickets</h1>
                <div class="section-actions">
                    <button class="btn btn--primary" onclick="app.showNewTicketModal()">
                        <span class="btn__icon">➕</span>
                        Nouveau ticket
                    </button>
                </div>
            </div>
            
            <div class="tickets-filters">
                <select class="filter-select" id="statusFilter">
                    <option value="">Tous les statuts</option>
                    <option value="ouvert">Ouvert</option>
                    <option value="assigne">Assigné</option>
                    <option value="en_cours">En cours</option>
                    <option value="termine">Terminé</option>
                </select>
                
                <select class="filter-select" id="priorityFilter">
                    <option value="">Toutes les priorités</option>
                    <option value="faible">Faible</option>
                    <option value="normale">Normale</option>
                    <option value="elevee">Élevée</option>
                    <option value="critique">Critique</option>
                </select>
                
                <input type="search" class="search-input" placeholder="Rechercher..." id="ticketSearch">
            </div>
            
            <div class="tickets-table-container">
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>N° Ticket</th>
                            <th>Titre</th>
                            <th>Client</th>
                            <th>Technicien</th>
                            <th>Statut</th>
                            <th>Priorité</th>
                            <th>Date création</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.renderTicketsTable()}
                    </tbody>
                </table>
            </div>
        `;
        
        this.updateActiveNavigation('tickets');
        this.bindTicketFilters();
    }

    /**
     * Rendu du tableau des tickets
     */
    renderTicketsTable() {
        return this.data.tickets.map(ticket => {
            const client = this.data.clients.find(c => c.id === ticket.client_id);
            const technicien = this.data.users.find(u => u.id === ticket.technicien_id);
            
            return `
                <tr class="ticket-row">
                    <td class="ticket-number-cell">${ticket.numero_ticket}</td>
                    <td>
                        <div class="ticket-title">${ticket.titre}</div>
                        <div class="ticket-type">${this.getTypeLabel(ticket.type_intervention)}</div>
                    </td>
                    <td>${client?.nom || 'Non défini'}</td>
                    <td>${technicien ? `${technicien.prenom} ${technicien.nom}` : 'Non assigné'}</td>
                    <td>
                        <span class="status-badge status-badge--${ticket.statut}">
                            ${this.getStatusLabel(ticket.statut)}
                        </span>
                    </td>
                    <td>
                        <span class="priority-badge priority-badge--${ticket.priorite}">
                            ${this.getPriorityLabel(ticket.priorite)}
                        </span>
                    </td>
                    <td>${new Date(ticket.date_creation).toLocaleDateString('fr-FR')}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-icon" onclick="app.viewTicket(${ticket.id})" title="Voir">
                                👁️
                            </button>
                            <button class="btn-icon" onclick="app.editTicket(${ticket.id})" title="Modifier">
                                ✏️
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }

    /**
     * Liaison des filtres des tickets
     */
    bindTicketFilters() {
        const statusFilter = document.getElementById('statusFilter');
        const priorityFilter = document.getElementById('priorityFilter');
        const searchInput = document.getElementById('ticketSearch');
        
        [statusFilter, priorityFilter, searchInput].forEach(element => {
            if (element) {
                element.addEventListener('change', () => this.applyTicketFilters());
                element.addEventListener('input', () => this.applyTicketFilters());
            }
        });
    }

    /**
     * Application des filtres des tickets
     */
    applyTicketFilters() {
        // Implémentation du filtrage (pour la démo, on recharge simplement)
        setTimeout(() => {
            this.loadTicketsSection();
        }, 100);
    }

    /**
     * Obtenir le libellé du statut
     */
    getStatusLabel(status) {
        const labels = {
            'ouvert': 'Ouvert',
            'assigne': 'Assigné',
            'en_cours': 'En cours',
            'en_attente': 'En attente',
            'termine': 'Terminé',
            'annule': 'Annulé'
        };
        return labels[status] || status;
    }

    /**
     * Obtenir le libellé de la priorité
     */
    getPriorityLabel(priority) {
        const labels = {
            'faible': 'Faible',
            'normale': 'Normale',
            'elevee': 'Élevée',
            'critique': 'Critique'
        };
        return labels[priority] || priority;
    }

    /**
     * Obtenir le libellé du type d'intervention
     */
    getTypeLabel(type) {
        const labels = {
            'installation': 'Installation',
            'maintenance_preventive': 'Maintenance préventive',
            'maintenance_curative': 'Maintenance curative',
            'reparation': 'Réparation',
            'autre': 'Autre'
        };
        return labels[type] || type;
    }

    /**
     * Affichage d'une alerte
     */
    showAlert(message, type = 'info', duration = 3000) {
        // Création de l'élément d'alerte
        const alertElement = document.createElement('div');
        alertElement.className = `alert alert--${type}`;
        alertElement.innerHTML = `
            <span class="alert__message">${message}</span>
            <button class="alert__close" onclick="this.parentElement.remove()">&times;</button>
        `;
        
        // Ajout au DOM
        document.body.appendChild(alertElement);
        
        // Suppression automatique
        setTimeout(() => {
            if (alertElement.parentElement) {
                alertElement.remove();
            }
        }, duration);
    }

    /**
     * Sections à implémenter (stubs pour la démo)
     */
    loadClientsSection() {
        this.updateActiveNavigation('clients');
        document.getElementById('mainContent').innerHTML = '<h1>Section Clients (à implémenter)</h1>';
    }

    loadMachinesSection() {
        this.updateActiveNavigation('machines');
        document.getElementById('mainContent').innerHTML = '<h1>Section Machines (à implémenter)</h1>';
    }

    loadInterventionsSection() {
        this.updateActiveNavigation('interventions');
        document.getElementById('mainContent').innerHTML = '<h1>Section Interventions (à implémenter)</h1>';
    }

    loadPiecesSection() {
        this.updateActiveNavigation('pieces');
        document.getElementById('mainContent').innerHTML = '<h1>Section Pièces Détachées (à implémenter)</h1>';
    }

    loadUsersSection() {
        this.updateActiveNavigation('users');
        document.getElementById('mainContent').innerHTML = '<h1>Section Utilisateurs (à implémenter)</h1>';
    }

    loadReportsSection() {
        this.updateActiveNavigation('reports');
        document.getElementById('mainContent').innerHTML = '<h1>Section Rapports (à implémenter)</h1>';
    }

    /**
     * Modales et actions (stubs)
     */
    showNewTicketModal() {
        this.showAlert('Modal de création de ticket (à implémenter)', 'info');
    }

    viewTicket(ticketId) {
        this.showAlert(`Affichage du ticket ${ticketId} (à implémenter)`, 'info');
    }

    editTicket(ticketId) {
        this.showAlert(`Modification du ticket ${ticketId} (à implémenter)`, 'info');
    }
}

// Initialisation de l'application
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new MedimexApp();
});