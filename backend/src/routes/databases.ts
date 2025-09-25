import { Hono } from 'hono';
import { databaseController } from '../controllers/databaseController.js';

const databaseRoutes = new Hono();

// Créer une nouvelle base de données
databaseRoutes.post('/create', (c) => databaseController.createDatabase(c));

// Récupérer toutes les bases de données
databaseRoutes.get('/all', (c) => databaseController.getAllDatabases(c));

// Récupérer une base de données spécifique
databaseRoutes.get('/:id', (c) => databaseController.getDatabase(c));

// Mettre à jour une base de données
databaseRoutes.put('/:id', (c) => databaseController.updateDatabase(c));

// Supprimer une base de données
databaseRoutes.delete('/:id', (c) => databaseController.deleteDatabase(c));

// Tester la connexion à une base de données
databaseRoutes.post('/:id/test-connection', (c) => databaseController.testConnection(c));

export { databaseRoutes };