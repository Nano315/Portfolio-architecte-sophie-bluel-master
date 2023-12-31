// URL de l'API de connexion
const LOGIN_API_URL = "http://localhost:5678/api/users/login";

const body = document.getElementsByTagName('body')[0];
body.style.marginTop = '0px';

document.querySelector(".login-container form").addEventListener("submit", function (event) {
    event.preventDefault();  // Prévenir la soumission standard du formulaire


    const email = document.querySelector("#email").value;
    const password = document.querySelector("#password").value;

    // Validation de l'email
    const emailRegex = /[a-z0-9._-]+@[a-z0-9._-]+.[a-z0-9._-]+/;
    if (!emailRegex.test(email)) {
        alert("Veuillez entrer une adresse e-mail valide.");
        return;
    }

    // Envoyer une requête POST avec les données de l'utilisateur
    fetch(LOGIN_API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            email: email,
            password: password
        })
    })
        .then(response => response.json())
        .then(data => {
            // Traiter la réponse
            if (data.token) {
                // Stocker le token pour une utilisation ultérieure
                localStorage.setItem('token', data.token);
                // Rediriger vers la page d'accueil
                window.location.href = "index.html";
            } else {
                // Afficher un message d'erreur
                alert("Combinaison utilisateur/mot de passe incorrecte.");
            }
        })
        .catch(error => {
            console.error("Erreur lors de l'authentification:", error);
            alert("Une erreur est survenue lors de la connexion.");
        });
});
