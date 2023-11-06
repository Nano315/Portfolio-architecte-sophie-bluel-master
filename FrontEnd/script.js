// URL de l'API
const API_URL = "http://localhost:5678/api/works";

let travaux = [];  // Déclaration globale

const filtres = document.querySelectorAll('.filtres-card');

const body = document.getElementsByTagName('body')[0];
const modeEditionBar = document.querySelector('.mode-edition-bar');
const token = localStorage.getItem('token');


// Afficher la barre noire si l'utilisateur est connecté
if (token) {
    modeEditionBar.style.display = 'flex';
    body.style.marginTop = '43px';
} else {
    modeEditionBar.style.display = 'none';
    body.style.marginTop = '0px';
}

// Récupération des travaux depuis le back-end
fetch(API_URL)
    .then(response => response.json())
    .then(data => {
        travaux = data;  // Mise à jour de la valeur
        afficherTravaux(data);
    })
    .catch(error => {
        console.error("Erreur lors de la récupération des travaux:", error);
    });


// Fonction pour afficher les travaux dans la galerie
function afficherTravaux(travaux) {
    const galerie = document.querySelector(".gallery"); // Remplacez "galerie" par l'ID de votre élément de galerie
    travaux.forEach(travail => {
        // Créez un nouvel élément pour chaque travail
        const elementTravail = document.createElement("figure");
        elementTravail.innerHTML = `
            <img src="${travail.imageUrl}" alt="${travail.title}">
            <figcaption>${travail.title}</figcaption>
        `;
        galerie.appendChild(elementTravail);
    });
}


// Fonction pour filtrer les travaux selon la catégorie
function filtrerTravaux(categoryId) {
    // Si la catégorie est 0 ("Tous"), on affiche tous les travaux
    if (categoryId === 0) {
        afficherTravaux(travaux);
    } else {
        // Sinon, on filtre les travaux selon la catégorie choisie
        const travauxFiltres = travaux.filter(travail => travail.categoryId === categoryId);
        afficherTravaux(travauxFiltres);
    }
}


filtres.forEach(filtre => {
    filtre.addEventListener('click', () => {
        // Enlever la classe 'selected' de tous les filtres
        filtres.forEach(innerFiltre => {
            innerFiltre.classList.remove('selected');
        });

        // Ajouter la classe 'selected' au filtre cliqué
        filtre.classList.add('selected');


        // Récupération de l'ID de la catégorie du filtre
        const categoryId = parseInt(filtre.getAttribute('data-category-id'));

        // Suppression de tous les éléments précédents de la galerie
        document.querySelector('.gallery').innerHTML = "";

        // Filtrage des travaux selon l'ID de la catégorie
        filtrerTravaux(categoryId);

        // À la déconnexion de l'utilisateur
localStorage.removeItem('token');
    });
});


