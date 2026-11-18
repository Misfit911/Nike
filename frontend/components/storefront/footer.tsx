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
  return (
    <footer className={`${flush ? "mt-0" : "mt-8"} border-t border-line px-5 pb-16`}>
      <Row title="Company">
        <p>{settings.companyName} is a Nike store serving in Nairobi.</p>
        <p>Pickup: {settings.pickupAddress}</p>
      </Row>
      <Row title="Delivery and returns">
        <p>
          Delivery is {formatKes(settings.deliveryFeeCents)}. Orders of {formatKes(settings.freeDeliveryThresholdCents)} or more
          ship free. Pickup at the store is free.
        </p>
        <p>Same day delivery in Nairobi when order is placed before 3pm.</p> 
        <p>Next day delivery in Nairobi for orders placed after 3pm.</p> 
        <p>Delivery takes 1 to 3 days outside Nairobi.</p> 
        <p>Unworn items can be returned in store within 30 days with the order number.</p>
      </Row>
      {/* <Row title="Kenya">
        <p>Shopping from Nairobi, Kenya. Prices are shown in Kenyan shillings and include VAT.</p>
      </Row> */}

      <Row title="Guides">
        <p>From locked-in compression layers to relaxed streetwear fleece, every piece is engineered with a specific silhouette in mind. Order your true UK size for standard and tailored fits, size down on oversized styles for a cleaner drape, and check your chest, waist, hips, and inseam measurements before checkout to dial in your exact match.</p>
        <p>Explore curated gear built for your pace. Shop by activity, browse the latest seasonal drops, or see how pieces move on-model with full fit notes on every product page. Missed out on a limited release? Turn on back-in-stock alerts for your size and watch our launch countdowns so you never miss the next drop.</p>
      </Row>
      <Row title="Terms of Use">
        <p>Use this online store to browse and buy goods for personal use. Do not misuse the checkout or attempt to place fraudulent orders.</p>
      </Row>
      <Row title="Terms of Sale">
        <p>
          A contract starts when payment is confirmed. Prices are in KES. {settings.companyName} may cancel an order that cannot be fulfilled
          and will not capture payment for items it cannot send.
        </p>
      </Row>
      <Row title="Privacy">
        <p>
          We collect your name, email address, phone number, and delivery details solely to process and fulfill your order. For your security, we do not store yoyr payment details on our servers. Card transactions are securely processed by stripe and M-pesa payments are confirmed directly through Safaricom.
        </p>
      </Row>
      <p className="border-t border-line py-4 text-sm text-muted">
        © {year} {settings.companyName}. All rights reserved.
      </p>
    </footer>
  );
}
