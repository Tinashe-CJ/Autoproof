export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'subscription' | 'payment';
  price: number;
  currency: string;
  interval?: 'month' | 'year';
}

export const stripeProducts: StripeProduct[] = [
  {
    id: 'prod_SgGWRwKomkHu2H',
    priceId: 'price_1Rktzf2cWVUBmwvUorBDZOoN',
    name: 'Starter',
    description: 'Perfect for small teams getting started with compliance automation',
    mode: 'subscription',
    price: 30.00,
    currency: 'usd',
    interval: 'month'
  },
  {
    id: 'prod_SgGYs6CkiETt8T',
    priceId: 'price_1Rku1A2cWVUBmwvUJo2ySut6',
    name: 'Growth',
    description: 'For growing teams with increasing compliance needs',
    mode: 'subscription',
    price: 75.00,
    currency: 'usd',
    interval: 'month'
  },
  {
    id: 'prod_SgGYJE70Miqyoy',
    priceId: 'price_1Rku1S2cWVUBmwvUWCoQOLyE',
    name: 'Business',
    description: 'For organizations with complex compliance requirements',
    mode: 'subscription',
    price: 300.00,
    currency: 'usd',
    interval: 'month'
  }
];

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.priceId === priceId);
};

export const getProductByName = (name: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.name.toLowerCase() === name.toLowerCase());
};

export const getProductById = (id: string): StripeProduct | undefined => {
  return stripeProducts.find(product => product.id === id);
};