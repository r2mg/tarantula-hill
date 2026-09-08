import Component, { Topic } from 'component';
import { replaceContent, assert, uuid, toNum } from 'utils';
import { CART_DRAWER_CONTENT_ID, ReqSection, ENTER_KEY_IDENTIFIER } from 'constants';
export const LINE_ITEM_DATA_ATTR = 'data-line-item';
export const NOTES_TEXT_DATA_ATTR = 'data-cart-notes-text';
export const MODAL_ID_ATTR = 'modal-id';
export const NOTES_OPEN_ID_ATTR = 'notes-open-checkbox';
export const NOTES_CLOSE_DATA_ATTR = 'data-notes-close-checkbox';
export const NOTES_OPEN_DATA_ATTR = 'data-cart-notes-open';
customElements.define('x-cart-drawer', class extends Component {
    constructor() {
        super();
        this.$element.content = this.querySelector('[data-cart-drawer-element="content"]');
    }
    modal;
    TUID = null;
    closeNotesCheckbox = null;
    openNotesCheckbox = null;
    notesText = null;
    enterKeyPressHandler = this.handleEnterKeypress.bind(this);
    render() {
        this.modal = document.getElementById(this.getAttribute(MODAL_ID_ATTR));
        assert(this.modal, `Cart drawer is missing dialog element`);
        this.on(this, 'change', this.handleCartChange);
        this.notesText = this.querySelector(`[${NOTES_TEXT_DATA_ATTR}]`);
        if (this.notesText) {
            this.updateCartNotesFlow();
        }
        this.sub(Topic.CART_UPDATE, ({ data, error, TUID }) => {
            if (this.TUID && this.TUID === TUID) {
                this.loading(false);
            }
            if (error) {
            }
            if (data) {
                const { sections, openDrawer } = data;
                const targetDoc = sections[ReqSection.CART_DRAWER];
                if (targetDoc && this.updateContent(targetDoc)) {
                    if (openDrawer) {
                        this.modal.open();
                    }
                    if (this.notesText) {
                        this.updateCartNotesFlow();
                    }
                }
            }
        }, { global: true });
        this.sub(Topic.NEWSLETTER_POPUP_OPENED, () => this.modal.refreshLayer(), { global: true, once: true });
    }
    loading(state) {
        this.classList.toggle('cart-drawer--loading', state);
    }
    async handleCartChange(e) {
        const target = e.target;
        if (!target) {
            return;
        }
        if (target.hasAttribute(NOTES_TEXT_DATA_ATTR)) {
            this.pub(Topic.CART_NOTES, target.value);
            return;
        }
        if (target.hasAttribute(NOTES_CLOSE_DATA_ATTR)) {
            this.openNotesCheckbox.checked = false;
            target.checked = false;
            return;
        }
        const lineItem = target.getAttribute(LINE_ITEM_DATA_ATTR);
        if (!lineItem) {
            return;
        }
        const value = toNum(target.value);
        if (value === null) {
            console.error('Invalid value');
            return;
        }
        this.TUID = uuid();
        this.pub(Topic.CART_CHANGE, {
            TUID: this.TUID,
            id: lineItem,
            qty: value
        });
        this.loading(true);
    }
    updateContent(updatedDoc) {
        const updatedContent = updatedDoc.getElementById(CART_DRAWER_CONTENT_ID);
        if (!updatedContent) {
            console.error('No cart drawer container within response section');
            return false;
        }
        replaceContent(this.$element.content, updatedContent, true);
        return true;
    }
    handleEnterKeypress(e) {
        if (e.key === ENTER_KEY_IDENTIFIER) {
            const target = e.currentTarget;
            e.preventDefault();
            e.stopPropagation();
            target.checked = !target.checked;
            if (target !== this.openNotesCheckbox) {
                this.openNotesCheckbox.checked = false;
            }
            else {
                this.notesText?.focus();
            }
        }
    }
    updateCartNotesFlow() {
        [this.closeNotesCheckbox, this.openNotesCheckbox].forEach(el => {
            el && el.removeEventListener('keypress', this.enterKeyPressHandler);
        });
        this.closeNotesCheckbox = this.querySelector(`[${NOTES_CLOSE_DATA_ATTR}]`);
        this.openNotesCheckbox = this.querySelector(`[${NOTES_OPEN_DATA_ATTR}]`);
        [this.closeNotesCheckbox, this.openNotesCheckbox].forEach(el => {
            el && el.addEventListener('keypress', this.enterKeyPressHandler);
        });
    }
});
