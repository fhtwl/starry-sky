import router from './router';
import NProgress from 'nprogress';
import '@/components/NProgress/nprogress.less';

NProgress.configure({ showSpinner: false });

export const loginRoutePath = '/auth/login';

router.beforeEach(() => {
  NProgress.start();
});

router.afterEach(() => {
  NProgress.done();
});
