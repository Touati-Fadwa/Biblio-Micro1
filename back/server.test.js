const request = require('supertest');
const app = require('./server'); // Importer l'application Express

let server;

// Démarrer le serveur avant les tests
beforeAll(() => {
  const PORT = process.env.PORT || 3000;
  server = app.listen(PORT);
});

// Arrêter le serveur après les tests
afterAll((done) => {
  server.close(done);
});

// Tester la route GET /
describe('GET /', () => {
  it('devrait retourner un message de bienvenue', async () => {
    const res = await request(app).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toContain('Backend de la bibliothèque ISET Tozeur');
  });
});