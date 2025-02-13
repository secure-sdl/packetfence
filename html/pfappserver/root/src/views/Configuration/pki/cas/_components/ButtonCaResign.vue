<template>
  <b-button-group>
    <b-button :size="size" variant="outline-danger" :disabled="disabled || isLoading" @click.stop.prevent="onShowModal">{{ $t('Resign CA Certificate') }}</b-button>
    <b-modal v-model="isShowModal"
      size="lg" centered cancel-disabled>
      <template v-slot:modal-title>
        <h4>{{ $t('Resign CA Certificate') }}</h4>
      </template>
      <b-form-group @submit.prevent="onResign" class="mb-0">
        <base-form ref="rootRef"
          :form="formCopy"
          :schema="schema"
          :isLoading="isLoading"
        >
          <the-form-fields v-bind="{ form: formCopy, isResign: true }" />
        </base-form>
      </b-form-group>
      <template v-slot:modal-footer>
        <b-button variant="secondary" class="mr-1" :disabled="isLoading" @click="onHideModal">{{ $t('Cancel') }}</b-button>
        <b-button variant="danger" :disabled="isLoading || !isValid" @click="onResign">
          <icon v-if="isLoading" class="mr-1" name="circle-notch" spin /> {{ $t('Resign') }}
        </b-button>
      </template>
    </b-modal>
  </b-button-group>
</template>
<script>
import { BaseForm } from '@/components/new/'
import TheFormFields from './TheFormFields'

const components = {
  BaseForm,
  TheFormFields,
}

const props = {
  id : {
    type: [String, Number]
  },
  disabled: {
    type: Boolean
  },
  form: {
    type: Object,
    default: () => ({})
  },
  size: {
    type: String,
    default: "md",
    validator: value => ['sm', 'md', 'lg'].includes(value)
  }
}

import i18n from '@/utils/locale'
import { computed, ref, toRefs, watch } from '@vue/composition-api'
import { useDebouncedWatchHandler } from '@/composables/useDebounce'
import schemaFn from '../schema'
import { useStore } from '../_composables/useCollection'
import StoreModule from '../../_store'

const setup = (props, context) => {

  const schema = computed(() => schemaFn(props))

  const {
    id,
    form
  } = toRefs(props)

  const { emit, root: { $store } = {} } = context

  const {
    resignItem
  } = useStore($store)

  if (!$store.state.$_pkis)
    $store.registerModule('$_pkis', StoreModule)

  const isLoading = computed(() => $store.getters['$_pkis/isLoading'])
  const rootRef = ref(null)

  const formCopy = ref()
  watch(form, () => {
    formCopy.value = JSON.parse(JSON.stringify(form.value)) // dereference form
  }, { deep: true, immediate: true })

  const isShowModal = ref(false)
  const onShowModal = () => { isShowModal.value = true }
  const onHideModal = () => { isShowModal.value = false }
  const isValid = useDebouncedWatchHandler([formCopy, isShowModal], () => (!rootRef.value || rootRef.value.$el.querySelectorAll('.is-invalid').length === 0))
  const onResign = () => {
    resignItem({ id: id.value, ...formCopy.value }).then(item => {
      $store.dispatch('notification/info', { message: i18n.t('Certificate Authority <code>{id}</code> resigned.', { id: id.value }) })
      emit('change', item)
      onHideModal()
    }).catch(e => {
      $store.dispatch('notification/danger', { message: i18n.t('Could not resign Certificate Authority <code>{id}</code>.<br/>Reason: ', { id: id.value }) + e })
    })
  }

  return {
    isLoading,
    rootRef,
    schema,
    isValid,
    isShowModal,
    onShowModal,
    onHideModal,
    onResign,
    formCopy,
  }
}

// @vue/component
export default {
  name: 'button-ca-resign',
  inheritAttrs: false,
  components,
  props,
  setup
}
</script>
