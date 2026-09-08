import Component, { Topic } from 'component';
import { ESCAPE_KEY_IDENTIFIER } from 'constants';
const STORAGE_ID = 'age-verified';
export const MODAL_ID = 'ageVerifiedModal';
customElements.define('x-age-verification', class extends Component {
    constructor() {
        super();
    }
    modal = null;
    async render() {
        if (this.isVerified)
            return;
        await customElements.whenDefined('x-modal');
        this.modal = document.getElementById(MODAL_ID);
        this.modal.open();
        this.on(this, 'submit', this.handleSubmit);
        this.on(this.modal, 'keydown', this.handleEscapeKey);
        this.sub(Topic.NEWSLETTER_POPUP_OPENED, () => this.modal.refreshLayer(), { global: true, once: true });
    }
    async handleSubmit(e) {
        e.preventDefault();
        window.sessionStorage.setItem(STORAGE_ID, '1');
        await this.modal.close();
        this.destroy();
    }
    handleEscapeKey(e) {
        if (e.key === ESCAPE_KEY_IDENTIFIER) {
            e.preventDefault();
            e.stopPropagation();
        }
    }
    destroy() {
        this.remove();
    }
    get isVerified() {
        return window.sessionStorage.getItem(STORAGE_ID);
    }
});
