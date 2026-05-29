<script setup>
import { computed, onMounted, ref, reactive } from 'vue'

const props = defineProps({
  api: {
    type: Object,
    default: () => ({}),
  },
  pluginId: {
    type: String,
    default: 'PTPiler',
  },
  hideTitle: {
    type: Boolean,
    default: false,
  },
})

const loading = ref(false)
const error = ref('')
const sites = ref([])
const allUserInfo = ref([])
const searchResults = ref([])
const searchKeyword = ref('')
const tab = ref('sites')

const pluginBase = computed(() => `plugin/${props.pluginId}`)

const siteTypes = [
  { title: 'NexusPHP', value: 'nexusphp' },
  { title: 'Unit3D', value: 'unit3d' },
  { title: 'Gazelle', value: 'gazelle' },
]

const newSite = reactive({
  name: '',
  url: '',
  cookie: '',
  type: 'nexusphp',
})

const addDialog = ref(false)
const deleteConfirm = ref(null)

async function loadSites() {
  loading.value = true
  error.value = ''
  try {
    const res = await props.api.get(`${pluginBase.value}/sites`)
    sites.value = res?.data?.sites || res?.sites || []
  } catch (err) {
    error.value = err?.message || 'Failed to load sites'
  } finally {
    loading.value = false
  }
}

async function addSite() {
  if (!newSite.name || !newSite.url) return
  loading.value = true
  error.value = ''
  try {
    await props.api.post(`${pluginBase.value}/site/add`, {
      name: newSite.name,
      url: newSite.url,
      cookie: newSite.cookie,
      type: newSite.type,
    })
    newSite.name = ''
    newSite.url = ''
    newSite.cookie = ''
    newSite.type = 'nexusphp'
    addDialog.value = false
    await loadSites()
  } catch (err) {
    error.value = err?.message || 'Failed to add site'
  } finally {
    loading.value = false
  }
}

async function deleteSite(siteId) {
  loading.value = true
  error.value = ''
  try {
    await props.api.post(`${pluginBase.value}/site/delete`, { site_id: siteId })
    deleteConfirm.value = null
    await loadSites()
  } catch (err) {
    error.value = err?.message || 'Failed to delete site'
  } finally {
    loading.value = false
  }
}

async function refreshUserInfo(siteId) {
  loading.value = true
  error.value = ''
  try {
    const res = await props.api.get(`${pluginBase.value}/userinfo?site_id=${siteId}`)
    if (res?.data?.success || res?.success) {
      await loadSites()
    }
  } catch (err) {
    error.value = err?.message || 'Failed to refresh user info'
  } finally {
    loading.value = false
  }
}

async function refreshAllUserInfo() {
  loading.value = true
  error.value = ''
  try {
    const res = await props.api.get(`${pluginBase.value}/userinfo/all`)
    allUserInfo.value = res?.data?.sites || res?.sites || []
    await loadSites()
  } catch (err) {
    error.value = err?.message || 'Failed to refresh all user info'
  } finally {
    loading.value = false
  }
}

async function search() {
  if (!searchKeyword.value) return
  loading.value = true
  error.value = ''
  searchResults.value = []
  try {
    const res = await props.api.get(`${pluginBase.value}/search?keyword=${encodeURIComponent(searchKeyword.value)}`)
    searchResults.value = res?.data?.results || res?.results || []
  } catch (err) {
    error.value = err?.message || 'Failed to search'
  } finally {
    loading.value = false
  }
}

function formatSize(gb) {
  if (!gb) return '0 B'
  if (gb < 1) return `${(gb * 1024).toFixed(1)} MB`
  return `${gb.toFixed(2)} GB`
}

function formatNumber(n) {
  return Number(n || 0).toLocaleString()
}

function maskedCookie(cookie) {
  if (!cookie) return ''
  if (cookie.length <= 20) return cookie
  return cookie.substring(0, 10) + '...' + cookie.substring(cookie.length - 10)
}

onMounted(loadSites)

defineExpose({ loadSites, refreshAllUserInfo })
</script>

<template>
  <div>
    <v-card v-if="!hideTitle" class="mb-4">
      <v-card-title class="text-h5">
        <v-icon class="mr-2">mdi-file-tree</v-icon>
        PT Piler
      </v-card-title>
      <v-card-subtitle>PT Site Management Tool</v-card-subtitle>
    </v-card>

    <v-alert v-if="error" type="error" class="mb-4" closable @click:close="error = ''">
      {{ error }}
    </v-alert>

    <v-tabs v-model="tab" class="mb-4">
      <v-tab value="sites">
        <v-icon start>mdi-server</v-icon>
        Sites
      </v-tab>
      <v-tab value="search">
        <v-icon start>mdi-magnify</v-icon>
        Search
      </v-tab>
    </v-tabs>

    <v-window v-model="tab">
      <v-window-item value="sites">
        <v-card>
          <v-card-title class="d-flex align-center">
            Site List
            <v-spacer />
            <v-btn color="primary" size="small" class="mr-2" @click="refreshAllUserInfo" :loading="loading">
              <v-icon start>mdi-refresh</v-icon>
              Refresh All
            </v-btn>
            <v-btn color="primary" size="small" @click="addDialog = true">
              <v-icon start>mdi-plus</v-icon>
              Add Site
            </v-btn>
          </v-card-title>

          <v-card-text>
            <v-data-table
              :items="sites"
              :headers="[
                { title: 'Name', key: 'name', sortable: true },
                { title: 'URL', key: 'url', sortable: false },
                { title: 'Type', key: 'type', sortable: true },
                { title: 'Upload', key: 'user_info.upload', sortable: true },
                { title: 'Download', key: 'user_info.download', sortable: true },
                { title: 'Ratio', key: 'user_info.ratio', sortable: true },
                { title: 'Bonus', key: 'user_info.bonus', sortable: true },
                { title: 'Seeding', key: 'user_info.seeding', sortable: true },
                { title: 'Actions', key: 'actions', sortable: false },
              ]"
              :loading="loading"
              no-data-text="No sites configured. Click 'Add Site' to get started."
            >
              <template #[`item.url`]="{ item }">
                <a :href="item.url" target="_blank" class="text-primary">{{ item.url }}</a>
              </template>
              <template #[`item.user_info.upload`]="{ item }">
                {{ item.user_info ? formatSize(item.user_info.upload) : '-' }}
              </template>
              <template #[`item.user_info.download`]="{ item }">
                {{ item.user_info ? formatSize(item.user_info.download) : '-' }}
              </template>
              <template #[`item.user_info.ratio`]="{ item }">
                {{ item.user_info ? item.user_info.ratio?.toFixed(2) : '-' }}
              </template>
              <template #[`item.user_info.bonus`]="{ item }">
                {{ item.user_info ? formatNumber(item.user_info.bonus) : '-' }}
              </template>
              <template #[`item.user_info.seeding`]="{ item }">
                {{ item.user_info ? item.user_info.seeding : '-' }}
              </template>
              <template #[`item.actions`]="{ item }">
                <v-icon size="small" class="mr-1" @click="refreshUserInfo(item.id)" :title="'Refresh'">
                  mdi-refresh
                </v-icon>
                <v-icon size="small" color="error" @click="deleteConfirm = item" :title="'Delete'">
                  mdi-delete
                </v-icon>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-window-item>

      <v-window-item value="search">
        <v-card>
          <v-card-title>
            <v-icon class="mr-2">mdi-magnify</v-icon>
            Search Torrents
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="8">
                <v-text-field
                  v-model="searchKeyword"
                  label="Search keyword"
                  prepend-inner-icon="mdi-magnify"
                  @keyup.enter="search"
                  clearable
                />
              </v-col>
              <v-col cols="12" md="4">
                <v-btn color="primary" block @click="search" :loading="loading" :disabled="!searchKeyword">
                  Search
                </v-btn>
              </v-col>
            </v-row>

            <v-data-table
              v-if="searchResults.length > 0"
              :items="searchResults"
              :headers="[
                { title: 'Site', key: 'site', sortable: true },
                { title: 'Title', key: 'title', sortable: false },
                { title: 'Size', key: 'size', sortable: true },
                { title: 'Seeders', key: 'seeders', sortable: true },
                { title: 'Leechers', key: 'leechers', sortable: true },
                { title: 'Action', key: 'action', sortable: false },
              ]"
              class="mt-4"
            >
              <template #[`item.size`]="{ item }">
                {{ formatSize(item.size) }}
              </template>
              <template #[`item.action`]="{ item }">
                <v-btn size="small" color="primary" :href="item.url" target="_blank">
                  <v-icon start>mdi-download</v-icon>
                  Download
                </v-btn>
              </template>
            </v-data-table>

            <div v-else-if="searchKeyword && !loading" class="text-center text-grey py-8">
              No results found
            </div>
          </v-card-text>
        </v-card>
      </v-window-item>
    </v-window>

    <v-dialog v-model="addDialog" max-width="600">
      <v-card>
        <v-card-title>
          <v-icon class="mr-2">mdi-plus</v-icon>
          Add Site
        </v-card-title>
        <v-card-text>
          <v-form @submit.prevent="addSite">
            <v-text-field v-model="newSite.name" label="Site Name" required />
            <v-text-field v-model="newSite.url" label="Site URL" required placeholder="https://example.com" />
            <v-select v-model="newSite.type" :items="siteTypes" label="Site Type" />
            <v-textarea v-model="newSite.cookie" label="Cookie" rows="3" />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="addDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="addSite" :loading="loading" :disabled="!newSite.name || !newSite.url">
            Add
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="deleteConfirm" max-width="400">
      <v-card v-if="deleteConfirm">
        <v-card-title>Confirm Delete</v-card-title>
        <v-card-text>
          Are you sure you want to delete site <strong>{{ deleteConfirm.name }}</strong>?
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="deleteConfirm = null">Cancel</v-btn>
          <v-btn color="error" @click="deleteSite(deleteConfirm.id)" :loading="loading">Delete</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
