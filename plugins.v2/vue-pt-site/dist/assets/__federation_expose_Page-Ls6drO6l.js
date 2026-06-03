import { importShared } from './__federation_fn_import-JrT3xvdd.js';
import _sfc_main$1 from './__federation_expose_Config-1x6xUPT3.js';
import { _ as _export_sfc } from './_plugin-vue_export-helper-pcqpp-6-.js';

const {resolveComponent:_resolveComponent,createVNode:_createVNode,createTextVNode:_createTextVNode,withCtx:_withCtx,renderList:_renderList,Fragment:_Fragment,openBlock:_openBlock,createElementBlock:_createElementBlock,toDisplayString:_toDisplayString,createElementVNode:_createElementVNode,createCommentVNode:_createCommentVNode,createBlock:_createBlock} = await importShared('vue');


const _hoisted_1 = { key: 0 };
const _hoisted_2 = { class: "vpts-dialog-card__header" };
const _hoisted_3 = { class: "vpts-dialog-card__name" };
const _hoisted_4 = { class: "vpts-dialog-card__body" };
const _hoisted_5 = {
  key: 1,
  class: "text-center text-grey pa-4"
};

const {ref,onMounted} = await importShared('vue');


const _sfc_main = {
  __name: 'Page',
  props: {
  api: { type: Object, default: () => ({}) },
  initialConfig: { type: Object, default: () => ({}) },
},
  emits: ['switch', 'close'],
  setup(__props, { emit: __emit }) {

const props = __props;

const sites = ref([]);
const config = ref({});
const loading = ref(false);
const showConfig = ref(false);

onMounted(async () => {
  await loadSites();
  config.value = props.initialConfig || {};
});

async function loadSites() {
  loading.value = true;
  try {
    const result = await props.api.get('plugin/VuePtSite/sites');
    const data = result?.data;
    if (data && data.success !== false) {
      sites.value = data.data?.sites || [];
    }
  } catch (error) {
    console.error('[VuePtSite] Failed to load sites:', error);
  } finally {
    loading.value = false;
  }
}

function formatSize(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

return (_ctx, _cache) => {
  const _component_v_icon = _resolveComponent("v-icon");
  const _component_v_spacer = _resolveComponent("v-spacer");
  const _component_v_btn = _resolveComponent("v-btn");
  const _component_v_card_title = _resolveComponent("v-card-title");
  const _component_v_chip = _resolveComponent("v-chip");
  const _component_v_card_text = _resolveComponent("v-card-text");
  const _component_v_dialog = _resolveComponent("v-dialog");
  const _component_v_card = _resolveComponent("v-card");

  return (_openBlock(), _createBlock(_component_v_card, null, {
    default: _withCtx(() => [
      _createVNode(_component_v_card_title, { class: "d-flex align-center" }, {
        default: _withCtx(() => [
          _createVNode(_component_v_icon, {
            class: "mr-2",
            icon: "mdi-web"
          }),
          _cache[4] || (_cache[4] = _createTextVNode(" PT Site ", -1)),
          _createVNode(_component_v_spacer),
          _createVNode(_component_v_btn, {
            icon: "mdi-cog",
            variant: "text",
            size: "small",
            onClick: _cache[0] || (_cache[0] = $event => (showConfig.value = true))
          }),
          _createVNode(_component_v_btn, {
            icon: "mdi-refresh",
            variant: "text",
            size: "small",
            loading: loading.value,
            onClick: loadSites
          }, null, 8, ["loading"]),
          _createVNode(_component_v_btn, {
            icon: "mdi-close",
            variant: "text",
            size: "small",
            onClick: _cache[1] || (_cache[1] = $event => (_ctx.$emit('close')))
          })
        ]),
        _: 1
      }),
      _createVNode(_component_v_card_text, null, {
        default: _withCtx(() => [
          (sites.value.length > 0)
            ? (_openBlock(), _createElementBlock("div", _hoisted_1, [
                (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(sites.value, (site) => {
                  return (_openBlock(), _createElementBlock("div", {
                    key: site.id,
                    class: "vpts-dialog-card"
                  }, [
                    _createElementVNode("div", _hoisted_2, [
                      _createVNode(_component_v_icon, {
                        icon: "mdi-server",
                        size: "16",
                        color: "primary"
                      }),
                      _createElementVNode("span", _hoisted_3, _toDisplayString(site.name), 1),
                      _createVNode(_component_v_chip, {
                        size: "x-small",
                        variant: "tonal",
                        color: "success"
                      }, {
                        default: _withCtx(() => [
                          _createTextVNode(_toDisplayString(site.level), 1)
                        ]),
                        _: 2
                      }, 1024)
                    ]),
                    _createElementVNode("div", _hoisted_4, [
                      _createElementVNode("span", null, "上传: " + _toDisplayString(formatSize(site.upload)), 1),
                      _createElementVNode("span", null, "下载: " + _toDisplayString(formatSize(site.download)), 1),
                      _createElementVNode("span", null, "分享率: " + _toDisplayString(site.ratio), 1)
                    ])
                  ]))
                }), 128))
              ]))
            : (_openBlock(), _createElementBlock("div", _hoisted_5, " 暂无站点数据 "))
        ]),
        _: 1
      }),
      _createVNode(_component_v_dialog, {
        modelValue: showConfig.value,
        "onUpdate:modelValue": _cache[3] || (_cache[3] = $event => ((showConfig).value = $event)),
        "max-width": "600"
      }, {
        default: _withCtx(() => [
          _createVNode(_sfc_main$1, {
            api: __props.api,
            "initial-config": config.value,
            onClose: _cache[2] || (_cache[2] = $event => (showConfig.value = false))
          }, null, 8, ["api", "initial-config"])
        ]),
        _: 1
      }, 8, ["modelValue"])
    ]),
    _: 1
  }))
}
}

};
const Page = /*#__PURE__*/_export_sfc(_sfc_main, [['__scopeId',"data-v-3873c17a"]]);

export { Page as default };
