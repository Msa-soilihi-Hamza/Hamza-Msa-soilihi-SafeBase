import cron from 'node-cron';
import { backupService } from '../services/backupService.js';
import { prisma } from './database.js';

export class CronService {
  private tasks: Map<string, cron.ScheduledTask> = new Map();

  async startScheduledBackups() {
    console.log('=R Initialisation des sauvegardes automatiques...');

    // Sauvegarde quotidienne à 2h du matin pour toutes les bases actives
    const dailyTask = cron.schedule('0 2 * * *', async () => {
      await this.runScheduledBackups('SCHEDULED');
    }, {
      scheduled: false,
      timezone: 'Europe/Paris'
    });

    // Sauvegarde toutes les 6 heures pour les bases critiques
    const sixHourlyTask = cron.schedule('0 */6 * * *', async () => {
      await this.runScheduledBackups('AUTOMATIC');
    }, {
      scheduled: false,
      timezone: 'Europe/Paris'
    });

    this.tasks.set('daily', dailyTask);
    this.tasks.set('sixHourly', sixHourlyTask);

    // Démarrer les tâches
    dailyTask.start();
    sixHourlyTask.start();

    console.log(' Sauvegardes automatiques configurées :');
    console.log('   - Quotidienne : 2h00 (toutes les bases)');
    console.log('   - 6h : toutes les 6h (bases critiques)');
  }

  private async runScheduledBackups(backupType: 'SCHEDULED' | 'AUTOMATIC') {
    try {
      console.log(`\n= Démarrage des sauvegardes ${backupType}...`);

      // Récupérer toutes les bases actives
      const activeDatabases = await prisma.database.findMany({
        where: { isActive: true },
        include: {
          user: { select: { name: true, email: true } }
        }
      });

      if (activeDatabases.length === 0) {
        console.log('9  Aucune base de données active trouvée');
        return;
      }

      console.log(`=Ê ${activeDatabases.length} base(s) de données à sauvegarder`);

      const results = [];

      // Sauvegarder chaque base
      for (const database of activeDatabases) {
        try {
          console.log(`  = Sauvegarde: ${database.name}...`);

          const backup = await backupService.createBackup(database.id, backupType);

          results.push({
            database: database.name,
            success: true,
            version: backup.version
          });

          console.log(`   ${database.name} - ${backup.version}`);

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

      console.log(`\n=È Résumé des sauvegardes ${backupType}:`);
      console.log(`    Réussies: ${successful}`);
      console.log(`   L Échouées: ${failed}`);
      console.log(`   =Å ${new Date().toLocaleString('fr-FR')}`);

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
    }
  }

  // Nettoyage automatique des anciennes sauvegardes
  async startCleanupSchedule() {
    console.log('>ù Configuration du nettoyage automatique...');

    const cleanupTask = cron.schedule('0 3 * * 0', async () => {
      await this.runScheduledCleanup();
    }, {
      scheduled: false,
      timezone: 'Europe/Paris'
    });

    this.tasks.set('cleanup', cleanupTask);
    cleanupTask.start();

    console.log(' Nettoyage automatique configuré : Dimanche 3h00');
  }

  private async runScheduledCleanup() {
    try {
      console.log('\n>ù Démarrage du nettoyage automatique...');

      const activeDatabases = await prisma.database.findMany({
        where: { isActive: true }
      });

      let totalDeleted = 0;

      for (const database of activeDatabases) {
        try {
          const result = await backupService.cleanupOldBackups(database.id, 30);
          totalDeleted += result.deleted;
          console.log(`  >ù ${database.name}: ${result.deleted} sauvegarde(s) supprimée(s)`);
        } catch (error: any) {
          console.error(`  L Erreur nettoyage ${database.name}:`, error.message);
        }
      }

      console.log(`\n>ù Nettoyage terminé: ${totalDeleted} sauvegarde(s) supprimée(s)`);

      await prisma.log.create({
        data: {
          level: 'INFO',
          message: `Nettoyage automatique: ${totalDeleted} sauvegarde(s) supprimée(s)`,
          action: 'CRON_CLEANUP',
          metadata: { deleted: totalDeleted, databases: activeDatabases.length }
        }
      });

    } catch (error: any) {
      console.error('L Erreur lors du nettoyage automatique:', error);
    }
  }

  // Créer une sauvegarde manuelle immédiate pour toutes les bases
  async createImmediateBackup() {
    console.log('¡ Sauvegarde immédiate demandée...');
    await this.runScheduledBackups('MANUAL');
  }

  // Arrêter toutes les tâches programmées
  stopAllTasks() {
    console.log('=Ñ Arrêt des tâches programmées...');
    this.tasks.forEach((task, name) => {
      task.stop();
      console.log(`   Tâche "${name}" arrêtée`);
    });
    this.tasks.clear();
  }

  // Obtenir le statut des tâches
  getTasksStatus() {
    const status: any = {};
    this.tasks.forEach((task, name) => {
      status[name] = {
        running: task.running,
        scheduled: true
      };
    });
    return status;
  }
}

export const cronService = new CronService();