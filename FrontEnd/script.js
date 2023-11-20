// Constantes et références globales
const API_URL = "http://localhost:5678/api/works";

const body = document.getElementsByTagName('body')[0];
const loginLogoutLink = document.querySelector('#login-logout');
const modeEditionBar = document.querySelector('.edit-mode-bar');

const filters = document.querySelectorAll('.filter-card');
const gallery = document.querySelector(".gallery");

const openModalButton = document.querySelector('.js-edit-mode-link');
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
let works = [];

// Récupération des travaux depuis le backend
fetchWorks();

// Gestionnaire d'événements pour les filtres
filters.forEach(filter => {
    filter.addEventListener('click', filterHandler);
});

// Fonction pour ouvrir la modale
function openModal(event) {
    event.preventDefault(); // Empêche le navigateur de suivre le lien
    modal.style.display = 'flex'; // Affiche la modale
    displayWorksInModal(works);
}

// Fonction pour fermer la modale
function closeModal() {
    modal.style.display = 'none'; // Cache la modale
    resetModalToInitialState(); // Réinitialise l'affichage de la modale
    resetAddPhotoModal(); // Réinitialise les champs de la modale d'ajout de photo
}

// Fonction pour créer un bouton de suppression
function createDeleteButton(work) {
    const btn = document.createElement('button');
    btn.className = 'delete-btn';
    btn.innerHTML = `<img src="./assets/icons/trash-can-solid.svg" alt="Supprimer"/>`;
    btn.onclick = function () {
        deleteWork(work.id);
    };
    return btn;
}

// Fonction pour supprimer un travail
function deleteWork(id) {
    const token = localStorage.getItem('token'); // Récupérez le token stocké dans localStorage
    fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
        .then(response => {
            if (response.ok) {
                const elementToDelete = document.querySelector(`[data-work-id="${id}"]`);
                if (elementToDelete) {
                    galleryGrid.removeChild(elementToDelete);
                }
            } else {
                throw new Error('Autorisation requise');
            }
        })
        .catch(error => {
            console.error('Erreur lors de la suppression du travail:', error);
        });
}


function initializeUI() {
    const token = localStorage.getItem('token');
    const filtersWrapper = document.querySelector('.filters-wrapper');
    const modalEditLink = document.getElementById('modalEditLink');
    if (token) {
        modeEditionBar.style.display = 'flex';
        body.style.marginTop = '43px';

        // Changer le texte en "logout"
        if (loginLogoutLink) {
            loginLogoutLink.textContent = 'logout';
            // Ajouter un écouteur d'événement pour la déconnexion
            loginLogoutLink.addEventListener('click', logoutUser);
        }

        // Afficher le lien d'édition modal si l'utilisateur est connecté
        if (modalEditLink) {
            modalEditLink.style.display = 'flex';
        }

        // Cacher les filtres si l'utilisateur est connecté
        if (filtersWrapper) {
            filtersWrapper.style.display = 'none';
        }
    } else {
        modeEditionBar.style.display = 'none';
        body.style.marginTop = '0px';

        // Changer le texte en "login"
        if (loginLogoutLink) {
            loginLogoutLink.textContent = 'login';
            loginLogoutLink.removeEventListener('click', logoutUser);
        }

        // Masquer le lien d'édition modal si l'utilisateur n'est pas connecté
        if (modalEditLink) {
            modalEditLink.style.display = 'none';
        }

        // Afficher les filtres si l'utilisateur n'est pas connecté
        if (filtersWrapper) {
            filtersWrapper.style.display = 'flex';
        }
    }
}

function logoutUser() {
    // Suppression du token du localStorage
    localStorage.removeItem('token');
}

function fetchWorks() {
    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            works = data; // Mise à jour de la liste des travaux
            displayWorks(works);
        })
        .catch(error => {
            console.error("Erreur lors de la récupération des travaux:", error);
        });
}

function displayWorks(works) {
    // Vider la galerie avant d'afficher de nouveaux éléments
    gallery.innerHTML = "";
    works.forEach(work => {
        gallery.appendChild(createWorkElement(work));
    });
}

// Fonction pour afficher les travaux dans la modale
function displayWorksInModal(works) {
    galleryGrid.innerHTML = ''; // Vider la galerie

    works.forEach(work => {
        // Conteneur pour chaque travail
        const workDiv = document.createElement('div');
        workDiv.className = 'work-item';
        workDiv.setAttribute('data-work-id', work.id); // Attribut pour identifier l'élément lors de la suppression

        // Image du travail
        const imgElement = document.createElement('img');
        imgElement.src = work.imageUrl;
        imgElement.alt = 'Image du travail';

        // Ajout de l'image au conteneur
        workDiv.appendChild(imgElement);

        // Créer et ajouter le bouton de suppression
        const deleteBtn = createDeleteButton(work);
        workDiv.appendChild(deleteBtn);

        // Ajouter le conteneur à la galerie
        galleryGrid.appendChild(workDiv);
    });
}

function createWorkElement(work) {
    const elementTravail = document.createElement("figure");
    elementTravail.innerHTML = `
        <img src="${work.imageUrl}" alt="${work.title}">
        <figcaption>${work.title}</figcaption>
    `;
    return elementTravail;
}

function filterWorks(categoryId) {
    return categoryId === 0 ? works : works.filter(work => work.categoryId === categoryId);
}

function filterHandler(event) {
    // Récupération de l'ID de la catégorie du filtre et mise à jour de l'UI
    const filter = event.currentTarget;
    const categoryId = parseInt(filter.getAttribute('data-category-id'));
    updateFiltersUI(filter);

    // Affichage des travaux filtrés
    displayWorks(filterWorks(categoryId));
}

function updateFiltersUI(filterSelect) {
    filters.forEach(filter => {
        filter.classList.remove('selected');
    });
    filterSelect.classList.add('selected');
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
document.querySelector('.modal-back-button').addEventListener('click', function () {
    toggleModalContent();
});

// Fonction pour charger et afficher l'image sélectionnée
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const container = document.querySelector('.image-input-container');
            container.innerHTML = `<img src="${e.target.result}" alt="Uploaded Image" style="width: 129px; height: 193px;"/>`;
            checkFormCompletion(); // Vérifiez si tous les champs sont remplis après le chargement de l'image
        };
        reader.readAsDataURL(file);
    }
}

// Modifier l'écouteur d'événements pour le bouton d'upload d'image pour qu'il s'applique à l'input et non au bouton
document.querySelector('.image-input-container').addEventListener('click', function () {
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
    const title = document.getElementById('project-title').value;
    const category = document.getElementById('project-category').value;
    const imageContainer = document.querySelector('.image-input-container img');

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
    const container = document.querySelector('.image-input-container');
    container.innerHTML = `
      <img src="./assets/icons/picture-svgrepo-com.svg" alt="icon image" />
      <button class="add-photo-button">+ Ajouter photo</button>
      <p>jpg, png : 4mo max</p>
    `;

    // Réinitialiser les valeurs des champs de formulaire
    document.getElementById('project-title').value = '';
    document.getElementById('project-category').value = '';

    // Réinitialiser le bouton de validation
    const validateButton = document.querySelector('.validate-add-photo');
    validateButton.classList.add('invalid');
    validateButton.classList.remove('valid');
}

// Ajoutez des écouteurs d'événements pour les changements de champ
document.getElementById('project-title').addEventListener('input', checkFormCompletion);
document.getElementById('project-category').addEventListener('change', checkFormCompletion);

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
    formData.append('title', document.getElementById('project-title').value);
    formData.append('category', document.getElementById('project-category').value);


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
                displayNewProject(data); // Fonction pour afficher le nouveau projet ajouté
            }
        })
        .catch(error => {
            console.error("Erreur lors de l'envoi du formulaire: ", error);
        });
}

// Fonction pour afficher le nouveau projet ajouté dans la galerie et la modale
function displayNewProject(projet) {
    // Ajouter le nouveau projet à l'array travaux
    works.push(projet);

    // Créer le nouvel élément de la galerie
    const nouvelElement = createWorkElement(projet);
    gallery.appendChild(nouvelElement);
}

// Initialisation de l'interface utilisateur
initializeUI();