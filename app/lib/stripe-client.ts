import { loadStripe, Stripe } from '@stripe/stripe-js';

// Initialize Stripe.js
let stripePromise: Promise<Stripe | null>;

export const getStripe = (): Promise<Stripe | null> => {
  if (!stripePromise) {
    stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
  }
  return stripePromise;
};

// Client-side payment processing
export const processPayment = async (params: {
  stripe: Stripe;
  elements: any;
  clientSecret: string;
  confirmationData?: {
    payment_method?: {
      billing_details?: {
        name?: string;
        email?: string;
        phone?: string;
        address?: {
          line1?: string;
          line2?: string;
          city?: string;
          state?: string;
          postal_code?: string;
          country?: string;
        };
      };
    };
  };
}) => {
  const { stripe, elements, clientSecret, confirmationData } = params;

  // Get the card element
  const cardElement = elements.getElement('card');

  if (!cardElement) {
    throw new Error('Card element not found');
  }

  // Confirm the payment
  const result = await stripe.confirmCardPayment(clientSecret, {
    payment_method: {
      card: cardElement,
      billing_details: confirmationData?.payment_method?.billing_details || {},
    },
  });

  return result;
};

// Setup payment method for future use
export const setupPaymentMethod = async (params: {
  stripe: Stripe;
  elements: any;
  clientSecret: string;
  confirmationData?: {
    payment_method?: {
      billing_details?: {
        name?: string;
        email?: string;
        phone?: string;
      };
    };
  };
}) => {
  const { stripe, elements, clientSecret, confirmationData } = params;

  // Get the card element
  const cardElement = elements.getElement('card');

  if (!cardElement) {
    throw new Error('Card element not found');
  }

  // Confirm the setup intent
  const result = await stripe.confirmCardSetup(clientSecret, {
    payment_method: {
      card: cardElement,
      billing_details: confirmationData?.payment_method?.billing_details || {},
    },
  });

  return result;
};

// Create payment method without confirming
export const createPaymentMethod = async (params: {
  stripe: Stripe;
  elements: any;
  billingDetails?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      postal_code?: string;
      country?: string;
    };
  };
}) => {
  const { stripe, elements, billingDetails } = params;

  // Get the card element
  const cardElement = elements.getElement('card');

  if (!cardElement) {
    throw new Error('Card element not found');
  }

  // Create the payment method
  const result = await stripe.createPaymentMethod({
    type: 'card',
    card: cardElement,
    billing_details: billingDetails || {},
  });

  return result;
};

// Stripe Elements styling options
export const stripeElementsOptions = {
  fonts: [
    {
      cssSrc: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap',
    },
  ],
  appearance: {
    theme: 'stripe' as const,
    variables: {
      colorPrimary: '#0570de',
      colorBackground: '#ffffff',
      colorText: '#30313d',
      colorDanger: '#df1b41',
      fontFamily: 'Inter, system-ui, sans-serif',
      spacingUnit: '4px',
      borderRadius: '8px',
    },
    rules: {
      '.Input': {
        border: '1px solid #e6e6e6',
        borderRadius: '8px',
        padding: '12px',
        fontSize: '16px',
        backgroundColor: '#ffffff',
      },
      '.Input:focus': {
        border: '1px solid #0570de',
        boxShadow: '0 0 0 2px rgba(5, 112, 222, 0.1)',
      },
      '.Label': {
        fontSize: '14px',
        fontWeight: '500',
        color: '#374151',
        marginBottom: '6px',
      },
    },
  },
};

// Card element options
export const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      fontFamily: 'Inter, system-ui, sans-serif',
      '::placeholder': {
        color: '#aab7c4',
      },
      padding: '12px',
    },
    invalid: {
      color: '#9e2146',
    },
  },
  hidePostalCode: false,
};

// Format card brand for display
export const formatCardBrand = (brand: string): string => {
  const brandMap: Record<string, string> = {
    visa: 'Visa',
    mastercard: 'Mastercard',
    amex: 'American Express',
    discover: 'Discover',
    diners: 'Diners Club',
    jcb: 'JCB',
    unionpay: 'UnionPay',
    unknown: 'Unknown',
  };

  return brandMap[brand] || brandMap.unknown;
};

// Validate card number
export const validateCardNumber = (cardNumber: string): boolean => {
  // Remove spaces and non-digits
  const cleanNumber = cardNumber.replace(/\D/g, '');
  
  // Check if it's a valid length
  if (cleanNumber.length < 13 || cleanNumber.length > 19) {
    return false;
  }

  // Luhn algorithm
  let sum = 0;
  let isEven = false;

  for (let i = cleanNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cleanNumber.charAt(i), 10);

    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    isEven = !isEven;
  }

  return sum % 10 === 0;
};

// Format card number for display
export const formatCardNumber = (cardNumber: string): string => {
  const cleanNumber = cardNumber.replace(/\D/g, '');
  const groups = cleanNumber.match(/.{1,4}/g) || [];
  return groups.join(' ').substr(0, 19); // Max 19 characters with spaces
};

// Format expiry date
export const formatExpiryDate = (expiryDate: string): string => {
  const cleanDate = expiryDate.replace(/\D/g, '');
  if (cleanDate.length >= 2) {
    return cleanDate.substr(0, 2) + (cleanDate.length > 2 ? '/' + cleanDate.substr(2, 2) : '');
  }
  return cleanDate;
};

// Validate expiry date
export const validateExpiryDate = (expiryDate: string): boolean => {
  const cleanDate = expiryDate.replace(/\D/g, '');
  if (cleanDate.length !== 4) return false;

  const month = parseInt(cleanDate.substr(0, 2), 10);
  const year = parseInt(cleanDate.substr(2, 2), 10) + 2000;

  if (month < 1 || month > 12) return false;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return false;
  }

  return true;
};

// Validate CVC
export const validateCVC = (cvc: string, cardBrand?: string): boolean => {
  const cleanCVC = cvc.replace(/\D/g, '');
  
  if (cardBrand === 'amex') {
    return cleanCVC.length === 4;
  }
  
  return cleanCVC.length === 3;
};

// Get card type from number
export const getCardType = (cardNumber: string): string => {
  const cleanNumber = cardNumber.replace(/\D/g, '');
  
  if (/^4/.test(cleanNumber)) return 'visa';
  if (/^5[1-5]/.test(cleanNumber)) return 'mastercard';
  if (/^3[47]/.test(cleanNumber)) return 'amex';
  if (/^6(?:011|5)/.test(cleanNumber)) return 'discover';
  if (/^3[0689]/.test(cleanNumber)) return 'diners';
  if (/^35/.test(cleanNumber)) return 'jcb';
  if (/^62/.test(cleanNumber)) return 'unionpay';
  
  return 'unknown';
};

// Handle Stripe errors
export const handleStripeClientError = (error: any): string => {
  if (error.type === 'card_error' || error.type === 'validation_error') {
    return error.message || 'Your card was declined.';
  } else {
    return 'An unexpected error occurred.';
  }
};
