/**
 * Vue Router Configuration
 */

import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

// Lazy load components
const BpmnEditor = () => import('@/components/BpmnEditor/BpmnEditor.vue')
const BpmnTestingPage = () => import('@/components/BpmnTestingPage.vue')

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/editor'
  },
  {
    path: '/editor',
    name: 'editor',
    component: BpmnEditor,
    meta: {
      title: 'BPMN Editor'
    }
  },
  {
    path: '/testing',
    name: 'testing',
    component: BpmnTestingPage,
    meta: {
      title: 'BPMN Testing'
    }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/editor'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard for page title
router.afterEach((to) => {
  const title = to.meta.title as string | undefined
  if (title) {
    document.title = `${title} - vue-flow-bpm`
  }
})

export default router
