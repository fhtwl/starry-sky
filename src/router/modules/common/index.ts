/**
 * @description 公共的一些路由，不属于功能模块的都放这里统一管理
 * @author fhtwl */

import router404 from './404';
import im from './im';

export default [...im, ...router404];
