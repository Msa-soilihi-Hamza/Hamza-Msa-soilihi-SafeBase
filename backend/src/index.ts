import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { connectDatabase } from './config/database.js'
import { backupRoutes } from './routes/backups.js'

const app = new Hono()

// Route de test
app.get('/', (c) => {
  return c.json({
    message: 'SafeBase API - Gestionnaire de sauvegardes de bases de données',
    version: '1.0.0',
    status: 'running'
  })
})

// Routes pour les sauvegardes
app.route('/api/backups', backupRoutes)

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

    serve({
      fetch: app.fetch,
      port: 3002
    }, (info) => {
      console.log(`🚀 SafeBase API démarré sur http://localhost:${info.port}`)
      console.log('📋 Endpoints disponibles:')
      console.log('  GET  / - Informations API')
      console.log('  GET  /health - État de santé')
      console.log('  POST /api/backups/create - Créer une sauvegarde')
      console.log('  GET  /api/backups/database/:id/versions - Versions d\'une base')
      console.log('  POST /api/backups/:id/restore - Restaurer une sauvegarde')
      console.log('  DELETE /api/backups/:id - Supprimer une sauvegarde')
    })
  } catch (error) {
    console.error('❌ Erreur lors du démarrage:', error)
    process.exit(1)
  }
}

startServer()
