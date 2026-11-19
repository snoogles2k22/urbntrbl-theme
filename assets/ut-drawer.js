/**
 * <ut-drawer> Spec: design/components/drawer.md
 *
 * Wraps a native modal <dialog class="ut-drawer">. Any element in the document
 * with aria-controls="<drawer id>" toggles it. Platform-agnostic: no ut-api.
 * Extended later by <ut-cart-drawer> (phase E) and <ut-facets> (phase C).
 *
 * Events (bubbling): ut:drawer:open, ut:drawer:close with { detail: { id } }.
 */
export class UtDrawer extends HTMLElement {
  #dialog = null;
  #trigger = null;

  connectedCallback() {
    this.#dialog = this.querySelector(':scope > dialog');
    if (!this.#dialog || !this.id) return;
    this.#dialog.addEventListener('click', this.#onDialogClick);
    this.#dialog.addEventListener('close', this.#onClose);
    document.addEventListener('click', this.#onDocumentClick);
    this.#syncTriggers(false);
  }

  disconnectedCallback() {
    this.#dialog?.removeEventListener('click', this.#onDialogClick);
    this.#dialog?.removeEventListener('close', this.#onClose);
    document.removeEventListener('click', this.#onDocumentClick);
  }

  get isOpen() {
    return Boolean(this.#dialog?.open);
  }

  open(trigger = null) {
    if (!this.#dialog || this.isOpen) return;
    this.#trigger = trigger instanceof HTMLElement ? trigger : document.activeElement;
    this.#dialog.showModal();
    this.#syncTriggers(true);
    this.dispatchEvent(new CustomEvent('ut:drawer:open', { bubbles: true, detail: { id: this.id } }));
  }

  close() {
    if (this.isOpen) this.#dialog.close();
  }

  toggle(trigger = null) {
    if (this.isOpen) this.close();
    else this.open(trigger);
  }

  #triggers() {
    return document.querySelectorAll(`[aria-controls="${CSS.escape(this.id)}"]`);
  }

  #syncTriggers(expanded) {
    for (const el of this.#triggers()) el.setAttribute('aria-expanded', String(expanded));
  }

  #onDocumentClick = (event) => {
    const trigger = event.target instanceof Element
      ? event.target.closest(`[aria-controls="${CSS.escape(this.id)}"]`)
      : null;
    if (!trigger || this.#dialog.contains(trigger)) return;
    event.preventDefault();
    this.toggle(trigger);
  };

  #onDialogClick = (event) => {
    // The <dialog> itself is the overlay; the panel fills only part of it.
    const target = event.target instanceof Element ? event.target : null;
    if (target === this.#dialog || target?.closest('[data-drawer-close]')) this.close();
  };

  #onClose = () => {
    this.#syncTriggers(false);
    const trigger = this.#trigger;
    this.#trigger = null;
    if (trigger?.isConnected) trigger.focus();
    this.dispatchEvent(new CustomEvent('ut:drawer:close', { bubbles: true, detail: { id: this.id } }));
  };
}

if (!customElements.get('ut-drawer')) customElements.define('ut-drawer', UtDrawer);
