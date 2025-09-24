# Agent IA: Configuration MySQL avec Prisma

## Description
Cet agent se charge de créer et configurer la connexion à MySQL via Prisma dans un projet Node.js/TypeScript.

## Responsabilités

### 1. Création du fichier .env
- Créer un fichier `.env` à la racine du projet backend
- Ajouter les variables d'environnement suivantes:
  ```
  DATABASE_URL="mysql://user:password@localhost:3308/database_name"
  DB_HOST=localhost
  DB_PORT=3308
  DB_USER=root
  DB_PASSWORD=
  DB_NAME=safebase
  ```

### 2. Configuration Prisma (src/config/database.ts)
- Importer PrismaClient depuis @prisma/client
- Créer une instance unique de PrismaClient (singleton pattern)
- Exporter l'instance pour réutilisation
- Gérer la connexion et déconnexion proprement
- Inclure la gestion d'erreurs TypeScript

### 3. Test de connexion
- Créer un script de test de connexion
- Vérifier que Node.js peut se connecter à MySQL
- Logger le statut de connexion (succès/échec)
- Gérer les erreurs de connexion avec messages clairs

## Utilisation de l'agent

Pour activer cet agent, demandez:
"Configure la connexion MySQL avec Prisma selon l'agent mysql-prisma-setup"

## Prérequis
- Prisma installé (`npm install prisma @prisma/client`)
- MySQL en cours d'exécution
- Schema Prisma initialisé (prisma/schema.prisma)