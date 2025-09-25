import { prisma } from '../config/database.js';
import { exec } from 'child_process';
import { promises as fs } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class BackupService {
  private backupDir = path.join(process.cwd(), 'backups');

  constructor() {
    this.ensureBackupDirectory();
  }

  private async ensureBackupDirectory() {
    try {
      await fs.access(this.backupDir);
    } catch {
      await fs.mkdir(this.backupDir, { recursive: true });
    }
  }

  async createBackup(databaseId: string, backupType: 'MANUAL' | 'SCHEDULED' | 'AUTOMATIC' = 'MANUAL') {
    try {
      const database = await prisma.database.findUnique({
        where: { id: databaseId },
      });

      if (!database) {
        throw new Error('Base de donn�es non trouv�e');
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const version = `v${timestamp}`;
      const filename = `${database.name}_${version}.sql`;
      const filePath = path.join(this.backupDir, filename);

      const backup = await prisma.backup.create({
        data: {
          version,
          filePath,
          fileSize: BigInt(0),
          status: 'IN_PROGRESS',
          backupType,
          databaseId,
        },
      });

      try {
        await this.performDatabaseBackup(database, filePath);

        const stats = await fs.stat(filePath);
        const checksum = await this.generateChecksum(filePath);

        const updatedBackup = await prisma.backup.update({
          where: { id: backup.id },
          data: {
            status: 'COMPLETED',
            completedAt: new Date(),
            fileSize: BigInt(stats.size),
            checksum,
          },
        });

        await prisma.log.create({
          data: {
            level: 'INFO',
            message: `Sauvegarde cr��e avec succ�s: ${version}`,
            action: 'CREATE_BACKUP',
            metadata: { backupId: backup.id, database: database.name },
            databaseId,
          },
        });

        return updatedBackup;
      } catch (error) {
        await prisma.backup.update({
          where: { id: backup.id },
          data: {
            status: 'FAILED',
            errorMessage: error instanceof Error ? error.message : 'Erreur inconnue',
          },
        });

        await prisma.log.create({
          data: {
            level: 'ERROR',
            message: `�chec de la sauvegarde: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
            action: 'CREATE_BACKUP_FAILED',
            metadata: { backupId: backup.id, database: database.name },
            databaseId,
          },
        });

        throw error;
      }
    } catch (error) {
      console.error('Erreur lors de la cr�ation du backup:', error);
      throw error;
    }
  }

  private async performDatabaseBackup(database: any, filePath: string) {
    let command = '';

    switch (database.type) {
      case 'MYSQL':
        command = `mysqldump -h ${database.host} -P ${database.port} -u ${database.username} ${database.password ? `-p${database.password}` : ''} ${database.databaseName} > "${filePath}"`;
        break;
      case 'POSTGRESQL':
        command = `pg_dump -h ${database.host} -p ${database.port} -U ${database.username} -d ${database.databaseName} -f "${filePath}"`;
        break;
      default:
        throw new Error(`Type de base de donn�es non support�: ${database.type}`);
    }

    await execAsync(command);
  }

  async getBackupVersions(databaseId: string) {
    return await prisma.backup.findMany({
      where: { databaseId },
      orderBy: { startedAt: 'desc' },
      include: {
        database: {
          select: { name: true, type: true }
        }
      }
    });
  }

  async restoreBackup(backupId: string) {
    try {
      const backup = await prisma.backup.findUnique({
        where: { id: backupId },
        include: { database: true },
      });

      if (!backup || backup.status !== 'COMPLETED') {
        throw new Error('Sauvegarde non trouv�e ou invalide');
      }

      if (!await this.verifyBackup(backup.filePath, backup.checksum)) {
        throw new Error('Int�grit� de la sauvegarde compromise');
      }

      await this.performDatabaseRestore(backup.database, backup.filePath);

      await prisma.log.create({
        data: {
          level: 'INFO',
          message: `Restauration r�ussie depuis la version: ${backup.version}`,
          action: 'RESTORE_BACKUP',
          metadata: { backupId: backup.id, database: backup.database.name },
          databaseId: backup.databaseId,
        },
      });

      return { success: true, message: `Base de donn�es restaur�e vers la version ${backup.version}` };
    } catch (error) {
      await prisma.log.create({
        data: {
          level: 'ERROR',
          message: `�chec de la restauration: ${error instanceof Error ? error.message : 'Erreur inconnue'}`,
          action: 'RESTORE_BACKUP_FAILED',
          metadata: { backupId },
        },
      });

      throw error;
    }
  }

  private async performDatabaseRestore(database: any, filePath: string) {
    let command = '';

    switch (database.type) {
      case 'MYSQL':
        command = `mysql -h ${database.host} -P ${database.port} -u ${database.username} ${database.password ? `-p${database.password}` : ''} ${database.databaseName} < "${filePath}"`;
        break;
      case 'POSTGRESQL':
        command = `psql -h ${database.host} -p ${database.port} -U ${database.username} -d ${database.databaseName} -f "${filePath}"`;
        break;
      default:
        throw new Error(`Type de base de donn�es non support�: ${database.type}`);
    }

    await execAsync(command);
  }

  async deleteBackup(backupId: string) {
    try {
      const backup = await prisma.backup.findUnique({
        where: { id: backupId },
        include: { database: { select: { name: true } } }
      });

      if (!backup) {
        throw new Error('Sauvegarde non trouv�e');
      }

      await fs.unlink(backup.filePath);
      await prisma.backup.delete({ where: { id: backupId } });

      await prisma.log.create({
        data: {
          level: 'INFO',
          message: `Sauvegarde supprim�e: ${backup.version}`,
          action: 'DELETE_BACKUP',
          metadata: { backupId, database: backup.database.name },
          databaseId: backup.databaseId,
        },
      });

      return { success: true, message: 'Sauvegarde supprim�e avec succ�s' };
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      throw error;
    }
  }

  private async generateChecksum(filePath: string): Promise<string> {
    const fileBuffer = await fs.readFile(filePath);
    return crypto.createHash('sha256').update(fileBuffer).digest('hex');
  }

  private async verifyBackup(filePath: string, expectedChecksum: string | null): Promise<boolean> {
    if (!expectedChecksum) return true;

    try {
      const actualChecksum = await this.generateChecksum(filePath);
      return actualChecksum === expectedChecksum;
    } catch {
      return false;
    }
  }

  async cleanupOldBackups(databaseId: string, retentionDays: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const oldBackups = await prisma.backup.findMany({
      where: {
        databaseId,
        startedAt: { lt: cutoffDate },
        status: 'COMPLETED'
      }
    });

    for (const backup of oldBackups) {
      try {
        await this.deleteBackup(backup.id);
      } catch (error) {
        console.error(`Erreur lors du nettoyage du backup ${backup.id}:`, error);
      }
    }

    return { deleted: oldBackups.length };
  }
}

export const backupService = new BackupService();