/**
 * ut-api.js
 *
 * The ONLY place in the theme that talks to the commerce platform.
 * Web Components import from here and never call Shopify endpoints directly.
 *
 * Port strategy: this file is the adapter. For Next.js + Medusa v2 the same
 * interface is re-implemented against the Medusa Store API (cart, line items).
 * Keep the method signatures platform-neutral: no Shopify-specific fields in
 * the public return shape beyond what is documented in docs/portability.md.
 *
 * Public interface (stable):
 *   cart.get()                              -> Promise<Cart>
 *   cart.add({ variantId, quantity, props }) -> Promise<Cart>
 *   cart.update({ lineKey, quantity })      -> Promise<Cart>
 *   cart.remove({ lineKey })                -> Promise<Cart>
 *   events: window dispatches `ut:cart:updated` with { detail: Cart }
 *
 * Cart shape (neutral):
 *   { itemCount: number, totalPrice: number (minor units), currency: string,
 *     lines: [{ key, variantId, productId, title, quantity, price, image, url }] }
 */

const ROOT = window.Shopify?.routes?.root ?? '/';

async function request(path, options = {}) {
  const res = await fetch(`${ROOT}${path}`, {
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    ...options,
  });
  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = await res.json();
      message = body.description || body.message || message;
    } catch {
      /* ignore non-JSON error body */
    }
    throw new Error(message);
  }
  return res.json();
}

/** Map Shopify's /cart.js payload to the neutral Cart shape. */
function normalizeCart(raw) {
  return {
    itemCount: raw.item_count,
    totalPrice: raw.total_price,
    currency: raw.currency,
    lines: raw.items.map((item) => ({
      key: item.key,
      variantId: String(item.variant_id),
      productId: String(item.product_id),
      title: item.product_title,
      variantTitle: item.variant_title,
      quantity: item.quantity,
      price: item.final_line_price,
      image: item.image,
      url: item.url,
    })),
  };
}

function emit(cart) {
  window.dispatchEvent(new CustomEvent('ut:cart:updated', { detail: cart }));
  return cart;
}

export const cart = {
  async get() {
    return normalizeCart(await request('cart.js'));
  },

  async add({ variantId, quantity = 1, props = {} }) {
    await request('cart/add.js', {
      method: 'POST',
      body: JSON.stringify({ items: [{ id: variantId, quantity, properties: props }] }),
    });
    return emit(await this.get());
  },

  async update({ lineKey, quantity }) {
    const raw = await request('cart/change.js', {
      method: 'POST',
      body: JSON.stringify({ id: lineKey, quantity }),
    });
    return emit(normalizeCart(raw));
  },

  async remove({ lineKey }) {
    return this.update({ lineKey, quantity: 0 });
  },
};

export const api = { cart };
