# MatchIA — Consultants IA pour PME

Plateforme de mise en relation entre consultants IA vérifiés et PME françaises, avec recherche d'entreprise via l'API officielle du gouvernement.

## Déploiement rapide (Vercel — gratuit)

### Prérequis

- Un compte [GitHub](https://github.com/) (gratuit)
- Un compte [Vercel](https://vercel.com/) (gratuit, connectez-vous avec GitHub)
- Un compte [Supabase](https://supabase.com/) (gratuit)

### Étapes

#### 1. Créer un projet Supabase

1. Allez sur https://supabase.com/dashboard
2. Cliquez "New Project"
3. Nom du projet : `matchia`
4. Configurez le mot de passe de la base de données
5. Cliquez "Create new project"

#### 2. Exécuter le SQL

Dans l'onglet SQL Editor de Supabase, exécutez :

```sql
-- Création de la table profiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('business', 'consultant')),
  fullname TEXT,
  email TEXT,
  createdat TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger pour créer automatiquement un profil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role, fullname, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'business'),
    COALESCE(NEW.raw_user_meta_data->>'fullname', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

#### 3. Récupérer les clés Supabase

1. Dans Supabase, allez dans Settings > API
2. Copiez :
   - `Project URL` (ex: https://xxxxx.supabase.co)
   - `anon public` key

#### 4. Déployer sur Vercel

1. Allez sur https://vercel.com/new
2. Importez votre repository GitHub `matchia-final`
3. Framework : Vite (détecté automatiquement)
4. Ajoutez les variables d'environnement :
   - `VITE_SUPABASE_URL` = votre Project URL
   - `VITE_SUPABASE_ANON_KEY` = votre anon key
5. Cliquez "Deploy"
6. En 30 secondes, votre site est en ligne ! 🎉

#### 5. Configurer les URLs d'authentification

1. Une fois déployé, copiez l'URL Vercel (ex: `matchia-final.vercel.app`)
2. Dans Supabase, allez dans Authentication > URL Configuration
3. Ajoutez votre URL dans :
   - **Site URL** : `https://matchia-final.vercel.app`
   - **Redirect URLs** : `https://matchia-final.vercel.app/**`

## Développement local

```bash
npm install
npm run dev
```

Créez un fichier `.env` avec :

```
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=votre_anon_key
```

## Fonctionnalités

- ✅ Authentification Supabase (inscription/connexion)
- ✅ Recherche d'entreprise via l'API officielle française
- ✅ Interface consultant IA avec profils
- ✅ Matching PME/Consultants
- ✅ Design moderne avec Tailwind CSS
- ✅ React + Vite

## Technologies

- **Frontend** : React 18, Vite, Tailwind CSS
- **Backend** : Supabase (PostgreSQL + Auth)
- **API** : recherche-entreprises.api.gouv.fr
- **Déploiement** : Vercel
