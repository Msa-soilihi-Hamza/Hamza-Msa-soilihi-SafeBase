import bcrypt from 'bcryptjs';
import { prisma } from '../config/database.js';
import { generateToken, verifyToken, isValidEmail, isValidPassword, AUTH_ERRORS, PASSWORD_CONFIG } from '../config/auth.js';
import type { JWTPayload } from '../config/auth.js';

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    user: {
      id: string;
      name: string;
      email: string;
      role: 'ADMIN' | 'USER';
      isActive: boolean;
    };
    token: string;
  };
  errors?: string[];
}

export class AuthService {

  async register(registerData: RegisterData): Promise<AuthResponse> {
    try {
      const { name, email, password, phone } = registerData;

      // Validation des donn�es
      const validationErrors: string[] = [];

      if (!name || name.trim().length < 2) {
        validationErrors.push('Le nom doit contenir au moins 2 caract�res');
      }

      if (!isValidEmail(email)) {
        validationErrors.push('Format d\'email invalide');
      }

      const passwordValidation = isValidPassword(password);
      if (!passwordValidation.valid) {
        validationErrors.push(...passwordValidation.errors);
      }

      if (validationErrors.length > 0) {
        return {
          success: false,
          errors: validationErrors
        };
      }

      // V�rifier si l'email existe d�j�
      const existingUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (existingUser) {
        return {
          success: false,
          errors: [AUTH_ERRORS.EMAIL_ALREADY_EXISTS]
        };
      }

      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(password, PASSWORD_CONFIG.saltRounds);

      // Cr�er l'utilisateur
      const newUser = await prisma.user.create({
        data: {
          name: name.trim(),
          email: email.toLowerCase(),
          password: hashedPassword,
          phone: phone?.trim() || null,
          role: 'USER', // Par d�faut USER, l'admin peut changer plus tard
          isActive: true
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true
        }
      });

      // G�n�rer le token JWT
      const token = generateToken({
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role
      });

      // Log de l'inscription
      await prisma.log.create({
        data: {
          level: 'INFO',
          message: `Nouvel utilisateur inscrit: ${newUser.email}`,
          action: 'USER_REGISTER',
          metadata: {
            userId: newUser.id,
            userRole: newUser.role
          },
          userId: newUser.id
        }
      });

      return {
        success: true,
        data: {
          user: {
            ...newUser,
            name: newUser.name || ''
          },
          token
        }
      };

    } catch (error: any) {
      console.error('Erreur lors de l\'inscription:', error);
      return {
        success: false,
        errors: ['Erreur interne du serveur']
      };
    }
  }

  async login(loginData: LoginData): Promise<AuthResponse> {
    try {
      const { email, password } = loginData;

      // Validation basique
      if (!email || !password) {
        return {
          success: false,
          errors: ['Email et mot de passe requis']
        };
      }

      // Trouver l'utilisateur
      const user = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        select: {
          id: true,
          name: true,
          email: true,
          password: true,
          role: true,
          isActive: true
        }
      });

      if (!user) {
        return {
          success: false,
          errors: [AUTH_ERRORS.INVALID_CREDENTIALS]
        };
      }

      // V�rifier si le compte est actif
      if (!user.isActive) {
        return {
          success: false,
          errors: [AUTH_ERRORS.ACCOUNT_DISABLED]
        };
      }

      // V�rifier le mot de passe
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        // Log tentative de connexion �chou�e
        await prisma.log.create({
          data: {
            level: 'WARNING',
            message: `Tentative de connexion �chou�e pour: ${email}`,
            action: 'LOGIN_FAILED',
            metadata: { email, reason: 'invalid_password' }
          }
        });

        return {
          success: false,
          errors: [AUTH_ERRORS.INVALID_CREDENTIALS]
        };
      }

      // G�n�rer le token JWT
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role
      });

      // Log connexion r�ussie
      await prisma.log.create({
        data: {
          level: 'INFO',
          message: `Connexion r�ussie: ${user.email}`,
          action: 'LOGIN_SUCCESS',
          metadata: {
            userId: user.id,
            userRole: user.role
          },
          userId: user.id
        }
      });

      // Retourner les donn�es utilisateur (sans le mot de passe)
      const { password: _, ...userWithoutPassword } = user;

      return {
        success: true,
        data: {
          user: {
            ...userWithoutPassword,
            name: userWithoutPassword.name || ''
          },
          token
        }
      };

    } catch (error: any) {
      console.error('Erreur lors de la connexion:', error);
      return {
        success: false,
        errors: ['Erreur interne du serveur']
      };
    }
  }

  async verifyUserToken(token: string): Promise<{ valid: boolean; user?: any; error?: string }> {
    try {
      if (!token) {
        return { valid: false, error: AUTH_ERRORS.TOKEN_MISSING };
      }

      // V�rifier et d�coder le token
      const decoded = verifyToken(token);

      // V�rifier si l'utilisateur existe encore et est actif
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true
        }
      });

      if (!user) {
        return { valid: false, error: AUTH_ERRORS.USER_NOT_FOUND };
      }

      if (!user.isActive) {
        return { valid: false, error: AUTH_ERRORS.ACCOUNT_DISABLED };
      }

      return { valid: true, user };

    } catch (error: any) {
      let errorMessage: string = AUTH_ERRORS.TOKEN_INVALID;

      if (error.message.includes('expir')) {
        errorMessage = AUTH_ERRORS.TOKEN_EXPIRED;
      }

      return { valid: false, error: errorMessage };
    }
  }

  async getUserById(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          phone: true,
          createdAt: true
        }
      });

      return user;
    } catch (error) {
      console.error('Erreur lors de la r�cup�ration de l\'utilisateur:', error);
      return null;
    }
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<AuthResponse> {
    try {
      // Validation du nouveau mot de passe
      const passwordValidation = isValidPassword(newPassword);
      if (!passwordValidation.valid) {
        return {
          success: false,
          errors: passwordValidation.errors
        };
      }

      // R�cup�rer l'utilisateur avec mot de passe
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          password: true,
          isActive: true
        }
      });

      if (!user || !user.isActive) {
        return {
          success: false,
          errors: [AUTH_ERRORS.USER_NOT_FOUND]
        };
      }

      // V�rifier l'ancien mot de passe
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return {
          success: false,
          errors: ['Mot de passe actuel incorrect']
        };
      }

      // Hasher le nouveau mot de passe
      const hashedNewPassword = await bcrypt.hash(newPassword, PASSWORD_CONFIG.saltRounds);

      // Mettre � jour le mot de passe
      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword }
      });

      // Log changement de mot de passe
      await prisma.log.create({
        data: {
          level: 'INFO',
          message: `Changement de mot de passe: ${user.email}`,
          action: 'PASSWORD_CHANGE',
          metadata: { userId },
          userId
        }
      });

      return { success: true };

    } catch (error: any) {
      console.error('Erreur lors du changement de mot de passe:', error);
      return {
        success: false,
        errors: ['Erreur interne du serveur']
      };
    }
  }
}

export const authService = new AuthService();