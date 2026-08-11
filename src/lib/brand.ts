/**
 * Customer-facing business identity and contact details.
 *
 * Defined once so the WhatsApp number, business name and support email can
 * never drift between the footer, contact page, dashboard and shipment views.
 */
export const BUSINESS_NAME = "Speed Link Express Logistics";

/** Customer service WhatsApp, digits only, in international format. */
export const WHATSAPP_NUMBER = "13252837971";

/** Human-readable form for display next to the link. */
export const WHATSAPP_DISPLAY = "+1 325 283 7971";

export const SUPPORT_EMAIL = "Speedlinkcourier6@gmail.com";

/**
 * Builds a click-to-chat URL. No WhatsApp Business API involved: this is the
 * plain wa.me link, which works from every device without any paid integration.
 */
export function whatsappUrl(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  const text = message?.trim();
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

/** Default enquiry used where no shipment context is available. */
export const WHATSAPP_DEFAULT_MESSAGE = `Hello ${BUSINESS_NAME}, I need assistance with my shipment.`;

/** Enquiry prefilled with a tracking number, for shipment-specific help. */
export function whatsappShipmentMessage(trackingNumber: string): string {
  return `Hello ${BUSINESS_NAME}, I need assistance with my shipment ${trackingNumber}.`;
}
