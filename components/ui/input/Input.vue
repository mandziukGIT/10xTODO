<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { useVModel } from "@vueuse/core"
import { cn } from "@/lib/utils"

const props = withDefaults(defineProps<{
  defaultValue?: string | number
  modelValue?: string | number
  type?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  class?: HTMLAttributes["class"]
}>(), {
  type: 'text',
  defaultValue: '',
  modelValue: '',
  placeholder: '',
  class: '',
  required: false,
  disabled: false
})

const emits = defineEmits<{
  (e: "update:modelValue", payload: string | number): void
}>()

const modelValue = useVModel(props, "modelValue", emits, {
  passive: true,
  defaultValue: props.defaultValue,
})

const input = ref<HTMLInputElement | null>(null)

defineExpose({
  focus: () => input.value?.focus()
})
</script>

<template>
  <input
    ref="input"
    v-model="modelValue"
    v-bind="$attrs"
    :type="type"
    :placeholder="placeholder"
    :required="required"
    :disabled="disabled"
    data-slot="input"
    :class="cn(
      'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
      'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
      'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
      props.class,
    )"
  >
</template>
