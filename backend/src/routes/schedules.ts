import { Hono } from 'hono';
import { cronService } from '../config/cron.js';

const scheduleRoutes = new Hono();

// Obtenir le statut des tâches programmées
scheduleRoutes.get('/status', (c) => {
  try {
    const status = cronService.getTasksStatus();
    return c.json({
      success: true,
      data: status
    });
  } catch (error: any) {
    return c.json({
      error: 'Erreur lors de la récupération du statut',
      details: error.message
    }, 500);
  }
});

// Déclencher une sauvegarde immédiate de toutes les bases
scheduleRoutes.get('/backup-now', async (c) => {
  try {
    await cronService.createImmediateBackup();
    return c.json({
      success: true,
      message: 'Sauvegarde immédiate déclenchée pour toutes les bases actives'
    });
  } catch (error: any) {
    return c.json({
      error: 'Erreur lors de la sauvegarde immédiate',
      details: error.message
    }, 500);
  }
});

// Redémarrer les tâches programmées
scheduleRoutes.get('/restart', async (c) => {
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
      error: 'Erreur lors du redémarrage des tâches',
      details: error.message
    }, 500);
  }
});

// Arrêter toutes les tâches programmées
scheduleRoutes.get('/stop', (c) => {
  try {
    cronService.stopAllTasks();
    return c.json({
      success: true,
      message: 'Toutes les tâches programmées ont été arrêtées'
    });
  } catch (error: any) {
    return c.json({
      error: 'Erreur lors de l\'arrêt des tâches',
      details: error.message
    }, 500);
  }
});

export { scheduleRoutes };