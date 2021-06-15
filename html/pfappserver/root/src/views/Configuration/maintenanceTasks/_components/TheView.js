import {
  AlertServices,
  BaseView,
  FormButtonBar,
  TheForm
} from './'

const components = {
  FormButtonBar,
  TheForm
}

import { computed } from '@vue/composition-api'
import { renderHOCWithScopedSlots } from '@/components/new/'
import { usePropsWrapper } from '@/composables/useProps'
import { useViewCollectionItem, useViewCollectionItemProps as props } from '../../_composables/useViewCollectionItem'
import * as collection from '../_composables/useCollection'

const setup = (props, context) => {
  const _collection = { ...collection } // unfurl Module
  // merge props w/ params in collection.useStore methods
  _collection.useStore = $store => usePropsWrapper(collection.useStore($store), props)

  const viewCollectionItem = useViewCollectionItem(_collection, props, context)
  const {
    isLoading,
    isModified
  } = viewCollectionItem

  const scopedSlotProps = computed(() => ({ ...props, isLoading: isLoading.value, isModified: isModified.value }))

  return {
    ...viewCollectionItem,
    scopedSlotProps
  }
}

const render = renderHOCWithScopedSlots(BaseView, { components, props, setup }, {
  buttonsPrepend: AlertServices
})

// @vue/component
export default {
  name: 'the-view',
  extends: BaseView,
  inheritAttrs: false,
  props,
  render
}
