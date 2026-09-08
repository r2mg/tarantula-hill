import Component, { Topic } from 'component';
import { assert, toNum } from 'utils';
export const MEDIA_ATTR = 'media-index';
export const VIDEO_ATTR = 'media-type-video';
export const VIDEO_HOST_ATTR = 'video-host';
export const THUMB_IMAGE_INDEX_ATTR = 'thumb-image-index';
export const CURRENT_INDEX_ATTR = 'current-index';
export const CURRENT_IMAGE_INDEX_ATTR = 'current-image-index';
export const THUMBS_ASIDE_ATTR = 'thumbs-aside';
export const VIDEO_AUTOPLAY_ATTR = 'video-autoplay';
customElements.define('x-product-gallery', class extends Component {
    constructor() {
        super();
        this.$element.containerRoot = this.querySelector('[data-product-gallery-element="container-root"]');
        this.$element.track = this.querySelector('[data-product-gallery-element="track"]');
        this.$element.modalImages = this.querySelectorAll('[data-product-gallery-element="modal-images"]');
        this.$element.thumbsCheck = this.querySelectorAll('[data-product-gallery-element="thumbs-check"]');
    }
    currentIndex = null;
    currentImageIndex = null;
    modal = null;
    modalId;
    mediaList;
    mobileMediaItemWidth = 0;
    scrollSnapSupport = false;
    ignoreMobileIntersections = false;
    observer = null;
    render() {
        this.watchViewport = true;
        assert(Boolean(this.$element.track?.childElementCount), "Product doesn't have any medias");
        this.modalId = this.getAttribute('modal-id');
        this.currentImageIndex = toNum(this.getAttribute(CURRENT_IMAGE_INDEX_ATTR));
        this.initModal();
        this.initVideoControl();
        this.on(this, 'change', (e) => {
            e.stopPropagation();
            const target = e.target;
            const activeMediaIndex = toNum(target.value);
            if (activeMediaIndex !== null) {
                this.setCurrentIndex(activeMediaIndex);
                if (this.mobileQuery.matches) {
                    this.scrollToActiveMedia(activeMediaIndex);
                }
            }
            const targetImageIndex = toNum(target.getAttribute(THUMB_IMAGE_INDEX_ATTR));
            if (targetImageIndex !== null) {
                this.setCurrentImageIndex(targetImageIndex);
            }
        });
        this.sub(Topic.PRODUCT_GALLERY_UPDATE, (currentIndex) => {
            if (this.setCurrentIndex(currentIndex)) {
                this.setCurrentThumb();
            }
            if (this.mobileQuery.matches) {
                this.scrollToActiveMedia(currentIndex);
            }
        });
    }
    onMobile() {
        this.mediaList = this.querySelectorAll(`[${MEDIA_ATTR}]`);
        this.mobileMediaItemWidth = this.mediaList.item(0).clientWidth;
        this.scrollSnapSupport = 'onscrollsnapchange' in window;
        this.currentIndex = toNum(this.getAttribute(CURRENT_INDEX_ATTR));
        if (this.currentIndex !== null) {
            this.scrollToActiveMedia(this.currentIndex);
        }
        if (this.scrollSnapSupport) {
            this.on(this.$element.track, 'scrollsnapchange', this.handleSnapChange);
        }
        else {
            if (!this.observer) {
                this.observer = this.createObserver();
            }
            this.mediaList.forEach(media => this.observer.observe(media));
        }
    }
    createObserver() {
        return new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (this.mobileQuery) {
                    if (entry.isIntersecting && !this.ignoreMobileIntersections) {
                        const target = entry.target;
                        const activeIndex = toNum(target.getAttribute(MEDIA_ATTR));
                        if (activeIndex !== null && this.setCurrentIndex(activeIndex)) {
                            this.setCurrentThumb();
                        }
                    }
                }
                if (entry.target.hasAttribute(VIDEO_ATTR)) {
                    const video = entry.target.firstElementChild;
                    const isHTMLVideo = video?.tagName === 'VIDEO';
                    if (!entry.isIntersecting) {
                        if (isHTMLVideo) {
                            this.handleHTMLVideo(video);
                        }
                        else if (video?.tagName === 'IFRAME') {
                            const videoHost = entry.target.getAttribute(VIDEO_HOST_ATTR);
                            this.pauseExternalVideo(video, videoHost);
                        }
                    }
                    if (entry.isIntersecting && this.videoAutoplay && isHTMLVideo) {
                        this.handleHTMLVideo(video, true);
                    }
                }
            });
        }, { root: this.$element.containerRoot, threshold: 0.9 });
    }
    scrollToActiveMedia(index) {
        if (!this.scrollSnapSupport) {
            this.ignoreMobileIntersections = true;
        }
        this.$element.track?.scrollTo({
            left: this.mobileMediaItemWidth * index,
            behavior: 'smooth'
        });
        if (!this.scrollSnapSupport) {
            setTimeout(() => {
                this.ignoreMobileIntersections = false;
            }, 1000);
        }
    }
    handleSnapChange(e) {
        const target = e.snapTargetInline;
        const activeIndex = toNum(target.getAttribute(MEDIA_ATTR));
        if (activeIndex !== null && this.setCurrentIndex(activeIndex)) {
            this.setCurrentThumb();
        }
    }
    initModal() {
        customElements.whenDefined('x-modal').then(() => {
            if (this.modalId) {
                this.modal = document.getElementById(this.modalId);
                this.modal.beforeOpen = this.scrollToModalImage.bind(this);
            }
        });
    }
    initVideoControl() {
        const videos = this.querySelectorAll(`[${VIDEO_ATTR}]`);
        if (videos.length > 0) {
            if (!this.observer) {
                this.observer = this.createObserver();
            }
            videos.forEach(video => this.observer.observe(video));
        }
    }
    setCurrentThumb() {
        if (this.currentIndex !== undefined && this.currentIndex !== null) {
            const currentThumb = this.$element.thumbsCheck?.item(this.currentIndex);
            if (currentThumb) {
                currentThumb.checked = true;
                if (this.thumbsAside && !this.mobileQuery.matches) {
                    currentThumb.scrollIntoView({
                        block: 'nearest',
                        behavior: 'smooth'
                    });
                }
                const currentThumbImageIndex = toNum(currentThumb.getAttribute(THUMB_IMAGE_INDEX_ATTR));
                if (currentThumbImageIndex !== null) {
                    this.setCurrentImageIndex(currentThumbImageIndex);
                }
            }
        }
    }
    setCurrentIndex(currentIndex) {
        if (currentIndex === this.currentIndex) {
            return false;
        }
        this.style.setProperty('--product-gallery-current-index', currentIndex.toString());
        this.currentIndex = currentIndex;
        return true;
    }
    setCurrentImageIndex(currentImageIndex) {
        if (currentImageIndex === this.currentImageIndex) {
            return;
        }
        this.currentImageIndex = currentImageIndex;
        return true;
    }
    scrollToModalImage() {
        if (this.currentImageIndex !== undefined && this.currentImageIndex !== null) {
            const target = this.$element.modalImages?.item(this.currentImageIndex);
            if (target) {
                target.scrollIntoView({
                    block: 'center'
                });
            }
        }
    }
    handleHTMLVideo(video, play = false) {
        play ? video.play() : video.pause();
    }
    pauseExternalVideo(embeddedVideo, videoHost) {
        const videoFrame = embeddedVideo.contentWindow;
        if (videoHost === 'youtube') {
            videoFrame.postMessage('{"event":"command","func":"' + 'pauseVideo' + '","args":""}', '*');
        }
        else if (videoHost === 'vimeo') {
            videoFrame.postMessage('{"method":"pause"}', '*');
        }
    }
    get thumbsAside() {
        return this.hasAttribute(THUMBS_ASIDE_ATTR);
    }
    get videoAutoplay() {
        return this.hasAttribute(VIDEO_AUTOPLAY_ATTR);
    }
});
