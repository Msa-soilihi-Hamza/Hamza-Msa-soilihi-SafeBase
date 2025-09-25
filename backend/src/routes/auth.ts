import { Hono } from 'hono';
import { authController } from '../controllers/authController.js';
import { authenticateToken, optionalAuth } from '../middlewares/authMiddleware.js';

const auth = new Hono();

// Routes publiques (pas d'authentification requise)
auth.post('/register', (c) => authController.register(c));
auth.post('/login', (c) => authController.login(c));
auth.post('/logout', (c) => authController.logout(c));

// Vérification de token (optionnelle pour debug)
auth.post('/verify', (c) => authController.verifyToken(c));

// Routes protégées (authentification requise)
auth.get('/profile', authenticateToken, (c) => authController.getProfile(c));
auth.put('/change-password', authenticateToken, (c) => authController.changePassword(c));

// Route pour tester l'authentification
auth.get('/me', authenticateToken, (c) => {
  const user = c.get('user');
  return c.json({
    success: true,
    message: 'Authentification réussie',
    data: { user }
  });
});

// Route publique avec authentification optionnelle
auth.get('/status', optionalAuth, (c) => {
  const user = c.get('user');

  return c.json({
    success: true,
    data: {
      authenticated: !!user,
      user: user || null,
      timestamp: new Date().toISOString()
    }
  });
});

export { auth };