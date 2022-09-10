import { PageView } from '@/layouts';
export default [
  {
    path: '/',
    component: PageView,
    redirect: '/home',
    hidden: true,
    children: [
      {
        path: 'home',
        name: 'im',
        component: () => import('@/views/Home'),
      },
      // {
      //   path: 'square',
      //   name: 'square',
      //   component: () => import('@/views/Square'),
      // },
    ],
  },
];
