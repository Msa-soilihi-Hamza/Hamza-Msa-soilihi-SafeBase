import { describe, test, expect } from 'vitest';
import { isValidPassword } from '../../config/auth.js';

describe('Test unitaire: Sécurité Mot de Passe', () => {

  // Test de validation positive: vérifie qu'un mot de passe respectant tous les critères est accepté
  test('Mot de passe sécurisé valide', () => {
    const result = isValidPassword('SecurePass123!');
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  // Test de validation positive: vérifie qu'un autre mot de passe valide est accepté
  test('Mot de passe avec tous les critères requis', () => {
    const result = isValidPassword('MyP@ssw0rd2024');
    expect(result.valid).toBe(true);
    expect(result.errors.length).toBe(0);
  });

  // Test de validation négative: vérifie que les mots de passe trop courts sont rejetés
  test('Échec: Mot de passe trop court (moins de 8 caractères)', () => {
    const result = isValidPassword('Pass1!');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Le mot de passe doit contenir au moins 8 caractères');
  });

  // Test de validation négative: vérifie que les mots de passe sans majuscule sont rejetés
  test('Échec: Mot de passe sans majuscule', () => {
    const result = isValidPassword('password123!');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Le mot de passe doit contenir au moins une majuscule');
  });

  // Test de validation négative: vérifie que les mots de passe sans minuscule sont rejetés
  test('Échec: Mot de passe sans minuscule', () => {
    const result = isValidPassword('PASSWORD123!');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Le mot de passe doit contenir au moins une minuscule');
  });

  // Test de validation négative: vérifie que les mots de passe sans chiffre sont rejetés
  test('Échec: Mot de passe sans chiffre', () => {
    const result = isValidPassword('Password!');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Le mot de passe doit contenir au moins un chiffre');
  });

  // Test de validation négative: vérifie que les mots de passe sans caractère spécial sont rejetés
  test('Échec: Mot de passe sans caractère spécial', () => {
    const result = isValidPassword('Password123');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Le mot de passe doit contenir au moins un caractère spécial');
  });

  // Test de validation négative: vérifie que les mots de passe vides sont rejetés
  test('Échec: Mot de passe vide', () => {
    const result = isValidPassword('');
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });

  // Test de validation négative: vérifie que les mots de passe composés uniquement d'espaces sont rejetés
  test('Échec: Mot de passe que des espaces', () => {
    const result = isValidPassword('        ');
    expect(result.valid).toBe(false);
  });

  // Test de validation positive: vérifie qu'un mot de passe avec différents caractères spéciaux est accepté
  test('Mot de passe avec caractères spéciaux variés', () => {
    const result = isValidPassword('Test@123#$%');
    expect(result.valid).toBe(true);
  });
});