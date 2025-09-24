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
                    created_at: new Date('2025-01-15')
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
                    created_at: new Date('2025-02-01')
                }
            ],
            clients: [
                {
                    id: 1,
                    nom: 'Hôpital Saint-Louis',
                    adresse: '1 Avenue Claude Vellefaux',
                    ville: 'Paris',
                    code_postal: '75010',
                    contact_principal: 'Dr. Bernard Médecin',
                    telephone: '01 42 49 49 49',
                    email: 'contact@hopital-st-louis.fr',
                    created_at: new Date('2025-01-10')
                },
                {
                    id: 2,
                    nom: 'Clinique du Parc',
                    adresse: '45 Avenue du Parc',
                    ville: 'Lyon',
                    code_postal: '69003',
                    contact_principal: 'Mme Rousseau',
                    telephone: '04 78 45 67 89',
                    email: 'direction@clinique-parc.fr',
                    created_at: new Date('2025-01-20')
                },
                {
                    id: 3,
                    nom: 'Centre Médical Sud',
                    adresse: '78 Boulevard Victor Hugo',
                    ville: 'Marseille',
                    code_postal: '13008',
                    contact_principal: 'M. Gonzalez',
                    telephone: '04 91 23 45 67',
                    email: 'info@centre-medical-sud.fr',
                    created_at: new Date('2025-02-01')
                }
            ],
            machines: [
                {
                    id: 1,
                    nom: 'Scanner IRM Magnetom',
                    modele: 'Siemens Magnetom Vida 3T',
                    numero_serie: 'SM2025001',
                    client_id: 1,
                    categorie: 'Imagerie médicale',
                    statut: 'actif',
                    date_installation: '2024-06-15',
                    created_at: new Date('2024-06-15')
                },
                {
                    id: 2,
                    nom: 'Échographe EPIQ',
                    modele: 'Philips EPIQ 7',
                    numero_serie: 'PH2024089',
                    client_id: 2,
                    categorie: 'Échographie',
                    statut: 'maintenance',
                    date_installation: '2024-08-20',
                    created_at: new Date('2024-08-20')
                },
                {
                    id: 3,
                    nom: 'Moniteur Patient IntelliVue',
                    modele: 'Philips IntelliVue MX800',
                    numero_serie: 'PH2024156',
                    client_id: 3,
                    categorie: 'Monitoring',
                    statut: 'actif',
                    date_installation: '2024-09-10',
                    created_at: new Date('2024-09-10')
                },
                {
                    id: 4,
                    nom: 'Ventilateur Evita V800',
                    modele: 'Dräger Evita V800',
                    numero_serie: 'DR2024234',
                    client_id: 1,
                    categorie: 'Ventilation',
                    statut: 'hors_service',
                    date_installation: '2024-05-30',
                    created_at: new Date('2024-05-30')
                }
            ],
            tickets: [
                {
                    id: 1,
                    titre: 'Panne scanner IRM - Urgent',
                    description: 'Le scanner IRM Magnetom présente une erreur système critique. Les examens sont interrompus depuis ce matin.',
                    client_id: 1,
                    machine_id: 1,
                    technicien_id: 3,
                    createur_id: 2,
                    statut: 'en_cours',
                    priorite: 'critique',
                    date_creation: '2025-09-24',
                    date_planifiee: '2025-09-24',
                    date_cloture: null,
                    created_at: new Date('2025-09-24T08:30:00')
                },
                {
                    id: 2,
                    titre: 'Maintenance préventive échographe',
                    description: 'Maintenance trimestrielle programmée : vérification des sondes, calibration, mise à jour logicielle.',
                    client_id: 2,
                    machine_id: 2,
                    technicien_id: 3,
                    createur_id: 2,
                    statut: 'ouvert',
                    priorite: 'normale',
                    date_creation: '2025-09-23',
                    date_planifiee: '2025-09-26',
                    date_cloture: null,
                    created_at: new Date('2025-09-23T14:15:00')
                },
                {
                    id: 3,
                    titre: 'Remplacement capteur température',
                    description: 'Le capteur de température du moniteur patient affiche des valeurs erronées.',
                    client_id: 3,
                    machine_id: 3,
                    technicien_id: 3,
                    createur_id: 2,
                    statut: 'termine',
                    priorite: 'elevee',
                    date_creation: '2025-09-22',
                    date_planifiee: '2025-09-23',
                    date_cloture: '2025-09-23',
                    created_at: new Date('2025-09-22T10:20:00')
                },
                {
                    id: 4,
                    titre: 'Réparation ventilateur - Valve défectueuse',
                    description: 'La valve expiratoire du ventilateur Evita présente une fuite. Intervention urgente requise.',
                    client_id: 1,
                    machine_id: 4,
                    technicien_id: 3,
                    createur_id: 1,
                    statut: 'ouvert',
                    priorite: 'critique',
                    date_creation: '2025-09-24',
                    date_planifiee: '2025-09-25',
                    date_cloture: null,
                    created_at: new Date('2025-09-24T11:45:00')
                }
            ],
            interventions: [
                {
                    id: 1,
                    ticket_id: 3,
                    technicien_id: 3,
                    description_travaux: 'Remplacement du capteur de température PT100. Test de calibration effectué avec succès.',
                    temps_passe: 120, // en minutes
                    photos: ['intervention_1_before.jpg', 'intervention_1_after.jpg'],
                    signature_client: 'data:image/svg+xml;base64,signature_base64',
                    satisfaction_client: 5,
                    commentaire_client: 'Intervention rapide et efficace. Problème résolu.',
                    created_at: new Date('2025-09-23T15:30:00')
                }
            ],
            pieces_detachees: [
                {
                    id: 1,
                    nom: 'Capteur température PT100',
                    reference: 'TEMP-PT100-001',
                    code_barre: '3301234567890',
                    stock_actuel: 8,
                    stock_minimum: 5,
                    prix_unitaire: 145.50,
                    fournisseur: 'TechMed Solutions',
                    created_at: new Date('2025-01-15')
                },
                {
                    id: 2,
                    nom: 'Sonde échographie convexe',
                    reference: 'ECHO-CVX-5MHz',
                    code_barre: '3301234567891',
                    stock_actuel: 3,
                    stock_minimum: 5,
                    prix_unitaire: 2890.00,
                    fournisseur: 'Philips Healthcare',
                    created_at: new Date('2025-01-20')
                },
                {
                    id: 3,
                    nom: 'Filtre HEPA ventilateur',
                    reference: 'FILT-HEPA-V800',
                    code_barre: '3301234567892',
                    stock_actuel: 12,
                    stock_minimum: 8,
                    prix_unitaire: 78.90,
                    fournisseur: 'Dräger Medical',
                    created_at: new Date('2025-02-01')
                },
                {
                    id: 4,
                    nom: 'Valve expiratoire',
                    reference: 'VALVE-EXP-V800',
                    code_barre: '3301234567893',
                    stock_actuel: 2,
                    stock_minimum: 4,
                    prix_unitaire: 234.75,
                    fournisseur: 'Dräger Medical',
                    created_at: new Date('2025-02-05')
                }
            ],
            activities: [
                {
                    id: 1,
                    type: 'ticket_created',
                    description: 'Nouveau ticket créé: Panne scanner IRM',
                    user_id: 2,
                    ticket_id: 1,
                    timestamp: new Date('2025-09-24T08:30:00')
                },
                {
                    id: 2,
                    type: 'ticket_assigned',
                    description: 'Ticket assigné à Marie Martin',
                    user_id: 2,
                    ticket_id: 1,
                    timestamp: new Date('2025-09-24T08:35:00')
                },
                {
                    id: 3,
                    type: 'intervention_completed',
                    description: 'Intervention terminée: Remplacement capteur température',
                    user_id: 3,
                    ticket_id: 3,
                    timestamp: new Date('2025-09-23T16:00:00')
                }
            ]
        };
    }

    /**
     * Initialisation de l'application
     */
    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupEventListeners();
                this.updateDateTime();
                this.checkExistingSession();
            });
        } else {
            this.setupEventListeners();
            this.updateDateTime();
            this.checkExistingSession();
        }
    }

    /**
     * Configuration des écouteurs d'événements
     */
    setupEventListeners() {
        // Connexion
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }

        // Boutons de démonstration
        document.querySelectorAll('.demo-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleDemoLogin(e));
        });

        // Déconnexion
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => this.handleLogout());
        }

        // Toggle sidebar
        const sidebarToggle = document.getElementById('sidebarToggle');
        if (sidebarToggle) {
            sidebarToggle.addEventListener('click', () => this.toggleSidebar());
        }

        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => this.handleNavigation(e));
        });

        // Modales
        this.setupModalEvents();

        // Formulaires
        this.setupFormEvents();

        // Filtres
        this.setupFilterEvents();

        // Planning
        this.setupPlanningEvents();

        // Responsive
        this.setupResponsiveEvents();
    }

    /**
     * Gestion des événements de modales
     */
    setupModalEvents() {
        // Boutons d'ouverture de modales
        const newTicketBtn = document.getElementById('newTicketBtn');
        if (newTicketBtn) {
            newTicketBtn.addEventListener('click', () => this.openTicketModal());
        }

        // Fermeture des modales
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-close-modal]')) {
                this.closeModals();
            }
        });

        // Échapper pour fermer les modales
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeModals();
            }
        });
    }

    /**
     * Gestion des événements de formulaires
     */
    setupFormEvents() {
        const ticketForm = document.getElementById('ticketForm');
        if (ticketForm) {
            ticketForm.addEventListener('submit', (e) => this.handleCreateTicket(e));
        }

        // Changement de client pour filtrer les machines
        const clientSelect = document.getElementById('ticketClient');
        if (clientSelect) {
            clientSelect.addEventListener('change', (e) => this.filterMachinesByClient(e.target.value));
        }
    }

    /**
     * Gestion des événements de filtres
     */
    setupFilterEvents() {
        const statusFilter = document.getElementById('statusFilter');
        const priorityFilter = document.getElementById('priorityFilter');
        const searchTickets = document.getElementById('searchTickets');
        const resetFilters = document.getElementById('resetFilters');

        [statusFilter, priorityFilter].forEach(filter => {
            if (filter) {
                filter.addEventListener('change', () => this.applyTicketFilters());
            }
        });

        if (searchTickets) {
            searchTickets.addEventListener('input', this.debounce(() => this.applyTicketFilters(), 300));
        }

        if (resetFilters) {
            resetFilters.addEventListener('click', () => this.resetTicketFilters());
        }
    }

    /**
     * Gestion des événements du planning
     */
    setupPlanningEvents() {
        const prevWeekBtn = document.getElementById('prevWeek');
        const nextWeekBtn = document.getElementById('nextWeek');

        if (prevWeekBtn) {
            prevWeekBtn.addEventListener('click', () => this.changeWeek(-1));
        }

        if (nextWeekBtn) {
            nextWeekBtn.addEventListener('click', () => this.changeWeek(1));
        }
    }

    /**
     * Gestion des événements responsive
     */
    setupResponsiveEvents() {
        window.addEventListener('resize', this.debounce(() => {
            if (window.innerWidth > 768) {
                const sidebar = document.getElementById('sidebar');
                if (sidebar) {
                    sidebar.classList.remove('active');
                }
                this.state.sidebarCollapsed = false;
            }
        }, 250));

        // Fermer la sidebar en mobile quand on clique ailleurs
        document.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                const sidebar = document.getElementById('sidebar');
                const sidebarToggle = document.getElementById('sidebarToggle');
                
                if (sidebar && !sidebar.contains(e.target) && 
                    sidebarToggle && !sidebarToggle.contains(e.target)) {
                    sidebar.classList.remove('active');
                    this.state.sidebarCollapsed = false;
                }
            }
        });
    }

    /**
     * Vérification d'une session existante
     */
    checkExistingSession() {
        try {
            const savedUser = sessionStorage.getItem('medimex_user');
            if (savedUser) {
                const userData = JSON.parse(savedUser);
                this.state.currentUser = userData;
                this.showApp();
            }
        } catch (e) {
            console.warn('Session invalide détectée');
            sessionStorage.removeItem('medimex_user');
        }
    }

    /**
     * Gestion de la connexion de démonstration
     */
    handleDemoLogin(e) {
        e.preventDefault();
        const btn = e.target;
        const username = btn.dataset.username;
        const password = btn.dataset.password;

        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        
        if (usernameInput && passwordInput) {
            usernameInput.value = username;
            passwordInput.value = password;
        }
    }

    /**
     * Gestion de la connexion
     */
    handleLogin(e) {
        e.preventDefault();
        
        const usernameInput = document.getElementById('username');
        const passwordInput = document.getElementById('password');
        
        if (!usernameInput || !passwordInput) {
            this.showError('Erreur: champs de connexion introuvables');
            return;
        }

        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        if (!username || !password) {
            this.showError('Veuillez saisir vos identifiants');
            return;
        }

        this.showLoading(true);

        // Simulation d'un délai de connexion
        setTimeout(() => {
            try {
                const user = this.authenticateUser(username, password);
                
                if (user) {
                    this.state.currentUser = user;
                    this.updateUserSession(user);
                    this.showApp();
                    this.showSuccess('Connexion réussie');
                } else {
                    this.showError('Identifiants incorrects');
                }
            } catch (error) {
                this.showError('Erreur de connexion');
                console.error('Erreur de connexion:', error);
            } finally {
                this.showLoading(false);
            }
        }, 800); // Délai réaliste pour la démo
    }

    /**
     * Authentification utilisateur (simulation)
     */
    authenticateUser(username, password) {
        const user = this.data.users.find(u => 
            u.username === username && u.password_hash === password && u.statut === 'actif'
        );

        if (user) {
            // Mise à jour de la dernière connexion
            user.derniere_connexion = new Date();
            
            // Copie sans le mot de passe pour la session
            const { password_hash, ...safeUser } = user;
            return safeUser;
        }
        
        return null;
    }

    /**
     * Mise à jour de la session utilisateur
     */
    updateUserSession(user) {
        try {
            sessionStorage.setItem('medimex_user', JSON.stringify(user));
        } catch (e) {
            console.warn('Impossible de sauvegarder la session');
        }
        
        // Auto-déconnexion après timeout
        setTimeout(() => {
            this.handleLogout();
            this.showWarning('Session expirée, veuillez vous reconnecter');
        }, this.config.sessionTimeout);
    }

    /**
     * Affichage de l'application
     */
    showApp() {
        const loginPage = document.getElementById('loginPage');
        const mainApp = document.getElementById('mainApp');

        if (loginPage && mainApp) {
            loginPage.classList.add('hidden');
            mainApp.classList.remove('hidden');
        }

        this.updateUserInterface();
        this.loadDashboard();
        this.populateFormSelects();

        // Ajouter la classe de rôle au body pour la gestion CSS
        document.body.classList.add(`user-${this.state.currentUser.role}`);
    }

    /**
     * Mise à jour de l'interface utilisateur
     */
    updateUserInterface() {
        const user = this.state.currentUser;
        
        // Nom d'utilisateur
        const userNameEl = document.getElementById('currentUserName');
        if (userNameEl) {
            userNameEl.textContent = `${user.prenom} ${user.nom}`;
        }

        // Rôle
        const userRoleEl = document.getElementById('currentUserRole');
        if (userRoleEl) {
            userRoleEl.textContent = this.getRoleDisplayName(user.role);
        }

        // Avatar
        const userAvatarEl = document.getElementById('userAvatar');
        if (userAvatarEl) {
            userAvatarEl.textContent = `${user.prenom.charAt(0)}${user.nom.charAt(0)}`;
        }

        // Masquer/afficher les éléments selon le rôle
        this.updateUIForRole(user.role);
    }

    /**
     * Mise à jour de l'UI selon le rôle
     */
    updateUIForRole(role) {
        const adminElements = document.querySelectorAll('.admin-only');
        
        adminElements.forEach(el => {
            if (role === 'admin') {
                el.style.display = '';
            } else {
                el.style.display = 'none';
            }
        });
    }

    /**
     * Gestion de la déconnexion
     */
    handleLogout() {
        this.state.currentUser = null;
        sessionStorage.removeItem('medimex_user');
        
        const loginPage = document.getElementById('loginPage');
        const mainApp = document.getElementById('mainApp');

        if (loginPage && mainApp) {
            loginPage.classList.remove('hidden');
            mainApp.classList.add('hidden');
        }

        // Réinitialiser le formulaire de connexion
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.reset();
        }

        // Nettoyer les classes de rôle
        document.body.className = document.body.className
            .replace(/user-(admin|superviseur|technicien|referent|constructeur)/g, '');

        // Détruire les graphiques
        Object.values(this.state.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.state.charts = {};
    }

    /**
     * Toggle du menu latéral
     */
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.classList.toggle('active');
            this.state.sidebarCollapsed = !this.state.sidebarCollapsed;
        }
    }

    /**
     * Gestion de la navigation
     */
    handleNavigation(e) {
        e.preventDefault();
        
        const section = e.currentTarget.dataset.section;
        if (section) {
            this.navigateToSection(section);
        }
    }

    /**
     * Navigation vers une section
     */
    navigateToSection(sectionName) {
        // Mise à jour de la navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeNavItem = document.querySelector(`[data-section="${sectionName}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }

        // Mise à jour du contenu
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });
        
        const targetSection = document.getElementById(`${sectionName}Section`);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        this.state.currentSection = sectionName;

        // Chargement du contenu spécifique
        this.loadSectionContent(sectionName);

        // Fermer la sidebar en mobile
        if (window.innerWidth <= 768) {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                sidebar.classList.remove('active');
            }
        }
    }

    /**
     * Chargement du contenu d'une section
     */
    loadSectionContent(section) {
        switch (section) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'tickets':
                this.loadTickets();
                break;
            case 'interventions':
                this.loadInterventions();
                break;
            case 'clients':
                this.loadClients();
                break;
            case 'machines':
                this.loadMachines();
                break;
            case 'planning':
                this.loadPlanning();
                break;
            case 'pieces':
                this.loadPiecesDetachees();
                break;
            case 'utilisateurs':
                if (this.state.currentUser.role === 'admin') {
                    this.loadUsers();
                }
                break;
            case 'rapports':
                this.loadRapports();
                break;
        }
    }

    /**
     * Chargement du tableau de bord
     */
    loadDashboard() {
        this.updateDashboardStats();
        this.loadRecentActivity();
        this.loadTodayInterventions();
        this.loadStockAlerts();
    }

    /**
     * Mise à jour des statistiques du tableau de bord
     */
    updateDashboardStats() {
        const openTickets = this.data.tickets.filter(t => t.statut !== 'termine').length;
        const urgentTickets = this.data.tickets.filter(t => 
            ['critique', 'elevee'].includes(t.priorite) && t.statut !== 'termine'
        ).length;
        const completedTickets = this.data.tickets.filter(t => t.statut === 'termine').length;
        const totalTickets = this.data.tickets.length;
        const resolutionRate = totalTickets > 0 ? Math.round((completedTickets / totalTickets) * 100) : 0;

        // Calcul du temps moyen (simulation)
        const averageTime = 4.2;

        // Mise à jour de l'affichage
        this.updateElement('openTickets', openTickets);
        this.updateElement('urgentInterventions', urgentTickets);
        this.updateElement('resolutionRate', `${resolutionRate}%`);
        this.updateElement('averageTime', `${averageTime}h`);

        // Changements (simulation)
        this.updateElement('ticketsChange', '+3 cette semaine');
        this.updateElement('urgentChange', urgentTickets > 0 ? 'À traiter' : 'Aucune urgence');
        this.updateElement('resolutionChange', '+5% ce mois');
        this.updateElement('timeChange', '-0.3h ce mois');
    }

    /**
     * Chargement de l'activité récente
     */
    loadRecentActivity() {
        const container = document.getElementById('recentActivity');
        if (!container) return;

        const recentActivities = this.data.activities
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 10);

        if (recentActivities.length === 0) {
            container.innerHTML = this.getEmptyState('📋', 'Aucune activité récente', 'Les activités apparaîtront ici');
            return;
        }

        container.innerHTML = recentActivities.map(activity => {
            const user = this.data.users.find(u => u.id === activity.user_id);
            const timeAgo = this.getTimeAgo(new Date(activity.timestamp));
            
            return `
                <div class="activity-item">
                    <div class="activity-icon">${this.getActivityIcon(activity.type)}</div>
                    <div class="activity-content">
                        <p class="activity-title">${activity.description}</p>
                        <p class="activity-meta">Par ${user ? `${user.prenom} ${user.nom}` : 'Système'}</p>
                    </div>
                    <span class="activity-time">${timeAgo}</span>
                </div>
            `;
        }).join('');
    }

    /**
     * Chargement des interventions du jour
     */
    loadTodayInterventions() {
        const container = document.getElementById('todayInterventions');
        if (!container) return;

        const today = new Date().toISOString().split('T')[0];
        const todayTickets = this.data.tickets.filter(t => 
            t.date_planifiee === today && t.statut !== 'termine'
        );

        if (todayTickets.length === 0) {
            container.innerHTML = this.getEmptyState('✅', 'Aucune intervention prévue', 'Profitez de cette journée calme');
            return;
        }

        container.innerHTML = todayTickets.map(ticket => {
            const client = this.data.clients.find(c => c.id === ticket.client_id);
            const technicien = this.data.users.find(u => u.id === ticket.technicien_id);
            
            return `
                <div class="intervention-item">
                    <h4 class="intervention-title">${ticket.titre}</h4>
                    <p class="intervention-meta">
                        ${client?.nom || 'Client non spécifié'} • 
                        ${technicien ? `${technicien.prenom} ${technicien.nom}` : 'Non assigné'}
                    </p>
                </div>
            `;
        }).join('');
    }

    /**
     * Chargement des alertes de stock
     */
    loadStockAlerts() {
        const container = document.getElementById('stockAlerts');
        if (!container) return;

        const lowStockPieces = this.data.pieces_detachees.filter(p => 
            p.stock_actuel <= p.stock_minimum
        );

        if (lowStockPieces.length === 0) {
            container.innerHTML = this.getEmptyState('📦', 'Stock optimal', 'Tous les stocks sont suffisants');
            return;
        }

        container.innerHTML = lowStockPieces.map(piece => `
            <div class="stock-alert">
                <h5 class="alert-title">${piece.nom}</h5>
                <p class="alert-stock">Stock: ${piece.stock_actuel} (min: ${piece.stock_minimum})</p>
            </div>
        `).join('');
    }

    /**
     * Chargement des tickets
     */
    loadTickets() {
        const container = document.getElementById('ticketsTableContainer');
        if (!container) return;

        let tickets = [...this.data.tickets];

        // Application des filtres
        tickets = this.applyFiltersToTickets(tickets);

        // Tri par date de création (plus récent en premier)
        tickets.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        container.innerHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Titre</th>
                        <th>Client</th>
                        <th>Statut</th>
                        <th>Priorité</th>
                        <th>Technicien</th>
                        <th>Date prévue</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${tickets.map(ticket => this.renderTicketRow(ticket)).join('')}
                </tbody>
            </table>
        `;
    }

    /**
     * Rendu d'une ligne de ticket
     */
    renderTicketRow(ticket) {
        const client = this.data.clients.find(c => c.id === ticket.client_id);
        const technicien = this.data.users.find(u => u.id === ticket.technicien_id);
        
        return `
            <tr>
                <td><strong>#${ticket.id}</strong></td>
                <td>
                    <div>
                        <strong>${ticket.titre}</strong>
                        <br><small class="text-muted">${this.truncateText(ticket.description, 50)}</small>
                    </div>
                </td>
                <td>${client?.nom || 'N/A'}</td>
                <td>
                    <span class="status-badge status-${ticket.statut}">
                        ${this.getStatusDisplayName(ticket.statut)}
                    </span>
                </td>
                <td>
                    <span class="status-badge priority-${ticket.priorite}">
                        ${this.getPriorityDisplayName(ticket.priorite)}
                    </span>
                </td>
                <td>${technicien ? `${technicien.prenom} ${technicien.nom}` : 'Non assigné'}</td>
                <td>${this.formatDate(ticket.date_planifiee)}</td>
                <td>
                    <button class="btn btn--outline btn--sm" onclick="app.viewTicketDetails(${ticket.id})">
                        Voir
                    </button>
                </td>
            </tr>
        `;
    }

    /**
     * Chargement des interventions (section spécifique)
     */
    loadInterventions() {
        const container = document.getElementById('interventionsGrid');
        if (!container) return;

        if (this.data.interventions.length === 0) {
            container.innerHTML = this.getEmptyState('🔧', 'Aucune intervention', 'Les interventions apparaîtront ici');
            return;
        }

        container.innerHTML = this.data.interventions.map(intervention => {
            const ticket = this.data.tickets.find(t => t.id === intervention.ticket_id);
            const technicien = this.data.users.find(u => u.id === intervention.technicien_id);
            const client = ticket ? this.data.clients.find(c => c.id === ticket.client_id) : null;
            
            return `
                <div class="intervention-card">
                    <div class="card-header">
                        <h3 class="card-title">${ticket?.titre || 'Intervention sans titre'}</h3>
                        <span class="card-status">
                            <span class="status-badge status-termine">Terminée</span>
                        </span>
                    </div>
                    <div class="card-content">
                        <div class="card-field">
                            <span class="field-label">Technicien</span>
                            <span class="field-value">${technicien ? `${technicien.prenom} ${technicien.nom}` : 'N/A'}</span>
                        </div>
                        <div class="card-field">
                            <span class="field-label">Client</span>
                            <span class="field-value">${client?.nom || 'N/A'}</span>
                        </div>
                        <div class="card-field">
                            <span class="field-label">Temps passé</span>
                            <span class="field-value">${Math.floor(intervention.temps_passe / 60)}h ${intervention.temps_passe % 60}min</span>
                        </div>
                        <div class="card-field">
                            <span class="field-label">Satisfaction</span>
                            <span class="field-value">${intervention.satisfaction_client}/5 ⭐</span>
                        </div>
                        <div class="card-field">
                            <span class="field-label">Date</span>
                            <span class="field-value">${this.formatDate(intervention.created_at)}</span>
                        </div>
                    </div>
                    <div class="card-actions">
                        <button class="btn btn--outline btn--sm">Voir détails</button>
                        <button class="btn btn--primary btn--sm">Rapport PDF</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Chargement des clients
     */
    loadClients() {
        const container = document.getElementById('clientsGrid');
        if (!container) return;

        if (this.data.clients.length === 0) {
            container.innerHTML = this.getEmptyState('👥', 'Aucun client', 'Ajoutez votre premier client');
            return;
        }

        container.innerHTML = this.data.clients.map(client => {
            const machinesCount = this.data.machines.filter(m => m.client_id === client.id).length;
            const ticketsCount = this.data.tickets.filter(t => t.client_id === client.id).length;
            
            return `
                <div class="client-card">
                    <div class="card-header">
                        <h3 class="card-title">${client.nom}</h3>
                    </div>
                    <div class="card-content">
                        <div class="card-field">
                            <span class="field-label">Contact</span>
                            <span class="field-value">${client.contact_principal}</span>
                        </div>
                        <div class="card-field">
                            <span class="field-label">Téléphone</span>
                            <span class="field-value">${client.telephone}</span>
                        </div>
                        <div class="card-field">
                            <span class="field-label">Email</span>
                            <span class="field-value">${client.email}</span>
                        </div>
                        <div class="card-field">
                            <span class="field-label">Ville</span>
                            <span class="field-value">${client.ville} (${client.code_postal})</span>
                        </div>
                        <div class="card-field">
                            <span class="field-label">Machines</span>
                            <span class="field-value">${machinesCount}</span>
                        </div>
                        <div class="card-field">
                            <span class="field-label">Tickets</span>
                            <span class="field-value">${ticketsCount}</span>
                        </div>
                    </div>
                    <div class="card-actions">
                        <button class="btn btn--outline btn--sm">Modifier</button>
                        <button class="btn btn--primary btn--sm">Voir machines</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Chargement des machines
     */
    loadMachines() {
        const container = document.getElementById('machinesGrid');
        if (!container) return;

        if (this.data.machines.length === 0) {
            container.innerHTML = this.getEmptyState('⚙️', 'Aucune machine', 'Ajoutez votre première machine');
            return;
        }

        container.innerHTML = this.data.machines.map(machine => {
            const client = this.data.clients.find(c => c.id === machine.client_id);
            const ticketsCount = this.data.tickets.filter(t => t.machine_id === machine.id).length;
            
            return `
                <div class="machine-card machine-${machine.statut}">
                    <div class="card-header">
                        <h3 class="card-title">${machine.nom}</h3>
                        <span class="card-status">
                            <span class="status-badge status-${machine.statut}">
                                ${this.getMachineStatusDisplayName(machine.statut)}
                            </span>
                        </span>
                    </div>
                    <div class="card-content">
                        <div class="card-field">
                            <span class="field-label">Modèle</span>
                            <span class="field-value">${machine.modele}</span>
                        </div>
                        <div class="card-field">
                            <span class="field-label">N° Série</span>
                            <span class="field-value">${machine.numero_serie}</span>
                        </div>
                        <div class="card-field">
                            <span class="field-label">Client</span>
                            <span class="field-value">${client?.nom || 'N/A'}</span>
                        </div>
                        <div class="card-field">
                            <span class="field-label">Catégorie</span>
                            <span class="field-value">${machine.categorie}</span>
                        </div>
                        <div class="card-field">
                            <span class="field-label">Installation</span>
                            <span class="field-value">${this.formatDate(machine.date_installation)}</span>
                        </div>
                        <div class="card-field">
                            <span class="field-label">Interventions</span>
                            <span class="field-value">${ticketsCount}</span>
                        </div>
                    </div>
                    <div class="card-actions">
                        <button class="btn btn--outline btn--sm">Modifier</button>
                        <button class="btn btn--primary btn--sm">Historique</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Chargement du planning
     */
    loadPlanning() {
        this.updateWeekDisplay();
        this.generateCalendar();
    }

    /**
     * Chargement des pièces détachées
     */
    loadPiecesDetachees() {
        const container = document.getElementById('piecesTableContainer');
        if (!container) return;

        container.innerHTML = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Référence</th>
                        <th>Stock actuel</th>
                        <th>Stock minimum</th>
                        <th>Prix unitaire</th>
                        <th>Fournisseur</th>
                        <th>Statut</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${this.data.pieces_detachees.map(piece => {
                        const isLowStock = piece.stock_actuel <= piece.stock_minimum;
                        return `
                            <tr ${isLowStock ? 'style="background: rgba(var(--color-error-rgb), 0.05);"' : ''}>
                                <td><strong>${piece.nom}</strong></td>
                                <td>${piece.reference}</td>
                                <td class="${isLowStock ? 'text-error' : ''}">
                                    <strong>${piece.stock_actuel}</strong>
                                </td>
                                <td>${piece.stock_minimum}</td>
                                <td>${piece.prix_unitaire.toFixed(2)} €</td>
                                <td>${piece.fournisseur}</td>
                                <td>
                                    <span class="status-badge ${isLowStock ? 'status-annule' : 'status-termine'}">
                                        ${isLowStock ? 'Stock faible' : 'OK'}
                                    </span>
                                </td>
                                <td>
                                    <button class="btn btn--outline btn--sm">Modifier</button>
                                    ${isLowStock ? '<button class="btn btn--primary btn--sm">Commander</button>' : ''}
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    }

    /**
     * Chargement des utilisateurs (admin uniquement)
     */
    loadUsers() {
        const container = document.getElementById('usersGrid');
        if (!container) return;

        container.innerHTML = this.data.users.map(user => `
            <div class="user-card">
                <div class="card-header">
                    <h3 class="card-title">${user.prenom} ${user.nom}</h3>
                    <span class="card-status">
                        <span class="status-badge status-${user.statut}">
                            ${user.statut === 'actif' ? 'Actif' : 'Inactif'}
                        </span>
                    </span>
                </div>
                <div class="card-content">
                    <div class="card-field">
                        <span class="field-label">Username</span>
                        <span class="field-value">${user.username}</span>
                    </div>
                    <div class="card-field">
                        <span class="field-label">Email</span>
                        <span class="field-value">${user.email}</span>
                    </div>
                    <div class="card-field">
                        <span class="field-label">Rôle</span>
                        <span class="field-value">${this.getRoleDisplayName(user.role)}</span>
                    </div>
                    <div class="card-field">
                        <span class="field-label">Téléphone</span>
                        <span class="field-value">${user.telephone}</span>
                    </div>
                    <div class="card-field">
                        <span class="field-label">Dernière connexion</span>
                        <span class="field-value">${this.formatDateTime(user.derniere_connexion)}</span>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn btn--outline btn--sm">Modifier</button>
                    <button class="btn btn--primary btn--sm">Réinitialiser MDP</button>
                </div>
            </div>
        `).join('');
    }

    /**
     * Chargement des rapports
     */
    loadRapports() {
        // Délai pour permettre au DOM de se mettre à jour
        setTimeout(() => {
            this.createCharts();
        }, 100);
    }

    /**
     * Création des graphiques
     */
    createCharts() {
        this.createMonthlyChart();
        this.createTechnicianChart();
        this.createClientChart();
        this.createResolutionChart();
    }

    /**
     * Graphique d'évolution mensuelle
     */
    createMonthlyChart() {
        const canvas = document.getElementById('monthlyChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        if (this.state.charts.monthly) {
            this.state.charts.monthly.destroy();
        }

        this.state.charts.monthly = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep'],
                datasets: [{
                    label: 'Tickets traités',
                    data: [12, 19, 15, 25, 22, 30, 28, 35, 32],
                    borderColor: '#1FB8CD',
                    backgroundColor: 'rgba(31, 184, 205, 0.1)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    /**
     * Graphique répartition par technicien
     */
    createTechnicianChart() {
        const canvas = document.getElementById('technicianChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        if (this.state.charts.technician) {
            this.state.charts.technician.destroy();
        }

        const techniciens = this.data.users.filter(u => u.role === 'technicien');
        const data = techniciens.map(tech => 
            this.data.tickets.filter(t => t.technicien_id === tech.id).length
        );

        this.state.charts.technician = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: techniciens.map(t => `${t.prenom} ${t.nom}`),
                datasets: [{
                    data: data,
                    backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    /**
     * Graphique performance par client
     */
    createClientChart() {
        const canvas = document.getElementById('clientChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        if (this.state.charts.client) {
            this.state.charts.client.destroy();
        }

        const clientsData = this.data.clients.map(client => ({
            name: client.nom,
            tickets: this.data.tickets.filter(t => t.client_id === client.id).length
        }));

        this.state.charts.client = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: clientsData.map(c => c.name),
                datasets: [{
                    label: 'Nombre de tickets',
                    data: clientsData.map(c => c.tickets),
                    backgroundColor: '#1FB8CD',
                    borderColor: '#1FB8CD',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    /**
     * Graphique temps de résolution
     */
    createResolutionChart() {
        const canvas = document.getElementById('resolutionChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        
        if (this.state.charts.resolution) {
            this.state.charts.resolution.destroy();
        }

        this.state.charts.resolution = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['< 1h', '1-4h', '4-8h', '8-24h', '> 24h'],
                datasets: [{
                    label: 'Nombre d\'interventions',
                    data: [8, 15, 12, 6, 3],
                    backgroundColor: [
                        '#5D878F',
                        '#1FB8CD', 
                        '#FFC185',
                        '#B4413C',
                        '#DB4545'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 1
                        }
                    }
                }
            }
        });
    }

    /**
     * Ouverture de la modal de création de ticket
     */
    openTicketModal() {
        const modal = document.getElementById('ticketModal');
        if (modal) {
            modal.classList.remove('hidden');
            this.populateTicketForm();
        }
    }

    /**
     * Peuplement du formulaire de ticket
     */
    populateTicketForm() {
        // Clients
        const clientSelect = document.getElementById('ticketClient');
        if (clientSelect) {
            clientSelect.innerHTML = '<option value="">Sélectionner un client</option>' +
                this.data.clients.map(client => 
                    `<option value="${client.id}">${client.nom}</option>`
                ).join('');
        }

        // Techniciens
        const technicianSelect = document.getElementById('ticketTechnician');
        if (technicianSelect) {
            const techniciens = this.data.users.filter(u => u.role === 'technicien');
            technicianSelect.innerHTML = '<option value="">Assigner automatiquement</option>' +
                techniciens.map(tech => 
                    `<option value="${tech.id}">${tech.prenom} ${tech.nom}</option>`
                ).join('');
        }

        // Date par défaut (demain)
        const dateInput = document.getElementById('ticketDate');
        if (dateInput) {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            dateInput.value = tomorrow.toISOString().split('T')[0];
        }
    }

    /**
     * Filtrage des machines par client
     */
    filterMachinesByClient(clientId) {
        const machineSelect = document.getElementById('ticketMachine');
        if (!machineSelect) return;

        let machines = [];
        if (clientId) {
            machines = this.data.machines.filter(m => m.client_id == clientId);
        }

        machineSelect.innerHTML = '<option value="">Sélectionner une machine</option>' +
            machines.map(machine => 
                `<option value="${machine.id}">${machine.nom} (${machine.modele})</option>`
            ).join('');
    }

    /**
     * Création d'un nouveau ticket
     */
    handleCreateTicket(e) {
        e.preventDefault();

        const formData = new FormData(e.target);
        
        const newTicket = {
            id: Math.max(...this.data.tickets.map(t => t.id)) + 1,
            titre: formData.get('titre'),
            description: formData.get('description'),
            client_id: parseInt(formData.get('client_id')),
            machine_id: formData.get('machine_id') ? parseInt(formData.get('machine_id')) : null,
            technicien_id: formData.get('technicien_id') ? parseInt(formData.get('technicien_id')) : null,
            createur_id: this.state.currentUser.id,
            statut: 'ouvert',
            priorite: formData.get('priorite'),
            date_creation: new Date().toISOString().split('T')[0],
            date_planifiee: formData.get('date_planifiee') || new Date().toISOString().split('T')[0],
            date_cloture: null,
            created_at: new Date()
        };

        // Validation
        if (!newTicket.titre || !newTicket.description || !newTicket.client_id) {
            this.showError('Veuillez remplir tous les champs obligatoires');
            return;
        }

        this.data.tickets.push(newTicket);

        // Ajouter une activité
        this.addActivity('ticket_created', `Nouveau ticket créé: ${newTicket.titre}`, newTicket.id);

        this.closeModals();
        e.target.reset();
        
        if (this.state.currentSection === 'tickets') {
            this.loadTickets();
        }
        
        this.updateDashboardStats();
        this.loadRecentActivity();
        
        this.showSuccess('Ticket créé avec succès');
    }

    /**
     * Affichage des détails d'un ticket
     */
    viewTicketDetails(ticketId) {
        const ticket = this.data.tickets.find(t => t.id === ticketId);
        if (!ticket) return;

        const client = this.data.clients.find(c => c.id === ticket.client_id);
        const machine = this.data.machines.find(m => m.id === ticket.machine_id);
        const technicien = this.data.users.find(u => u.id === ticket.technicien_id);
        const createur = this.data.users.find(u => u.id === ticket.createur_id);

        const modal = document.getElementById('ticketDetailsModal');
        const content = document.getElementById('ticketDetailsContent');
        
        if (modal && content) {
            content.innerHTML = `
                <div class="ticket-details">
                    <div class="detail-section">
                        <h4>Informations générales</h4>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <label>Titre:</label>
                                <span>${ticket.titre}</span>
                            </div>
                            <div class="detail-item">
                                <label>Statut:</label>
                                <span class="status-badge status-${ticket.statut}">
                                    ${this.getStatusDisplayName(ticket.statut)}
                                </span>
                            </div>
                            <div class="detail-item">
                                <label>Priorité:</label>
                                <span class="status-badge priority-${ticket.priorite}">
                                    ${this.getPriorityDisplayName(ticket.priorite)}
                                </span>
                            </div>
                            <div class="detail-item">
                                <label>Date de création:</label>
                                <span>${this.formatDateTime(ticket.created_at)}</span>
                            </div>
                            <div class="detail-item">
                                <label>Date prévue:</label>
                                <span>${this.formatDate(ticket.date_planifiee)}</span>
                            </div>
                            <div class="detail-item">
                                <label>Créé par:</label>
                                <span>${createur ? `${createur.prenom} ${createur.nom}` : 'N/A'}</span>
                            </div>
                        </div>
                    </div>

                    <div class="detail-section">
                        <h4>Description</h4>
                        <p>${ticket.description}</p>
                    </div>

                    <div class="detail-section">
                        <h4>Client et Machine</h4>
                        <div class="detail-grid">
                            <div class="detail-item">
                                <label>Client:</label>
                                <span>${client?.nom || 'N/A'}</span>
                            </div>
                            <div class="detail-item">
                                <label>Machine:</label>
                                <span>${machine?.nom || 'Aucune machine spécifiée'}</span>
                            </div>
                            <div class="detail-item">
                                <label>Technicien assigné:</label>
                                <span>${technicien ? `${technicien.prenom} ${technicien.nom}` : 'Non assigné'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            modal.classList.remove('hidden');
        }
    }

    /**
     * Application des filtres aux tickets
     */
    applyTicketFilters() {
        this.loadTickets();
    }

    /**
     * Application des filtres
     */
    applyFiltersToTickets(tickets) {
        const statusFilter = document.getElementById('statusFilter')?.value;
        const priorityFilter = document.getElementById('priorityFilter')?.value;
        const searchFilter = document.getElementById('searchTickets')?.value?.toLowerCase();

        let filteredTickets = [...tickets];

        if (statusFilter) {
            filteredTickets = filteredTickets.filter(t => t.statut === statusFilter);
        }

        if (priorityFilter) {
            filteredTickets = filteredTickets.filter(t => t.priorite === priorityFilter);
        }

        if (searchFilter) {
            filteredTickets = filteredTickets.filter(t =>
                t.titre.toLowerCase().includes(searchFilter) ||
                t.description.toLowerCase().includes(searchFilter)
            );
        }

        return filteredTickets;
    }

    /**
     * Réinitialisation des filtres
     */
    resetTicketFilters() {
        const statusFilter = document.getElementById('statusFilter');
        const priorityFilter = document.getElementById('priorityFilter');
        const searchTickets = document.getElementById('searchTickets');
        
        if (statusFilter) statusFilter.value = '';
        if (priorityFilter) priorityFilter.value = '';
        if (searchTickets) searchTickets.value = '';
        
        this.loadTickets();
    }

    /**
     * Changement de semaine dans le planning
     */
    changeWeek(direction) {
        const newDate = new Date(this.state.currentWeek);
        newDate.setDate(newDate.getDate() + (direction * 7));
        this.state.currentWeek = newDate;
        
        this.updateWeekDisplay();
        this.generateCalendar();
    }

    /**
     * Mise à jour de l'affichage de la semaine
     */
    updateWeekDisplay() {
        const currentWeekEl = document.getElementById('currentWeek');
        if (!currentWeekEl) return;

        const startOfWeek = this.getStartOfWeek(this.state.currentWeek);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        currentWeekEl.textContent = 
            `${this.formatDate(startOfWeek)} - ${this.formatDate(endOfWeek)}`;
    }

    /**
     * Génération du calendrier
     */
    generateCalendar() {
        const container = document.getElementById('calendar');
        if (!container) return;

        const startOfWeek = this.getStartOfWeek(this.state.currentWeek);
        const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

        let calendarHTML = '';

        for (let i = 0; i < 7; i++) {
            const currentDay = new Date(startOfWeek);
            currentDay.setDate(startOfWeek.getDate() + i);
            const dayString = currentDay.toISOString().split('T')[0];
            
            const dayTickets = this.data.tickets.filter(t => t.date_planifiee === dayString);
            
            calendarHTML += `
                <div class="calendar-day">
                    <div class="day-header">
                        <strong>${days[i]}</strong>
                        <span class="day-number">${currentDay.getDate()}</span>
                    </div>
                    <div class="day-events">
                        ${dayTickets.map(ticket => {
                            const client = this.data.clients.find(c => c.id === ticket.client_id);
                            return `
                                <div class="calendar-event" onclick="app.viewTicketDetails(${ticket.id})">
                                    <strong>${ticket.titre}</strong>
                                    <br><small>${client?.nom || 'N/A'}</small>
                                </div>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }

        container.innerHTML = calendarHTML;
    }

    /**
     * Fermeture des modales
     */
    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('hidden');
        });
    }

    /**
     * Peuplement des sélects de formulaires
     */
    populateFormSelects() {
        this.populateTicketForm();
    }

    /**
     * Ajout d'une activité
     */
    addActivity(type, description, ticketId = null) {
        const activity = {
            id: Math.max(...this.data.activities.map(a => a.id)) + 1,
            type,
            description,
            user_id: this.state.currentUser.id,
            ticket_id: ticketId,
            timestamp: new Date()
        };

        this.data.activities.push(activity);
    }

    /**
     * Mise à jour de la date et heure
     */
    updateDateTime() {
        const now = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };

        const currentDateEl = document.getElementById('currentDate');
        if (currentDateEl) {
            currentDateEl.textContent = now.toLocaleDateString('fr-FR', options);
        }

        // Mettre à jour chaque minute
        setTimeout(() => this.updateDateTime(), 60000);
    }

    // === MÉTHODES UTILITAIRES ===

    /**
     * Affichage du chargement
     */
    showLoading(show = true) {
        const overlay = document.getElementById('loadingOverlay');
        if (overlay) {
            if (show) {
                overlay.classList.remove('hidden');
            } else {
                overlay.classList.add('hidden');
            }
        }
    }

    /**
     * Affichage d'un message de succès
     */
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    /**
     * Affichage d'un message d'erreur
     */
    showError(message) {
        this.showNotification(message, 'error');
    }

    /**
     * Affichage d'un avertissement
     */
    showWarning(message) {
        this.showNotification(message, 'warning');
    }

    /**
     * Affichage d'une notification
     */
    showNotification(message, type = 'info') {
        // Création simple d'une notification
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 6px;
            color: white;
            font-weight: 500;
            z-index: 9999;
            max-width: 300px;
            animation: slideIn 0.3s ease;
        `;
        
        switch (type) {
            case 'success':
                notification.style.backgroundColor = 'var(--color-success)';
                break;
            case 'error':
                notification.style.backgroundColor = 'var(--color-error)';
                break;
            case 'warning':
                notification.style.backgroundColor = 'var(--color-warning)';
                break;
            default:
                notification.style.backgroundColor = 'var(--color-info)';
        }

        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    /**
     * Débounce pour les événements
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Mise à jour d'un élément
     */
    updateElement(id, content) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = content;
        }
    }

    /**
     * État vide
     */
    getEmptyState(icon, title, description) {
        return `
            <div class="empty-state">
                <div class="empty-state-icon">${icon}</div>
                <h3 class="empty-state-title">${title}</h3>
                <p class="empty-state-description">${description}</p>
            </div>
        `;
    }

    /**
     * Formatage de date
     */
    formatDate(date) {
        if (!date) return 'N/A';
        const d = typeof date === 'string' ? new Date(date) : date;
        return d.toLocaleDateString('fr-FR');
    }

    /**
     * Formatage de date et heure
     */
    formatDateTime(date) {
        if (!date) return 'N/A';
        const d = typeof date === 'string' ? new Date(date) : date;
        return d.toLocaleDateString('fr-FR') + ' à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }

    /**
     * Temps relatif
     */
    getTimeAgo(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}j`;
        if (hours > 0) return `${hours}h`;
        if (minutes > 0) return `${minutes}min`;
        return 'Maintenant';
    }

    /**
     * Début de semaine
     */
    getStartOfWeek(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    }

    /**
     * Tronquer le texte
     */
    truncateText(text, length) {
        if (!text) return '';
        return text.length > length ? text.substring(0, length) + '...' : text;
    }

    /**
     * Icône d'activité
     */
    getActivityIcon(type) {
        const icons = {
            ticket_created: '🎫',
            ticket_assigned: '👤',
            ticket_completed: '✅',
            intervention_completed: '🔧',
            user_created: '👥',
            stock_alert: '📦'
        };
        return icons[type] || '📋';
    }

    /**
     * Nom d'affichage du rôle
     */
    getRoleDisplayName(role) {
        const roles = {
            admin: 'Administrateur',
            superviseur: 'Superviseur',
            technicien: 'Technicien',
            referent: 'Référent',
            constructeur: 'Constructeur'
        };
        return roles[role] || role;
    }

    /**
     * Nom d'affichage du statut
     */
    getStatusDisplayName(status) {
        const statuts = {
            ouvert: 'Ouvert',
            en_cours: 'En cours',
            termine: 'Terminé',
            annule: 'Annulé'
        };
        return statuts[status] || status;
    }

    /**
     * Nom d'affichage de la priorité
     */
    getPriorityDisplayName(priority) {
        const priorites = {
            faible: 'Faible',
            normale: 'Normale',
            elevee: 'Élevée',
            critique: 'Critique'
        };
        return priorites[priority] || priority;
    }

    /**
     * Nom d'affichage du statut machine
     */
    getMachineStatusDisplayName(status) {
        const statuts = {
            actif: 'Actif',
            maintenance: 'Maintenance',
            hors_service: 'Hors service'
        };
        return statuts[status] || status;
    }
}

// Initialisation de l'application
let app;

// Styles CSS pour les notifications
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    
    .detail-section {
        margin-bottom: var(--space-24);
    }
    
    .detail-section h4 {
        margin-bottom: var(--space-16);
        color: var(--color-primary);
        font-size: var(--font-size-lg);
    }
    
    .detail-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: var(--space-16);
    }
    
    .detail-item {
        display: flex;
        flex-direction: column;
        gap: var(--space-4);
    }
    
    .detail-item label {
        font-weight: var(--font-weight-semibold);
        color: var(--color-text-secondary);
        font-size: var(--font-size-sm);
    }
    
    .detail-item span {
        color: var(--color-text);
    }
    
    .text-error {
        color: var(--color-error);
        font-weight: var(--font-weight-semibold);
    }
    
    .text-muted {
        color: var(--color-text-secondary);
    }
    
    @media (max-width: 768px) {
        .detail-grid {
            grid-template-columns: 1fr;
        }
    }
`;
document.head.appendChild(notificationStyles);

// Démarrage de l'application
document.addEventListener('DOMContentLoaded', () => {
    app = new MedimexApp();
});

// Gestion des erreurs globales
window.addEventListener('error', (e) => {
    console.error('Erreur dans l\'application:', e.error);
});

// Export pour les tests (si nécessaire)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MedimexApp;
}