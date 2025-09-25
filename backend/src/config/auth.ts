import jwt from 'jsonwebtoken';

// Configuration JWT
export const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
  expiresIn: '24h', // Token expire apr�s 24 heures
  algorithm: 'HS256' as const
};

// Interface pour le payload JWT
export interface JWTPayload {
  userId: string;
  email: string;
  role: 'ADMIN' | 'USER';
  iat?: number;
  exp?: number;
}

// G�n�rer un token JWT
export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  const secret = JWT_CONFIG.secret as jwt.Secret;
  return jwt.sign(payload, secret, {
    expiresIn: JWT_CONFIG.expiresIn,
    algorithm: JWT_CONFIG.algorithm
  } as jwt.SignOptions);
}

// V�rifier et d�coder un token JWT
export function verifyToken(token: string): JWTPayload {
  try {
    const secret = JWT_CONFIG.secret as jwt.Secret;
    const decoded = jwt.verify(token, secret, {
      algorithms: [JWT_CONFIG.algorithm]
    }) as JWTPayload;

    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expir�');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Token invalide');
    }
    throw new Error('Erreur de v�rification du token');
  }
}

// Configuration des mots de passe
export const PASSWORD_CONFIG = {
  saltRounds: 12, // Nombre de rounds pour bcrypt
  minLength: 8,   // Longueur minimale
  requireNumbers: true,
  requireSpecialChars: true,
  requireUppercase: true,
  requireLowercase: true
};

// Validation du format email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validation du mot de passe
export function isValidPassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Vérifier si le mot de passe est vide ou ne contient que des espaces
  if (!password || password.trim().length === 0) {
    errors.push('Le mot de passe ne peut pas être vide');
  }

  // Vérifier la longueur minimale
  if (password.length < PASSWORD_CONFIG.minLength) {
    errors.push(`Le mot de passe doit contenir au moins ${PASSWORD_CONFIG.minLength} caractères`);
  }

  // Vérifier la présence d'au moins une majuscule
  if (PASSWORD_CONFIG.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule');
  }

  // Vérifier la présence d'au moins une minuscule
  if (PASSWORD_CONFIG.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une minuscule');
  }

  if (PASSWORD_CONFIG.requireNumbers && !/\d/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }

  if (PASSWORD_CONFIG.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un caractère spécial');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Configuration des cookies (si vous utilisez des cookies)
export const COOKIE_CONFIG = {
  name: 'safebase_token',
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 24 * 60 * 60 * 1000 // 24 heures en millisecondes
};

// Messages d'erreur standardis�s
export const AUTH_ERRORS = {
  INVALID_CREDENTIALS: 'Email ou mot de passe incorrect',
  USER_NOT_FOUND: 'Utilisateur non trouv�',
  EMAIL_ALREADY_EXISTS: 'Cette adresse email est d�j� utilis�e',
  ACCOUNT_DISABLED: 'Ce compte a �t� d�sactiv�',
  TOKEN_MISSING: 'Token d\'authentification manquant',
  TOKEN_INVALID: 'Token d\'authentification invalide',
  TOKEN_EXPIRED: 'Token d\'authentification expir�',
  INSUFFICIENT_PERMISSIONS: 'Permissions insuffisantes',
  VALIDATION_ERROR: 'Erreur de validation des donn�es'
} as const;