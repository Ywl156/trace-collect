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
