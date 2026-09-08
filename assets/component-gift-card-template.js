import Component, { Topic } from 'component';
export const COPY_MSG_ATTR = 'fallback-msg';
export const GIFT_CARD_CODE_ID = 'gift-card-code';
export const COPY_BUTTON_ID = 'copy-button';
customElements.define('x-gift-card-template', class extends Component {
    constructor() {
        super();
    }
    $giftCardCode;
    $copyButton;
    render() {
        this.$giftCardCode = document.getElementById(GIFT_CARD_CODE_ID);
        this.$copyButton = document.getElementById(COPY_BUTTON_ID);
        this.on(this.$copyButton, 'click', () => {
            navigator.clipboard.writeText(this.$giftCardCode.innerText).then(() => {
                this.pub(Topic.SHOW_TOAST, {
                    type: 'success',
                    msg: this.$giftCardCode.getAttribute(COPY_MSG_ATTR)
                });
            });
        });
    }
});
