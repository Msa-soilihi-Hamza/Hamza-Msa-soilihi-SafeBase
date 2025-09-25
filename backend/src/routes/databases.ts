import { Hono } from 'hono';
import { databaseController } from '../controllers/databaseController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const databaseRoutes = new Hono();

// Cr�er une nouvelle base de donn�es
databaseRoutes.post('/create', authenticateToken, (c) => databaseController.createDatabase(c));

// R�cup�rer toutes les bases de donn�es
databaseRoutes.get('/all', authenticateToken, (c) => databaseController.getAllDatabases(c));

// R�cup�rer une base de donn�es sp�cifique
databaseRoutes.get('/:id', authenticateToken, (c) => databaseController.getDatabase(c));

// Mettre � jour une base de donn�es
databaseRoutes.put('/:id', authenticateToken, (c) => databaseController.updateDatabase(c));

// Supprimer une base de donn�es
databaseRoutes.delete('/:id', authenticateToken, (c) => databaseController.deleteDatabase(c));

// Tester la connexion � une base de donn�es
databaseRoutes.post('/:id/test-connection', authenticateToken, (c) => databaseController.testConnection(c));

export { databaseRoutes };