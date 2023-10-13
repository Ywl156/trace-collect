## 前端埋点（用户操作、错误收集上报）

### 1. 安装

`npm i trace-collect`

### 2. 说明

```
/**
 * @uid 用户标识
 * @requestUrl 上报的服务器地址
 * @extra 额外的参数
 * @historyCollect 是否开启浏览器history收集
 * @hashCollect 是否开启浏览器hash收集
 * @domCollect 是否开启用户操作dom收集
 * @jsError 是否开启js报错收集
 */
export interface DefaultOptions {
  uid: string;
  extra: Record<string, any>;
  requestUrl: string;
  historyCollect: boolean;
  hashCollect: boolean;
  domCollect: boolean;
  jsError: boolean;
}

export interface Options extends Partial<DefaultOptions> {
  requestUrl: string;
}
```

**4 种模式**

1. historyCollect --- (pushState、replaceState、 popState) 收集上报
2. hashCollect --- (hashchange) 收集上报
3. domCollect --- dom 元素操作上报 ('click'、 'dblclick'、 'contextmenu'、 'mouseout'、 'mouseover'、 'mousedown'、 'mouseup') 事件可选
4. jsError --- (error、reject) js 报错上报

### 3. 用法

```javascript
import TraceCollect from 'trace-collect';
// or
// <script stc="https://unpkg.com/trace-collect/dist/index.js"></script>

// options 参数如说明所示，requestUrl必填
const traceCollect = new TraceCollect({
  uid: 'xxx',
  extra: {},
  requestUrl: 'http://xxx.com/xxx',
  // 以下参数开启即自动上报 navagatiob.sendBeacon() 方式
  historyCollect: true,
  hashCollect: true,
  // domCollect 额外要求dom元素中添加 target-key="xxx" target-event="all / 事件1,事件2,..."
  // 无target-event属性，默认all
  // 如 <div target-key="xxx" target-event="all" | target-event="click,dblclick"></div>
  domCollect: true,
  jsError: true,
})

// 实例方法
// 设置uid
traceCollect.setUid('xxx')
// 设置额外参数
traceCollect.setExtra({})
// 手动上报 data - Record<string, any>
traceCollect.sendCollect(data)

// 上报数据格式
// 手动上报
Object.assign({
  options,
  // 手动传入的data
  {},
  {
    time: Date.now(),
  }
})
// historyCollect
Object.assign({
  options,
  {
    event: 'popstate | pushState | replaceState',
    key: 'history',
    href: window.location.href,
  },
  {
    time: Date.now(),
  }
})

// hash
Object.assign({
  options,
  {
    event: 'hashchange',
    key: 'hash',
    hash: location.hash,
    oldUrl: ev.oldURL,
    newUrl: ev.newURL,
  },
  {
    time: Date.now(),
  }
})

// dom
Object.assign({
  options,
  {
    event: "click | dbclick ...",
    key: `dom-${targetKey}`,
  },
  {
    time: Date.now(),
  }
})

// jsError
Object.assign({
  options,
  {
    event: 'error | reject',
    key: 'jsError',
    message: e.message,
  },
  {
    time: Date.now(),
  }
})
```
