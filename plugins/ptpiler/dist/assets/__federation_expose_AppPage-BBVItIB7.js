import { importShared } from './__federation_fn_import-JrT3xvdd.js';

const {createTextVNode:_createTextVNode,resolveComponent:_resolveComponent,withCtx:_withCtx,createVNode:_createVNode,openBlock:_openBlock,createBlock:_createBlock,createCommentVNode:_createCommentVNode,toDisplayString:_toDisplayString,createElementVNode:_createElementVNode,withKeys:_withKeys,createElementBlock:_createElementBlock,withModifiers:_withModifiers} = await importShared('vue');


const _hoisted_1 = ["href"];
const _hoisted_2 = {
  key: 1,
  class: "text-center text-grey py-8"
};

const {computed,onMounted,ref,reactive} = await importShared('vue');



const _sfc_main = {
  __name: 'AppPage',
  props: {
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
},
  setup(__props, { expose: __expose }) {

const props = __props;

const loading = ref(false);
const error = ref('');
const sites = ref([]);
const allUserInfo = ref([]);
const searchResults = ref([]);
const searchKeyword = ref('');
const tab = ref('sites');

const pluginBase = computed(() => `plugin/${props.pluginId}`);

const siteTypes = [
  { title: 'NexusPHP', value: 'nexusphp' },
  { title: 'Unit3D', value: 'unit3d' },
  { title: 'Gazelle', value: 'gazelle' },
];

const newSite = reactive({
  name: '',
  url: '',
  cookie: '',
  type: 'nexusphp',
});

const addDialog = ref(false);
const deleteConfirm = ref(null);

async function loadSites() {
  loading.value = true;
  error.value = '';
  try {
    const res = await props.api.get(`${pluginBase.value}/sites`);
    sites.value = res?.data?.sites || res?.sites || [];
  } catch (err) {
    error.value = err?.message || 'Failed to load sites';
  } finally {
    loading.value = false;
  }
}

async function addSite() {
  if (!newSite.name || !newSite.url) return
  loading.value = true;
  error.value = '';
  try {
    await props.api.post(`${pluginBase.value}/site/add`, {
      name: newSite.name,
      url: newSite.url,
      cookie: newSite.cookie,
      type: newSite.type,
    });
    newSite.name = '';
    newSite.url = '';
    newSite.cookie = '';
    newSite.type = 'nexusphp';
    addDialog.value = false;
    await loadSites();
  } catch (err) {
    error.value = err?.message || 'Failed to add site';
  } finally {
    loading.value = false;
  }
}

async function deleteSite(siteId) {
  loading.value = true;
  error.value = '';
  try {
    await props.api.post(`${pluginBase.value}/site/delete`, { site_id: siteId });
    deleteConfirm.value = null;
    await loadSites();
  } catch (err) {
    error.value = err?.message || 'Failed to delete site';
  } finally {
    loading.value = false;
  }
}

async function refreshUserInfo(siteId) {
  loading.value = true;
  error.value = '';
  try {
    const res = await props.api.get(`${pluginBase.value}/userinfo?site_id=${siteId}`);
    if (res?.data?.success || res?.success) {
      await loadSites();
    }
  } catch (err) {
    error.value = err?.message || 'Failed to refresh user info';
  } finally {
    loading.value = false;
  }
}

async function refreshAllUserInfo() {
  loading.value = true;
  error.value = '';
  try {
    const res = await props.api.get(`${pluginBase.value}/userinfo/all`);
    allUserInfo.value = res?.data?.sites || res?.sites || [];
    await loadSites();
  } catch (err) {
    error.value = err?.message || 'Failed to refresh all user info';
  } finally {
    loading.value = false;
  }
}

async function search() {
  if (!searchKeyword.value) return
  loading.value = true;
  error.value = '';
  searchResults.value = [];
  try {
    const res = await props.api.get(`${pluginBase.value}/search?keyword=${encodeURIComponent(searchKeyword.value)}`);
    searchResults.value = res?.data?.results || res?.results || [];
  } catch (err) {
    error.value = err?.message || 'Failed to search';
  } finally {
    loading.value = false;
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

onMounted(loadSites);

__expose({ loadSites, refreshAllUserInfo });

return (_ctx, _cache) => {
  const _component_v_icon = _resolveComponent("v-icon");
  const _component_v_card_title = _resolveComponent("v-card-title");
  const _component_v_card_subtitle = _resolveComponent("v-card-subtitle");
  const _component_v_card = _resolveComponent("v-card");
  const _component_v_alert = _resolveComponent("v-alert");
  const _component_v_tab = _resolveComponent("v-tab");
  const _component_v_tabs = _resolveComponent("v-tabs");
  const _component_v_spacer = _resolveComponent("v-spacer");
  const _component_v_btn = _resolveComponent("v-btn");
  const _component_v_data_table = _resolveComponent("v-data-table");
  const _component_v_card_text = _resolveComponent("v-card-text");
  const _component_v_window_item = _resolveComponent("v-window-item");
  const _component_v_text_field = _resolveComponent("v-text-field");
  const _component_v_col = _resolveComponent("v-col");
  const _component_v_row = _resolveComponent("v-row");
  const _component_v_window = _resolveComponent("v-window");
  const _component_v_select = _resolveComponent("v-select");
  const _component_v_textarea = _resolveComponent("v-textarea");
  const _component_v_form = _resolveComponent("v-form");
  const _component_v_card_actions = _resolveComponent("v-card-actions");
  const _component_v_dialog = _resolveComponent("v-dialog");

  return (_openBlock(), _createElementBlock("div", null, [
    (!__props.hideTitle)
      ? (_openBlock(), _createBlock(_component_v_card, {
          key: 0,
          class: "mb-4"
        }, {
          default: _withCtx(() => [
            _createVNode(_component_v_card_title, { class: "text-h5" }, {
              default: _withCtx(() => [
                _createVNode(_component_v_icon, { class: "mr-2" }, {
                  default: _withCtx(() => [...(_cache[14] || (_cache[14] = [
                    _createTextVNode("mdi-file-tree", -1)
                  ]))]),
                  _: 1
                }),
                _cache[15] || (_cache[15] = _createTextVNode(" PT Piler ", -1))
              ]),
              _: 1
            }),
            _createVNode(_component_v_card_subtitle, null, {
              default: _withCtx(() => [...(_cache[16] || (_cache[16] = [
                _createTextVNode("PT Site Management Tool", -1)
              ]))]),
              _: 1
            })
          ]),
          _: 1
        }))
      : _createCommentVNode("", true),
    (error.value)
      ? (_openBlock(), _createBlock(_component_v_alert, {
          key: 1,
          type: "error",
          class: "mb-4",
          closable: "",
          "onClick:close": _cache[0] || (_cache[0] = $event => (error.value = ''))
        }, {
          default: _withCtx(() => [
            _createTextVNode(_toDisplayString(error.value), 1)
          ]),
          _: 1
        }))
      : _createCommentVNode("", true),
    _createVNode(_component_v_tabs, {
      modelValue: tab.value,
      "onUpdate:modelValue": _cache[1] || (_cache[1] = $event => ((tab).value = $event)),
      class: "mb-4"
    }, {
      default: _withCtx(() => [
        _createVNode(_component_v_tab, { value: "sites" }, {
          default: _withCtx(() => [
            _createVNode(_component_v_icon, { start: "" }, {
              default: _withCtx(() => [...(_cache[17] || (_cache[17] = [
                _createTextVNode("mdi-server", -1)
              ]))]),
              _: 1
            }),
            _cache[18] || (_cache[18] = _createTextVNode(" Sites ", -1))
          ]),
          _: 1
        }),
        _createVNode(_component_v_tab, { value: "search" }, {
          default: _withCtx(() => [
            _createVNode(_component_v_icon, { start: "" }, {
              default: _withCtx(() => [...(_cache[19] || (_cache[19] = [
                _createTextVNode("mdi-magnify", -1)
              ]))]),
              _: 1
            }),
            _cache[20] || (_cache[20] = _createTextVNode(" Search ", -1))
          ]),
          _: 1
        })
      ]),
      _: 1
    }, 8, ["modelValue"]),
    _createVNode(_component_v_window, {
      modelValue: tab.value,
      "onUpdate:modelValue": _cache[4] || (_cache[4] = $event => ((tab).value = $event))
    }, {
      default: _withCtx(() => [
        _createVNode(_component_v_window_item, { value: "sites" }, {
          default: _withCtx(() => [
            _createVNode(_component_v_card, null, {
              default: _withCtx(() => [
                _createVNode(_component_v_card_title, { class: "d-flex align-center" }, {
                  default: _withCtx(() => [
                    _cache[25] || (_cache[25] = _createTextVNode(" Site List ", -1)),
                    _createVNode(_component_v_spacer),
                    _createVNode(_component_v_btn, {
                      color: "primary",
                      size: "small",
                      class: "mr-2",
                      onClick: refreshAllUserInfo,
                      loading: loading.value
                    }, {
                      default: _withCtx(() => [
                        _createVNode(_component_v_icon, { start: "" }, {
                          default: _withCtx(() => [...(_cache[21] || (_cache[21] = [
                            _createTextVNode("mdi-refresh", -1)
                          ]))]),
                          _: 1
                        }),
                        _cache[22] || (_cache[22] = _createTextVNode(" Refresh All ", -1))
                      ]),
                      _: 1
                    }, 8, ["loading"]),
                    _createVNode(_component_v_btn, {
                      color: "primary",
                      size: "small",
                      onClick: _cache[2] || (_cache[2] = $event => (addDialog.value = true))
                    }, {
                      default: _withCtx(() => [
                        _createVNode(_component_v_icon, { start: "" }, {
                          default: _withCtx(() => [...(_cache[23] || (_cache[23] = [
                            _createTextVNode("mdi-plus", -1)
                          ]))]),
                          _: 1
                        }),
                        _cache[24] || (_cache[24] = _createTextVNode(" Add Site ", -1))
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                }),
                _createVNode(_component_v_card_text, null, {
                  default: _withCtx(() => [
                    _createVNode(_component_v_data_table, {
                      items: sites.value,
                      headers: [
                { title: 'Name', key: 'name', sortable: true },
                { title: 'URL', key: 'url', sortable: false },
                { title: 'Type', key: 'type', sortable: true },
                { title: 'Upload', key: 'user_info.upload', sortable: true },
                { title: 'Download', key: 'user_info.download', sortable: true },
                { title: 'Ratio', key: 'user_info.ratio', sortable: true },
                { title: 'Bonus', key: 'user_info.bonus', sortable: true },
                { title: 'Seeding', key: 'user_info.seeding', sortable: true },
                { title: 'Actions', key: 'actions', sortable: false },
              ],
                      loading: loading.value,
                      "no-data-text": "No sites configured. Click 'Add Site' to get started."
                    }, {
                      [`item.url`]: _withCtx(({ item }) => [
                        _createElementVNode("a", {
                          href: item.url,
                          target: "_blank",
                          class: "text-primary"
                        }, _toDisplayString(item.url), 9, _hoisted_1)
                      ]),
                      [`item.user_info.upload`]: _withCtx(({ item }) => [
                        _createTextVNode(_toDisplayString(item.user_info ? formatSize(item.user_info.upload) : '-'), 1)
                      ]),
                      [`item.user_info.download`]: _withCtx(({ item }) => [
                        _createTextVNode(_toDisplayString(item.user_info ? formatSize(item.user_info.download) : '-'), 1)
                      ]),
                      [`item.user_info.ratio`]: _withCtx(({ item }) => [
                        _createTextVNode(_toDisplayString(item.user_info ? item.user_info.ratio?.toFixed(2) : '-'), 1)
                      ]),
                      [`item.user_info.bonus`]: _withCtx(({ item }) => [
                        _createTextVNode(_toDisplayString(item.user_info ? formatNumber(item.user_info.bonus) : '-'), 1)
                      ]),
                      [`item.user_info.seeding`]: _withCtx(({ item }) => [
                        _createTextVNode(_toDisplayString(item.user_info ? item.user_info.seeding : '-'), 1)
                      ]),
                      [`item.actions`]: _withCtx(({ item }) => [
                        _createVNode(_component_v_icon, {
                          size: "small",
                          class: "mr-1",
                          onClick: $event => (refreshUserInfo(item.id)),
                          title: 'Refresh'
                        }, {
                          default: _withCtx(() => [...(_cache[26] || (_cache[26] = [
                            _createTextVNode(" mdi-refresh ", -1)
                          ]))]),
                          _: 1
                        }, 8, ["onClick"]),
                        _createVNode(_component_v_icon, {
                          size: "small",
                          color: "error",
                          onClick: $event => (deleteConfirm.value = item),
                          title: 'Delete'
                        }, {
                          default: _withCtx(() => [...(_cache[27] || (_cache[27] = [
                            _createTextVNode(" mdi-delete ", -1)
                          ]))]),
                          _: 1
                        }, 8, ["onClick"])
                      ]),
                      _: 2
                    }, 1032, ["items", "loading"])
                  ]),
                  _: 1
                })
              ]),
              _: 1
            })
          ]),
          _: 1
        }),
        _createVNode(_component_v_window_item, { value: "search" }, {
          default: _withCtx(() => [
            _createVNode(_component_v_card, null, {
              default: _withCtx(() => [
                _createVNode(_component_v_card_title, null, {
                  default: _withCtx(() => [
                    _createVNode(_component_v_icon, { class: "mr-2" }, {
                      default: _withCtx(() => [...(_cache[28] || (_cache[28] = [
                        _createTextVNode("mdi-magnify", -1)
                      ]))]),
                      _: 1
                    }),
                    _cache[29] || (_cache[29] = _createTextVNode(" Search Torrents ", -1))
                  ]),
                  _: 1
                }),
                _createVNode(_component_v_card_text, null, {
                  default: _withCtx(() => [
                    _createVNode(_component_v_row, null, {
                      default: _withCtx(() => [
                        _createVNode(_component_v_col, {
                          cols: "12",
                          md: "8"
                        }, {
                          default: _withCtx(() => [
                            _createVNode(_component_v_text_field, {
                              modelValue: searchKeyword.value,
                              "onUpdate:modelValue": _cache[3] || (_cache[3] = $event => ((searchKeyword).value = $event)),
                              label: "Search keyword",
                              "prepend-inner-icon": "mdi-magnify",
                              onKeyup: _withKeys(search, ["enter"]),
                              clearable: ""
                            }, null, 8, ["modelValue"])
                          ]),
                          _: 1
                        }),
                        _createVNode(_component_v_col, {
                          cols: "12",
                          md: "4"
                        }, {
                          default: _withCtx(() => [
                            _createVNode(_component_v_btn, {
                              color: "primary",
                              block: "",
                              onClick: search,
                              loading: loading.value,
                              disabled: !searchKeyword.value
                            }, {
                              default: _withCtx(() => [...(_cache[30] || (_cache[30] = [
                                _createTextVNode(" Search ", -1)
                              ]))]),
                              _: 1
                            }, 8, ["loading", "disabled"])
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    }),
                    (searchResults.value.length > 0)
                      ? (_openBlock(), _createBlock(_component_v_data_table, {
                          key: 0,
                          items: searchResults.value,
                          headers: [
                { title: 'Site', key: 'site', sortable: true },
                { title: 'Title', key: 'title', sortable: false },
                { title: 'Size', key: 'size', sortable: true },
                { title: 'Seeders', key: 'seeders', sortable: true },
                { title: 'Leechers', key: 'leechers', sortable: true },
                { title: 'Action', key: 'action', sortable: false },
              ],
                          class: "mt-4"
                        }, {
                          [`item.size`]: _withCtx(({ item }) => [
                            _createTextVNode(_toDisplayString(formatSize(item.size)), 1)
                          ]),
                          [`item.action`]: _withCtx(({ item }) => [
                            _createVNode(_component_v_btn, {
                              size: "small",
                              color: "primary",
                              href: item.url,
                              target: "_blank"
                            }, {
                              default: _withCtx(() => [
                                _createVNode(_component_v_icon, { start: "" }, {
                                  default: _withCtx(() => [...(_cache[31] || (_cache[31] = [
                                    _createTextVNode("mdi-download", -1)
                                  ]))]),
                                  _: 1
                                }),
                                _cache[32] || (_cache[32] = _createTextVNode(" Download ", -1))
                              ]),
                              _: 1
                            }, 8, ["href"])
                          ]),
                          _: 2
                        }, 1032, ["items"]))
                      : (searchKeyword.value && !loading.value)
                        ? (_openBlock(), _createElementBlock("div", _hoisted_2, " No results found "))
                        : _createCommentVNode("", true)
                  ]),
                  _: 1
                })
              ]),
              _: 1
            })
          ]),
          _: 1
        })
      ]),
      _: 1
    }, 8, ["modelValue"]),
    _createVNode(_component_v_dialog, {
      modelValue: addDialog.value,
      "onUpdate:modelValue": _cache[10] || (_cache[10] = $event => ((addDialog).value = $event)),
      "max-width": "600"
    }, {
      default: _withCtx(() => [
        _createVNode(_component_v_card, null, {
          default: _withCtx(() => [
            _createVNode(_component_v_card_title, null, {
              default: _withCtx(() => [
                _createVNode(_component_v_icon, { class: "mr-2" }, {
                  default: _withCtx(() => [...(_cache[33] || (_cache[33] = [
                    _createTextVNode("mdi-plus", -1)
                  ]))]),
                  _: 1
                }),
                _cache[34] || (_cache[34] = _createTextVNode(" Add Site ", -1))
              ]),
              _: 1
            }),
            _createVNode(_component_v_card_text, null, {
              default: _withCtx(() => [
                _createVNode(_component_v_form, {
                  onSubmit: _withModifiers(addSite, ["prevent"])
                }, {
                  default: _withCtx(() => [
                    _createVNode(_component_v_text_field, {
                      modelValue: newSite.name,
                      "onUpdate:modelValue": _cache[5] || (_cache[5] = $event => ((newSite.name) = $event)),
                      label: "Site Name",
                      required: ""
                    }, null, 8, ["modelValue"]),
                    _createVNode(_component_v_text_field, {
                      modelValue: newSite.url,
                      "onUpdate:modelValue": _cache[6] || (_cache[6] = $event => ((newSite.url) = $event)),
                      label: "Site URL",
                      required: "",
                      placeholder: "https://example.com"
                    }, null, 8, ["modelValue"]),
                    _createVNode(_component_v_select, {
                      modelValue: newSite.type,
                      "onUpdate:modelValue": _cache[7] || (_cache[7] = $event => ((newSite.type) = $event)),
                      items: siteTypes,
                      label: "Site Type"
                    }, null, 8, ["modelValue"]),
                    _createVNode(_component_v_textarea, {
                      modelValue: newSite.cookie,
                      "onUpdate:modelValue": _cache[8] || (_cache[8] = $event => ((newSite.cookie) = $event)),
                      label: "Cookie",
                      rows: "3"
                    }, null, 8, ["modelValue"])
                  ]),
                  _: 1
                })
              ]),
              _: 1
            }),
            _createVNode(_component_v_card_actions, null, {
              default: _withCtx(() => [
                _createVNode(_component_v_spacer),
                _createVNode(_component_v_btn, {
                  onClick: _cache[9] || (_cache[9] = $event => (addDialog.value = false))
                }, {
                  default: _withCtx(() => [...(_cache[35] || (_cache[35] = [
                    _createTextVNode("Cancel", -1)
                  ]))]),
                  _: 1
                }),
                _createVNode(_component_v_btn, {
                  color: "primary",
                  onClick: addSite,
                  loading: loading.value,
                  disabled: !newSite.name || !newSite.url
                }, {
                  default: _withCtx(() => [...(_cache[36] || (_cache[36] = [
                    _createTextVNode(" Add ", -1)
                  ]))]),
                  _: 1
                }, 8, ["loading", "disabled"])
              ]),
              _: 1
            })
          ]),
          _: 1
        })
      ]),
      _: 1
    }, 8, ["modelValue"]),
    _createVNode(_component_v_dialog, {
      modelValue: deleteConfirm.value,
      "onUpdate:modelValue": _cache[13] || (_cache[13] = $event => ((deleteConfirm).value = $event)),
      "max-width": "400"
    }, {
      default: _withCtx(() => [
        (deleteConfirm.value)
          ? (_openBlock(), _createBlock(_component_v_card, { key: 0 }, {
              default: _withCtx(() => [
                _createVNode(_component_v_card_title, null, {
                  default: _withCtx(() => [...(_cache[37] || (_cache[37] = [
                    _createTextVNode("Confirm Delete", -1)
                  ]))]),
                  _: 1
                }),
                _createVNode(_component_v_card_text, null, {
                  default: _withCtx(() => [
                    _cache[38] || (_cache[38] = _createTextVNode(" Are you sure you want to delete site ", -1)),
                    _createElementVNode("strong", null, _toDisplayString(deleteConfirm.value.name), 1),
                    _cache[39] || (_cache[39] = _createTextVNode("? ", -1))
                  ]),
                  _: 1
                }),
                _createVNode(_component_v_card_actions, null, {
                  default: _withCtx(() => [
                    _createVNode(_component_v_spacer),
                    _createVNode(_component_v_btn, {
                      onClick: _cache[11] || (_cache[11] = $event => (deleteConfirm.value = null))
                    }, {
                      default: _withCtx(() => [...(_cache[40] || (_cache[40] = [
                        _createTextVNode("Cancel", -1)
                      ]))]),
                      _: 1
                    }),
                    _createVNode(_component_v_btn, {
                      color: "error",
                      onClick: _cache[12] || (_cache[12] = $event => (deleteSite(deleteConfirm.value.id))),
                      loading: loading.value
                    }, {
                      default: _withCtx(() => [...(_cache[41] || (_cache[41] = [
                        _createTextVNode("Delete", -1)
                      ]))]),
                      _: 1
                    }, 8, ["loading"])
                  ]),
                  _: 1
                })
              ]),
              _: 1
            }))
          : _createCommentVNode("", true)
      ]),
      _: 1
    }, 8, ["modelValue"])
  ]))
}
}

};

export { _sfc_main as default };
