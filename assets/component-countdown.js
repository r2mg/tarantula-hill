import Component from 'component';
import { toNum, assert } from 'utils';
export const TIME_ATTR = 'time';
const SHORT_LIMIT = 59;
const HOURS_LIMIT = 23;
const SECOND_INTERVAL = 1000;
var Time;
(function (Time) {
    Time[Time["SECOND"] = 0] = "SECOND";
    Time[Time["MINUTE"] = 1] = "MINUTE";
    Time[Time["HOUR"] = 2] = "HOUR";
    Time[Time["DAY"] = 3] = "DAY";
})(Time || (Time = {}));
;
customElements.define('x-countdown', class extends Component {
    constructor() {
        super();
    }
    diff;
    timeFn;
    interval;
    render() {
        this.diff = toNum(this.getAttribute(TIME_ATTR));
        assert(this.diff !== null, `Invalid time`);
        this.init();
        this.interval = setInterval(() => {
            if (this.setTime(Time.SECOND) === SHORT_LIMIT) {
                if (this.setTime(Time.MINUTE) === SHORT_LIMIT) {
                    if (this.setTime(Time.HOUR) === HOURS_LIMIT) {
                        this.setTime(Time.DAY);
                    }
                }
            }
            this.diff -= 1;
        }, SECOND_INTERVAL);
    }
    init() {
        this.timeFn = {
            [Time.SECOND]: () => this.diff % 60,
            [Time.MINUTE]: () => Math.floor((this.diff % 3600 / 60)),
            [Time.HOUR]: () => Math.floor((this.diff % 86400 / 3600)),
            [Time.DAY]: () => Math.floor((this.diff / 86400))
        };
        [
            Time.SECOND,
            Time.MINUTE,
            Time.HOUR,
            Time.DAY
        ].map(this.setTime.bind(this));
    }
    setTime(time) {
        const value = this.timeFn[time]();
        switch (time) {
            case Time.SECOND:
                this.style.setProperty('--countdown-seconds', (value).toString());
                break;
            case Time.MINUTE:
                this.style.setProperty('--countdown-minutes', value.toString());
                break;
            case Time.HOUR:
                this.style.setProperty('--countdown-hours', value.toString());
                break;
            case Time.DAY:
                this.style.setProperty('--countdown-days', value.toString());
                break;
            default:
                throw new Error('Invalid time');
        }
        return value;
    }
    destroy() {
        clearInterval(this.interval);
    }
});
