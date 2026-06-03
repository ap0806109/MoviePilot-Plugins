import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import AppPage from './components/AppPage.vue'

const vuetify = createVuetify({
  components,
  directives,
})

const app = createApp(AppPage)
app.use(vuetify)
app.mount('#app')
