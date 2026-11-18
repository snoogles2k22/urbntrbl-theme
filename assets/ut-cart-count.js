/**
 * <ut-cart-count> Spec: design/components/cart-count.md
 *
 * Progressive enhancement of a plain link to the cart. Listens to
 * `ut:cart:updated` (dispatched by ut-api.js) and never calls the platform.
 * Opens <ut-cart-drawer> on click once that element exists (phase E).
 */
const MAX_VISIBLE = 99;

class UtCartCount extends HTMLElement {
  #bubble = null;
  #label = null;
  #plural = null;

  connectedCallback() {
    this.#bubble = this.querySelector('.ut-cart-count__bubble');
    this.#label = this.querySelector('.ut-cart-count__label');
    this.#plural = new Intl.PluralRules(document.documentElement.lang || undefined);
    window.addEventListener('ut:cart:updated', this.#onUpdate);
    this.addEventListener('click', this.#onClick);
  }

  disconnectedCallback() {
    window.removeEventListener('ut:cart:updated', this.#onUpdate);
    this.removeEventListener('click', this.#onClick);
  }

  get count() {
    return Number(this.dataset.count) || 0;
  }

  set count(value) {
    const count = Math.max(0, Number.parseInt(value, 10) || 0);
    this.dataset.count = String(count);
    if (this.#bubble) {
      this.#bubble.textContent = count > MAX_VISIBLE ? `${MAX_VISIBLE}+` : String(count);
      this.#bubble.hidden = count === 0;
    }
    if (this.#label) {
      const items = this.#plural.select(count) === 'one' ? this.dataset.itemsOne : this.dataset.itemsOther;
      this.#label.textContent = `${this.dataset.label}, ${count} ${items}`;
    }
  }

  #onUpdate = (event) => {
    const count = event.detail?.cart?.itemCount;
    if (Number.isInteger(count)) this.count = count;
  };

  #onClick = (event) => {
    const drawer = document.querySelector('ut-cart-drawer');
    if (!drawer || typeof drawer.open !== 'function') return;
    event.preventDefault();
    drawer.open(event.target instanceof Element ? event.target.closest('a') : null);
  };
}

if (!customElements.get('ut-cart-count')) customElements.define('ut-cart-count', UtCartCount);
