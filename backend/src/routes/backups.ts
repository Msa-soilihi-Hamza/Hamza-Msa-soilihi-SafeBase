import { Hono } from 'hono';
import { backupController } from '../controllers/backupController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const backupRoutes = new Hono();

// Cr�er une nouvelle sauvegarde
backupRoutes.get('/create', authenticateToken, (c) => backupController.createBackup(c));

// R�cup�rer toutes les versions de sauvegarde d'une base de donn�es
backupRoutes.get('/database/:databaseId/versions', authenticateToken, (c) => backupController.getBackupVersions(c));

// R�cup�rer toutes les sauvegardes (avec pagination)
backupRoutes.get('/all', authenticateToken, (c) => backupController.getAllBackups(c));

// R�cup�rer le statut d'une sauvegarde
backupRoutes.get('/:backupId/status', authenticateToken, (c) => backupController.getBackupStatus(c));

// Restaurer une sauvegarde
backupRoutes.get('/:backupId/restore', authenticateToken, (c) => backupController.restoreBackup(c));

// Supprimer une sauvegarde
backupRoutes.delete('/:backupId', authenticateToken, (c) => backupController.deleteBackup(c));

// Nettoyer les anciennes sauvegardes
backupRoutes.post('/database/:databaseId/cleanup', authenticateToken, (c) => backupController.cleanupOldBackups(c));

export { backupRoutes };