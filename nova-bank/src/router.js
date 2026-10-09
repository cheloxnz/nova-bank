import { createRouter, createWebHashHistory } from 'vue-router'
import { useBank } from './stores/bank.js'
import HomeView from './views/HomeView.vue'
import LockView from './views/LockView.vue'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/lock', name: 'lock', component: LockView, meta: { bare: true } },
    { path: '/', name: 'home', component: HomeView },
    { path: '/activity', name: 'activity', component: () => import('./views/ActivityView.vue') },
    { path: '/transfer', name: 'transfer', component: () => import('./views/TransferView.vue'), meta: { bare: true } },
    { path: '/card', name: 'card', component: () => import('./views/CardView.vue') },
    { path: '/profile', name: 'profile', component: () => import('./views/ProfileView.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach((to) => {
  const bank = useBank()
  if (!bank.unlocked && to.name !== 'lock') return { name: 'lock', query: { next: to.fullPath } }
  if (bank.unlocked && to.name === 'lock') return { name: 'home' }
})

export default router
