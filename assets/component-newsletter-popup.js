import Component, { Topic } from 'component';
import { assert, isFn, toNum } from 'utils';
const STORAGE_ID = 'newsletter-popup-shown';
export const MODAL_ID = 'popup-newsletter-modal';
export const TYPE_ATTR = 'popup-type';
export const DELAY_ATTR = 'popup-delay';
export const SESSION_ATTR = 'single-session';
customElements.define('x-newsletter-popup', class extends Component {
    constructor() {
        super();
        this.$element.close = this.querySelector('[data-newsletter-popup-element="close"]');
        this.$element.popover = this.querySelector('[data-newsletter-popup-element="popover"]');
    }
    displayType;
    target;
    delay;
    open;
    close;
    async render() {
        if (this.hasAttribute(SESSION_ATTR) && window.sessionStorage.getItem(STORAGE_ID)) {
            return;
        }
        assert(this.$element.close, `close element is not defined`);
        this.displayType = this.getAttribute(TYPE_ATTR);
        assert(this.displayType === 'modal' || this.displayType === 'popover', `Invalid display type ${this.displayType}`);
        this.delay = toNum(this.getAttribute(DELAY_ATTR));
        assert(this.delay !== null, `Invalid delay attribute`);
        if (this.displayType === 'modal') {
            await customElements.whenDefined('x-modal');
            this.target = this.querySelector(`#${MODAL_ID}`);
            this.open = this.target.open;
            this.close = this.target.close;
        }
        else {
            this.target = this.$element.popover;
            this.open = this.target.showPopover;
            this.close = this.target.hidePopover;
        }
        assert(this.target, `Invalid popup target`);
        assert(isFn(this.open), `Invalid open method`);
        assert(isFn(this.close), `Invalid close method`);
        this.open = this.open.bind(this.target);
        this.close = this.close.bind(this.target);
        this.on(this.$element.close, 'click', () => {
            this.close();
        });
        setTimeout(() => {
            this.open();
            window.sessionStorage.setItem(STORAGE_ID, '1');
            this.pub(Topic.NEWSLETTER_POPUP_OPENED, true);
        }, this.delay * 1000);
    }
});
