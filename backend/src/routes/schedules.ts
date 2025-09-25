import { Hono } from 'hono';
import { cronService } from '../config/cron.js';
import { scheduleController } from '../controllers/scheduleController.js';

const scheduleRoutes = new Hono();

// Obtenir le statut des planifications
scheduleRoutes.get('/status', (c) => scheduleController.getScheduleStatus(c));

// Déclencher une sauvegarde immédiate
scheduleRoutes.post('/backup-now', (c) => scheduleController.triggerImmediateBackup(c));

// Déclencher une sauvegarde planifiée
scheduleRoutes.post('/backup-scheduled', (c) => scheduleController.triggerScheduledBackup(c));

// Déclencher une sauvegarde automatique
scheduleRoutes.post('/backup-automatic', (c) => scheduleController.runAutomaticBackup(c));

// Déclencher le nettoyage
scheduleRoutes.post('/cleanup', (c) => scheduleController.triggerCleanup(c));

// Redémarrer les tâches programmées (admin)
scheduleRoutes.post('/restart', async (c) => {
  try {
    cronService.stopAllTasks();
    await cronService.startScheduledBackups();
    await cronService.startCleanupSchedule();

    return c.json({
      success: true,
      message: 'Tâches programmées redémarrées avec succès'
    });
  } catch (error: any) {
    return c.json({
      success: false,
      message: 'Erreur lors du redémarrage des tâches',
      error: error.message
    }, 500);
  }
});

// Arrêter toutes les tâches programmées (admin)
scheduleRoutes.post('/stop', (c) => {
  try {
    cronService.stopAllTasks();
    return c.json({
      success: true,
      message: 'Toutes les tâches programmées ont été arrêtées'
    });
  } catch (error: any) {
    return c.json({
      success: false,
      message: 'Erreur lors de l\'arrêt des tâches',
      error: error.message
    }, 500);
  }
});

// Statut des tâches CRON
scheduleRoutes.get('/cron-status', (c) => {
  try {
    const status = cronService.getTasksStatus();
    return c.json({
      success: true,
      message: 'Statut des tâches CRON',
      data: status
    });
  } catch (error: any) {
    return c.json({
      success: false,
      message: 'Erreur lors de la récupération du statut CRON',
      error: error.message
    }, 500);
  }
});

export { scheduleRoutes };