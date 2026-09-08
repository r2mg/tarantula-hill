import Component from 'component';
customElements.define('x-navbar', class extends Component {
    constructor() {
        super();
    }
    anchor = null;
    render() {
        document.documentElement.style.setProperty('--glob-header-height', `${this.offsetHeight}px`);
    }
    scrollTimelineFallback() {
        this.anchor = document.createElement('div');
        document.body.prepend(this.anchor);
        const observer = new IntersectionObserver(([entry]) => {
            this.classList.toggle('navbar--no-overlap-fallback', !entry.isIntersecting);
        });
        observer.observe(this.anchor);
    }
});
