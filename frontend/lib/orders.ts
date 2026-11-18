import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/index";
import { orderItems, orders, products, productColors, productImages, productSizes, storeSettings } from "@/lib/db/schema";
import { deliveryFeeFor, shillingsFromCents } from "@/lib/money";
import { mpesaOutcome, stkQuery } from "@/lib/mpesa";
import { normalizeKePhone } from "@/lib/phone";
import { getStripe } from "@/lib/stripe";
import type { CheckoutInput } from "@/lib/validators";
import type { OrderReceipt } from "@/lib/types";

export class OrderError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

function orderNumber() {
  const date = new Date();
  const ymd = date.toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `NN-${ymd}-${suffix}`;
}

async function settingsRow() {
  const [row] = await db.select().from(storeSettings).limit(1);
  if (!row) throw new OrderError("The store is not ready for checkout", 503);
  return row;
}

export async function priceCheckout(input: CheckoutInput) {
  const settings = await settingsRow();
  const lines = [];
  for (const item of input.items) {
    const [product] = await db.select().from(products).where(eq(products.id, item.productId));
    if (!product || !product.active) throw new OrderError("A product in your bag is no longer available");
    const sizes = await db.select().from(productSizes).where(eq(productSizes.productId, product.id));
    const colors = await db.select().from(productColors).where(eq(productColors.productId, product.id));
    if (sizes.length > 0) {
      const size = sizes.find((entry) => entry.label === item.size);
      if (!size) throw new OrderError(`Choose a size for ${product.name}`);
      if (!size.inStock) throw new OrderError(`${product.name} in size ${size.label} is sold out`);
    }
    if (colors.length > 0 && !colors.some((entry) => entry.name === item.color)) {
      throw new OrderError(`Choose a colour for ${product.name}`);
    }
    const images = await db.select().from(productImages).where(eq(productImages.productId, product.id));
    const color = colors.find((entry) => entry.name === item.color);
    const image = images.find((entry) => color && entry.colorId === color.id)?.image ?? images[0]?.image ?? "";
    lines.push({
      productId: product.id,
      name: product.name,
      subtitle: product.subtitle,
      size: item.size,
      color: item.color,
      unitPriceCents: product.priceCents,
      quantity: item.quantity,
      image,
    });
  }
  const subtotalCents = lines.reduce((sum, line) => sum + line.unitPriceCents * line.quantity, 0);
  const deliveryFeeCents = deliveryFeeFor(subtotalCents, input.fulfillment, settings);
  return {
    settings,
    lines,
    subtotalCents,
    deliveryFeeCents,
    totalCents: subtotalCents + deliveryFeeCents,
    phone: normalizeKePhone(input.phone) ?? input.phone,
  };
}

export async function createPendingOrder(input: CheckoutInput, paymentMethod: "card" | "mpesa") {
  const priced = await priceCheckout(input);
  const id = crypto.randomUUID();
  const number = orderNumber();
  await db.transaction(async (tx) => {
    await tx.insert(orders).values({
      id,
      orderNumber: number,
      status: "pending",
      paymentMethod,
      fullName: input.fullName,
      email: input.email.toLowerCase(),
      phone: priced.phone,
      fulfillment: input.fulfillment,
      area: input.fulfillment === "delivery" ? input.area : null,
      street: input.fulfillment === "delivery" ? input.street : null,
      note: input.note || null,
      pickupAddress: input.fulfillment === "pickup" ? priced.settings.pickupAddress : null,
      subtotalCents: priced.subtotalCents,
      deliveryFeeCents: priced.deliveryFeeCents,
      totalCents: priced.totalCents,
    });
    await tx.insert(orderItems).values(
      priced.lines.map((line) => ({
        id: crypto.randomUUID(),
        orderId: id,
        productId: line.productId,
        name: line.name,
        subtitle: line.subtitle,
        size: line.size,
        color: line.color,
        unitPriceCents: line.unitPriceCents,
        quantity: line.quantity,
        image: line.image,
      })),
    );
  });
  const order = await getOrder(id);
  if (!order) throw new OrderError("The order could not be created", 500);
  return order;
}

export async function getOrder(id: string) {
  const [order] = await db.select().from(orders).where(eq(orders.id, id));
  return order ?? null;
}

export async function getOrderByNumber(orderNumberValue: string) {
  const [order] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumberValue));
  return order ?? null;
}

export async function getOrderByPaymentIntent(paymentIntentId: string) {
  const [order] = await db.select().from(orders).where(eq(orders.stripePaymentIntentId, paymentIntentId));
  return order ?? null;
}

export async function getOrderByCheckoutRequest(checkoutRequestId: string) {
  const [order] = await db.select().from(orders).where(eq(orders.mpesaCheckoutRequestId, checkoutRequestId));
  return order ?? null;
}

async function itemsFor(orderId: string) {
  return db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

export async function toReceipt(orderId: string): Promise<OrderReceipt | null> {
  const order = await getOrder(orderId);
  if (!order) return null;
  const items = await itemsFor(order.id);
  return {
    orderId: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    statusDetail: order.statusDetail,
    email: order.email,
    fullName: order.fullName,
    phone: order.phone,
    fulfillment: order.fulfillment === "pickup" ? "pickup" : "delivery",
    area: order.area,
    street: order.street,
    note: order.note,
    pickupAddress: order.pickupAddress,
    subtotalCents: order.subtotalCents,
    deliveryFeeCents: order.deliveryFeeCents,
    totalCents: order.totalCents,
    paymentMethod: order.paymentMethod,
    mpesaReceipt: order.mpesaReceipt,
    createdAt: order.createdAt.toISOString(),
    items: items.map((item) => ({
      name: item.name,
      subtitle: item.subtitle,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      unitPriceCents: item.unitPriceCents,
      image: item.image,
    })),
  };
}

export function emailMatches(orderEmail: string, email: string) {
  return orderEmail.toLowerCase() === email.trim().toLowerCase();
}

export async function markPaid(orderId: string, extra: { mpesaReceipt?: string | null; stripePaymentIntentId?: string }) {
  await db
    .update(orders)
    .set({
      status: "paid",
      statusDetail: null,
      ...(extra.mpesaReceipt ? { mpesaReceipt: extra.mpesaReceipt } : {}),
      ...(extra.stripePaymentIntentId ? { stripePaymentIntentId: extra.stripePaymentIntentId } : {}),
    })
    .where(and(eq(orders.id, orderId), eq(orders.status, "pending")));
}

export async function markFailed(orderId: string, detail: string) {
  await db
    .update(orders)
    .set({ status: "failed", statusDetail: detail.slice(0, 300) })
    .where(and(eq(orders.id, orderId), eq(orders.status, "pending")));
}

export async function cancelPending(orderId: string, email: string) {
  const order = await getOrder(orderId);
  if (!order || !emailMatches(order.email, email)) throw new OrderError("Order not found", 404);
  if (order.status !== "pending") return order;
  await db.update(orders).set({ status: "cancelled", statusDetail: "Replaced before payment" }).where(eq(orders.id, orderId));
  return getOrder(orderId);
}

export async function confirmStripeOrder(orderId: string) {
  const order = await getOrder(orderId);
  if (!order || !order.stripePaymentIntentId) throw new OrderError("Order not found", 404);
  if (order.status === "paid") return order;
  const stripe = getStripe();
  const intent = await stripe.paymentIntents.retrieve(order.stripePaymentIntentId);
  if (intent.metadata.orderId !== order.id || intent.amount !== order.totalCents || intent.currency !== "kes") {
    throw new OrderError("Payment does not match this order", 409);
  }
  if (intent.status === "succeeded") {
    await markPaid(order.id, { stripePaymentIntentId: intent.id });
  } else if (intent.status === "canceled") {
    await markFailed(order.id, "Card payment was cancelled");
  }
  return getOrder(order.id);
}

export async function syncMpesaOrder(orderId: string) {
  const order = await getOrder(orderId);
  if (!order) throw new OrderError("Order not found", 404);
  if (order.status === "paid" || !order.mpesaCheckoutRequestId) return order;
  try {
    const result = await stkQuery(order.mpesaCheckoutRequestId);
    const outcome = mpesaOutcome(result);
    if (outcome.state === "paid") {
      const fresh = await getOrder(order.id);
      await markPaid(order.id, { mpesaReceipt: fresh?.mpesaReceipt ?? null });
    } else if (outcome.state === "failed") {
      await markFailed(order.id, outcome.description);
    }
  } catch (error) {
    console.error("M-Pesa status check failed", error);
  }
  return getOrder(order.id);
}

export function mpesaAmount(totalCents: number) {
  return shillingsFromCents(totalCents);
}
