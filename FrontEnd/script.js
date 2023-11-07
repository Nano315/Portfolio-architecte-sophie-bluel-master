// Constantes et références globales
const API_URL = "http://localhost:5678/api/works";
const body = document.getElementsByTagName('body')[0];
const modeEditionBar = document.querySelector('.mode-edition-bar');
const galerie = document.querySelector(".gallery");
const filtres = document.querySelectorAll('.filtres-card');
const loginLogoutLink = document.querySelector('#login-logout');

// Stockage des travaux récupérés du backend
let travaux = [];

// Récupération des travaux depuis le backend
fetchTravaux();

// Gestionnaire d'événements pour les filtres
filtres.forEach(filtre => {
    filtre.addEventListener('click', gestionnaireFiltre);
});

function initialiserUI() {
    const token = localStorage.getItem('token');
    const filtresWrapper = document.querySelector('.filtres-wrapper');
    const modalEditLink = document.getElementById('modalEditLink');
    if (token) {
        modeEditionBar.style.display = 'flex';
        body.style.marginTop = '43px';
        
        // Changer le texte en "logout"
        if (loginLogoutLink) {
            loginLogoutLink.textContent = 'logout';
            // Ajouter un écouteur d'événement pour la déconnexion
            loginLogoutLink.addEventListener('click', deconnecterUtilisateur);
        }

        // Afficher le lien d'édition modal si l'utilisateur est connecté
        if (modalEditLink) {
            modalEditLink.style.display = 'flex';
        }

        // Cacher les filtres si l'utilisateur est connecté
        if (filtresWrapper) {
            filtresWrapper.style.display = 'none';
        }
    } else {
        modeEditionBar.style.display = 'none';
        body.style.marginTop = '0px';
        
        // Changer le texte en "login"
        if (loginLogoutLink) {
            loginLogoutLink.textContent = 'login';
            loginLogoutLink.removeEventListener('click', deconnecterUtilisateur);
        }

        // Masquer le lien d'édition modal si l'utilisateur n'est pas connecté
        if (modalEditLink) {
            modalEditLink.style.display = 'none';
        }

        // Afficher les filtres si l'utilisateur n'est pas connecté
        if (filtresWrapper) {
            filtresWrapper.style.display = 'flex';
        }
    }
}

function deconnecterUtilisateur() {
    // Suppression du token du localStorage
    localStorage.removeItem('token');
}

function fetchTravaux() {
    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            travaux = data; // Mise à jour de la liste des travaux
            afficherTravaux(travaux);
        })
        .catch(error => {
            console.error("Erreur lors de la récupération des travaux:", error);
        });
}

function afficherTravaux(travaux) {
    // Vider la galerie avant d'afficher de nouveaux éléments
    galerie.innerHTML = "";
    travaux.forEach(travail => {
        galerie.appendChild(creerElementTravail(travail));
    });
}

function creerElementTravail(travail) {
    const elementTravail = document.createElement("figure");
    elementTravail.innerHTML = `
        <img src="${travail.imageUrl}" alt="${travail.title}">
        <figcaption>${travail.title}</figcaption>
    `;
    return elementTravail;
}

function filtrerTravaux(categoryId) {
    return categoryId === 0 ? travaux : travaux.filter(travail => travail.categoryId === categoryId);
}

function gestionnaireFiltre(event) {
    // Récupération de l'ID de la catégorie du filtre et mise à jour de l'UI
    const filtre = event.currentTarget;
    const categoryId = parseInt(filtre.getAttribute('data-category-id'));
    majFiltresUI(filtre);

    // Affichage des travaux filtrés
    afficherTravaux(filtrerTravaux(categoryId));
}

function majFiltresUI(filtreSelectionne) {
    filtres.forEach(filtre => {
        filtre.classList.remove('selected');
    });
    filtreSelectionne.classList.add('selected');
}

// Initialisation de l'interface utilisateur
initialiserUI();