import Component, { Topic } from 'component';
import { toNum, } from 'utils';
export const OPTION_POSITION_ATTR = 'data-position';
export const OPTION_MEDIA_POSITION_ATTR = 'data-media-position';
customElements.define('x-product-variant-picker', class extends Component {
    constructor() {
        super();
    }
    productId;
    render() {
        this.productId = this.getAttribute('product-id');
        this.addEventListener('change', (e) => {
            e.stopPropagation();
            const target = e.target;
            const value = target.value;
            if (!value) {
                console.error('value is empty for option picker');
                return;
            }
            const position = toNum(target.getAttribute(OPTION_POSITION_ATTR));
            const mediaPositionData = target.getAttribute(OPTION_MEDIA_POSITION_ATTR);
            let mediaPosition = toNum(mediaPositionData);
            if (mediaPosition !== null) {
                mediaPosition -= 1;
            }
            if (position !== null) {
                this.pub(Topic.PRODUCT_OPTION_CHANGE, {
                    id: value,
                    position,
                    mediaPosition,
                    productId: this.productId
                });
            }
        });
    }
});
