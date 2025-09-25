import type { Context } from 'hono';
import { authService } from '../services/authService.js';
import { COOKIE_CONFIG } from '../config/auth.js';
import type { RegisterData, LoginData } from '../services/authService.js';

export class AuthController {

  async register(c: Context) {
    try {
      const body = await c.req.json() as RegisterData;

      const result = await authService.register(body);

      if (!result.success) {
        return c.json({
          success: false,
          message: '�chec de l\'inscription',
          errors: result.errors
        }, 400);
      }

      // Optionnel : d�finir le cookie avec le token
      if (result.data?.token) {
        c.res.headers.set('Set-Cookie',
          `${COOKIE_CONFIG.name}=${result.data.token}; HttpOnly; Path=/; Max-Age=${COOKIE_CONFIG.maxAge / 1000}; SameSite=${COOKIE_CONFIG.sameSite}${COOKIE_CONFIG.secure ? '; Secure' : ''}`
        );
      }

      return c.json({
        success: true,
        message: 'Inscription r�ussie',
        data: {
          user: result.data?.user,
          token: result.data?.token
        }
      }, 201);

    } catch (error: any) {
      console.error('Erreur dans authController.register:', error);
      return c.json({
        success: false,
        message: 'Erreur interne du serveur',
        errors: ['Une erreur inattendue s\'est produite']
      }, 500);
    }
  }

  async login(c: Context) {
    try {
      const body = await c.req.json() as LoginData;

      const result = await authService.login(body);

      if (!result.success) {
        return c.json({
          success: false,
          message: '�chec de la connexion',
          errors: result.errors
        }, 401);
      }

      // Optionnel : d�finir le cookie avec le token
      if (result.data?.token) {
        c.res.headers.set('Set-Cookie',
          `${COOKIE_CONFIG.name}=${result.data.token}; HttpOnly; Path=/; Max-Age=${COOKIE_CONFIG.maxAge / 1000}; SameSite=${COOKIE_CONFIG.sameSite}${COOKIE_CONFIG.secure ? '; Secure' : ''}`
        );
      }

      return c.json({
        success: true,
        message: 'Connexion r�ussie',
        data: {
          user: result.data?.user,
          token: result.data?.token
        }
      });

    } catch (error: any) {
      console.error('Erreur dans authController.login:', error);
      return c.json({
        success: false,
        message: 'Erreur interne du serveur',
        errors: ['Une erreur inattendue s\'est produite']
      }, 500);
    }
  }

  async logout(c: Context) {
    try {
      // Supprimer le cookie en d�finissant une expiration pass�e
      c.res.headers.set('Set-Cookie',
        `${COOKIE_CONFIG.name}=; HttpOnly; Path=/; Max-Age=0; SameSite=${COOKIE_CONFIG.sameSite}${COOKIE_CONFIG.secure ? '; Secure' : ''}`
      );

      return c.json({
        success: true,
        message: 'D�connexion r�ussie'
      });

    } catch (error: any) {
      console.error('Erreur dans authController.logout:', error);
      return c.json({
        success: false,
        message: 'Erreur lors de la d�connexion'
      }, 500);
    }
  }

  async getProfile(c: Context) {
    try {
      // L'utilisateur est d�j� attach� au contexte par le middleware auth
      const user = c.get('user');

      if (!user) {
        return c.json({
          success: false,
          message: 'Utilisateur non authentifi�'
        }, 401);
      }

      // R�cup�rer les d�tails complets de l'utilisateur
      const userDetails = await authService.getUserById(user.id);

      if (!userDetails) {
        return c.json({
          success: false,
          message: 'Utilisateur non trouv�'
        }, 404);
      }

      return c.json({
        success: true,
        data: { user: userDetails }
      });

    } catch (error: any) {
      console.error('Erreur dans authController.getProfile:', error);
      return c.json({
        success: false,
        message: 'Erreur lors de la r�cup�ration du profil'
      }, 500);
    }
  }

  async changePassword(c: Context) {
    try {
      const user = c.get('user');
      const body = await c.req.json() as {
        currentPassword: string;
        newPassword: string;
      };

      if (!user) {
        return c.json({
          success: false,
          message: 'Utilisateur non authentifi�'
        }, 401);
      }

      if (!body.currentPassword || !body.newPassword) {
        return c.json({
          success: false,
          message: 'Mots de passe requis',
          errors: ['Ancien et nouveau mot de passe requis']
        }, 400);
      }

      const result = await authService.changePassword(
        user.id,
        body.currentPassword,
        body.newPassword
      );

      if (!result.success) {
        return c.json({
          success: false,
          message: '�chec du changement de mot de passe',
          errors: result.errors
        }, 400);
      }

      return c.json({
        success: true,
        message: 'Mot de passe chang� avec succ�s'
      });

    } catch (error: any) {
      console.error('Erreur dans authController.changePassword:', error);
      return c.json({
        success: false,
        message: 'Erreur lors du changement de mot de passe'
      }, 500);
    }
  }

  async verifyToken(c: Context) {
    try {
      const authHeader = c.req.header('Authorization');
      const token = authHeader?.replace('Bearer ', '') ||
                   c.req.header('Cookie')?.match(new RegExp(`${COOKIE_CONFIG.name}=([^;]+)`))?.[1];

      if (!token) {
        return c.json({
          success: false,
          message: 'Token manquant'
        }, 401);
      }

      const result = await authService.verifyUserToken(token);

      if (!result.valid) {
        return c.json({
          success: false,
          message: result.error || 'Token invalide'
        }, 401);
      }

      return c.json({
        success: true,
        data: { user: result.user }
      });

    } catch (error: any) {
      console.error('Erreur dans authController.verifyToken:', error);
      return c.json({
        success: false,
        message: 'Erreur lors de la v�rification du token'
      }, 500);
    }
  }
}

export const authController = new AuthController();