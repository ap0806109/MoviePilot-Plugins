import { importShared } from './__federation_fn_import-JrT3xvdd.js';
import { _ as _export_sfc } from './_plugin-vue_export-helper-pcqpp-6-.js';

const {resolveComponent:_resolveComponent,createVNode:_createVNode,createElementVNode:_createElementVNode,toDisplayString:_toDisplayString,createTextVNode:_createTextVNode,withCtx:_withCtx,vModelText:_vModelText,withDirectives:_withDirectives,openBlock:_openBlock,createElementBlock:_createElementBlock,createCommentVNode:_createCommentVNode,renderList:_renderList,Fragment:_Fragment,createBlock:_createBlock} = await importShared('vue');


const _hoisted_1 = { class: "vpts-root" };
const _hoisted_2 = { class: "vpts-header" };
const _hoisted_3 = { class: "vpts-header__top" };
const _hoisted_4 = { class: "vpts-header__brand" };
const _hoisted_5 = { class: "vpts-logo" };
const _hoisted_6 = { class: "vpts-stats" };
const _hoisted_7 = { class: "vpts-stat" };
const _hoisted_8 = { class: "vpts-stat__value" };
const _hoisted_9 = { class: "vpts-stat vpts-stat--upload" };
const _hoisted_10 = { class: "vpts-stat__value" };
const _hoisted_11 = { class: "vpts-stat vpts-stat--download" };
const _hoisted_12 = { class: "vpts-stat__value" };
const _hoisted_13 = { class: "vpts-header__actions" };
const _hoisted_14 = { class: "vpts-header__filters" };
const _hoisted_15 = { class: "vpts-search" };
const _hoisted_16 = { class: "vpts-filters__meta" };
const _hoisted_17 = {
  key: 0,
  class: "vpts-list"
};
const _hoisted_18 = { class: "vpts-card__header" };
const _hoisted_19 = { class: "vpts-card__name" };
const _hoisted_20 = ["src", "alt"];
const _hoisted_21 = ["href"];
const _hoisted_22 = {
  key: 3,
  class: "ml-2"
};
const _hoisted_23 = { class: "vpts-card__body" };
const _hoisted_24 = { class: "vpts-field" };
const _hoisted_25 = { class: "vpts-field__value" };
const _hoisted_26 = { class: "vpts-field" };
const _hoisted_27 = { class: "vpts-field__value" };
const _hoisted_28 = { class: "vpts-field" };
const _hoisted_29 = { class: "vpts-field__value vpts-field__value--upload" };
const _hoisted_30 = { class: "vpts-field" };
const _hoisted_31 = { class: "vpts-field__value vpts-field__value--download" };
const _hoisted_32 = { class: "vpts-field" };
const _hoisted_33 = { class: "vpts-field__value" };
const _hoisted_34 = { class: "vpts-field" };
const _hoisted_35 = { class: "vpts-field__value" };
const _hoisted_36 = { class: "vpts-field" };
const _hoisted_37 = { class: "vpts-field__value" };
const _hoisted_38 = { class: "vpts-field" };
const _hoisted_39 = { class: "vpts-field__value" };
const _hoisted_40 = { class: "vpts-field" };
const _hoisted_41 = { class: "vpts-field__value vpts-field__value--hr" };
const _hoisted_42 = {
  key: 1,
  class: "vpts-empty"
};
const _hoisted_43 = {
  key: 2,
  class: "vpts-loading"
};

const {ref,computed,onMounted} = await importShared('vue');



const _sfc_main = {
  __name: 'AppPage',
  props: {
  api: { type: Object, default: () => ({}) },
  navKey: { type: String, default: 'main' },
  pluginId: { type: String, default: '' },
},
  setup(__props) {

const props = __props;

const sites = ref([]);
const loading = ref(false);
const refreshingId = ref(null);
const keyword = ref('');

const filteredSites = computed(() => {
  if (!keyword.value) return sites.value
  const kw = keyword.value.toLowerCase();
  return sites.value.filter(
    (s) =>
      s.name.toLowerCase().includes(kw) ||
      (s.username && s.username.toLowerCase().includes(kw))
  )
});

const totalUpload = computed(() =>
  sites.value.reduce((sum, s) => sum + (s.upload || 0), 0)
);

const totalDownload = computed(() =>
  sites.value.reduce((sum, s) => sum + (s.download || 0), 0)
);

onMounted(async () => {
  console.log('[VuePtSite] Component mounted, pluginId:', props.pluginId);
  await loadSites();
});

async function loadSites() {
  loading.value = true;
  try {
    const apiUrl = `plugin/${props.pluginId}/sites`;
    console.log('[VuePtSite] Calling API:', apiUrl);
    const result = await props.api.get(apiUrl);
    console.log('[VuePtSite] Raw API result:', JSON.stringify(result));
    
    // Handle different response structures
    let siteData = null;
    if (result?.data?.data?.sites) {
      // Structure: { data: { success: true, data: { sites: [...] } } }
      siteData = result.data.data.sites;
    } else if (result?.data?.sites) {
      // Structure: { data: { sites: [...] } }
      siteData = result.data.sites;
    } else if (result?.sites) {
      // Structure: { sites: [...] }
      siteData = result.sites;
    }
    
    console.log('[VuePtSite] Parsed site data:', siteData);
    
    if (siteData && Array.isArray(siteData)) {
      sites.value = siteData;
      console.log('[VuePtSite] Loaded sites:', sites.value.length);
    } else {
      console.warn('[VuePtSite] No valid site data found in response');
      sites.value = [];
    }
  } catch (error) {
    console.error('[VuePtSite] Failed to load sites:', error);
    sites.value = [];
  } finally {
    loading.value = false;
  }
}

async function refreshAll() {
  loading.value = true;
  try {
    await props.api.post(`plugin/${props.pluginId}/site/refresh-all`);
    await loadSites();
  } catch (error) {
    console.error('[VuePtSite] Failed to refresh all:', error);
  } finally {
    loading.value = false;
  }
}

async function refreshSite(site) {
  refreshingId.value = site.id;
  try {
    await props.api.post(`plugin/${props.pluginId}/site/refresh`, {
      site_id: site.id,
    });
    await loadSites();
  } catch (error) {
    console.error('[VuePtSite] Failed to refresh site:', error);
  } finally {
    refreshingId.value = null;
  }
}

function formatSize(bytes) {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function formatNumber(num) {
  if (!num) return '0'
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

return (_ctx, _cache) => {
  const _component_v_icon = _resolveComponent("v-icon");
  const _component_v_btn = _resolveComponent("v-btn");
  const _component_v_chip = _resolveComponent("v-chip");
  const _component_v_col = _resolveComponent("v-col");
  const _component_v_row = _resolveComponent("v-row");
  const _component_v_progress_circular = _resolveComponent("v-progress-circular");

  return (_openBlock(), _createElementBlock("div", _hoisted_1, [
    _createElementVNode("div", _hoisted_2, [
      _createElementVNode("div", _hoisted_3, [
        _createElementVNode("div", _hoisted_4, [
          _createElementVNode("div", _hoisted_5, [
            _createVNode(_component_v_icon, {
              icon: "mdi-web",
              size: "24"
            })
          ]),
          _cache[3] || (_cache[3] = _createElementVNode("div", null, [
            _createElementVNode("h1", { class: "vpts-header__title" }, "PT Site"),
            _createElementVNode("p", { class: "vpts-header__desc" }, "站点用户信息统计")
          ], -1))
        ]),
        _createElementVNode("div", _hoisted_6, [
          _createElementVNode("div", _hoisted_7, [
            _createElementVNode("span", _hoisted_8, _toDisplayString(sites.value.length), 1),
            _cache[4] || (_cache[4] = _createElementVNode("span", { class: "vpts-stat__label" }, "站点", -1))
          ]),
          _cache[7] || (_cache[7] = _createElementVNode("div", { class: "vpts-stat__divider" }, null, -1)),
          _createElementVNode("div", _hoisted_9, [
            _createElementVNode("span", _hoisted_10, _toDisplayString(formatSize(totalUpload.value)), 1),
            _cache[5] || (_cache[5] = _createElementVNode("span", { class: "vpts-stat__label" }, "总上传", -1))
          ]),
          _cache[8] || (_cache[8] = _createElementVNode("div", { class: "vpts-stat__divider" }, null, -1)),
          _createElementVNode("div", _hoisted_11, [
            _createElementVNode("span", _hoisted_12, _toDisplayString(formatSize(totalDownload.value)), 1),
            _cache[6] || (_cache[6] = _createElementVNode("span", { class: "vpts-stat__label" }, "总下载", -1))
          ])
        ]),
        _createElementVNode("div", _hoisted_13, [
          _createVNode(_component_v_btn, {
            color: "primary",
            variant: "tonal",
            loading: loading.value,
            onClick: refreshAll,
            size: "small"
          }, {
            default: _withCtx(() => [
              _createVNode(_component_v_icon, {
                start: "",
                icon: "mdi-refresh"
              }),
              _cache[9] || (_cache[9] = _createTextVNode(" 刷新全部 ", -1))
            ]),
            _: 1
          }, 8, ["loading"])
        ])
      ]),
      _createElementVNode("div", _hoisted_14, [
        _createElementVNode("div", _hoisted_15, [
          _createVNode(_component_v_icon, {
            icon: "mdi-magnify",
            size: "18",
            class: "vpts-search__icon"
          }),
          _withDirectives(_createElementVNode("input", {
            "onUpdate:modelValue": _cache[0] || (_cache[0] = $event => ((keyword).value = $event)),
            type: "text",
            placeholder: "搜索站点...",
            class: "vpts-search__input"
          }, null, 512), [
            [_vModelText, keyword.value]
          ]),
          (keyword.value)
            ? (_openBlock(), _createElementBlock("button", {
                key: 0,
                class: "vpts-search__clear",
                onClick: _cache[1] || (_cache[1] = $event => (keyword.value = ''))
              }, [
                _createVNode(_component_v_icon, {
                  icon: "mdi-close-circle",
                  size: "16"
                })
              ]))
            : _createCommentVNode("", true)
        ]),
        _createElementVNode("div", _hoisted_16, [
          _cache[10] || (_cache[10] = _createTextVNode(" 共 ", -1)),
          _createElementVNode("b", null, _toDisplayString(filteredSites.value.length), 1),
          _createTextVNode(" / " + _toDisplayString(sites.value.length) + " 个站点 ", 1)
        ])
      ])
    ]),
    (filteredSites.value.length > 0)
      ? (_openBlock(), _createElementBlock("div", _hoisted_17, [
          (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(filteredSites.value, (site) => {
            return (_openBlock(), _createElementBlock("div", {
              key: site.id,
              class: "vpts-card"
            }, [
              _createElementVNode("div", _hoisted_18, [
                _createElementVNode("div", _hoisted_19, [
                  (site.icon)
                    ? (_openBlock(), _createElementBlock("img", {
                        key: 0,
                        src: site.icon,
                        class: "vpts-card__icon",
                        alt: site.name,
                        onError: _cache[2] || (_cache[2] = (e) => e.target.style.display='none')
                      }, null, 40, _hoisted_20))
                    : (_openBlock(), _createBlock(_component_v_icon, {
                        key: 1,
                        icon: "mdi-server",
                        size: "18",
                        color: "primary"
                      })),
                  (site.url)
                    ? (_openBlock(), _createElementBlock("a", {
                        key: 2,
                        href: site.url,
                        target: "_blank",
                        rel: "noopener noreferrer",
                        class: "vpts-card__link"
                      }, [
                        _createTextVNode(_toDisplayString(site.name) + " ", 1),
                        _createVNode(_component_v_icon, {
                          icon: "mdi-open-in-new",
                          size: "12",
                          class: "vpts-card__link-icon"
                        })
                      ], 8, _hoisted_21))
                    : (_openBlock(), _createElementBlock("span", _hoisted_22, _toDisplayString(site.name), 1)),
                  (site.error)
                    ? (_openBlock(), _createBlock(_component_v_chip, {
                        key: 4,
                        size: "x-small",
                        color: "error",
                        variant: "tonal",
                        class: "ml-2"
                      }, {
                        default: _withCtx(() => [
                          _createTextVNode(_toDisplayString(site.error), 1)
                        ]),
                        _: 2
                      }, 1024))
                    : _createCommentVNode("", true)
                ]),
                _createVNode(_component_v_btn, {
                  size: "x-small",
                  variant: "text",
                  icon: "mdi-refresh",
                  loading: refreshingId.value === site.id,
                  onClick: $event => (refreshSite(site))
                }, null, 8, ["loading", "onClick"])
              ]),
              _createElementVNode("div", _hoisted_23, [
                _createVNode(_component_v_row, { dense: "" }, {
                  default: _withCtx(() => [
                    _createVNode(_component_v_col, {
                      cols: "6",
                      md: "3",
                      sm: "4"
                    }, {
                      default: _withCtx(() => [
                        _createElementVNode("div", _hoisted_24, [
                          _createVNode(_component_v_icon, {
                            icon: "mdi-account",
                            size: "14",
                            color: "grey"
                          }),
                          _cache[11] || (_cache[11] = _createElementVNode("span", { class: "vpts-field__label" }, "账号", -1)),
                          _createElementVNode("span", _hoisted_25, _toDisplayString(site.username || '-'), 1)
                        ])
                      ]),
                      _: 2
                    }, 1024),
                    _createVNode(_component_v_col, {
                      cols: "6",
                      md: "3",
                      sm: "4"
                    }, {
                      default: _withCtx(() => [
                        _createElementVNode("div", _hoisted_26, [
                          _createVNode(_component_v_icon, {
                            icon: "mdi-star",
                            size: "14",
                            color: "amber"
                          }),
                          _cache[12] || (_cache[12] = _createElementVNode("span", { class: "vpts-field__label" }, "等级", -1)),
                          _createElementVNode("span", _hoisted_27, _toDisplayString(site.level || '-'), 1)
                        ])
                      ]),
                      _: 2
                    }, 1024),
                    _createVNode(_component_v_col, {
                      cols: "6",
                      md: "3",
                      sm: "4"
                    }, {
                      default: _withCtx(() => [
                        _createElementVNode("div", _hoisted_28, [
                          _createVNode(_component_v_icon, {
                            icon: "mdi-arrow-up",
                            size: "14",
                            color: "success"
                          }),
                          _cache[13] || (_cache[13] = _createElementVNode("span", { class: "vpts-field__label" }, "上传", -1)),
                          _createElementVNode("span", _hoisted_29, _toDisplayString(formatSize(site.upload)), 1)
                        ])
                      ]),
                      _: 2
                    }, 1024),
                    _createVNode(_component_v_col, {
                      cols: "6",
                      md: "3",
                      sm: "4"
                    }, {
                      default: _withCtx(() => [
                        _createElementVNode("div", _hoisted_30, [
                          _createVNode(_component_v_icon, {
                            icon: "mdi-arrow-down",
                            size: "14",
                            color: "error"
                          }),
                          _cache[14] || (_cache[14] = _createElementVNode("span", { class: "vpts-field__label" }, "下载", -1)),
                          _createElementVNode("span", _hoisted_31, _toDisplayString(formatSize(site.download)), 1)
                        ])
                      ]),
                      _: 2
                    }, 1024),
                    _createVNode(_component_v_col, {
                      cols: "6",
                      md: "3",
                      sm: "4"
                    }, {
                      default: _withCtx(() => [
                        _createElementVNode("div", _hoisted_32, [
                          _createVNode(_component_v_icon, {
                            icon: "mdi-percent",
                            size: "14",
                            color: "info"
                          }),
                          _cache[15] || (_cache[15] = _createElementVNode("span", { class: "vpts-field__label" }, "分享率", -1)),
                          _createElementVNode("span", _hoisted_33, _toDisplayString(site.ratio || '0.00'), 1)
                        ])
                      ]),
                      _: 2
                    }, 1024),
                    _createVNode(_component_v_col, {
                      cols: "6",
                      md: "3",
                      sm: "4"
                    }, {
                      default: _withCtx(() => [
                        _createElementVNode("div", _hoisted_34, [
                          _createVNode(_component_v_icon, {
                            icon: "mdi-bolt",
                            size: "14",
                            color: "orange"
                          }),
                          _cache[16] || (_cache[16] = _createElementVNode("span", { class: "vpts-field__label" }, "魔力值", -1)),
                          _createElementVNode("span", _hoisted_35, _toDisplayString(formatNumber(site.bonus)), 1)
                        ])
                      ]),
                      _: 2
                    }, 1024),
                    _createVNode(_component_v_col, {
                      cols: "6",
                      md: "3",
                      sm: "4"
                    }, {
                      default: _withCtx(() => [
                        _createElementVNode("div", _hoisted_36, [
                          _createVNode(_component_v_icon, {
                            icon: "mdi-seeding",
                            size: "14",
                            color: "teal"
                          }),
                          _cache[17] || (_cache[17] = _createElementVNode("span", { class: "vpts-field__label" }, "做种数", -1)),
                          _createElementVNode("span", _hoisted_37, _toDisplayString(site.seeding || 0), 1)
                        ])
                      ]),
                      _: 2
                    }, 1024),
                    _createVNode(_component_v_col, {
                      cols: "6",
                      md: "3",
                      sm: "4"
                    }, {
                      default: _withCtx(() => [
                        _createElementVNode("div", _hoisted_38, [
                          _createVNode(_component_v_icon, {
                            icon: "mdi-clock-outline",
                            size: "14",
                            color: "purple"
                          }),
                          _cache[18] || (_cache[18] = _createElementVNode("span", { class: "vpts-field__label" }, "加入时间", -1)),
                          _createElementVNode("span", _hoisted_39, _toDisplayString(site.join_time || '-'), 1)
                        ])
                      ]),
                      _: 2
                    }, 1024),
                    (site.hr > 0)
                      ? (_openBlock(), _createBlock(_component_v_col, {
                          key: 0,
                          cols: "6",
                          md: "3",
                          sm: "4"
                        }, {
                          default: _withCtx(() => [
                            _createElementVNode("div", _hoisted_40, [
                              _createVNode(_component_v_icon, {
                                icon: "mdi-alert",
                                size: "14",
                                color: "error"
                              }),
                              _cache[19] || (_cache[19] = _createElementVNode("span", { class: "vpts-field__label" }, "H&R", -1)),
                              _createElementVNode("span", _hoisted_41, _toDisplayString(site.hr), 1)
                            ])
                          ]),
                          _: 2
                        }, 1024))
                      : _createCommentVNode("", true)
                  ]),
                  _: 2
                }, 1024)
              ])
            ]))
          }), 128))
        ]))
      : (!loading.value)
        ? (_openBlock(), _createElementBlock("div", _hoisted_42, [
            _createVNode(_component_v_icon, {
              icon: "mdi-web-off",
              size: "64",
              color: "grey-lighten-1"
            }),
            _cache[21] || (_cache[21] = _createElementVNode("p", { class: "vpts-empty__text" }, "暂无站点数据", -1)),
            _cache[22] || (_cache[22] = _createElementVNode("p", { class: "vpts-empty__hint" }, "请先在 MoviePilot 站点管理中添加 PT 站点", -1)),
            _createVNode(_component_v_btn, {
              color: "primary",
              variant: "tonal",
              onClick: loadSites,
              class: "mt-2"
            }, {
              default: _withCtx(() => [
                _createVNode(_component_v_icon, {
                  start: "",
                  icon: "mdi-refresh"
                }),
                _cache[20] || (_cache[20] = _createTextVNode(" 刷新数据 ", -1))
              ]),
              _: 1
            })
          ]))
        : _createCommentVNode("", true),
    (loading.value)
      ? (_openBlock(), _createElementBlock("div", _hoisted_43, [
          _createVNode(_component_v_progress_circular, {
            indeterminate: "",
            color: "primary"
          })
        ]))
      : _createCommentVNode("", true)
  ]))
}
}

};
const AppPage = /*#__PURE__*/_export_sfc(_sfc_main, [['__scopeId',"data-v-36a66f9c"]]);

export { AppPage as default };
