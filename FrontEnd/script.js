// Constantes et références globales
const API_URL = "http://localhost:5678/api/works";

const body = document.getElementsByTagName('body')[0];
const loginLogoutLink = document.querySelector('#login-logout');
const modeEditionBar = document.querySelector('.mode-edition-bar');

const filtres = document.querySelectorAll('.filtres-card');
const galerie = document.querySelector(".gallery");

const openModalButton = document.querySelector('.js-mode-edition-link');
const modal = document.querySelector('.modal');
const galleryGrid = document.querySelector('.gallery-grid');


// Attacher l'événement click au bouton de fermeture de la modale pour chaque section
document.querySelectorAll('.close-modal').forEach(button => {
    button.addEventListener('click', closeModal);
});

// Attacher l'événement click au bouton d'ouverture de la modale
openModalButton.addEventListener('click', openModal);

// Fermer la modale si on clique à l'extérieur de .modal-wrapper
modal.addEventListener('click', function (event) {
    if (event.target === modal) {
        closeModal();
    }
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
    resetModalToInitialState(); // Réinitialise l'affichage de la modale
    resetAddPhotoModal(); // Réinitialise les champs de la modale d'ajout de photo
}

// Fonction pour créer un bouton de suppression
function creerBoutonSuppression(travail) {
    const btn = document.createElement('button');
    btn.className = 'delete-btn';
    btn.innerHTML = `<img src="./assets/icons/trash-can-solid.svg" alt="Supprimer"/>`;
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
        imgElement.alt = 'Image du travail';

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

// Fonction pour changer l'affichage de la modale
function toggleModalContent() {
    const gallerySection = document.getElementById('gallery-section');
    const addPhotoSection = document.getElementById('add-photo-section');

    gallerySection.classList.toggle('hidden');
    addPhotoSection.classList.toggle('hidden');

    resetAddPhotoModal(); // Réinitialise les champs de la modale d'ajout de photo
}

// Ajoutez un écouteur d'événements pour le bouton "Ajouter une photo"
document.querySelector('.add-photo').addEventListener('click', function () {
    toggleModalContent();
});

// Ajoutez un écouteur d'événements pour le bouton de retour
document.querySelector('.retour-modal').addEventListener('click', function () {
    toggleModalContent();
});

// Fonction pour charger et afficher l'image sélectionnée
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const container = document.querySelector('.container-input-img');
            container.innerHTML = `<img src="${e.target.result}" alt="Uploaded Image" style="width: 129px; height: 193px;" />`;
            checkFormCompletion(); // Vérifiez si tous les champs sont remplis après le chargement de l'image
        };
        reader.readAsDataURL(file);
    }
}

// Modifier l'écouteur d'événements pour le bouton d'upload d'image pour qu'il s'applique à l'input et non au bouton
document.querySelector('.container-input-img').addEventListener('click', function () {
    document.getElementById('image-upload').click();
});

// Créez un input de type file qui sera cliqué lors du clic sur le bouton "+ Ajouter photo"
const fileInput = document.createElement('input');
fileInput.type = 'file';
fileInput.id = 'image-upload';
fileInput.style.display = 'none';
fileInput.accept = 'image/png, image/jpeg';
document.body.appendChild(fileInput);

// Attachez l'écouteur d'événements à cet input de type file
fileInput.addEventListener('change', handleImageUpload);


// Fonction pour vérifier si tous les champs sont remplis
function checkFormCompletion() {
    const title = document.getElementById('titre-projet').value;
    const category = document.getElementById('categorie-projet').value;
    const imageContainer = document.querySelector('.container-input-img img');
    
    // Vérifiez que l'imageContainer existe et que son src n'est pas l'image par défaut
    const defaultImageSrc = 'assets/icons/picture-svgrepo-com.svg'; 
    const isImageUploaded = imageContainer && (!imageContainer.src.includes(defaultImageSrc));
    
    const isValid = title && category && isImageUploaded;
    
    const validateButton = document.querySelector('.validate-add-photo');

    if (isValid) {
        validateButton.classList.remove('invalid');
        validateButton.classList.add('valid');
        document.querySelector('.validate-add-photo').addEventListener('click', handleAddPhotoFormSubmission);
        return true;
    } else {
        validateButton.classList.remove('valid');
        validateButton.classList.add('invalid');
        document.querySelector('.validate-add-photo').removeEventListener('click', handleAddPhotoFormSubmission);
        return false;
    }
}

// Fonction pour réinitialiser l'affichage de la modale à l'état initial
function resetModalToInitialState() {
    document.getElementById('gallery-section').classList.remove('hidden');
    document.getElementById('add-photo-section').classList.add('hidden');
}

// Fonction pour réinitialiser les champs de la modale d'ajout de photo
function resetAddPhotoModal() {
    // Remettre l'aperçu de l'image à son état initial
    const container = document.querySelector('.container-input-img');
    container.innerHTML = `
      <img src="./assets/icons/picture-svgrepo-com.svg" alt="icon image" />
      <button class="input-add-photo">+ Ajouter photo</button>
      <p>jpg, png : 4mo max</p>
    `;

    // Réinitialiser les valeurs des champs de formulaire
    document.getElementById('titre-projet').value = '';
    document.getElementById('categorie-projet').value = '';

    // Réinitialiser le bouton de validation
    const validateButton = document.querySelector('.validate-add-photo');
    validateButton.classList.add('invalid');
    validateButton.classList.remove('valid');
}

// Ajoutez des écouteurs d'événements pour les changements de champ
document.getElementById('titre-projet').addEventListener('input', checkFormCompletion);
document.getElementById('categorie-projet').addEventListener('change', checkFormCompletion);

// Fonction pour gérer la soumission du formulaire d'ajout de photo
function handleAddPhotoFormSubmission(event) {
    event.preventDefault(); // Empêcher le comportement de soumission par défaut

    // Vérifier si le formulaire est correctement rempli
    if (!checkFormCompletion()) {
        alert("Veuillez remplir tous les champs avant de soumettre.");
        return;
    }

    // Créer un objet FormData et ajouter les données du formulaire
    const formData = new FormData();
    formData.append('image', document.getElementById('image-upload').files[0]);
    formData.append('title', document.getElementById('titre-projet').value);
    formData.append('category', document.getElementById('categorie-projet').value);
    

    const token = localStorage.getItem('token');
    // Envoyer les données au serveur via fetch
    fetch(API_URL, {
        method: 'POST',
        body: formData,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                alert("Une erreur est survenue lors de l'envoi du formulaire.");
            } else {
                closeModal();
                afficherNouveauProjet(data); // Fonction pour afficher le nouveau projet ajouté
            }
        })
        .catch(error => {
            console.error("Erreur lors de l'envoi du formulaire: ", error);
        });
}

// Fonction pour afficher le nouveau projet ajouté dans la galerie et la modale
function afficherNouveauProjet(projet) {
    // Ajouter le nouveau projet à l'array travaux
    travaux.push(projet);

    // Créer le nouvel élément de la galerie
    const nouvelElement = creerElementTravail(projet);
    galerie.appendChild(nouvelElement);
}

// Initialisation de l'interface utilisateur
initialiserUI();