import store from '@/store'
import BasesStoreModule from '../_store/bases'

const TheView = () => import(/* webpackChunkName: "Configuration" */ './_components/TheView')

export const beforeEnter = (to, from, next = () => {}) => {
  if (!store.state.$_bases) {
    store.registerModule('$_bases', BasesStoreModule)
  }
  next()
}

export default [
  {
    path: 'webservices',
    name: 'webservices',
    component: TheView,
    props: (route) => ({ query: route.query.query }),
    beforeEnter
  }
]
