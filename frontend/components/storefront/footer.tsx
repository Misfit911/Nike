"use client";

import { formatKes } from "@/lib/money";
import type { StoreSettings } from "@/lib/types";
import { IconChevron } from "@/components/storefront/icons";

function Row({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="group border-t border-line">
      <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-base font-medium">
        {title}
        <IconChevron className="transition group-open:rotate-180" />
      </summary>
      <div className="space-y-3 pb-5 text-sm leading-6 text-muted">{children}</div>
    </details>
  );
}

export function Footer({ settings, flush = false }: { settings: StoreSettings; flush?: boolean }) {
  const year = new Date().getFullYear();
  const fee = formatKes(settings.deliveryFeeCents);
  const threshold = formatKes(settings.freeDeliveryThresholdCents);
  return (
    <footer className={`${flush ? "mt-0" : "mt-8"} border-t border-line px-5 pb-16`}>
      <Row title="Company">
        <p>{settings.companyName} is a demonstration storefront for a Nike shop in Nairobi. It is not the official Nike website.</p>
        <p>Pickup address shown at checkout: {settings.pickupAddress}</p>
      </Row>
      <Row title="Delivery and returns">
        <p>The delivery fee at checkout is {fee}. An order of {threshold} or more shows a delivery fee of zero. Pickup shows no delivery fee.</p>
        <p>This demonstration does not promise a delivery day or a pickup time. Any timing would be confirmed by the shop only after a payment is recorded.</p>
        <p>An unworn item may be brought back to the store within 30 days with the order number. The shop decides whether to accept the return.</p>
      </Row>
      <Row title="Guides">
        <p>Choose the size you usually wear. A size and colour with none left cannot be added to the bag.</p>
        <p>This demonstration does not include back-in-stock alerts, launch countdowns, or early access.</p>
      </Row>
      <Row title="Terms of Use">
        <p>Use this demonstration to browse and to place a personal order. Do not misuse checkout, and do not place an order you do not intend to pay.</p>
      </Row>
      <Row title="Terms of Sale">
        <p>
          Prices are in Kenyan shillings. An order counts as paid only after M-Pesa or the card payment is confirmed. {settings.companyName} may
          cancel an order it cannot fulfil. Delivery, pickup, and returns follow the notes above.
        </p>
      </Row>
      <Row title="Privacy">
        <p>
          Name, email, phone, and delivery details are used to fulfil an order. An email added to the list stays until you unsubscribe. Card
          numbers are handled by Stripe. M-Pesa is confirmed by Safaricom. This site does not store card numbers.
        </p>
      </Row>
      <p className="border-t border-line py-4 text-sm text-muted">
        © {year} {settings.companyName}. Demonstration storefront.
      </p>
    </footer>
  );
}
