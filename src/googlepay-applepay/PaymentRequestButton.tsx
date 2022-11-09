import type {
  PaymentRequestOptions,
  PaymentRequestPaymentMethodEvent,
  StripeElement,
  StripeElementBase,
  StripeElementClasses,
  StripePaymentRequestButtonElementOptions,
} from '@stripe/stripe-js';
import type { Component } from 'solid-js';
import { mergeProps, onCleanup, onMount } from 'solid-js';
import { useStripeElements, useStripe } from '../StripeProvider';

interface Props {
  element?: StripeElementBase | null
  // eslint-disable-next-line no-unused-vars
  setCanMakePayment?: (canMakePayment: boolean) => void
  // eslint-disable-next-line no-unused-vars
  setElement?: (element: StripeElement) => void
  classes?: StripeElementClasses
  style?: NonNullable<StripePaymentRequestButtonElementOptions['style']>['paymentRequestButton']
  paymentRequest: PaymentRequestOptions
  // eslint-disable-next-line no-unused-vars
  onPaymentMethod: (payload: PaymentRequestPaymentMethodEvent) => void
}

export const PaymentRequestButton: Component<Props> = (props) => {
  let wrapper: HTMLDivElement;

  const stripe = useStripe();
  const elements = useStripeElements();

  const merged: Props = mergeProps(
    {
      classes: {},
      style: {},
    },
    props,
  );

  onMount(async () => {
    if (!stripe || !elements) return;

    const paymentRequestObject = stripe.paymentRequest(props.paymentRequest);

    const element = elements.create('paymentRequestButton', {
      classes: merged.classes,
      style: {
        paymentRequestButton: merged.style as any,
      },
      paymentRequest: paymentRequestObject,
    });
    props.setElement?.(element);

    const result = await paymentRequestObject.canMakePayment();

    if (result) {
      props.setCanMakePayment?.(true)
      props.element?.mount(wrapper);
      paymentRequestObject.on('paymentmethod', (e) => {
        props.onPaymentMethod(e);
      });
    } else {
      props.setCanMakePayment?.(false)
      wrapper.style.display = 'none';
    }

    onCleanup(() => {
      element.unmount();
    });
  });

  return <div ref={wrapper!} />;
};