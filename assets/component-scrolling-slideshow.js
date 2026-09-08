import Component from 'component';
import { toNum, assert } from 'utils';
export const SLIDE_ATTR = 'data-scroll-slide';
customElements.define('x-scrolling-slideshow', class extends Component {
    constructor() {
        super();
    }
    prevIndex = 0;
    slides;
    obs;
    scrollTimelineFallback() {
        this.slides = this.querySelectorAll(`[${SLIDE_ATTR}]`);
        this.obs = new IntersectionObserver(this.intersectionHandler.bind(this), {
            threshold: 0.5
        });
        this.slides.forEach(s => {
            assert(this.obs, `Observer is not defined`);
            this.obs.observe(s);
        });
    }
    intersectionHandler(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                const index = toNum(target.getAttribute(SLIDE_ATTR));
                if (index === null) {
                    console.error(`Invalid observed slide`);
                    return;
                }
                if (index !== this.prevIndex) {
                    this.style.setProperty('--scrolling-slideshow-active-item', String(index));
                    this.prevIndex = index;
                }
            }
        });
    }
    destroy() {
        this.obs?.disconnect();
    }
});
