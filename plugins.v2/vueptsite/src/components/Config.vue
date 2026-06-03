<template>
  <v-card>
    <v-card-title class="d-flex align-center">
      <v-icon class="mr-2" icon="mdi-cog" />
      PT Site 配置
      <v-spacer />
      <v-btn icon="mdi-close" variant="text" size="small" @click="$emit('close')" />
    </v-card-title>

    <v-card-text>
      <v-form v-model="valid">
        <v-row>
          <v-col cols="12" md="6">
            <v-switch
              v-model="form.enabled"
              label="启用插件"
              color="primary"
              hide-details
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-switch
              v-model="form.show_sidebar"
              label="显示在侧栏菜单"
              color="primary"
              hide-details
            />
          </v-col>
        </v-row>

        <v-row class="mt-2">
          <v-col cols="12" md="6">
            <v-switch
              v-model="form.auto_refresh"
              label="自动刷新"
              color="primary"
              hide-details
            />
          </v-col>
          <v-col cols="12" md="6">
            <v-select
              v-model="form.refresh_interval"
              :items="intervalOptions"
              label="刷新间隔"
              :disabled="!form.auto_refresh"
              density="compact"
              variant="outlined"
              hide-details
            />
          </v-col>
        </v-row>

        <v-row class="mt-2">
          <v-col cols="12">
            <v-select
              v-model="form.display_sites"
              :items="siteOptions"
              label="显示站点（留空显示全部）"
              multiple
              chips
              closable-chips
              clearable
              density="compact"
              variant="outlined"
              hide-details
            />
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>

    <v-card-actions>
      <v-spacer />
      <v-btn variant="text" @click="$emit('close')">取消</v-btn>
      <v-btn color="primary" :loading="saving" @click="saveConfig">保存</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'

const props = defineProps({
  api: { type: Object, default: () => ({}) },
  initialConfig: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['switch', 'close'])

const valid = ref(false)
const saving = ref(false)
const siteOptions = ref([])

const form = reactive({
  enabled: false,
  show_sidebar: true,
  auto_refresh: false,
  refresh_interval: 60,
  display_sites: [],
})

const intervalOptions = [
  { title: '30 分钟', value: 30 },
  { title: '60 分钟', value: 60 },
  { title: '120 分钟', value: 120 },
  { title: '360 分钟', value: 360 },
]

onMounted(async () => {
  if (props.initialConfig) {
    Object.assign(form, {
      enabled: props.initialConfig.enabled ?? false,
      show_sidebar: props.initialConfig.show_sidebar ?? true,
      auto_refresh: props.initialConfig.auto_refresh ?? false,
      refresh_interval: props.initialConfig.refresh_interval ?? 60,
      display_sites: props.initialConfig.display_sites ?? [],
    })
    siteOptions.value = props.initialConfig.site_options ?? []
  }
})

async function saveConfig() {
  saving.value = true
  try {
    await props.api.post('plugin/VuePtSite/config', { ...form })
    emit('close')
  } catch (error) {
    console.error('[VuePtSite] Failed to save config:', error)
  } finally {
    saving.value = false
  }
}
</script>
