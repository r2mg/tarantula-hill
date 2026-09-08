import Component from 'component';
customElements.define('x-bg-video', class extends Component {
    constructor() {
        super();
        this.$element.video = this.querySelector('[data-bg-video-element="video"]');
    }
    obs;
    render() {
        if (this.$element.video) {
            this.$element.video.playsInline = true;
            this.obs = new IntersectionObserver(([entry]) => {
                const target = entry.target;
                if (entry.isIntersecting) {
                    target.play();
                }
                else {
                    target.pause();
                }
            });
            this.obs.observe(this.$element.video);
        }
    }
    destroy() {
        this.obs?.disconnect();
    }
});
