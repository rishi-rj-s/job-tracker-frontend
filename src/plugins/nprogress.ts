import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import type { Router } from 'vue-router'

NProgress.configure({ showSpinner: false })

export function setupProgress(router: Router) {
  router.beforeEach((to, from, next) => {
    NProgress.start()
    next() // ✅ explicitly continue navigation
  })

  router.afterEach(() => {
    NProgress.done()
  })
}
