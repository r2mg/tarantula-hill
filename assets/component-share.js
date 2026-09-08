import Component, { Topic } from 'component';
export const FALLBACK_MSG_ATTR = 'fallback-msg';
export const URL_ATTR = 'url-to-share';
customElements.define('x-share', class extends Component {
    constructor() {
        super();
    }
    url;
    render() {
        this.url = this.getAttribute(URL_ATTR) || document.location.href;
        if ('share' in window.navigator) {
            this.on(this, 'click', () => {
                window.navigator.share({
                    url: this.url,
                    title: document.title
                });
            });
        }
        else {
            this.on(this, 'click', () => {
                window.navigator.clipboard.writeText(this.url).then(() => {
                    this.pub(Topic.SHOW_TOAST, {
                        type: 'success',
                        msg: this.getAttribute(FALLBACK_MSG_ATTR)
                    });
                });
            });
        }
    }
});
