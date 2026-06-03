import { importShared } from './__federation_fn_import-JrT3xvdd.js';
import { _ as _export_sfc } from './_plugin-vue_export-helper-pcqpp-6-.js';

const {resolveComponent:_resolveComponent,createVNode:_createVNode,createTextVNode:_createTextVNode,withCtx:_withCtx,createElementVNode:_createElementVNode,openBlock:_openBlock,createElementBlock:_createElementBlock,createCommentVNode:_createCommentVNode,renderList:_renderList,Fragment:_Fragment,toDisplayString:_toDisplayString,normalizeClass:_normalizeClass,createBlock:_createBlock} = await importShared('vue');


const _hoisted_1 = { class: "d-flex align-center mb-2" };
const _hoisted_2 = { class: "d-flex align-center mb-2" };
const _hoisted_3 = {
  key: 0,
  class: "text-center text-grey py-4"
};
const _hoisted_4 = { class: "log-time" };
const _hoisted_5 = { class: "log-message" };

const {ref,reactive,onMounted,nextTick} = await importShared('vue');



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
const running = ref(false);
const loadingLogs = ref(false);
const siteOptions = ref([]);
const logs = ref([]);
const logContainer = ref(null);

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

function logColor(level) {
  const colors = { INFO: 'info', WARNING: 'warning', ERROR: 'error', DEBUG: 'grey' };
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
    });
    siteOptions.value = props.initialConfig.site_options ?? [];
  }
  await loadLogs();
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

async function runNow() {
  running.value = true;
  try {
    await props.api.post('plugin/VuePtSite/run-now');
    await loadLogs();
  } catch (error) {
    console.error('[VuePtSite] Failed to run:', error);
  } finally {
    running.value = false;
  }
}

async function loadLogs() {
  loadingLogs.value = true;
  try {
    const result = await props.api.get('plugin/VuePtSite/logs');
    const data = result?.data;
    if (data && data.success !== false) {
      logs.value = data.data?.logs || [];
      await nextTick();
      if (logContainer.value) {
        logContainer.value.scrollTop = 0;
      }
    }
  } catch (error) {
    console.error('[VuePtSite] Failed to load logs:', error);
  } finally {
    loadingLogs.value = false;
  }
}

function clearLogs() {
  logs.value = [];
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
  const _component_v_divider = _resolveComponent("v-divider");
  const _component_v_chip = _resolveComponent("v-chip");
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
          }, 8, ["modelValue"]),
          _createVNode(_component_v_divider, { class: "my-4" }),
          _createElementVNode("div", _hoisted_1, [
            _createVNode(_component_v_icon, {
              icon: "mdi-play-circle",
              size: "18",
              class: "mr-2",
              color: "success"
            }),
            _cache[10] || (_cache[10] = _createElementVNode("span", { class: "text-subtitle-2" }, "立即运行", -1)),
            _createVNode(_component_v_spacer),
            _createVNode(_component_v_btn, {
              color: "success",
              variant: "tonal",
              size: "small",
              loading: running.value,
              onClick: runNow
            }, {
              default: _withCtx(() => [
                _createVNode(_component_v_icon, {
                  start: "",
                  icon: "mdi-play"
                }),
                _cache[9] || (_cache[9] = _createTextVNode(" 运行一次 ", -1))
              ]),
              _: 1
            }, 8, ["loading"])
          ]),
          _createVNode(_component_v_divider, { class: "my-4" }),
          _createElementVNode("div", _hoisted_2, [
            _createVNode(_component_v_icon, {
              icon: "mdi-text-box-outline",
              size: "18",
              class: "mr-2"
            }),
            _cache[11] || (_cache[11] = _createElementVNode("span", { class: "text-subtitle-2" }, "运行日志", -1)),
            _createVNode(_component_v_spacer),
            _createVNode(_component_v_btn, {
              size: "x-small",
              variant: "text",
              icon: "mdi-refresh",
              loading: loadingLogs.value,
              onClick: loadLogs
            }, null, 8, ["loading"]),
            _createVNode(_component_v_btn, {
              size: "x-small",
              variant: "text",
              icon: "mdi-delete-outline",
              onClick: clearLogs
            })
          ]),
          _createElementVNode("div", {
            class: "log-container",
            ref_key: "logContainer",
            ref: logContainer
          }, [
            (logs.value.length === 0)
              ? (_openBlock(), _createElementBlock("div", _hoisted_3, " 暂无日志 "))
              : _createCommentVNode("", true),
            (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(logs.value, (log, idx) => {
              return (_openBlock(), _createElementBlock("div", {
                key: idx,
                class: _normalizeClass(["log-line", `log-line--${log.level.toLowerCase()}`])
              }, [
                _createElementVNode("span", _hoisted_4, _toDisplayString(log.time), 1),
                _createVNode(_component_v_chip, {
                  size: "x-small",
                  color: logColor(log.level),
                  variant: "tonal",
                  class: "log-level"
                }, {
                  default: _withCtx(() => [
                    _createTextVNode(_toDisplayString(log.level), 1)
                  ]),
                  _: 2
                }, 1032, ["color"]),
                _createElementVNode("span", _hoisted_5, _toDisplayString(log.message), 1)
              ], 2))
            }), 128))
          ], 512)
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
            default: _withCtx(() => [...(_cache[12] || (_cache[12] = [
              _createTextVNode("取消", -1)
            ]))]),
            _: 1
          }),
          _createVNode(_component_v_btn, {
            color: "primary",
            loading: saving.value,
            onClick: saveConfig
          }, {
            default: _withCtx(() => [...(_cache[13] || (_cache[13] = [
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
const Config = /*#__PURE__*/_export_sfc(_sfc_main, [['__scopeId',"data-v-7f1ae0a6"]]);

export { Config as default };
