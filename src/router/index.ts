import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

// 布局组件
const Layout = () => import('@/layout/index.vue');

// 路由配置
const routes: Array<RouteRecordRaw> = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', hidden: true }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '仪表盘', icon: 'HomeFilled' }
      }
    ]
  },
  {
    path: '/user',
    component: Layout,
    redirect: '/user/list',
    meta: { title: '用户管理', icon: 'User' },
    children: [
      {
        path: 'list',
        name: 'UserList',
        component: () => import('@/views/user/list.vue'),
        meta: { title: '用户列表' }
      },
    ]
  },
  {
    path: '/article',
    component: Layout,
    redirect: '/article/list',
    meta: { title: '文章管理', icon: 'Document' },
    children: [
      {
        path: 'list',
        name: 'ArticleList',
        component: () => import('@/views/article/list.vue'),
        meta: { title: '文章管理' }
      },
      {
        path: 'view/:id',
        name: 'ArticleView',
        component: () => import('@/views/article/view.vue'),
        meta: { title: '查看文章', hidden: true }
      }
    ]
  },
  {
    path: '/comment',
    component: Layout,
    redirect: '/comment/list',
    meta: { title: '评论管理', icon: 'ChatDotRound' },
    children: [
      {
        path: 'list',
        name: 'CommentList',
        component: () => import('@/views/comment/list.vue'),
        meta: { title: '评论列表' }
      },
      {
        path: 'detail/:id',
        name: 'CommentDetail',
        component: () => import('@/views/comment/detail.vue'),
        meta: { title: '评论详情', hidden: true }
      }
    ]
  },
  {
    path: '/tag',
    component: Layout,
    redirect: '/tag/list',
    meta: { title: '标签管理', icon: 'Collection' },
    children: [
      {
        path: 'list',
        name: 'TagList',
        component: () => import('@/views/tag/list.vue'),
        meta: { title: '标签列表' }
      },
      {
        path: 'create',
        name: 'TagCreate',
        component: () => import('@/views/tag/form.vue'),
        meta: { title: '添加标签' }
      },
      {
        path: 'edit/:id',
        name: 'TagEdit',
        component: () => import('@/views/tag/form.vue'),
        meta: { title: '编辑标签', hidden: true }
      }
    ]
  },
  {
    path: '/404',
    component: () => import('@/views/error/404.vue'),
    meta: { hidden: true }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/404',
    meta: { hidden: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;