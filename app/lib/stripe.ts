import Stripe from 'stripe';

// Initialize Stripe with secret key
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
  typescript: true,
});

// Stripe configuration
export const STRIPE_CONFIG = {
  currency: 'zar', // South African Rand
  country: 'ZA',   // South Africa
  paymentMethods: ['card'], // Accept card payments
};

// Helper function to format amount for Stripe (convert from cents)
export const formatAmountForStripe = (amount: number): number => {
  return Math.round(amount); // Stripe expects amounts in cents for ZAR
};

// Helper function to format amount for display (convert to currency)
export const formatAmountForDisplay = (amount: number): string => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
  }).format(amount / 100);
};

// Create a Stripe customer
export const createStripeCustomer = async (params: {
  email: string;
  name?: string;
  phone?: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.Customer> => {
  return await stripe.customers.create({
    email: params.email,
    name: params.name,
    phone: params.phone,
    metadata: params.metadata || {},
  });
};

// Create a payment intent
export const createPaymentIntent = async (params: {
  amount: number; // Amount in cents
  currency?: string;
  customerId?: string;
  paymentMethodId?: string;
  description?: string;
  metadata?: Record<string, string>;
}): Promise<Stripe.PaymentIntent> => {
  const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
    amount: formatAmountForStripe(params.amount),
    currency: params.currency || STRIPE_CONFIG.currency,
    payment_method_types: STRIPE_CONFIG.paymentMethods,
    description: params.description,
    metadata: params.metadata || {},
  };

  if (params.customerId) {
    paymentIntentParams.customer = params.customerId;
  }

  if (params.paymentMethodId) {
    paymentIntentParams.payment_method = params.paymentMethodId;
    paymentIntentParams.confirmation_method = 'manual';
    paymentIntentParams.confirm = true;
  }

  return await stripe.paymentIntents.create(paymentIntentParams);
};

// Confirm a payment intent
export const confirmPaymentIntent = async (
  paymentIntentId: string,
  paymentMethodId?: string
): Promise<Stripe.PaymentIntent> => {
  const params: Stripe.PaymentIntentConfirmParams = {};
  
  if (paymentMethodId) {
    params.payment_method = paymentMethodId;
  }

  return await stripe.paymentIntents.confirm(paymentIntentId, params);
};

// Create a setup intent for saving payment methods
export const createSetupIntent = async (params: {
  customerId: string;
  paymentMethodTypes?: string[];
  metadata?: Record<string, string>;
}): Promise<Stripe.SetupIntent> => {
  return await stripe.setupIntents.create({
    customer: params.customerId,
    payment_method_types: params.paymentMethodTypes || STRIPE_CONFIG.paymentMethods,
    metadata: params.metadata || {},
  });
};

// Attach payment method to customer
export const attachPaymentMethodToCustomer = async (
  paymentMethodId: string,
  customerId: string
): Promise<Stripe.PaymentMethod> => {
  return await stripe.paymentMethods.attach(paymentMethodId, {
    customer: customerId,
  });
};

// Detach payment method from customer
export const detachPaymentMethodFromCustomer = async (
  paymentMethodId: string
): Promise<Stripe.PaymentMethod> => {
  return await stripe.paymentMethods.detach(paymentMethodId);
};

// List customer payment methods
export const listCustomerPaymentMethods = async (
  customerId: string,
  type: string = 'card'
): Promise<Stripe.PaymentMethod[]> => {
  const paymentMethods = await stripe.paymentMethods.list({
    customer: customerId,
    type: type as Stripe.PaymentMethodListParams.Type,
  });
  
  return paymentMethods.data;
};

// Create a refund
export const createRefund = async (params: {
  paymentIntentId?: string;
  chargeId?: string;
  amount?: number; // Amount in cents, if partial refund
  reason?: Stripe.RefundCreateParams.Reason;
  metadata?: Record<string, string>;
}): Promise<Stripe.Refund> => {
  const refundParams: Stripe.RefundCreateParams = {
    metadata: params.metadata || {},
  };

  if (params.paymentIntentId) {
    refundParams.payment_intent = params.paymentIntentId;
  } else if (params.chargeId) {
    refundParams.charge = params.chargeId;
  }

  if (params.amount) {
    refundParams.amount = formatAmountForStripe(params.amount);
  }

  if (params.reason) {
    refundParams.reason = params.reason;
  }

  return await stripe.refunds.create(refundParams);
};

// Retrieve a payment intent
export const retrievePaymentIntent = async (
  paymentIntentId: string
): Promise<Stripe.PaymentIntent> => {
  return await stripe.paymentIntents.retrieve(paymentIntentId);
};

// Retrieve a customer
export const retrieveCustomer = async (
  customerId: string
): Promise<Stripe.Customer> => {
  return await stripe.customers.retrieve(customerId) as Stripe.Customer;
};

// Update customer
export const updateCustomer = async (
  customerId: string,
  params: Stripe.CustomerUpdateParams
): Promise<Stripe.Customer> => {
  return await stripe.customers.update(customerId, params);
};

// Webhook signature verification
export const verifyWebhookSignature = (
  payload: string | Buffer,
  signature: string,
  secret: string
): Stripe.Event => {
  return stripe.webhooks.constructEvent(payload, signature, secret);
};

// Get payment method details
export const getPaymentMethodDetails = (paymentMethod: Stripe.PaymentMethod) => {
  if (paymentMethod.type === 'card' && paymentMethod.card) {
    return {
      type: 'STRIPE_CARD',
      brand: paymentMethod.card.brand.toUpperCase(),
      lastFour: paymentMethod.card.last4,
      expiryMonth: paymentMethod.card.exp_month,
      expiryYear: paymentMethod.card.exp_year,
      fingerprint: paymentMethod.card.fingerprint,
    };
  }
  
  return {
    type: 'STRIPE_WALLET',
    brand: paymentMethod.type.toUpperCase(),
    lastFour: null,
    expiryMonth: null,
    expiryYear: null,
    fingerprint: null,
  };
};

// Error handling helper
export const handleStripeError = (error: any): string => {
  if (error.type === 'StripeCardError') {
    return error.message || 'Your card was declined.';
  } else if (error.type === 'StripeRateLimitError') {
    return 'Too many requests made to the API too quickly.';
  } else if (error.type === 'StripeInvalidRequestError') {
    return 'Invalid parameters were supplied to Stripe\'s API.';
  } else if (error.type === 'StripeAPIError') {
    return 'An error occurred internally with Stripe\'s API.';
  } else if (error.type === 'StripeConnectionError') {
    return 'Some kind of error occurred during the HTTPS communication.';
  } else if (error.type === 'StripeAuthenticationError') {
    return 'You probably used an incorrect API key.';
  } else {
    return 'An unknown error occurred.';
  }
};
