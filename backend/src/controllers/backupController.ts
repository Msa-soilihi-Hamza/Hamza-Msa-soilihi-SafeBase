import type { Context } from 'hono';
import { backupService } from '../services/backupService.js';

export class BackupController {

  async createBackup(c: Context) {
    try {
      // Pour GET, on récupère les paramètres depuis query ou on utilise des valeurs par défaut
      const databaseId = c.req.query('databaseId') || 'test-database-id';
      const backupType = (c.req.query('backupType') || 'MANUAL') as 'MANUAL' | 'SCHEDULED' | 'AUTOMATIC';

      if (!databaseId) {
        return c.json({ error: 'Database ID requis' }, 400);
      }

      const backup = await backupService.createBackup(databaseId, backupType);

      return c.json({
        success: true,
        message: 'Sauvegarde cr��e avec succ�s',
        data: backup
      });
    } catch (error) {
      console.error('Erreur cr�ation backup:', error);
      return c.json({
        error: 'Erreur lors de la cr�ation de la sauvegarde',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      }, 500);
    }
  }

  async getBackupVersions(c: Context) {
    try {
      const databaseId = c.req.param('databaseId');

      if (!databaseId) {
        return c.json({ error: 'Database ID requis' }, 400);
      }

      const versions = await backupService.getBackupVersions(databaseId);

      return c.json({
        success: true,
        data: versions.map((backup: any) => ({
          id: backup.id,
          version: backup.version,
          status: backup.status,
          backupType: backup.backupType,
          fileSize: backup.fileSize.toString(),
          startedAt: backup.startedAt,
          completedAt: backup.completedAt || null,
          compressed: backup.compressed,
          checksum: backup.checksum || null,
          database: backup.database,
          errorMessage: backup.errorMessage || null
        }))
      });
    } catch (error) {
      console.error('Erreur r�cup�ration versions:', error);
      return c.json({
        error: 'Erreur lors de la r�cup�ration des versions',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      }, 500);
    }
  }

  async restoreBackup(c: Context) {
    try {
      const backupId = c.req.param('backupId');

      if (!backupId) {
        return c.json({ error: 'Backup ID requis' }, 400);
      }

      const result = await backupService.restoreBackup(backupId);

      return c.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Erreur restauration:', error);
      return c.json({
        error: 'Erreur lors de la restauration',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      }, 500);
    }
  }

  async deleteBackup(c: Context) {
    try {
      const backupId = c.req.param('backupId');

      if (!backupId) {
        return c.json({ error: 'Backup ID requis' }, 400);
      }

      const result = await backupService.deleteBackup(backupId);

      return c.json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Erreur suppression backup:', error);
      return c.json({
        error: 'Erreur lors de la suppression',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      }, 500);
    }
  }

  async cleanupOldBackups(c: Context) {
    try {
      const databaseId = c.req.param('databaseId');
      const { retentionDays = 30 } = await c.req.json().catch(() => ({}));

      if (!databaseId) {
        return c.json({ error: 'Database ID requis' }, 400);
      }

      const result = await backupService.cleanupOldBackups(databaseId, retentionDays);

      return c.json({
        success: true,
        message: `${result.deleted} ancienne(s) sauvegarde(s) supprim�e(s)`
      });
    } catch (error) {
      console.error('Erreur nettoyage:', error);
      return c.json({
        error: 'Erreur lors du nettoyage',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      }, 500);
    }
  }

  async getBackupStatus(c: Context) {
    try {
      const backupId = c.req.param('backupId');

      if (!backupId) {
        return c.json({ error: 'Backup ID requis' }, 400);
      }

      const backup = await backupService.getBackupVersions('').then(backups =>
        backups.find((b: any) => b.id === backupId)
      );

      if (!backup) {
        return c.json({ error: 'Sauvegarde non trouv�e' }, 404);
      }

      return c.json({
        success: true,
        data: {
          id: backup.id,
          status: backup.status,
          version: backup.version,
          startedAt: backup.startedAt,
          completedAt: backup.completedAt,
          errorMessage: backup.errorMessage,
          progress: backup.status === 'COMPLETED' ? 100 :
                   backup.status === 'IN_PROGRESS' ? 50 : 0
        }
      });
    } catch (error) {
      console.error('Erreur statut backup:', error);
      return c.json({
        error: 'Erreur lors de la r�cup�ration du statut',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      }, 500);
    }
  }

  async getAllBackups(c: Context) {
    try {
      const page = parseInt(c.req.query('page') || '1');
      const limit = parseInt(c.req.query('limit') || '10');
      const status = c.req.query('status');

      const skip = (page - 1) * limit;

      // Pour cette version simplifi�e, on r�cup�re tous les backups
      // Dans une vraie application, vous utiliseriez Prisma avec pagination
      const allBackups = await backupService.getBackupVersions('');

      const filteredBackups = status
        ? allBackups.filter((b: any) => b.status === status)
        : allBackups;

      const paginatedBackups = filteredBackups.slice(skip, skip + limit);

      return c.json({
        success: true,
        data: paginatedBackups.map((backup: any) => ({
          id: backup.id,
          version: backup.version,
          status: backup.status,
          backupType: backup.backupType,
          fileSize: backup.fileSize.toString(),
          startedAt: backup.startedAt,
          completedAt: backup.completedAt || null,
          database: backup.database
        })),
        pagination: {
          page,
          limit,
          total: filteredBackups.length,
          pages: Math.ceil(filteredBackups.length / limit)
        }
      });
    } catch (error) {
      console.error('Erreur r�cup�ration tous backups:', error);
      return c.json({
        error: 'Erreur lors de la r�cup�ration des sauvegardes',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      }, 500);
    }
  }
}

export const backupController = new BackupController();