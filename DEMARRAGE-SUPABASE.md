# Configuration Supabase pour SOINS+

## Informations de connexion

- **URL Supabase** : https://yriiklceyghtymxfjdst.supabase.co
- **Anon Key** : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyaWlrbGNleWdodHlteGZqZHN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2MjA4NDIsImV4cCI6MjA3OTE5Njg0Mn0.qmK3FfWpgut7uxYMLRDRY2f2CIT-ebX9l4giYvB_l1Y

## Comment obtenir la DATABASE_URL complète

1. Allez sur https://supabase.com/dashboard/project/yriiklceyghtymxfjdst
2. Cliquez sur **Settings** (⚙️) dans la barre latérale
3. Cliquez sur **Database**
4. Dans la section **Connection string**, choisissez :
   - **URI** (pour les migrations Prisma)
   - Ou **Connection pooling** → **URI** (pour l'application en production)
5. Copiez la chaîne complète qui ressemble à :
   ```
   postgresql://postgres.yriiklceyghtymxfjdst:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres
   ```

## Mise à jour du fichier .env

Remplacez la ligne `DATABASE_URL` dans `apps/api/.env` par la connection string complète que vous avez copiée.

## Démarrer les serveurs

```powershell
# Depuis la racine du projet
pnpm dev
```

Cela démarre :
- **Backend API** : http://localhost:4000
- **Frontend** : http://localhost:5173

## Vérifier que tout fonctionne

1. Ouvrez http://localhost:5173 dans votre navigateur
2. Essayez de vous connecter avec `admin@soins.plus`
3. Si vous voyez une erreur de connexion à la base de données, vérifiez que la `DATABASE_URL` est correcte

