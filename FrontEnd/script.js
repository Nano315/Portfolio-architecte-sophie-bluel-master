// Constantes et références globales
const API_URL = "http://localhost:5678/api/works";

const body = document.getElementsByTagName('body')[0];
const loginLogoutLink = document.querySelector('#login-logout');
const modeEditionBar = document.querySelector('.mode-edition-bar');

const filtres = document.querySelectorAll('.filtres-card');
const galerie = document.querySelector(".gallery");

const openModalButton = document.querySelector('.js-mode-edition-link');
const closeModalButton = document.querySelector('.close-modal');
const modal = document.querySelector('.modal');
const galleryGrid = document.querySelector('.gallery-grid');


// Attacher l'événement click au bouton d'ouverture de la modale
openModalButton.addEventListener('click', openModal);

// Attacher l'événement click au bouton de fermeture de la modale
closeModalButton.addEventListener('click', closeModal);

// Fermer la modale si on clique à l'extérieur de .modal-wrapper
modal.addEventListener('click', function (event) {
    if (event.target === modal) {
        closeModal();
    }
});

// Empêcher la propagation de l'événement click dans .modal-wrapper
document.querySelector('.modal-wrapper').addEventListener('click', function (event) {
    event.stopPropagation();
});



// Stockage des travaux récupérés du backend
let travaux = [];

// Récupération des travaux depuis le backend
fetchTravaux();

// Gestionnaire d'événements pour les filtres
filtres.forEach(filtre => {
    filtre.addEventListener('click', gestionnaireFiltre);
});

// Fonction pour ouvrir la modale
function openModal(event) {
    event.preventDefault(); // Empêche le navigateur de suivre le lien
    modal.style.display = 'flex'; // Affiche la modale
    afficherTravauxDansModale(travaux);
}

// Fonction pour fermer la modale
function closeModal() {
    modal.style.display = 'none'; // Cache la modale
}

// Fonction pour créer un bouton de suppression
function creerBoutonSuppression(travail) {
    const btn = document.createElement('button');
    btn.className = 'delete-btn';
    btn.innerHTML = `<img src="./assets/icons/trash.png" alt="Supprimer"/>`; // Remplacez avec le chemin de votre icône corbeille
    btn.onclick = function () {
        supprimerTravail(travail.id);
    };
    return btn;
}

// Fonction pour supprimer un travail
function supprimerTravail(id) {
    const token = localStorage.getItem('token'); // Récupérez le token stocké dans localStorage
    fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(response => {
            if (response.ok) {
                const elementASupprimer = document.querySelector(`[data-travail-id="${id}"]`);
                if (elementASupprimer) {
                    galleryGrid.removeChild(elementASupprimer);
                }
            } else {
                throw new Error('Authorization required');
            }
        })
        .catch(error => {
            console.error('Erreur lors de la suppression du travail:', error);
        });
}


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

// Fonction pour afficher les travaux dans la modale
function afficherTravauxDansModale(travaux) {
    galleryGrid.innerHTML = ''; // Vider la galerie

    travaux.forEach(travail => {
        // Conteneur pour chaque travail
        const divTravail = document.createElement('div');
        divTravail.className = 'travail-item';
        divTravail.setAttribute('data-travail-id', travail.id); // Attribut pour identifier l'élément lors de la suppression

        // Image du travail
        const imgElement = document.createElement('img');
        imgElement.src = travail.imageUrl;
        imgElement.alt = 'Image du travail'; // Modifier si nécessaire

        // Ajout de l'image au conteneur
        divTravail.appendChild(imgElement);

        // Créer et ajouter le bouton de suppression
        const deleteBtn = creerBoutonSuppression(travail);
        divTravail.appendChild(deleteBtn);

        // Ajouter le conteneur à la galerie
        galleryGrid.appendChild(divTravail);
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