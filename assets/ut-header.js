/**
 * <ut-header> Spec: design/components/header.md
 *
 * Opening, closing and focus of the mobile menu are handled by <ut-drawer>.
 * The header only closes that menu when the viewport reaches the desktop
 * breakpoint (md = 768px, design/tokens/tokens.json breakpoint.md).
 */
const DESKTOP_QUERY = '(min-width: 768px)';

class UtHeader extends HTMLElement {
  #media = window.matchMedia(DESKTOP_QUERY);

  connectedCallback() {
    this.#media.addEventListener('change', this.#onMediaChange);
  }

  disconnectedCallback() {
    this.#media.removeEventListener('change', this.#onMediaChange);
  }

  #onMediaChange = (event) => {
    if (!event.matches) return;
    const drawer = this.querySelector('ut-drawer');
    if (drawer && typeof drawer.close === 'function') drawer.close();
  };
}

if (!customElements.get('ut-header')) customElements.define('ut-header', UtHeader);
