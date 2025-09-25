import { backupService } from './backupService.js';
import { prisma } from '../config/database.js';

export class ScheduleService {

  async runScheduledBackups(backupType: 'SCHEDULED' | 'AUTOMATIC' | 'MANUAL') {
    try {
      console.log(`\n=\u0004 Démarrage des sauvegardes ${backupType}...`);

      // Récupérer toutes les bases actives
      const activeDatabases = await prisma.database.findMany({
        where: { isActive: true },
        include: {
          user: { select: { name: true, email: true } }
        }
      });

      if (activeDatabases.length === 0) {
        console.log('9\u000f  Aucune base de données active trouvée');
        return;
      }

      console.log(`=\u0012 ${activeDatabases.length} base(s) de données à sauvegarder`);

      const results = [];

      // Sauvegarder chaque base
      for (const database of activeDatabases) {
        try {
          console.log(`  =\u0004 Sauvegarde: ${database.name}...`);

          const backup = await backupService.createBackup(database.id, backupType);

          results.push({
            database: database.name,
            success: true,
            version: backup.version
          });

          console.log(`  \u0005 ${database.name} - ${backup.version}`);

        } catch (error: any) {
          console.error(`  L Erreur ${database.name}:`, error.message);
          results.push({
            database: database.name,
            success: false,
            error: error.message
          });
        }
      }

      // Résumé
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      console.log(`\n=\u0012 Résumé des sauvegardes ${backupType}:`);
      console.log(`   \u0005 Réussies: ${successful}`);
      console.log(`   L Échouées: ${failed}`);
      console.log(`   =\u0012 ${new Date().toLocaleString('fr-FR')}`);

      // Log général
      await prisma.log.create({
        data: {
          level: failed > 0 ? 'WARNING' : 'INFO',
          message: `Sauvegardes ${backupType}: ${successful} réussies, ${failed} échouées`,
          action: `CRON_${backupType}`,
          metadata: {
            successful,
            failed,
            total: activeDatabases.length,
            results
          }
        }
      });

      return {
        successful,
        failed,
        total: activeDatabases.length,
        results
      };

    } catch (error: any) {
      console.error(`L Erreur lors des sauvegardes ${backupType}:`, error);

      await prisma.log.create({
        data: {
          level: 'CRITICAL',
          message: `Erreur critique lors des sauvegardes ${backupType}: ${error.message}`,
          action: `CRON_${backupType}_ERROR`,
          metadata: { error: error.message }
        }
      });

      throw error;
    }
  }

  async runScheduledCleanup() {
    try {
      console.log('\n>\u0012 Démarrage du nettoyage automatique...');

      const activeDatabases = await prisma.database.findMany({
        where: { isActive: true }
      });

      let totalDeleted = 0;

      for (const database of activeDatabases) {
        try {
          const result = await backupService.cleanupOldBackups(database.id, 30);
          totalDeleted += result.deleted;
          console.log(`  >\u0012 ${database.name}: ${result.deleted} sauvegarde(s) supprimée(s)`);
        } catch (error: any) {
          console.error(`  L Erreur nettoyage ${database.name}:`, error.message);
        }
      }

      console.log(`\n>\u0012 Nettoyage terminé: ${totalDeleted} sauvegarde(s) supprimée(s)`);

      await prisma.log.create({
        data: {
          level: 'INFO',
          message: `Nettoyage automatique: ${totalDeleted} sauvegarde(s) supprimée(s)`,
          action: 'CRON_CLEANUP',
          metadata: { deleted: totalDeleted, databases: activeDatabases.length }
        }
      });

      return {
        deleted: totalDeleted,
        databases: activeDatabases.length
      };

    } catch (error: any) {
      console.error('L Erreur lors du nettoyage automatique:', error);

      await prisma.log.create({
        data: {
          level: 'CRITICAL',
          message: `Erreur critique lors du nettoyage: ${error.message}`,
          action: 'CRON_CLEANUP_ERROR',
          metadata: { error: error.message }
        }
      });

      throw error;
    }
  }

  async createImmediateBackup() {
    console.log('\u0012 Sauvegarde immédiate demandée...');
    return await this.runScheduledBackups('MANUAL');
  }

  async getScheduleStatus() {
    return {
      scheduledBackupsEnabled: true,
      cleanupEnabled: true,
      dailyBackupTime: '02:00',
      sixHourlyBackupInterval: '6h',
      weeklyCleanupTime: 'Sunday 03:00',
      retentionDays: 30
    };
  }
}

export const scheduleService = new ScheduleService();