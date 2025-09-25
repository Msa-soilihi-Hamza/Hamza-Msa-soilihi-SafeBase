import cron from 'node-cron';
import { backupService } from '../services/backupService.js';
import { prisma } from './database.js';

export class CronService {
  private tasks: Map<string, cron.ScheduledTask> = new Map();

  async startScheduledBackups() {
    console.log('=R Initialisation des sauvegardes automatiques...');

    // Sauvegarde quotidienne � 2h du matin pour toutes les bases actives
    const dailyTask = cron.schedule('0 2 * * *', async () => {
      await this.runScheduledBackups('SCHEDULED');
    });

    // Sauvegarde toutes les 6 heures pour les bases critiques
    const sixHourlyTask = cron.schedule('0 */6 * * *', async () => {
      await this.runScheduledBackups('AUTOMATIC');
    });

    this.tasks.set('daily', dailyTask);
    this.tasks.set('sixHourly', sixHourlyTask);

    // D�marrer les t�ches
    // Les tâches sont automatiquement démarrées

    console.log(' Sauvegardes automatiques configur�es :');
    console.log('   - Quotidienne : 2h00 (toutes les bases)');
    console.log('   - 6h : toutes les 6h (bases critiques)');
  }

  private async runScheduledBackups(backupType: 'SCHEDULED' | 'AUTOMATIC' | 'MANUAL') {
    try {
      console.log(`\n= D�marrage des sauvegardes ${backupType}...`);

      // R�cup�rer toutes les bases actives
      const activeDatabases = await prisma.database.findMany({
        where: { isActive: true },
        include: {
          user: { select: { name: true, email: true } }
        }
      });

      if (activeDatabases.length === 0) {
        console.log('9  Aucune base de donn�es active trouv�e');
        return;
      }

      console.log(`=� ${activeDatabases.length} base(s) de donn�es � sauvegarder`);

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

      // R�sum�
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      console.log(`\n=� R�sum� des sauvegardes ${backupType}:`);
      console.log(`    R�ussies: ${successful}`);
      console.log(`   L �chou�es: ${failed}`);
      console.log(`   =� ${new Date().toLocaleString('fr-FR')}`);

      // Log g�n�ral
      await prisma.log.create({
        data: {
          level: failed > 0 ? 'WARNING' : 'INFO',
          message: `Sauvegardes ${backupType}: ${successful} r�ussies, ${failed} �chou�es`,
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
    console.log('>� Configuration du nettoyage automatique...');

    const cleanupTask = cron.schedule('0 3 * * 0', async () => {
      await this.runScheduledCleanup();
    });

    this.tasks.set('cleanup', cleanupTask);
    // La tâche est automatiquement démarrée

    console.log(' Nettoyage automatique configur� : Dimanche 3h00');
  }

  private async runScheduledCleanup() {
    try {
      console.log('\n>� D�marrage du nettoyage automatique...');

      const activeDatabases = await prisma.database.findMany({
        where: { isActive: true }
      });

      let totalDeleted = 0;

      for (const database of activeDatabases) {
        try {
          const result = await backupService.cleanupOldBackups(database.id, 30);
          totalDeleted += result.deleted;
          console.log(`  >� ${database.name}: ${result.deleted} sauvegarde(s) supprim�e(s)`);
        } catch (error: any) {
          console.error(`  L Erreur nettoyage ${database.name}:`, error.message);
        }
      }

      console.log(`\n>� Nettoyage termin�: ${totalDeleted} sauvegarde(s) supprim�e(s)`);

      await prisma.log.create({
        data: {
          level: 'INFO',
          message: `Nettoyage automatique: ${totalDeleted} sauvegarde(s) supprim�e(s)`,
          action: 'CRON_CLEANUP',
          metadata: { deleted: totalDeleted, databases: activeDatabases.length }
        }
      });

    } catch (error: any) {
      console.error('L Erreur lors du nettoyage automatique:', error);
    }
  }

  // Cr�er une sauvegarde manuelle imm�diate pour toutes les bases
  async createImmediateBackup() {
    console.log('� Sauvegarde imm�diate demand�e...');
    await this.runScheduledBackups('MANUAL');
  }

  // Arr�ter toutes les t�ches programm�es
  stopAllTasks() {
    console.log('=� Arr�t des t�ches programm�es...');
    this.tasks.forEach((task, name) => {
      task.stop();
      console.log(`   T�che "${name}" arr�t�e`);
    });
    this.tasks.clear();
  }

  // Obtenir le statut des t�ches
  getTasksStatus() {
    const status: any = {};
    this.tasks.forEach((task, name) => {
      status[name] = {
        active: this.tasks.has(name),
        scheduled: true
      };
    });
    return status;
  }
}

export const cronService = new CronService();