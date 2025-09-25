import { Hono } from 'hono';
import { cronService } from '../config/cron.js';

const scheduleRoutes = new Hono();

// Obtenir le statut des t�ches programm�es
scheduleRoutes.get('/status', (c) => {
  try {
    const status = cronService.getTasksStatus();
    return c.json({
      success: true,
      data: status
    });
  } catch (error: any) {
    return c.json({
      error: 'Erreur lors de la r�cup�ration du statut',
      details: error.message
    }, 500);
  }
});

// D�clencher une sauvegarde imm�diate de toutes les bases
scheduleRoutes.get('/backup-now', async (c) => {
  try {
    await cronService.createImmediateBackup();
    return c.json({
      success: true,
      message: 'Sauvegarde imm�diate d�clench�e pour toutes les bases actives'
    });
  } catch (error: any) {
    return c.json({
      error: 'Erreur lors de la sauvegarde imm�diate',
      details: error.message
    }, 500);
  }
});

// Red�marrer les t�ches programm�es
scheduleRoutes.get('/restart', async (c) => {
  try {
    cronService.stopAllTasks();
    await cronService.startScheduledBackups();
    await cronService.startCleanupSchedule();

    return c.json({
      success: true,
      message: 'T�ches programm�es red�marr�es avec succ�s'
    });
  } catch (error: any) {
    return c.json({
      error: 'Erreur lors du red�marrage des t�ches',
      details: error.message
    }, 500);
  }
});

// Arr�ter toutes les t�ches programm�es
scheduleRoutes.get('/stop', (c) => {
  try {
    cronService.stopAllTasks();
    return c.json({
      success: true,
      message: 'Toutes les t�ches programm�es ont �t� arr�t�es'
    });
  } catch (error: any) {
    return c.json({
      error: 'Erreur lors de l\'arr�t des t�ches',
      details: error.message
    }, 500);
  }
});

export { scheduleRoutes };