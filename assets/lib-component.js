import pubsub, { Topic, GLOBAL_CONTEXT } from 'pubsub';
import { isFn } from 'utils';
export { Topic };
let CUIDIterator = 0;
const MOBILE_WIDTH_THRESHOLD = '922px';
const SECTION_ID_ATTR = 'section-id';
export default class Component extends HTMLElement {
    pubsub;
    CUID;
    static DEFAULT_CONTEXT_PROP = 'section-id';
    _context;
    unsubList = new Set();
    $element = {};
    $styleProp = {};
    eventsMap = new Map();
    _sectionId;
    desktopFired = false;
    mobileFired = false;
    watchViewport = false;
    constructor() {
        super();
        this.pubsub = pubsub;
        this.CUID = `${this.tagName}-${CUIDIterator++}`;
    }
    pub(topic, data, options) {
        this.pubsub.publish(topic, data, {
            uid: this.CUID,
            context: options?.context || this.context || undefined
        });
    }
    on(element, kind, listener, options) {
        const elements = Array.isArray(element) ? element : [element];
        const eventKinds = Array.isArray(kind) ? kind : [kind];
        elements.forEach(el => {
            if (el) {
                eventKinds.forEach(ev => {
                    const listenerArgs = [ev, listener.bind(this), options];
                    if (el instanceof NodeList) {
                        el.forEach(e => {
                            e.addEventListener(...listenerArgs);
                            this.eventsMap.set(e, listenerArgs);
                        });
                    }
                    else {
                        el.addEventListener(...listenerArgs);
                        this.eventsMap.set(el, listenerArgs);
                    }
                });
            }
        });
    }
    sub(topic, callback, options) {
        let context;
        if (options?.global) {
            context = GLOBAL_CONTEXT;
        }
        else {
            context = options?.context || this.context || undefined;
            if (!context) {
                throw new Error(`You are subscring without a context for ${this.CUID}. Set a context or mark subscription as global.`);
            }
        }
        callback = callback.bind(this);
        const unsub = this.pubsub.subscribe(topic, callback, {
            context,
            once: options?.once,
            uid: this.CUID
        });
        this.unsubList.add(unsub);
        return unsub;
    }
    async connectedCallback() {
        if (isFn(this.render)) {
            await this.render();
        }
        if (isFn(this.onDesktop) || isFn(this.onMobile)) {
            if (isFn(this.onDesktop) && !this.mobileQuery.matches) {
                await this.onDesktop();
                this.desktopFired = true;
            }
            if (isFn(this.onMobile) && this.mobileQuery.matches) {
                await this.onMobile();
                this.mobileFired = true;
            }
        }
        if (isFn(this.scrollTimelineFallback) && !('ScrollTimeline' in window)) {
            await this.scrollTimelineFallback();
        }
        if (this.watchViewport) {
            this.mobileQuery.addEventListener('change', async (e) => {
                if (e.matches && isFn(this.onMobile) && !this.mobileFired) {
                    await this.onMobile();
                    this.mobileFired = true;
                }
                if (!e.matches && isFn(this.onDesktop) && !this.desktopFired) {
                    await this.onDesktop();
                    this.desktopFired = true;
                }
            });
        }
    }
    async disconnectedCallback() {
        this.unsubList.forEach(unsub => {
            unsub();
        });
        this.clearEvents();
        await this.destroy();
    }
    clearEvents() {
        this.eventsMap.forEach(([event, listener, options], element) => {
            element.removeEventListener(event, listener, options);
        });
    }
    destroy() { }
    get mobileQuery() {
        return window.matchMedia(`(max-width: ${MOBILE_WIDTH_THRESHOLD})`);
    }
    get context() {
        if (this._context !== undefined) {
            return this._context;
        }
        this._context = this.sectionId;
        return this._context;
    }
    get sectionId() {
        if (this._sectionId === undefined) {
            this._sectionId = this.getAttribute(SECTION_ID_ATTR);
        }
        return this._sectionId;
    }
}
