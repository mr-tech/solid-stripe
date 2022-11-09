import type { Appearance, StripeElements } from '@stripe/stripe-js';
import type { Component } from 'solid-js';
import { mergeProps, onCleanup, onMount } from 'solid-js';
import { useStripe } from '../StripeProvider';
import type { StripeElementEventHandler } from '../types';
import { createAndMountStripeElement } from '../utils';

type Props = {
  elements: StripeElements | null
  // eslint-disable-next-line no-unused-vars
  setElements: (elements: StripeElements) => void
  clientSecret: string
  theme?: Appearance['theme']
  variables?: Appearance['variables']
  rules?: Appearance['rules']
  options?: Record<string, any>
  labels?: Appearance['labels']
} & StripeElementEventHandler<'payment'>

export const PaymentElement: Component<Props> = (props) => {
  let wrapper: HTMLDivElement;
  const stripe = useStripe();
  
  const merged = mergeProps(
    {
      theme: 'stripe',
      variables: {},
      rules: {},
      labels: 'above',
    },
    props,
  );

  if (!stripe)
    throw new Error('Stripe.js has not yet loaded.');

  onMount(() => {
    const elements = stripe.elements({
      clientSecret: props.clientSecret,
      appearance: {
        theme: merged.theme as Appearance['theme'],
        variables: merged.variables,
        rules: merged.rules,
        labels: merged.labels as Appearance['labels'],
      },
    });
    props.setElements(elements);

    const element = createAndMountStripeElement(wrapper, 'payment', elements, props, props.options);

    onCleanup(() => {
      element.unmount();
    });
  });

  return <div ref={wrapper!} />;
};
