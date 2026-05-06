import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('../views/Landing.vue'),
    },
    {
      path: '/tasks',
      component: () => import('../views/TodoList.vue'),
    },
    {
      path: '/tasks/:id',
      component: () => import('../views/TaskDetails.vue'),
    },
    {
      path: '/test-error',
      component: () => import('../views/TestError.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      component: () => import('../views/NotFound.vue'),
    },
  ],
})

export default router
