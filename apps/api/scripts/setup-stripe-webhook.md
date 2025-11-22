# Configuration Stripe CLI pour les webhooks locaux

## Installation de Stripe CLI

### Windows (avec Scoop ou Chocolatey)

**Avec Scoop :**
```powershell
scoop install stripe
```

**Avec Chocolatey :**
```powershell
choco install stripe
```

**Ou téléchargement manuel :**
1. Allez sur https://github.com/stripe/stripe-cli/releases
2. Téléchargez `stripe_X.X.X_windows_x86_64.zip`
3. Extrayez et ajoutez au PATH

### Vérification
```powershell
stripe --version
```

## Configuration

1. **Connecter Stripe CLI à votre compte :**
```powershell
stripe login
```
Cela ouvrira votre navigateur pour vous authentifier.

2. **Lancer le forwarding des webhooks :**
```powershell
stripe listen --forward-to localhost:4000/webhooks/stripe
```

3. **Copier le webhook signing secret :**
   - Stripe CLI affichera un `whsec_...` 
   - Copiez-le et utilisez-le comme `STRIPE_WEBHOOK_SECRET`

4. **Événements à écouter :**
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`

## Utilisation

Lancez Stripe CLI dans un terminal séparé AVANT de démarrer votre serveur API :

```powershell
# Terminal 1 : Stripe CLI
stripe listen --forward-to localhost:4000/webhooks/stripe

# Terminal 2 : Votre serveur API
cd apps/api
npm run dev
```

Stripe CLI forwardera automatiquement tous les événements Stripe vers votre serveur local.

