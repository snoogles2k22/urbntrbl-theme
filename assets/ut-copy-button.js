/**
 * <ut-copy-button> Spec: design/components/copy-button.md
 *
 * Copies `value` with navigator.clipboard.writeText and reports the result in
 * an aria-live="polite" region. Progressive enhancement: the trigger button is
 * rendered `hidden` and only shown when the Clipboard API exists. Without JS
 * the text stays selectable (user-select: all on the page).
 * Browser API only, so it does not go through ut-api.js (no commerce platform).
 *
 * Attributes: value (text to copy), copied-label (status text),
 *             target (optional id of the element whose text is selected if
 *             writeText is rejected)
 * Event (bubbling): ut:copy-button:copied with { detail: { value } }
 */
const RESET_AFTER_MS = 2000;

class UtCopyButton extends HTMLElement {
  #trigger = null;
  #status = null;
  #timer = 0;

  connectedCallback() {
    this.#trigger = this.querySelector('.ut-copy-button__trigger');
    this.#status = this.querySelector('.ut-copy-button__status');
    if (!this.#trigger || typeof navigator.clipboard?.writeText !== 'function') return;
    this.#trigger.hidden = false;
    this.#trigger.addEventListener('click', this.#onClick);
  }

  disconnectedCallback() {
    this.#trigger?.removeEventListener('click', this.#onClick);
    window.clearTimeout(this.#timer);
  }

  #onClick = async () => {
    const value = this.getAttribute('value') ?? '';
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      this.#selectTarget();
      return;
    }
    this.#announce(this.getAttribute('copied-label') ?? '');
    this.dispatchEvent(new CustomEvent('ut:copy-button:copied', { bubbles: true, detail: { value } }));
  };

  #announce(text) {
    if (!this.#status) return;
    window.clearTimeout(this.#timer);
    this.#status.textContent = text;
    this.dataset.state = 'copied';
    this.#timer = window.setTimeout(() => {
      this.#status.textContent = '';
      delete this.dataset.state;
    }, RESET_AFTER_MS);
  }

  #selectTarget() {
    const target = document.getElementById(this.getAttribute('target') ?? '');
    if (!target) return;
    const range = document.createRange();
    range.selectNodeContents(target);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
  }
}

if (!customElements.get('ut-copy-button')) customElements.define('ut-copy-button', UtCopyButton);
