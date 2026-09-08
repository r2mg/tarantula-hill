export function add(x, y) {
    return x + y;
}
export function mult(x, y) {
    return x * y;
}
export function isElementEmpty(element) {
    let target;
    if ('content' in element) {
        target = element.content;
    }
    else {
        target = element;
    }
    return Boolean(target.textContent?.trim() === '');
}
export function parseHTML(text) {
    return new DOMParser().parseFromString(text, 'text/html');
}
export function fetchHTML(URL) {
    return fetch(URL)
        .then(res => res.text())
        .then(text => parseHTML(text))
        .catch(e => console.error(e));
}
export function replaceContent(from, to, forceReplace = false) {
    if (to === null) {
        from.replaceChildren();
        return;
    }
    const target = 'content' in to ? to.content : to;
    if (!from.isEqualNode(target) || forceReplace) {
        from.replaceChildren(...target.cloneNode(true).childNodes);
    }
}
export const debounce = (fn, wait) => {
    let t;
    return (...args) => {
        clearTimeout(t);
        t = setTimeout(() => fn.apply(this, args), wait);
    };
};
export const isFn = (fn) => {
    return fn instanceof Function;
};
export const toNum = (v, forceInt = false) => {
    if (typeof v === 'number') {
        return forceInt ? Math.floor(v) : v;
    }
    if (v === undefined) {
        return null;
    }
    if (v === null) {
        return null;
    }
    if (v.trim() === '') {
        return null;
    }
    if (typeof v === 'boolean') {
        return null;
    }
    if (Array.isArray(v)) {
        return null;
    }
    const res = Number(v);
    if (isNaN(res)) {
        return null;
    }
    return forceInt ? Math.floor(res) : res;
};
export const assert = (condition, msg) => {
    if (!condition) {
        throw new Error(msg);
    }
};
const FETCH_OPTIONS = [
    'body',
    'method',
    'headers'
];
export const fetchDoc = async (URL, options) => {
    try {
        const fetchParams = {};
        FETCH_OPTIONS.forEach(option => {
            if (options && options[option]) {
                fetchParams[option] = options[option];
            }
        });
        if (isFn(options?.before)) {
            options.before();
        }
        if (options?.sectionId) {
            if (!options.params) {
                options.params = {};
            }
            options.params['section_id'] = options.sectionId;
        }
        const res = await fetch(options?.params ? `${URL}?${new URLSearchParams(options.params)}` : URL, fetchParams);
        if (options?.nullOn404 && res.status === 404) {
            if (isFn(options.after)) {
                options.after();
            }
            return null;
        }
        const doc = await res.text();
        if (isFn(options?.after)) {
            options.after();
        }
        return parseHTML(doc);
    }
    catch (error) {
        console.error(error);
        if (isFn(options?.after)) {
            options.after();
        }
    }
};
export function updateWindowHistory(params) {
    window.history.pushState({}, '', `${window.location.pathname}?${params}`);
}
export function uuid() {
    return Math.random().toString(36).slice(-6);
}
export function qtyInputOverflowHandle(target) {
    if (target.max && target.validity.rangeOverflow) {
        target.value = target.max;
        return;
    }
    const qty = toNum(target.value, true);
    if (qty) {
        target.value = qty.toString();
    }
}
const loadedScripts = new Set();
export function docScriptLoader(doc) {
    const scripts = doc.querySelectorAll('script[type="module"]');
    scripts.forEach(script => {
        if (!script.src || script.type !== 'module' || loadedScripts.has(script.src)) {
            return;
        }
        const docScript = document.createElement('script');
        docScript.type = 'module';
        docScript.src = script.src;
        document.head.appendChild(docScript);
        loadedScripts.add(script.src);
    });
}
export function setDocumentClickHandler(cb) {
    let docClickListening = false;
    return (state) => {
        if (state && !docClickListening) {
            setTimeout(() => {
                document.addEventListener('click', cb);
                docClickListening = true;
            }, 20);
        }
        else if (!state && docClickListening) {
            docClickListening = false;
            document.removeEventListener('click', cb);
        }
    };
}
