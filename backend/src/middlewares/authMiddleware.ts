import type { Context, Next } from 'hono';
import { authService } from '../services/authService.js';
import { COOKIE_CONFIG, AUTH_ERRORS } from '../config/auth.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'ADMIN' | 'USER';
  name: string;
  isActive: boolean;
}

declare module 'hono' {
  interface ContextVariableMap {
    user: AuthenticatedUser;
  }
}

export async function authenticateToken(c: Context, next: Next) {
  try {
    // R�cup�rer le token depuis l'en-t�te Authorization ou les cookies
    const authHeader = c.req.header('Authorization');
    let token = authHeader?.replace('Bearer ', '');

    // Si pas de token dans l'en-t�te, chercher dans les cookies
    if (!token) {
      const cookies = c.req.header('Cookie');
      const match = cookies?.match(new RegExp(`${COOKIE_CONFIG.name}=([^;]+)`));
      token = match?.[1];
    }

    if (!token) {
      return c.json({
        success: false,
        message: AUTH_ERRORS.TOKEN_MISSING
      }, 401);
    }

    // V�rifier le token
    const result = await authService.verifyUserToken(token);

    if (!result.valid) {
      return c.json({
        success: false,
        message: result.error || AUTH_ERRORS.TOKEN_INVALID
      }, 401);
    }

    // Attacher l'utilisateur au contexte
    c.set('user', result.user as AuthenticatedUser);

    await next();
  } catch (error: any) {
    console.error('Erreur dans le middleware d\'authentification:', error);
    return c.json({
      success: false,
      message: 'Erreur d\'authentification'
    }, 500);
  }
}

export function requireRole(...allowedRoles: Array<'ADMIN' | 'USER'>) {
  return async (c: Context, next: Next) => {
    try {
      const user = c.get('user') as AuthenticatedUser;

      if (!user) {
        return c.json({
          success: false,
          message: AUTH_ERRORS.TOKEN_MISSING
        }, 401);
      }

      if (!allowedRoles.includes(user.role)) {
        return c.json({
          success: false,
          message: AUTH_ERRORS.INSUFFICIENT_PERMISSIONS
        }, 403);
      }

      await next();
    } catch (error: any) {
      console.error('Erreur dans le middleware de r�le:', error);
      return c.json({
        success: false,
        message: 'Erreur de v�rification des permissions'
      }, 500);
    }
  };
}

export function requireAdmin(c: Context, next: Next) {
  return requireRole('ADMIN')(c, next);
}

export async function optionalAuth(c: Context, next: Next) {
  try {
    // R�cup�rer le token sans forcer l'authentification
    const authHeader = c.req.header('Authorization');
    let token = authHeader?.replace('Bearer ', '');

    if (!token) {
      const cookies = c.req.header('Cookie');
      const match = cookies?.match(new RegExp(`${COOKIE_CONFIG.name}=([^;]+)`));
      token = match?.[1];
    }

    // Si un token est pr�sent, essayer de l'authentifier
    if (token) {
      const result = await authService.verifyUserToken(token);
      if (result.valid) {
        c.set('user', result.user as AuthenticatedUser);
      }
    }

    // Continuer m�me sans authentification
    await next();
  } catch (error: any) {
    console.error('Erreur dans le middleware d\'authentification optionnelle:', error);
    // En cas d'erreur, continuer sans utilisateur
    await next();
  }
}

export async function loggedUserOnly(c: Context, next: Next) {
  const user = c.get('user');

  if (!user) {
    return c.json({
      success: false,
      message: 'Acc�s refus�. Connexion requise.'
    }, 401);
  }

  await next();
}