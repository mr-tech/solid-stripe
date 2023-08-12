import type { Stripe } from '@stripe/stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { Show, createSignal, onMount } from 'solid-js'
import { Address, Elements, LinkAuthenticationElement, PaymentElement, useStripe, useStripeElements } from 'solid-stripe'
import { createRouteAction, useRouteData } from 'solid-start/data'
import { createPaymentIntent } from '~/lib/createPaymentIntent'
import { createServerData$ } from 'solid-start/server'
import '~/styles/payment-element.css'
import Alert from '~/components/Alert'

export function routeData() {
  return createServerData$(async () => {
    const paymentIntent = await createPaymentIntent({
      amount: 2000,
      currency: 'usd',
      payment_method_types: ['card']
    })

    return paymentIntent
  }, {
    key: 'payment-element',
  })
}

export default function Page() {
  const [stripe, setStripe] = createSignal<Stripe | null>(null)
  const paymentIntent = useRouteData<typeof routeData>()

  onMount(async () => {
    const result = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY)
    setStripe(result)
  })

  return (
    <>
      <h1 class="text-4xl font-normal leading-normal mt-0 mb-2">Payment Element Example</h1>
      <Show when={stripe() && paymentIntent()} fallback={<div>Loading stripe...</div>}>
        <Elements
          stripe={stripe()}
          clientSecret={paymentIntent().client_secret}
          theme="flat"
          labels="floating"
          variables={{ colorPrimary: '#7c4dff' }}
          rules={{ '.Input': { border: 'solid 1px #0002' } }}
        >
          <CheckoutForm />
        </Elements>
      </Show>
    </>
  )
}

function CheckoutForm() {
  const stripe = useStripe()
  const elements = useStripeElements()

  const [processing, { Form }] = createRouteAction(async () => {
    const result = await stripe().confirmPayment({
      elements: elements(),
      redirect: 'if_required'
    })

    if (result.error) {
      // payment failed
      throw new Error(result.error.message)
    }
    else {
      // payment succeeded
      return result.paymentIntent
    }
  })

  return (
    <>
      <Show when={processing.error}>
        <Alert type="error" message={`${processing.error.message} Please try again.`} />
      </Show>
      <Form>
        <LinkAuthenticationElement />
        <PaymentElement />
        <Address mode="billing" />
        <button class="btn btn-primary" disabled={processing.pending}>
          {processing.pending ? 'Processing...' : 'Pay'}
        </button>
      </Form>
    </>
  )
}
