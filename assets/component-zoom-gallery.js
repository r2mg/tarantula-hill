import Component from 'component';
import { toNum, assert } from 'utils';
export const ITEM_ATTR = 'data-scroll-item';
customElements.define('x-zoom-gallery', class extends Component {
    constructor() {
        super();
    }
    prevIndex = 0;
    slides;
    obs;
    observerHandled = false;
    onMobile() {
        this.handleObserver();
    }
    scrollTimelineFallback() {
        this.handleObserver();
    }
    handleObserver() {
        if (this.observerHandled) {
            return;
        }
        this.slides = this.querySelectorAll(`[${ITEM_ATTR}]`);
        this.obs = new IntersectionObserver(this.intersectionHandler.bind(this), {
            threshold: 0.5
        });
        this.slides.forEach(s => {
            assert(this.obs, 'Observer is not defined');
            this.obs.observe(s);
        });
        this.observerHandled = true;
    }
    intersectionHandler(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const index = toNum(target.getAttribute(ITEM_ATTR));
                if (index === null) {
                    console.error(`Invalid observed slide`);
                    return;
                }
                if (index !== this.prevIndex) {
                    this.style.setProperty('--zoom-gallery-active-item', String(index));
                    this.prevIndex = index;
                }
            }
        });
    }
    destroy() {
        this.obs?.disconnect();
    }
});
