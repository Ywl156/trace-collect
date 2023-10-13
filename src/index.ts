import { DefaultOptions, Options } from './types/index';

// 返回一个新函数，为history内的方法添加了事件支持
function createHistoryEvent<T extends keyof History>(type: T) {
  const origin = history[type];
  return function (this: any) {
    origin.apply(this, arguments);
    const event = new Event(type);
    window.dispatchEvent(event);
  };
}

export default class Collect {
  public data: Options;
  constructor(options: Options) {
    this.data = Object.assign(
      {
        historyCollect: false,
        hashCollect: false,
        domCollect: false,
        jsError: false,
      },
      options
    );
    this.installCollect();
  }

  public setUid<T extends DefaultOptions['uid']>(uid: T) {
    this.data.uid = uid;
  }

  public setExtra<T extends DefaultOptions['extra']>(extra: T) {
    this.data.extra = extra;
  }

  public sendCollect<T>(data: T) {
    this.reportCollect(data);
  }

  private reportCollect<T>(data: T) {
    const body = Object.assign({}, this.data, data, { time: Date.now() });
    const blob = new Blob([JSON.stringify(body)], { type: 'application/x-www-form-urlencoded' });
    navigator.sendBeacon(this.data.requestUrl, blob);
  }

  private installCollect() {
    if (this.data.historyCollect) {
      history['pushState'] = createHistoryEvent('pushState');
      history['replaceState'] = createHistoryEvent('replaceState');
      this.historyReport(['pushState', 'replaceState', 'popstate']);
    }
    if (this.data.hashCollect) {
      this.hashReport();
    }
    if (this.data.domCollect) {
      this.domReport();
    }
    if (this.data.jsError) {
      this.jsErrorReport();
    }
  }

  private historyReport(eventList: string[]) {
    eventList.forEach(eventKey => {
      window.addEventListener(eventKey, () => {
        this.reportCollect({
          event: eventKey,
          key: 'history',
          href: location.href,
        });
      });
    });
  }

  private hashReport() {
    window.addEventListener('hashchange', ev => {
      this.reportCollect({
        event: 'hashchange',
        key: 'hash',
        hash: location.hash,
        oldUrl: ev.oldURL,
        newUrl: ev.newURL,
      });
    });
  }

  private domReport() {
    const domEventList = ['click', 'dblclick', 'contextmenu', 'mouseout', 'mouseover', 'mousedown', 'mouseup'];
    domEventList.forEach(eventKey => {
      window.addEventListener(eventKey, (e: Event) => {
        const target = e.target as HTMLElement;
        const targetKey = target.getAttribute('target-key');
        const targetEvent = target.getAttribute('target-event');
        if (targetKey?.trim()) {
          if (!targetEvent || targetEvent === 'all') {
            this.reportCollect({
              event: eventKey,
              key: `dom-${targetKey}`,
            });
          } else {
            try {
              const eventList = targetEvent.split(',').map(val => val.trim());
              if (eventList.includes(eventKey)) {
                this.reportCollect({
                  event: eventKey,
                  key: `dom-${targetKey}`,
                });
              }
            } catch (error) {
              console.log(error);
            }
          }
        }
      });
    });
  }

  private jsErrorReport() {
    window.addEventListener('error', (e: ErrorEvent) => {
      this.reportCollect({
        event: 'error',
        key: 'jsError',
        message: e.message,
      });
    });

    window.addEventListener('unhandledrejection', (e: PromiseRejectionEvent) => {
      this.reportCollect({
        event: 'reject',
        key: 'jsError',
        message: e.reason,
      });
    });
  }
}
