import Component from 'component';
customElements.define('x-horizontal-scroller', class extends Component {
    constructor() {
        super();
        this.$element.frame = this.querySelector('[data-horizontal-scroller-element="frame"]');
        this.$element.target = this.querySelector('[data-horizontal-scroller-element="target"]');
    }
    transformHandler;
    absOffsetTop = 0;
    scrollTimelineFallback() {
        if (this.mobileQuery.matches)
            return;
        this.absOffsetTop = this.getBoundingClientRect().top + window.scrollY;
        this.style.setProperty('--horizontal-scroller-root-height', `${this.$element.target?.clientWidth}px`);
        this.transformHandler = this.setTransformPercentage.bind(this);
        const observer = new IntersectionObserver(([entry]) => {
            entry.isIntersecting
                ? window.addEventListener('scroll', this.transformHandler)
                : window.removeEventListener('scroll', this.transformHandler);
        }, { threshold: 0.95 });
        observer.observe(this.$element.frame);
    }
    setTransformPercentage() {
        const stickyScrolledPercentage = (window.scrollY - this.absOffsetTop) / (this.clientHeight - window.innerHeight) * 100;
        const transformValue = Math.max(0, Math.min(stickyScrolledPercentage, 100));
        this.style.setProperty('--horizontal-scroller-scroll-percentage', String(transformValue));
    }
});
