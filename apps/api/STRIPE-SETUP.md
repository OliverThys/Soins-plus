# Configuration Stripe CLI - Guide rapide

## Lancer Stripe CLI pour recevoir les webhooks

### Option 1 : Avec la commande npm (recommandé)
```powershell
cd apps/api
npm run stripe:webhook
```

### Option 2 : Commande directe
```powershell
stripe listen --forward-to localhost:4000/webhooks/stripe
```

## Ce qui va se passer

1. Stripe CLI va afficher un **webhook signing secret** qui commence par `whsec_...`
2. **Copiez ce secret** - vous en aurez besoin pour la configuration
3. Stripe CLI va maintenant forwarder tous les événements Stripe vers votre serveur local

## Important

- **Laissez ce terminal ouvert** pendant que vous testez les paiements
- Le webhook secret s'affiche au démarrage, il ressemble à : `whsec_xxxxxxxxxxxxx`
- Si vous fermez le terminal, vous devrez relancer la commande

## Configuration dans l'admin

Une fois que vous avez le `whsec_...`, allez sur `/admin/configuration` et remplissez :
- Clé secrète API : `sk_test_...`
- Secret Webhook : `whsec_...` (celui affiché par Stripe CLI)
- ID Prix Mensuel : `price_...`
- ID Prix Annuel : `price_...`


