import Component from 'component';
import { ENTER_KEY_IDENTIFIER } from 'constants';
customElements.define('x-video-player', class extends Component {
    constructor() {
        super();
        this.$element.trigger = this.querySelector('[data-video-player-element="trigger"]');
        this.$element.template = this.querySelector('[data-video-player-element="template"]');
    }
    render() {
        this.on(this.$element.trigger, 'click', this.loadVideo, { once: true });
        this.on(this.$element.trigger, 'keydown', this.handleEnterKey, { once: true });
    }
    loadVideo() {
        if (!this.loaded) {
            const template = this.$element.template;
            this.appendChild(template.content.firstElementChild?.cloneNode(true));
            this.setAttribute('loaded', '');
        }
    }
    handleEnterKey(e) {
        if (e.key === ENTER_KEY_IDENTIFIER && e.target === this.$element.trigger) {
            e.preventDefault();
            e.stopPropagation();
            this.loadVideo();
        }
    }
    get loaded() {
        return this.hasAttribute('loaded');
    }
});
