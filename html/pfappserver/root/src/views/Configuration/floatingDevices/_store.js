/**
* "$_floatingdevices" store module
*/
import Vue from 'vue'
import { computed } from '@vue/composition-api'
import api from './_api'

export const useStore = $store => {
  return {
    isLoading: computed(() => $store.getters['$_floatingdevices/isLoading']),
    getList: () => $store.dispatch('$_floatingdevices/all'),
    getListOptions: () => $store.dispatch('$_floatingdevices/options'),
    createItem: params => $store.dispatch('$_floatingdevices/createFloatingDevice', params),
    getItem: params => $store.dispatch('$_floatingdevices/getFloatingDevice', params.id).then(item => {
      return (params.isClone)
        ? { ...item, not_deletable: false }
        : item
    }),
    getItemOptions: params => $store.dispatch('$_floatingdevices/options', params.id),
    updateItem: params => $store.dispatch('$_floatingdevices/updateFloatingDevice', params),
    deleteItem: params => $store.dispatch('$_floatingdevices/deleteFloatingDevice', params.id),
  }
}

const types = {
  LOADING: 'loading',
  DELETING: 'deleting',
  SUCCESS: 'success',
  ERROR: 'error'
}

// Default values
const state = () => {
  return {
    cache: {}, // items details
    message: '',
    itemStatus: ''
  }
}

const getters = {
  isWaiting: state => [types.LOADING, types.DELETING].includes(state.itemStatus),
  isLoading: state => state.itemStatus === types.LOADING
}

const actions = {
  getFloatingDevice: ({ state, commit }, id) => {
    if (state.cache[id]) {
      return Promise.resolve(state.cache[id]).then(cache => JSON.parse(JSON.stringify(cache)))
    }
    commit('ITEM_REQUEST')
    return api.item(id).then(item => {
      commit('ITEM_REPLACED', item)
      return JSON.parse(JSON.stringify(item))
    }).catch((err) => {
      commit('ITEM_ERROR', err.response)
      throw err
    })
  },
  options: ({ commit }, id) => {
    commit('ITEM_REQUEST')
    if (id) {
      return api.itemOptions(id).then(response => {
        commit('ITEM_SUCCESS')
        return response
      }).catch((err) => {
        commit('ITEM_ERROR', err.response)
        throw err
      })
    } else {
      return api.listOptions().then(response => {
        commit('ITEM_SUCCESS')
        return response
      }).catch((err) => {
        commit('ITEM_ERROR', err.response)
        throw err
      })
    }
  },
  createFloatingDevice: ({ commit }, data) => {
    commit('ITEM_REQUEST')
    return api.create(data).then(response => {
      commit('ITEM_REPLACED', data)
      return response
    }).catch(err => {
      commit('ITEM_ERROR', err.response)
      throw err
    })
  },
  updateFloatingDevice: ({ commit }, data) => {
    commit('ITEM_REQUEST')
    return api.update(data).then(response => {
      commit('ITEM_REPLACED', data)
      return response
    }).catch(err => {
      commit('ITEM_ERROR', err.response)
      throw err
    })
  },
  deleteFloatingDevice: ({ commit }, data) => {
    commit('ITEM_REQUEST', types.DELETING)
    return api.delete(data).then(response => {
      commit('ITEM_DESTROYED', data)
      return response
    }).catch(err => {
      commit('ITEM_ERROR', err.response)
      throw err
    })
  }
}

const mutations = {
  ITEM_REQUEST: (state, type) => {
    state.itemStatus = type || types.LOADING
    state.message = ''
  },
  ITEM_REPLACED: (state, data) => {
    state.itemStatus = types.SUCCESS
    Vue.set(state.cache, data.id, JSON.parse(JSON.stringify(data)))
  },
  ITEM_DESTROYED: (state, id) => {
    state.itemStatus = types.SUCCESS
    Vue.set(state.cache, id, null)
  },
  ITEM_ERROR: (state, response) => {
    state.itemStatus = types.ERROR
    if (response && response.data) {
      state.message = response.data.message
    }
  },
  ITEM_SUCCESS: (state) => {
    state.itemStatus = types.SUCCESS
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
