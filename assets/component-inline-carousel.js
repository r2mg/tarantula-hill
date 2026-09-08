import Component, { Topic } from 'component';
customElements.define('x-inline-carousel', class extends Component {
    constructor() {
        super();
        this.$element.view = this.querySelector('[data-inline-carousel-element="view"]');
        this.$element.track = this.querySelector('[data-inline-carousel-element="track"]');
        this.$element.navPrev = this.querySelector('[data-inline-carousel-element="nav-prev"]');
        this.$element.navNext = this.querySelector('[data-inline-carousel-element="nav-next"]');
    }
    currentItem = 0;
    itemsCount = 0;
    columns = 0;
    endOffset;
    items = [];
    render() {
        this.watchViewport = true;
        this.itemsCount = Number(this.getAttribute('items-count'));
        this.columns = Number(this.getAttribute('columns'));
    }
    onMobile() {
        if (!('onscrollsnapchange' in window)) {
            this.classList.add('inline-carousel--nosnap');
            return;
        }
        this.$element.track?.childNodes.forEach(node => {
            if (node instanceof Element && (node.tagName !== 'LINK' && node.tagName !== 'SCRIPT')) {
                this.items.push(node);
            }
        });
        this.on(this.$element.view, 'scrollsnapchange', this.handleSnapChange);
        this.sub(Topic.CAROUSEL_PAGINATION_UPDATE, index => {
            const target = this.items[index];
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'start' });
            }
        });
    }
    handleSnapChange(e) {
        const target = e.snapTargetInline;
        const index = this.items.indexOf(target);
        if (index >= 0) {
            this.pub(Topic.CAROUSEL_PAGINATION_SET, index);
        }
    }
    onDesktop() {
        this.endOffset = this.itemsCount - this.columns;
        this.checkOffsets();
        this.on(this.$element.navPrev, 'click', () => {
            this.updatePosition(-1);
        });
        this.on(this.$element.navNext, 'click', () => {
            this.updatePosition(1);
        });
    }
    checkOffsets() {
        this.classList.toggle('inline-carousel--disable-prev', this.currentItem <= 0);
        this.classList.toggle('inline-carousel--disable-next', this.currentItem >= this.endOffset);
    }
    updatePosition(direction) {
        this.currentItem += direction;
        this.checkOffsets();
        this.style.setProperty('--inline-carousel-current-index', this.currentItem.toString());
    }
});
