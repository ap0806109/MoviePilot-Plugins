import { importShared } from './__federation_fn_import-JrT3xvdd.js';

const {resolveComponent:_resolveComponent,createVNode:_createVNode,createTextVNode:_createTextVNode,withCtx:_withCtx,openBlock:_openBlock,createBlock:_createBlock} = await importShared('vue');


const {ref,reactive,onMounted} = await importShared('vue');



const _sfc_main = {
  __name: 'Config',
  props: {
  api: { type: Object, default: () => ({}) },
  initialConfig: { type: Object, default: () => ({}) },
},
  emits: ['switch', 'close'],
  setup(__props, { emit: __emit }) {

const props = __props;

const emit = __emit;

const valid = ref(false);
const saving = ref(false);
const siteOptions = ref([]);

const form = reactive({
  enabled: false,
  show_sidebar: true,
  auto_refresh: false,
  refresh_interval: 60,
  display_sites: [],
});

const intervalOptions = [
  { title: '30 分钟', value: 30 },
  { title: '60 分钟', value: 60 },
  { title: '120 分钟', value: 120 },
  { title: '360 分钟', value: 360 },
];

onMounted(async () => {
  if (props.initialConfig) {
    Object.assign(form, {
      enabled: props.initialConfig.enabled ?? false,
      show_sidebar: props.initialConfig.show_sidebar ?? true,
      auto_refresh: props.initialConfig.auto_refresh ?? false,
      refresh_interval: props.initialConfig.refresh_interval ?? 60,
      display_sites: props.initialConfig.display_sites ?? [],
    });
    siteOptions.value = props.initialConfig.site_options ?? [];
  }
});

async function saveConfig() {
  saving.value = true;
  try {
    await props.api.post('plugin/VuePtSite/config', { ...form });
    emit('close');
  } catch (error) {
    console.error('[VuePtSite] Failed to save config:', error);
  } finally {
    saving.value = false;
  }
}

return (_ctx, _cache) => {
  const _component_v_icon = _resolveComponent("v-icon");
  const _component_v_spacer = _resolveComponent("v-spacer");
  const _component_v_btn = _resolveComponent("v-btn");
  const _component_v_card_title = _resolveComponent("v-card-title");
  const _component_v_switch = _resolveComponent("v-switch");
  const _component_v_col = _resolveComponent("v-col");
  const _component_v_row = _resolveComponent("v-row");
  const _component_v_select = _resolveComponent("v-select");
  const _component_v_form = _resolveComponent("v-form");
  const _component_v_card_text = _resolveComponent("v-card-text");
  const _component_v_card_actions = _resolveComponent("v-card-actions");
  const _component_v_card = _resolveComponent("v-card");

  return (_openBlock(), _createBlock(_component_v_card, null, {
    default: _withCtx(() => [
      _createVNode(_component_v_card_title, { class: "d-flex align-center" }, {
        default: _withCtx(() => [
          _createVNode(_component_v_icon, {
            class: "mr-2",
            icon: "mdi-cog"
          }),
          _cache[8] || (_cache[8] = _createTextVNode(" PT Site 配置 ", -1)),
          _createVNode(_component_v_spacer),
          _createVNode(_component_v_btn, {
            icon: "mdi-close",
            variant: "text",
            size: "small",
            onClick: _cache[0] || (_cache[0] = $event => (_ctx.$emit('close')))
          })
        ]),
        _: 1
      }),
      _createVNode(_component_v_card_text, null, {
        default: _withCtx(() => [
          _createVNode(_component_v_form, {
            modelValue: valid.value,
            "onUpdate:modelValue": _cache[6] || (_cache[6] = $event => ((valid).value = $event))
          }, {
            default: _withCtx(() => [
              _createVNode(_component_v_row, null, {
                default: _withCtx(() => [
                  _createVNode(_component_v_col, {
                    cols: "12",
                    md: "6"
                  }, {
                    default: _withCtx(() => [
                      _createVNode(_component_v_switch, {
                        modelValue: form.enabled,
                        "onUpdate:modelValue": _cache[1] || (_cache[1] = $event => ((form.enabled) = $event)),
                        label: "启用插件",
                        color: "primary",
                        "hide-details": ""
                      }, null, 8, ["modelValue"])
                    ]),
                    _: 1
                  }),
                  _createVNode(_component_v_col, {
                    cols: "12",
                    md: "6"
                  }, {
                    default: _withCtx(() => [
                      _createVNode(_component_v_switch, {
                        modelValue: form.show_sidebar,
                        "onUpdate:modelValue": _cache[2] || (_cache[2] = $event => ((form.show_sidebar) = $event)),
                        label: "显示在侧栏菜单",
                        color: "primary",
                        "hide-details": ""
                      }, null, 8, ["modelValue"])
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }),
              _createVNode(_component_v_row, { class: "mt-2" }, {
                default: _withCtx(() => [
                  _createVNode(_component_v_col, {
                    cols: "12",
                    md: "6"
                  }, {
                    default: _withCtx(() => [
                      _createVNode(_component_v_switch, {
                        modelValue: form.auto_refresh,
                        "onUpdate:modelValue": _cache[3] || (_cache[3] = $event => ((form.auto_refresh) = $event)),
                        label: "自动刷新",
                        color: "primary",
                        "hide-details": ""
                      }, null, 8, ["modelValue"])
                    ]),
                    _: 1
                  }),
                  _createVNode(_component_v_col, {
                    cols: "12",
                    md: "6"
                  }, {
                    default: _withCtx(() => [
                      _createVNode(_component_v_select, {
                        modelValue: form.refresh_interval,
                        "onUpdate:modelValue": _cache[4] || (_cache[4] = $event => ((form.refresh_interval) = $event)),
                        items: intervalOptions,
                        label: "刷新间隔",
                        disabled: !form.auto_refresh,
                        density: "compact",
                        variant: "outlined",
                        "hide-details": ""
                      }, null, 8, ["modelValue", "disabled"])
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }),
              _createVNode(_component_v_row, { class: "mt-2" }, {
                default: _withCtx(() => [
                  _createVNode(_component_v_col, { cols: "12" }, {
                    default: _withCtx(() => [
                      _createVNode(_component_v_select, {
                        modelValue: form.display_sites,
                        "onUpdate:modelValue": _cache[5] || (_cache[5] = $event => ((form.display_sites) = $event)),
                        items: siteOptions.value,
                        label: "显示站点（留空显示全部）",
                        multiple: "",
                        chips: "",
                        "closable-chips": "",
                        clearable: "",
                        density: "compact",
                        variant: "outlined",
                        "hide-details": ""
                      }, null, 8, ["modelValue", "items"])
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              })
            ]),
            _: 1
          }, 8, ["modelValue"])
        ]),
        _: 1
      }),
      _createVNode(_component_v_card_actions, null, {
        default: _withCtx(() => [
          _createVNode(_component_v_spacer),
          _createVNode(_component_v_btn, {
            variant: "text",
            onClick: _cache[7] || (_cache[7] = $event => (_ctx.$emit('close')))
          }, {
            default: _withCtx(() => [...(_cache[9] || (_cache[9] = [
              _createTextVNode("取消", -1)
            ]))]),
            _: 1
          }),
          _createVNode(_component_v_btn, {
            color: "primary",
            loading: saving.value,
            onClick: saveConfig
          }, {
            default: _withCtx(() => [...(_cache[10] || (_cache[10] = [
              _createTextVNode("保存", -1)
            ]))]),
            _: 1
          }, 8, ["loading"])
        ]),
        _: 1
      })
    ]),
    _: 1
  }))
}
}

};

export { _sfc_main as default };
