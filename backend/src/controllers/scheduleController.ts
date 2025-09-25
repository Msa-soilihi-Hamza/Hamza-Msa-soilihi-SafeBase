import type { Context } from 'hono';
import { scheduleService } from '../services/scheduleService.js';

export class ScheduleController {

  async getScheduleStatus(c: Context) {
    try {
      const status = await scheduleService.getScheduleStatus();

      return c.json({
        success: true,
        message: 'Statut des planifications r�cup�r�',
        data: status
      });

    } catch (error: any) {
      console.error('Erreur lors de la r�cup�ration du statut:', error);
      return c.json({
        success: false,
        message: 'Erreur lors de la r�cup�ration du statut des planifications',
        error: error.message
      }, 500);
    }
  }

  async triggerImmediateBackup(c: Context) {
    try {
      const result = await scheduleService.createImmediateBackup();

      return c.json({
        success: true,
        message: 'Sauvegarde imm�diate termin�e',
        data: result
      });

    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde imm�diate:', error);
      return c.json({
        success: false,
        message: 'Erreur lors de la sauvegarde imm�diate',
        error: error.message
      }, 500);
    }
  }

  async triggerScheduledBackup(c: Context) {
    try {
      const result = await scheduleService.runScheduledBackups('SCHEDULED');

      return c.json({
        success: true,
        message: 'Sauvegarde planifi�e termin�e',
        data: result
      });

    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde planifi�e:', error);
      return c.json({
        success: false,
        message: 'Erreur lors de la sauvegarde planifi�e',
        error: error.message
      }, 500);
    }
  }

  async triggerCleanup(c: Context) {
    try {
      const result = await scheduleService.runScheduledCleanup();

      return c.json({
        success: true,
        message: 'Nettoyage termin�',
        data: result
      });

    } catch (error: any) {
      console.error('Erreur lors du nettoyage:', error);
      return c.json({
        success: false,
        message: 'Erreur lors du nettoyage',
        error: error.message
      }, 500);
    }
  }

  async runAutomaticBackup(c: Context) {
    try {
      const result = await scheduleService.runScheduledBackups('AUTOMATIC');

      return c.json({
        success: true,
        message: 'Sauvegarde automatique termin�e',
        data: result
      });

    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde automatique:', error);
      return c.json({
        success: false,
        message: 'Erreur lors de la sauvegarde automatique',
        error: error.message
      }, 500);
    }
  }
}

export const scheduleController = new ScheduleController();