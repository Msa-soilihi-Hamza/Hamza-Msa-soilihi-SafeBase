import { describe, test, expect } from 'vitest';
import { isValidPassword } from '../../config/auth.js';

describe('Test unitaire: Sécurité Mot de Passe', () => {

  test('Mot de passe sécurisé valide', () => {
    const result = isValidPassword('SecurePass123!');
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  test('Mot de passe avec tous les critères requis', () => {
    const result = isValidPassword('MyP@ssw0rd2024');
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  test('Échec: Mot de passe trop court (moins de 8 caractères)', () => {
    const result = isValidPassword('Pass1!');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Le mot de passe doit contenir au moins 8 caractères');
  });

  test('Échec: Mot de passe sans majuscule', () => {
    const result = isValidPassword('password123!');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Le mot de passe doit contenir au moins une majuscule');
  });

  test('Échec: Mot de passe sans minuscule', () => {
    const result = isValidPassword('PASSWORD123!');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Le mot de passe doit contenir au moins une minuscule');
  });

  test('Échec: Mot de passe sans chiffre', () => {
    const result = isValidPassword('Password!');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Le mot de passe doit contenir au moins un chiffre');
  });

  test('Échec: Mot de passe sans caractère spécial', () => {
    const result = isValidPassword('Password123');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Le mot de passe doit contenir au moins un caractère spécial');
  });

  test('Échec: Mot de passe vide', () => {
    const result = isValidPassword('');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  test('Échec: Mot de passe que des espaces', () => {
    const result = isValidPassword('        ');
    expect(result.valid).toBe(false);
  });

  test('Mot de passe avec caractères spéciaux variés', () => {
    const result = isValidPassword('Test@123#$%');
    expect(result.valid).toBe(true);
  });
});