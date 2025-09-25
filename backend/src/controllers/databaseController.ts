import type { Context } from 'hono';
import { prisma } from '../config/database.js';

export class DatabaseController {

  async createDatabase(c: Context) {
    try {
      const {
        name,
        type,
        host,
        port,
        username,
        password,
        databaseName,
        description,
        userId
      } = await c.req.json();

      if (!name || !type || !host || !port || !username || !databaseName || !userId) {
        return c.json({
          error: 'Champs requis: name, type, host, port, username, databaseName, userId'
        }, 400);
      }

      const database = await prisma.database.create({
        data: {
          name,
          type,
          host,
          port: parseInt(port),
          username,
          password: password || '',
          databaseName,
          description,
          userId
        }
      });

      await prisma.log.create({
        data: {
          level: 'INFO',
          message: `Base de donn�es cr��e: ${name}`,
          action: 'CREATE_DATABASE',
          metadata: { databaseId: database.id, type, host },
          userId,
          databaseId: database.id
        }
      });

      return c.json({
        success: true,
        message: 'Base de donn�es cr��e avec succ�s',
        data: database
      });

    } catch (error: any) {
      console.error('Erreur cr�ation database:', error);
      return c.json({
        error: 'Erreur lors de la cr�ation de la base de donn�es',
        details: error.message
      }, 500);
    }
  }

  async getAllDatabases(c: Context) {
    try {
      const userId = c.req.query('userId');
      const page = parseInt(c.req.query('page') || '1');
      const limit = parseInt(c.req.query('limit') || '10');

      const skip = (page - 1) * limit;

      const where = userId ? { userId } : {};

      const [databases, total] = await Promise.all([
        prisma.database.findMany({
          where,
          skip,
          take: limit,
          include: {
            user: {
              select: { id: true, name: true, email: true }
            },
            _count: {
              select: { backups: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        }),
        prisma.database.count({ where })
      ]);

      return c.json({
        success: true,
        data: databases,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });

    } catch (error: any) {
      console.error('Erreur r�cup�ration databases:', error);
      return c.json({
        error: 'Erreur lors de la r�cup�ration des bases de donn�es',
        details: error.message
      }, 500);
    }
  }

  async getDatabase(c: Context) {
    try {
      const databaseId = c.req.param('id');

      if (!databaseId) {
        return c.json({ error: 'Database ID requis' }, 400);
      }

      const database = await prisma.database.findUnique({
        where: { id: databaseId },
        include: {
          user: {
            select: { id: true, name: true, email: true }
          },
          backups: {
            orderBy: { startedAt: 'desc' },
            take: 5
          },
          _count: {
            select: { backups: true, logs: true }
          }
        }
      });

      if (!database) {
        return c.json({ error: 'Base de donn�es non trouv�e' }, 404);
      }

      return c.json({
        success: true,
        data: database
      });

    } catch (error: any) {
      console.error('Erreur r�cup�ration database:', error);
      return c.json({
        error: 'Erreur lors de la r�cup�ration de la base de donn�es',
        details: error.message
      }, 500);
    }
  }

  async updateDatabase(c: Context) {
    try {
      const databaseId = c.req.param('id');
      const updateData = await c.req.json();

      if (!databaseId) {
        return c.json({ error: 'Database ID requis' }, 400);
      }

      const database = await prisma.database.update({
        where: { id: databaseId },
        data: {
          ...updateData,
          port: updateData.port ? parseInt(updateData.port) : undefined
        }
      });

      await prisma.log.create({
        data: {
          level: 'INFO',
          message: `Base de donn�es modifi�e: ${database.name}`,
          action: 'UPDATE_DATABASE',
          metadata: { databaseId: database.id },
          databaseId: database.id
        }
      });

      return c.json({
        success: true,
        message: 'Base de donn�es mise � jour avec succ�s',
        data: database
      });

    } catch (error: any) {
      console.error('Erreur mise � jour database:', error);
      return c.json({
        error: 'Erreur lors de la mise � jour de la base de donn�es',
        details: error.message
      }, 500);
    }
  }

  async deleteDatabase(c: Context) {
    try {
      const databaseId = c.req.param('id');

      if (!databaseId) {
        return c.json({ error: 'Database ID requis' }, 400);
      }

      const database = await prisma.database.findUnique({
        where: { id: databaseId },
        select: { name: true }
      });

      if (!database) {
        return c.json({ error: 'Base de donn�es non trouv�e' }, 404);
      }

      await prisma.database.delete({
        where: { id: databaseId }
      });

      return c.json({
        success: true,
        message: `Base de donn�es "${database.name}" supprim�e avec succ�s`
      });

    } catch (error: any) {
      console.error('Erreur suppression database:', error);
      return c.json({
        error: 'Erreur lors de la suppression de la base de donn�es',
        details: error.message
      }, 500);
    }
  }

  async testConnection(c: Context) {
    try {
      const databaseId = c.req.param('id');

      if (!databaseId) {
        return c.json({ error: 'Database ID requis' }, 400);
      }

      const database = await prisma.database.findUnique({
        where: { id: databaseId }
      });

      if (!database) {
        return c.json({ error: 'Base de donn�es non trouv�e' }, 404);
      }

      // Simuler un test de connexion (remplacez par une vraie logique)
      const isConnected = true; // Ici vous testeriez vraiment la connexion

      await prisma.log.create({
        data: {
          level: isConnected ? 'INFO' : 'ERROR',
          message: `Test de connexion ${isConnected ? 'r�ussi' : '�chou�'}: ${database.name}`,
          action: 'TEST_CONNECTION',
          metadata: { databaseId: database.id, host: database.host, port: database.port },
          databaseId: database.id
        }
      });

      return c.json({
        success: true,
        connected: isConnected,
        message: isConnected
          ? 'Connexion r�ussie'
          : '�chec de la connexion'
      });

    } catch (error: any) {
      console.error('Erreur test connexion:', error);
      return c.json({
        error: 'Erreur lors du test de connexion',
        details: error.message
      }, 500);
    }
  }
}

export const databaseController = new DatabaseController();