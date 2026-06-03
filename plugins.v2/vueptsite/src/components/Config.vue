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

      <!-- 立即运行 -->
      <v-divider class="my-4" />
      <div class="d-flex align-center mb-2">
        <v-icon icon="mdi-play-circle" size="18" class="mr-2" color="success" />
        <span class="text-subtitle-2">立即运行</span>
        <v-spacer />
        <v-btn
          color="success"
          variant="tonal"
          size="small"
          :loading="running"
          @click="runNow"
        >
          <v-icon start icon="mdi-play" />
          运行一次
        </v-btn>
      </div>

      <!-- 日志输出 -->
      <v-divider class="my-4" />
      <div class="d-flex align-center mb-2">
        <v-icon icon="mdi-text-box-outline" size="18" class="mr-2" />
        <span class="text-subtitle-2">运行日志</span>
        <v-spacer />
        <v-btn
          size="x-small"
          variant="text"
          icon="mdi-refresh"
          :loading="loadingLogs"
          @click="loadLogs"
        />
        <v-btn
          size="x-small"
          variant="text"
          icon="mdi-delete-outline"
          @click="clearLogs"
        />
      </div>
      <div class="log-container" ref="logContainer">
        <div v-if="logs.length === 0" class="text-center text-grey py-4">
          暂无日志
        </div>
        <div
          v-for="(log, idx) in logs"
          :key="idx"
          class="log-line"
          :class="`log-line--${log.level.toLowerCase()}`"
        >
          <span class="log-time">{{ log.time }}</span>
          <v-chip
            size="x-small"
            :color="logColor(log.level)"
            variant="tonal"
            class="log-level"
          >
            {{ log.level }}
          </v-chip>
          <span class="log-message">{{ log.message }}</span>
        </div>
      </div>
    </v-card-text>

    <v-card-actions>
      <v-spacer />
      <v-btn variant="text" @click="$emit('close')">取消</v-btn>
      <v-btn color="primary" :loading="saving" @click="saveConfig">保存</v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue'

const props = defineProps({
  api: { type: Object, default: () => ({}) },
  initialConfig: { type: Object, default: () => ({}) },
})

const emit = defineEmits(['switch', 'close'])

const valid = ref(false)
const saving = ref(false)
const running = ref(false)
const loadingLogs = ref(false)
const siteOptions = ref([])
const logs = ref([])
const logContainer = ref(null)

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

function logColor(level) {
  const colors = { INFO: 'info', WARNING: 'warning', ERROR: 'error', DEBUG: 'grey' }
  return colors[level] || 'grey'
}

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
  await loadLogs()
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

async function runNow() {
  running.value = true
  try {
    await props.api.post('plugin/VuePtSite/run-now')
    await loadLogs()
  } catch (error) {
    console.error('[VuePtSite] Failed to run:', error)
  } finally {
    running.value = false
  }
}

async function loadLogs() {
  loadingLogs.value = true
  try {
    const result = await props.api.get('plugin/VuePtSite/logs')
    const data = result?.data
    if (data && data.success !== false) {
      logs.value = data.data?.logs || []
      await nextTick()
      if (logContainer.value) {
        logContainer.value.scrollTop = 0
      }
    }
  } catch (error) {
    console.error('[VuePtSite] Failed to load logs:', error)
  } finally {
    loadingLogs.value = false
  }
}

function clearLogs() {
  logs.value = []
}
</script>

<style scoped>
.log-container {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.02);
  font-family: monospace;
  font-size: 0.75rem;
}

.log-line {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.log-line:last-child {
  border-bottom: none;
}

.log-line--error {
  background: rgba(239, 68, 68, 0.05);
}

.log-line--warning {
  background: rgba(245, 158, 11, 0.05);
}

.log-time {
  color: rgba(var(--v-theme-on-surface), 0.4);
  white-space: nowrap;
  flex-shrink: 0;
}

.log-level {
  flex-shrink: 0;
  font-size: 0.65rem !important;
}

.log-message {
  color: rgba(var(--v-theme-on-surface), 0.8);
  word-break: break-all;
}
</style>
