document.addEventListener("DOMContentLoaded", function() {
    // URL de l'API
const API_URL = "http://localhost:5678/api/works";

// Récupération des travaux depuis le back-end
fetch(API_URL)
    .then(response => response.json())
    .then(data => {
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

});