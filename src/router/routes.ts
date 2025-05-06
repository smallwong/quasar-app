import type { RouteRecordRaw } from 'vue-router';

// const routes: RouteRecordRaw[] = [

//   // Always leave this as last one,
//   // but you can also remove it
//   {
//     path: '/:catchAll(.*)*',
//     component: () => import('pages/ErrorNotFound.vue'),
//   },
// ];

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', redirect: '/login' },
      { path: 'login', component: () => import('pages/LoginPage.vue') },
      { path: 'orders', component: () => import('pages/OrderListPage.vue') },
    ],
  },
];

export default routes;
