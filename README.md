# solid-stripe

Solid wrapper for Stripe.js

## Installation

To configure your project add these packages:

```bash
pnpm add @stripe/stripe-js solid-stripe
```

In your server-side app, add the official server-side/node version of Stripe too:

```bash
pnpm add stripe
```

We will use [solid-start](https://github.com/solidjs/solid-start) in all of the examples.

## Docs

### Set up Stripe

Add your private and public keys to your environment:

```
VITE_STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
```

In your payment page, initialize Stripe and add a `<StripeProvider>` component:

```tsx
import { createSignal, onMount, Show } from 'solid-js';

const App = () => {
  const [stripe, setStripe] = createSignal<Stripe | null>(null);

  onMount(async () => {
    const result = await loadStripe('pk_test_5NTx3icIuJNpqxmUgRQNS3oQ');
    setStripe(result);
  });

  return (
    <Show when={stripe()} fallback={<div>Loading stripe...</div>}>
      <StripeProvider stripe={stripe()}>
        {/* this is where your Stripe components go */}
      </StripeProvider>
    </Show>
  );
};
```

### Creating a payment intent

Before making a charge, Stripe should be notified by creating a [payment intent](https://stripe.com/docs/api/payment_intents. This must happen server-side to avoid anyone tampering with the amount.

Let's add a `src/lib/create-payment-intent.js` to create a payment intent:

```ts
import Stripe from 'stripe';

const stripe = new Stripe(import.meta.VITE_STRIPE_SECRET_KEY);

export default function createPaymentIntent(body) {
  return stripe.paymentIntents.create({
    amount: body.amount,
    currency: body.currency,
    automatic_payment_methods: { enabled: true },
  });
}
```
