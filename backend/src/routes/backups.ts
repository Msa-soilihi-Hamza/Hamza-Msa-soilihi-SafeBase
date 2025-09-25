import { Hono } from 'hono';
import { backupController } from '../controllers/backupController.js';

const backupRoutes = new Hono();

// Cr�er une nouvelle sauvegarde
backupRoutes.get('/create', (c) => backupController.createBackup(c));

// R�cup�rer toutes les versions de sauvegarde d'une base de donn�es
backupRoutes.get('/database/:databaseId/versions', (c) => backupController.getBackupVersions(c));

// R�cup�rer toutes les sauvegardes (avec pagination)
backupRoutes.get('/all', (c) => backupController.getAllBackups(c));

// R�cup�rer le statut d'une sauvegarde
backupRoutes.get('/:backupId/status', (c) => backupController.getBackupStatus(c));

// Restaurer une sauvegarde
backupRoutes.get('/:backupId/restore', (c) => backupController.restoreBackup(c));

// Supprimer une sauvegarde
backupRoutes.delete('/:backupId', (c) => backupController.deleteBackup(c));

// Nettoyer les anciennes sauvegardes
backupRoutes.post('/database/:databaseId/cleanup', (c) => backupController.cleanupOldBackups(c));

export { backupRoutes };