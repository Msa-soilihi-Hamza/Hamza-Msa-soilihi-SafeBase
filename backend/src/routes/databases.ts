import { Hono } from 'hono';
import { databaseController } from '../controllers/databaseController.js';

const databaseRoutes = new Hono();

// Cr�er une nouvelle base de donn�es
databaseRoutes.post('/create', (c) => databaseController.createDatabase(c));

// R�cup�rer toutes les bases de donn�es
databaseRoutes.get('/all', (c) => databaseController.getAllDatabases(c));

// R�cup�rer une base de donn�es sp�cifique
databaseRoutes.get('/:id', (c) => databaseController.getDatabase(c));

// Mettre � jour une base de donn�es
databaseRoutes.put('/:id', (c) => databaseController.updateDatabase(c));

// Supprimer une base de donn�es
databaseRoutes.delete('/:id', (c) => databaseController.deleteDatabase(c));

// Tester la connexion � une base de donn�es
databaseRoutes.post('/:id/test-connection', (c) => databaseController.testConnection(c));

export { databaseRoutes };