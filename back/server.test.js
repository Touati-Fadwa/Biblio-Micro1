// Importer les dépendances nécessaires
const request = require('supertest');
const app = require('./server'); // Importez votre application Express

// Décrire les tests pour la route GET /
describe('GET /', () => {
  it('devrait retourner un message de bienvenue', async () => {
    // Envoyer une requête GET à la route /
    const res = await request(app).get('/');

    // Vérifier que le code de statut est 200 (succès)
    expect(res.statusCode).toEqual(200);

    // Vérifier que le texte de la réponse contient le message attendu
    expect(res.text).toContain('Backend de la bibliothèque ISET Tozeur');
  });
});