/**
 * <ut-copy-button> Spec: design/components/copy-button.md
 *
 * Copies `value` and reports the result in an aria-live="polite" region.
 * Fallback chain (browsers reject navigator.clipboard.writeText depending on
 * context, notably Safari):
 *   1. navigator.clipboard.writeText(value)
 *   2. select `target` + document.execCommand('copy')
 *   3. manual hint (failed-label); the selection stays so Cmd/Ctrl + C works
 * Progressive enhancement: the trigger button is rendered `hidden` and only
 * shown when path 1 or 2 can exist. Without JS the text stays selectable
 * (user-select: all on the page).
 * Browser API only, so it does not go through ut-api.js (no commerce platform).
 *
 * Attributes: value (text to copy), copied-label, failed-label (status texts),
 *             target (optional id of the element whose text is selected)
 * Event (bubbling, success only): ut:copy-button:copied with { detail: { value } }
 */
const COPIED_RESET_MS = 2000;
const FAILED_RESET_MS = 6000;

const canWriteText = () => typeof navigator.clipboard?.writeText === 'function';

const canExecCopy = () => {
  try {
    return document.queryCommandSupported?.('copy') === true;
  } catch {
    return false;
  }
};

class UtCopyButton extends HTMLElement {
  #trigger = null;
  #status = null;
  #timer = 0;

  connectedCallback() {
    this.#trigger = this.querySelector('.ut-copy-button__trigger');
    this.#status = this.querySelector('.ut-copy-button__status');
    if (!this.#trigger || !(canWriteText() || canExecCopy())) return;
    this.#trigger.hidden = false;
    this.#trigger.addEventListener('click', this.#onClick);
  }

  disconnectedCallback() {
    this.#trigger?.removeEventListener('click', this.#onClick);
    window.clearTimeout(this.#timer);
  }

  #onClick = async () => {
    const value = this.getAttribute('value') ?? '';

    if (canWriteText()) {
      try {
        await navigator.clipboard.writeText(value);
        this.#succeed(value);
        return;
      } catch (err) {
        console.debug('[ut-copy-button]', err?.name);
      }
    }

    if (this.#copyViaSelection(value)) {
      this.#succeed(value);
      return;
    }

    this.#announce(this.getAttribute('failed-label') ?? '', FAILED_RESET_MS, 'failed');
  };

  #succeed(value) {
    this.#announce(this.getAttribute('copied-label') ?? '', COPIED_RESET_MS, 'copied');
    this.dispatchEvent(new CustomEvent('ut:copy-button:copied', { bubbles: true, detail: { value } }));
  }

  /**
   * Path 2. Selects the target and runs execCommand('copy'). A one-shot copy
   * listener puts the raw value on the clipboard, because the visible text may
   * be formatted (gift card codes are shown with spaces).
   */
  #copyViaSelection(value) {
    if (!this.#selectTarget()) return false;
    const onCopy = (event) => {
      if (!event.clipboardData) return;
      event.clipboardData.setData('text/plain', value);
      event.preventDefault();
    };
    document.addEventListener('copy', onCopy, { once: true });
    let copied = false;
    try {
      copied = document.execCommand('copy') === true;
    } catch {
      copied = false;
    }
    document.removeEventListener('copy', onCopy);
    return copied;
  }

  #announce(text, resetAfterMs, state) {
    if (!this.#status) return;
    window.clearTimeout(this.#timer);
    this.#status.textContent = text;
    this.dataset.state = state;
    this.#timer = window.setTimeout(() => {
      this.#status.textContent = '';
      delete this.dataset.state;
    }, resetAfterMs);
  }

  /** Selects the target's text and keeps the selection. Returns false without a target. */
  #selectTarget() {
    const target = document.getElementById(this.getAttribute('target') ?? '');
    if (!target) return false;
    const range = document.createRange();
    range.selectNodeContents(target);
    const selection = window.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    return true;
  }
}

if (!customElements.get('ut-copy-button')) customElements.define('ut-copy-button', UtCopyButton);
