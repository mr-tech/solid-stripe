import type { Appearance, Stripe, StripeElements } from '@stripe/stripe-js'
import type { Accessor, Component, JSX } from 'solid-js'
import { createContext, createEffect, createMemo, createSignal, mergeProps, useContext } from 'solid-js'

export const StripeContext = createContext<{
  stripe: Accessor<Stripe | undefined>
  elements: Accessor<StripeElements | null>
}>()

interface Props {
  stripe?: Stripe
  clientSecret?: string
  theme?: Appearance['theme']
  variables?: Appearance['variables']
  rules?: Appearance['rules']
  options?: Record<string, any>
  labels?: Appearance['labels']
  children?: JSX.Element
}

export const Elements: Component<Props> = (props) => {
  const [elements, setElements] = createSignal<StripeElements | null>(null)

  const merged = mergeProps(
    {
      clientSecret: '',
      theme: 'stripe',
      variables: {},
      rules: {},
      labels: 'above',
    },
    props,
  )

  createEffect(() => {
    if (props.stripe && !elements()) {
      const instance = props.stripe.elements({
        clientSecret: merged.clientSecret,
        appearance: {
          theme: merged.theme as Appearance['theme'],
          variables: merged.variables,
          rules: merged.rules,
          labels: merged.labels as Appearance['labels'],
        },
      })

      setElements(instance)
    }
  })

  const stripe = createMemo(() => props.stripe)
  const value = {
    stripe,
    elements,
  }

  return <StripeContext.Provider value={value}>{props.children}</StripeContext.Provider>
}

export const useStripe = () => {
  const ctx = useContext(StripeContext)

  if (!ctx?.stripe())
    throw new Error('Stripe not loaded')

  return ctx.stripe
}

export const useStripeElements = () => {
  const ctx = useContext(StripeContext)

  if (!ctx?.stripe())
    throw new Error('Stripe not loaded')

  return ctx.elements
}