import Stripe from "stripe";
import { env } from "../config/env";

// Initialisation conditionnelle de Stripe
// Si la clé n'est pas définie, on crée un client factice qui lancera des erreurs à l'utilisation
export const stripe = env.stripeSecretKey
  ? new Stripe(env.stripeSecretKey, {
      apiVersion: "2024-06-20",
    })
  : (null as unknown as Stripe); // Type assertion pour éviter les erreurs TypeScript

export interface CreateCheckoutSessionParams {
  customerId?: string;
  customerEmail: string;
  customerName?: string;
  userId: string;
  priceId: string; // ID du prix Stripe (mensuel ou annuel)
  successUrl: string;
  cancelUrl: string;
}

/**
 * Crée un customer Stripe
 */
export async function createStripeCustomer(
  params: {
    email: string;
    name?: string;
    metadata?: Record<string, string>;
  },
  secretKey?: string
): Promise<Stripe.Customer> {
  const key = secretKey || env.stripeSecretKey;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is required for Stripe operations");
  }
  
  // Créer un client Stripe avec la clé fournie ou utiliser le client global
  const stripeClient = secretKey ? new Stripe(secretKey, { apiVersion: "2024-06-20" }) : stripe;
  
  return stripeClient.customers.create({
    email: params.email,
    name: params.name,
    metadata: params.metadata || {},
  });
}

/**
 * Crée une session Checkout pour l'abonnement
 */
export async function createCheckoutSession(
  params: CreateCheckoutSessionParams,
  secretKey?: string
): Promise<Stripe.Checkout.Session> {
  const key = secretKey || env.stripeSecretKey;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is required for Stripe operations");
  }
  
  // Créer un client Stripe avec la clé fournie ou utiliser le client global
  const stripeClient = secretKey ? new Stripe(secretKey, { apiVersion: "2024-06-20" }) : stripe;
  
  const sessionParams: Stripe.Checkout.SessionCreateParams = {
    mode: "subscription",
    customer: params.customerId,
    customer_email: params.customerId ? undefined : params.customerEmail,
    line_items: [
      {
        price: params.priceId,
        quantity: 1,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    metadata: {
      userId: params.userId,
    },
    subscription_data: {
      metadata: {
        userId: params.userId,
      },
    },
    allow_promotion_codes: true,
  };

  return stripeClient.checkout.sessions.create(sessionParams);
}

/**
 * Crée un portail client Stripe pour la gestion de l'abonnement
 */
export async function createCustomerPortalSession(params: {
  customerId: string;
  returnUrl: string;
}): Promise<Stripe.BillingPortal.Session> {
  if (!env.stripeSecretKey) {
    throw new Error("STRIPE_SECRET_KEY is required for Stripe operations");
  }
  return stripe.billingPortal.sessions.create({
    customer: params.customerId,
    return_url: params.returnUrl,
  });
}

/**
 * Récupère un abonnement Stripe
 */
export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  if (!env.stripeSecretKey) {
    throw new Error("STRIPE_SECRET_KEY is required for Stripe operations");
  }
  return stripe.subscriptions.retrieve(subscriptionId);
}

/**
 * Annule un abonnement Stripe
 */
export async function cancelSubscription(
  subscriptionId: string,
  immediately: boolean = false
): Promise<Stripe.Subscription> {
  if (!env.stripeSecretKey) {
    throw new Error("STRIPE_SECRET_KEY is required for Stripe operations");
  }
  if (immediately) {
    return stripe.subscriptions.cancel(subscriptionId);
  }
  // Annulation à la fin de la période
  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true,
  });
}

/**
 * Récupère les prix Stripe disponibles
 */
export async function getPrices(secretKey: string): Promise<Stripe.Price[]> {
  const stripeClient = getStripeClient(secretKey);
  const prices = await stripeClient.prices.list({
    active: true,
    type: "recurring",
    limit: 100,
  });
  return prices.data;
}

