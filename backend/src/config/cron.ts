import cron from 'node-cron';
import { scheduleService } from '../services/scheduleService.js';

export class CronService {
  private tasks: Map<string, cron.ScheduledTask> = new Map();

  async startScheduledBackups() {
    console.log('🔄 Initialisation des sauvegardes automatiques...');

    // Sauvegarde quotidienne à 2h du matin pour toutes les bases actives
    const dailyTask = cron.schedule('0 2 * * *', async () => {
      await scheduleService.runScheduledBackups('SCHEDULED');
    });

    // Sauvegarde toutes les 6 heures pour les bases critiques
    const sixHourlyTask = cron.schedule('0 */6 * * *', async () => {
      await scheduleService.runScheduledBackups('AUTOMATIC');
    });

    this.tasks.set('daily', dailyTask);
    this.tasks.set('sixHourly', sixHourlyTask);

    console.log('✅ Sauvegardes automatiques configurées :');
    console.log('   - Quotidienne : 2h00 (toutes les bases)');
    console.log('   - 6h : toutes les 6h (bases critiques)');
  }

  // Nettoyage automatique des anciennes sauvegardes
  async startCleanupSchedule() {
    console.log('🧹 Configuration du nettoyage automatique...');

    const cleanupTask = cron.schedule('0 3 * * 0', async () => {
      await scheduleService.runScheduledCleanup();
    });

    this.tasks.set('cleanup', cleanupTask);

    console.log('✅ Nettoyage automatique configuré : Dimanche 3h00');
  }

  // Créer une sauvegarde manuelle immédiate pour toutes les bases
  async createImmediateBackup() {
    console.log('⚡ Sauvegarde immédiate demandée...');
    return await scheduleService.createImmediateBackup();
  }

  // Arrêter toutes les tâches programmées
  stopAllTasks() {
    console.log('🛑 Arrêt des tâches programmées...');
    this.tasks.forEach((task, name) => {
      task.stop();
      console.log(`  ✅ Tâche "${name}" arrêtée`);
    });
    this.tasks.clear();
  }

  // Obtenir le statut des tâches
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