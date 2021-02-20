import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../components/Home'
import Index from '../components/index'
import Sandcastle from '../components/sandcastle/index'
import Documentation from '../components/documentation/index'
import Blog from '../components/blog/index'

Vue.use(VueRouter)

const routes = [
  {
    path:'/',
    redirect:'/index'
  },
  {
    path: '/home',
    component: Home,
    children: [
      {
        path: '/index',
        component: Index
      },
      {
        path: '/sandcastle',
        component: Sandcastle,
      },
      {
        path: '/documentation',
        component: Documentation
      },
      {
        path: '/blog',
        component: Blog
      }
    ]
  }
]

const router = new VueRouter({
  routes
})

export default router
