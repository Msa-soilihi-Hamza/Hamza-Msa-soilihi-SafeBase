import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { connectDatabase } from './config/database.js'
import { backupRoutes } from './routes/backups.js'
import { databaseRoutes } from './routes/databases.js'
import { scheduleRoutes } from './routes/schedules.js'
import { auth } from './routes/auth.js'
import { cronService } from './config/cron.js'

const app = new Hono()

// Route de test
app.get('/', (c) => {
  return c.json({
    message: 'SafeBase API - Gestionnaire de sauvegardes de bases de données',
    version: '1.0.0',
    status: 'running'
  })
})

// Routes d'authentification
app.route('/api/auth', auth)

// Routes pour les sauvegardes
app.route('/api/backups', backupRoutes)

// Routes pour les bases de données
app.route('/api/databases', databaseRoutes)

// Routes pour les planifications
app.route('/api/schedules', scheduleRoutes)

// Route de health check
app.get('/health', (c) => {
  return c.json({ status: 'healthy', timestamp: new Date().toISOString() })
})

// Démarrage du serveur
async function startServer() {
  try {
    // Connexion à la base de données
    const connected = await connectDatabase()
    if (!connected) {
      console.error('❌ Impossible de se connecter à la base de données')
      process.exit(1)
    }

    // Démarrer les sauvegardes automatiques
    await cronService.startScheduledBackups()
    await cronService.startCleanupSchedule()

    serve({
      fetch: app.fetch,
      port: 3004
    }, (info) => {
      console.log(`🚀 SafeBase API démarré sur http://localhost:${info.port}`)
      console.log('📋 Endpoints disponibles:')
      console.log('  GET  / - Informations API')
      console.log('  GET  /health - État de santé')
      console.log('  🔐 AUTHENTIFICATION:')
      console.log('    POST /api/auth/register - Inscription')
      console.log('    POST /api/auth/login - Connexion')
      console.log('    POST /api/auth/logout - Déconnexion')
      console.log('    GET  /api/auth/profile - Profil utilisateur')
      console.log('    GET  /api/auth/me - Test authentification')
      console.log('  📊 DATABASES:')
      console.log('    POST /api/databases/create - Créer une base')
      console.log('    GET  /api/databases/all - Lister les bases')
      console.log('    GET  /api/databases/:id - Détails d\'une base')
      console.log('  💾 BACKUPS:')
      console.log('    GET  /api/backups/create - Créer une sauvegarde')
      console.log('    GET  /api/backups/database/:id/versions - Versions d\'une base')
      console.log('    POST /api/backups/:id/restore - Restaurer une sauvegarde')
    })
  } catch (error) {
    console.error('❌ Erreur lors du démarrage:', error)
    process.exit(1)
  }
}

startServer()
