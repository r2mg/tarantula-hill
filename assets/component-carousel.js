import Component, { Topic } from 'component';
const ATTR_AUTOPLAY = 'autoplay';
customElements.define('x-carousel', class extends Component {
    constructor() {
        super();
        this.$element.navPrev = this.querySelector('[data-carousel-element="nav-prev"]');
        this.$element.navNext = this.querySelector('[data-carousel-element="nav-next"]');
    }
    currentItem = 0;
    itemsCount = 0;
    touching = false;
    delta = 0;
    autoplayInterval;
    autoplayTime = 0;
    pTouch = 0;
    render() {
        this.autoplayTime = Number(this.getAttribute(ATTR_AUTOPLAY)) * 1000;
        this.on(this.$element.navPrev, 'click', () => {
            this.updatePosition(-1);
        });
        this.on(this.$element.navNext, 'click', () => {
            this.updatePosition(1);
        });
        this.sub(Topic.CAROUSEL_PAGINATION_UPDATE, (index) => {
            this.setPosition(index);
        });
        this.on(this, 'animationend', (e) => {
            e.stopPropagation();
            this.classList.remove('carousel--animate');
            this.delta = 0;
            this.style.setProperty('--carousel-delta', this.delta.toString());
        });
        this.itemsCount = Number(this.getAttribute('items-count'));
        this.startAutoplay();
    }
    onMobile() {
        this.on(this, 'touchstart', () => {
            this.touching = true;
        });
        this.on(this, 'touchmove', (e) => {
            if (!this.touching) {
                return;
            }
            this.stopAutoplay();
            const [touch] = e.touches;
            if (this.pTouch) {
                this.delta += (touch.pageX - this.pTouch);
                this.style.setProperty('--carousel-delta', String(this.delta));
                this.style.setProperty('--carousel-direction', String(Math.sign(this.delta)));
                if (this.delta > 0) {
                    let position = this.currentItem - 1;
                    if (position < 0) {
                        position = this.itemsCount - 1;
                    }
                    this.style.setProperty('--carousel-current-index', String(position));
                    this.style.setProperty('--carousel-shift', String(-1));
                }
                else {
                    this.style.setProperty('--carousel-current-index', String(this.currentItem));
                    this.style.setProperty('--carousel-shift', String(0));
                }
            }
            this.pTouch = touch.pageX;
        });
        this.on(this, 'touchend', () => {
            this.style.setProperty('--carousel-current-index', String(this.currentItem));
            this.touching = false;
            this.pTouch = 0;
            this.style.setProperty('--carousel-shift', String(0));
            if (this.delta !== 0) {
                this.updatePosition(0 - Math.sign(this.delta));
            }
        });
    }
    updatePosition(direction, autoplay = false) {
        this.setPosition(this.currentItem + direction, autoplay);
        this.pub(Topic.CAROUSEL_PAGINATION_SET, this.currentItem);
    }
    setPosition(position, autoplay = false) {
        if (position === this.currentItem) {
            return;
        }
        const direction = position - this.currentItem;
        if (position >= this.itemsCount) {
            this.currentItem = 0;
        }
        else if (position < 0) {
            this.currentItem = this.itemsCount - 1;
        }
        else {
            this.currentItem = position;
        }
        this.classList.add('carousel--animate');
        this.style.setProperty('--carousel-direction', direction.toString());
        this.style.setProperty('--carousel-current-index', this.currentItem.toString());
        if (!autoplay && this.autoplayTime > 0) {
            this.resetAutoplay();
        }
    }
    startAutoplay() {
        if (this.autoplayTime > 0) {
            this.autoplayInterval = setInterval(() => {
                this.updatePosition(1, true);
            }, this.autoplayTime);
        }
    }
    resetAutoplay() {
        this.stopAutoplay();
        this.startAutoplay();
    }
    stopAutoplay() {
        if (this.autoplayInterval) {
            clearInterval(this.autoplayInterval);
        }
    }
    destroy() {
        this.stopAutoplay();
    }
});
