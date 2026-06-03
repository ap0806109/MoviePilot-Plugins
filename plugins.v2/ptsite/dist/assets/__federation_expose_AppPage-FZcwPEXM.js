import { importShared } from './__federation_fn_import-JrT3xvdd.js';

const _export_sfc = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) {
    target[key] = val;
  }
  return target;
};

const {createTextVNode:_createTextVNode,resolveComponent:_resolveComponent,withCtx:_withCtx,createVNode:_createVNode,toDisplayString:_toDisplayString,renderList:_renderList,Fragment:_Fragment,openBlock:_openBlock,createElementBlock:_createElementBlock,createBlock:_createBlock,createCommentVNode:_createCommentVNode,normalizeClass:_normalizeClass} = await importShared('vue');


const {ref,computed,onMounted} = await importShared('vue');



const _sfc_main = {
  __name: 'AppPage',
  props: {
  api: Object,
  pluginId: String,
  hideTitle: Boolean,
},
  setup(__props) {

const props = __props;

const sites = ref([]);
const loading = ref(false);

const stats = computed(() => ({
  total: sites.value.length,
}));

const totalStats = computed(() => {
  return sites.value.reduce(
    (acc, site) => {
      if (site.user_info) {
        acc.upload += site.user_info.upload || 0;
        acc.download += site.user_info.download || 0;
        acc.seeding += site.user_info.seeding || 0;
        acc.hr += site.user_info.hr || 0;
      }
      return acc
    },
    { upload: 0, download: 0, seeding: 0, hr: 0, total: sites.value.length }
  )
});

onMounted(async () => {
  await loadSites();
});

async function loadSites() {
  try {
    const response = await props.api.get(`plugin/${props.pluginId}/sites`);
    if (response.data && response.data.success !== false) {
      sites.value = response.data.sites || [];
    }
  } catch (error) {
    console.error('Failed to load sites:', error);
  }
}

async function refreshAll() {
  loading.value = true;
  try {
    const response = await props.api.post(`plugin/${props.pluginId}/site/refresh-all`);
    if (response.data && response.data.success) {
      await loadSites();
    }
  } catch (error) {
    console.error('Failed to refresh all:', error);
  } finally {
    loading.value = false;
  }
}

async function refreshSite(site) {
  try {
    await props.api.post(`plugin/${props.pluginId}/site/refresh`, { site_id: site.id });
    await loadSites();
  } catch (error) {
    console.error('Failed to refresh site:', error);
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

function formatTime(timeStr) {
  if (!timeStr) return ''
  const date = new Date(timeStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

return (_ctx, _cache) => {
  const _component_v_icon = _resolveComponent("v-icon");
  const _component_v_card_title = _resolveComponent("v-card-title");
  const _component_v_btn = _resolveComponent("v-btn");
  const _component_v_spacer = _resolveComponent("v-spacer");
  const _component_v_chip = _resolveComponent("v-chip");
  const _component_v_card_actions = _resolveComponent("v-card-actions");
  const _component_v_card = _resolveComponent("v-card");
  const _component_v_col = _resolveComponent("v-col");
  const _component_v_row = _resolveComponent("v-row");
  const _component_v_list_item_title = _resolveComponent("v-list-item-title");
  const _component_v_list_item_subtitle = _resolveComponent("v-list-item-subtitle");
  const _component_v_list_item = _resolveComponent("v-list-item");
  const _component_v_list = _resolveComponent("v-list");
  const _component_v_card_text = _resolveComponent("v-card-text");
  const _component_v_card_subtitle = _resolveComponent("v-card-subtitle");
  const _component_v_alert = _resolveComponent("v-alert");
  const _component_v_statistic = _resolveComponent("v-statistic");
  const _component_v_container = _resolveComponent("v-container");

  return (_openBlock(), _createBlock(_component_v_container, {
    fluid: "",
    class: "pt-site-container"
  }, {
    default: _withCtx(() => [
      _createVNode(_component_v_row, { class: "mb-4" }, {
        default: _withCtx(() => [
          _createVNode(_component_v_col, { cols: "12" }, {
            default: _withCtx(() => [
              _createVNode(_component_v_card, null, {
                default: _withCtx(() => [
                  _createVNode(_component_v_card_title, { class: "d-flex align-center" }, {
                    default: _withCtx(() => [
                      _createVNode(_component_v_icon, { class: "mr-2" }, {
                        default: _withCtx(() => [...(_cache[0] || (_cache[0] = [
                          _createTextVNode("mdi-web", -1)
                        ]))]),
                        _: 1
                      }),
                      _cache[1] || (_cache[1] = _createTextVNode(" PT Site - 站点信息统计 ", -1))
                    ]),
                    _: 1
                  }),
                  _createVNode(_component_v_card_actions, null, {
                    default: _withCtx(() => [
                      _createVNode(_component_v_btn, {
                        color: "primary",
                        onClick: refreshAll,
                        loading: loading.value
                      }, {
                        default: _withCtx(() => [
                          _createVNode(_component_v_icon, { start: "" }, {
                            default: _withCtx(() => [...(_cache[2] || (_cache[2] = [
                              _createTextVNode("mdi-refresh", -1)
                            ]))]),
                            _: 1
                          }),
                          _cache[3] || (_cache[3] = _createTextVNode(" 刷新所有站点 ", -1))
                        ]),
                        _: 1
                      }, 8, ["loading"]),
                      _createVNode(_component_v_spacer),
                      _createVNode(_component_v_chip, {
                        color: stats.value.total > 0 ? 'success' : 'grey',
                        variant: "tonal"
                      }, {
                        default: _withCtx(() => [
                          _createTextVNode(" 共 " + _toDisplayString(stats.value.total) + " 个站点 ", 1)
                        ]),
                        _: 1
                      }, 8, ["color"])
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
      }),
      _createVNode(_component_v_row, null, {
        default: _withCtx(() => [
          (_openBlock(true), _createElementBlock(_Fragment, null, _renderList(sites.value, (site) => {
            return (_openBlock(), _createBlock(_component_v_col, {
              cols: "12",
              md: "4",
              lg: "3",
              key: site.id
            }, {
              default: _withCtx(() => [
                _createVNode(_component_v_card, {
                  class: _normalizeClass({ 'card-error': site.error })
                }, {
                  default: _withCtx(() => [
                    _createVNode(_component_v_card_title, { class: "d-flex align-center" }, {
                      default: _withCtx(() => [
                        _createVNode(_component_v_icon, {
                          class: "mr-2",
                          color: site.user_info ? 'success' : 'grey'
                        }, {
                          default: _withCtx(() => [
                            _createTextVNode(_toDisplayString(site.user_info ? 'mdi-check-circle' : 'mdi-circle-outline'), 1)
                          ]),
                          _: 2
                        }, 1032, ["color"]),
                        _createTextVNode(" " + _toDisplayString(site.name), 1)
                      ]),
                      _: 2
                    }, 1024),
                    (site.user_info)
                      ? (_openBlock(), _createBlock(_component_v_card_text, { key: 0 }, {
                          default: _withCtx(() => [
                            _createVNode(_component_v_list, {
                              density: "compact",
                              lines: "two"
                            }, {
                              default: _withCtx(() => [
                                _createVNode(_component_v_list_item, null, {
                                  prepend: _withCtx(() => [
                                    _createVNode(_component_v_icon, {
                                      color: "primary",
                                      size: "small"
                                    }, {
                                      default: _withCtx(() => [...(_cache[4] || (_cache[4] = [
                                        _createTextVNode("mdi-account", -1)
                                      ]))]),
                                      _: 1
                                    })
                                  ]),
                                  default: _withCtx(() => [
                                    _createVNode(_component_v_list_item_title, null, {
                                      default: _withCtx(() => [...(_cache[5] || (_cache[5] = [
                                        _createTextVNode("账号", -1)
                                      ]))]),
                                      _: 1
                                    }),
                                    _createVNode(_component_v_list_item_subtitle, null, {
                                      default: _withCtx(() => [
                                        _createTextVNode(_toDisplayString(site.user_info.username), 1)
                                      ]),
                                      _: 2
                                    }, 1024)
                                  ]),
                                  _: 2
                                }, 1024),
                                _createVNode(_component_v_list_item, null, {
                                  prepend: _withCtx(() => [
                                    _createVNode(_component_v_icon, {
                                      color: "secondary",
                                      size: "small"
                                    }, {
                                      default: _withCtx(() => [...(_cache[6] || (_cache[6] = [
                                        _createTextVNode("mdi-star", -1)
                                      ]))]),
                                      _: 1
                                    })
                                  ]),
                                  default: _withCtx(() => [
                                    _createVNode(_component_v_list_item_title, null, {
                                      default: _withCtx(() => [...(_cache[7] || (_cache[7] = [
                                        _createTextVNode("等级", -1)
                                      ]))]),
                                      _: 1
                                    }),
                                    _createVNode(_component_v_list_item_subtitle, null, {
                                      default: _withCtx(() => [
                                        _createTextVNode(_toDisplayString(site.user_info.level), 1)
                                      ]),
                                      _: 2
                                    }, 1024)
                                  ]),
                                  _: 2
                                }, 1024),
                                _createVNode(_component_v_list_item, null, {
                                  prepend: _withCtx(() => [
                                    _createVNode(_component_v_icon, {
                                      color: "success",
                                      size: "small"
                                    }, {
                                      default: _withCtx(() => [...(_cache[8] || (_cache[8] = [
                                        _createTextVNode("mdi-arrow-up", -1)
                                      ]))]),
                                      _: 1
                                    })
                                  ]),
                                  default: _withCtx(() => [
                                    _createVNode(_component_v_list_item_title, null, {
                                      default: _withCtx(() => [...(_cache[9] || (_cache[9] = [
                                        _createTextVNode("上传量", -1)
                                      ]))]),
                                      _: 1
                                    }),
                                    _createVNode(_component_v_list_item_subtitle, null, {
                                      default: _withCtx(() => [
                                        _createTextVNode(_toDisplayString(formatSize(site.user_info.upload)), 1)
                                      ]),
                                      _: 2
                                    }, 1024)
                                  ]),
                                  _: 2
                                }, 1024),
                                _createVNode(_component_v_list_item, null, {
                                  prepend: _withCtx(() => [
                                    _createVNode(_component_v_icon, {
                                      color: "error",
                                      size: "small"
                                    }, {
                                      default: _withCtx(() => [...(_cache[10] || (_cache[10] = [
                                        _createTextVNode("mdi-arrow-down", -1)
                                      ]))]),
                                      _: 1
                                    })
                                  ]),
                                  default: _withCtx(() => [
                                    _createVNode(_component_v_list_item_title, null, {
                                      default: _withCtx(() => [...(_cache[11] || (_cache[11] = [
                                        _createTextVNode("下载量", -1)
                                      ]))]),
                                      _: 1
                                    }),
                                    _createVNode(_component_v_list_item_subtitle, null, {
                                      default: _withCtx(() => [
                                        _createTextVNode(_toDisplayString(formatSize(site.user_info.download)), 1)
                                      ]),
                                      _: 2
                                    }, 1024)
                                  ]),
                                  _: 2
                                }, 1024),
                                _createVNode(_component_v_list_item, null, {
                                  prepend: _withCtx(() => [
                                    _createVNode(_component_v_icon, {
                                      color: "warning",
                                      size: "small"
                                    }, {
                                      default: _withCtx(() => [...(_cache[12] || (_cache[12] = [
                                        _createTextVNode("mdi-percent", -1)
                                      ]))]),
                                      _: 1
                                    })
                                  ]),
                                  default: _withCtx(() => [
                                    _createVNode(_component_v_list_item_title, null, {
                                      default: _withCtx(() => [...(_cache[13] || (_cache[13] = [
                                        _createTextVNode("分享率", -1)
                                      ]))]),
                                      _: 1
                                    }),
                                    _createVNode(_component_v_list_item_subtitle, null, {
                                      default: _withCtx(() => [
                                        _createTextVNode(_toDisplayString(site.user_info.ratio), 1)
                                      ]),
                                      _: 2
                                    }, 1024)
                                  ]),
                                  _: 2
                                }, 1024),
                                (site.user_info.bonus > 0)
                                  ? (_openBlock(), _createBlock(_component_v_list_item, { key: 0 }, {
                                      prepend: _withCtx(() => [
                                        _createVNode(_component_v_icon, {
                                          color: "orange",
                                          size: "small"
                                        }, {
                                          default: _withCtx(() => [...(_cache[14] || (_cache[14] = [
                                            _createTextVNode("mdi-bolt", -1)
                                          ]))]),
                                          _: 1
                                        })
                                      ]),
                                      default: _withCtx(() => [
                                        _createVNode(_component_v_list_item_title, null, {
                                          default: _withCtx(() => [...(_cache[15] || (_cache[15] = [
                                            _createTextVNode("魔力值", -1)
                                          ]))]),
                                          _: 1
                                        }),
                                        _createVNode(_component_v_list_item_subtitle, null, {
                                          default: _withCtx(() => [
                                            _createTextVNode(_toDisplayString(formatNumber(site.user_info.bonus)), 1)
                                          ]),
                                          _: 2
                                        }, 1024)
                                      ]),
                                      _: 2
                                    }, 1024))
                                  : _createCommentVNode("", true),
                                (site.user_info.seeding > 0)
                                  ? (_openBlock(), _createBlock(_component_v_list_item, { key: 1 }, {
                                      prepend: _withCtx(() => [
                                        _createVNode(_component_v_icon, {
                                          color: "info",
                                          size: "small"
                                        }, {
                                          default: _withCtx(() => [...(_cache[16] || (_cache[16] = [
                                            _createTextVNode("mdi-seeding", -1)
                                          ]))]),
                                          _: 1
                                        })
                                      ]),
                                      default: _withCtx(() => [
                                        _createVNode(_component_v_list_item_title, null, {
                                          default: _withCtx(() => [...(_cache[17] || (_cache[17] = [
                                            _createTextVNode("做种数", -1)
                                          ]))]),
                                          _: 1
                                        }),
                                        _createVNode(_component_v_list_item_subtitle, null, {
                                          default: _withCtx(() => [
                                            _createTextVNode(_toDisplayString(site.user_info.seeding) + " 个 (" + _toDisplayString(formatSize(site.user_info.seeding_size)) + ")", 1)
                                          ]),
                                          _: 2
                                        }, 1024)
                                      ]),
                                      _: 2
                                    }, 1024))
                                  : _createCommentVNode("", true),
                                (site.user_info.hr > 0)
                                  ? (_openBlock(), _createBlock(_component_v_list_item, { key: 2 }, {
                                      prepend: _withCtx(() => [
                                        _createVNode(_component_v_icon, {
                                          color: "error",
                                          size: "small"
                                        }, {
                                          default: _withCtx(() => [...(_cache[18] || (_cache[18] = [
                                            _createTextVNode("mdi-alert", -1)
                                          ]))]),
                                          _: 1
                                        })
                                      ]),
                                      default: _withCtx(() => [
                                        _createVNode(_component_v_list_item_title, null, {
                                          default: _withCtx(() => [...(_cache[19] || (_cache[19] = [
                                            _createTextVNode("Hit&Run", -1)
                                          ]))]),
                                          _: 1
                                        }),
                                        _createVNode(_component_v_list_item_subtitle, null, {
                                          default: _withCtx(() => [
                                            _createTextVNode(_toDisplayString(site.user_info.hr) + " 个", 1)
                                          ]),
                                          _: 2
                                        }, 1024)
                                      ]),
                                      _: 2
                                    }, 1024))
                                  : _createCommentVNode("", true),
                                (site.user_info.seeding_time)
                                  ? (_openBlock(), _createBlock(_component_v_list_item, { key: 3 }, {
                                      prepend: _withCtx(() => [
                                        _createVNode(_component_v_icon, {
                                          color: "purple",
                                          size: "small"
                                        }, {
                                          default: _withCtx(() => [...(_cache[20] || (_cache[20] = [
                                            _createTextVNode("mdi-clock-outline", -1)
                                          ]))]),
                                          _: 1
                                        })
                                      ]),
                                      default: _withCtx(() => [
                                        _createVNode(_component_v_list_item_title, null, {
                                          default: _withCtx(() => [...(_cache[21] || (_cache[21] = [
                                            _createTextVNode("做种时间", -1)
                                          ]))]),
                                          _: 1
                                        }),
                                        _createVNode(_component_v_list_item_subtitle, null, {
                                          default: _withCtx(() => [
                                            _createTextVNode(_toDisplayString(site.user_info.seeding_time.days) + "天 " + _toDisplayString(site.user_info.seeding_time.hours) + "小时 ", 1)
                                          ]),
                                          _: 2
                                        }, 1024)
                                      ]),
                                      _: 2
                                    }, 1024))
                                  : _createCommentVNode("", true)
                              ]),
                              _: 2
                            }, 1024)
                          ]),
                          _: 2
                        }, 1024))
                      : (site.error)
                        ? (_openBlock(), _createBlock(_component_v_card_text, {
                            key: 1,
                            class: "text-error"
                          }, {
                            default: _withCtx(() => [
                              _createVNode(_component_v_icon, null, {
                                default: _withCtx(() => [...(_cache[22] || (_cache[22] = [
                                  _createTextVNode("mdi-alert-circle", -1)
                                ]))]),
                                _: 1
                              }),
                              _createTextVNode(" " + _toDisplayString(site.error), 1)
                            ]),
                            _: 2
                          }, 1024))
                        : (_openBlock(), _createBlock(_component_v_card_text, {
                            key: 2,
                            class: "text-grey"
                          }, {
                            default: _withCtx(() => [
                              _createVNode(_component_v_icon, null, {
                                default: _withCtx(() => [...(_cache[23] || (_cache[23] = [
                                  _createTextVNode("mdi-clock-outline", -1)
                                ]))]),
                                _: 1
                              }),
                              _cache[24] || (_cache[24] = _createTextVNode(" 未同步 ", -1))
                            ]),
                            _: 1
                          })),
                    (site.user_info || site.error)
                      ? (_openBlock(), _createBlock(_component_v_card_actions, { key: 3 }, {
                          default: _withCtx(() => [
                            _createVNode(_component_v_spacer),
                            _createVNode(_component_v_btn, {
                              size: "small",
                              variant: "text",
                              onClick: $event => (refreshSite(site))
                            }, {
                              default: _withCtx(() => [
                                _createVNode(_component_v_icon, { start: "" }, {
                                  default: _withCtx(() => [...(_cache[25] || (_cache[25] = [
                                    _createTextVNode("mdi-refresh", -1)
                                  ]))]),
                                  _: 1
                                }),
                                _cache[26] || (_cache[26] = _createTextVNode(" 刷新 ", -1))
                              ]),
                              _: 1
                            }, 8, ["onClick"])
                          ]),
                          _: 2
                        }, 1024))
                      : _createCommentVNode("", true),
                    (site.last_sync)
                      ? (_openBlock(), _createBlock(_component_v_card_subtitle, {
                          key: 4,
                          class: "text-caption"
                        }, {
                          default: _withCtx(() => [
                            _createTextVNode(" 最后同步：" + _toDisplayString(formatTime(site.last_sync)), 1)
                          ]),
                          _: 2
                        }, 1024))
                      : _createCommentVNode("", true)
                  ]),
                  _: 2
                }, 1032, ["class"])
              ]),
              _: 2
            }, 1024))
          }), 128)),
          (sites.value.length === 0)
            ? (_openBlock(), _createBlock(_component_v_col, {
                key: 0,
                cols: "12"
              }, {
                default: _withCtx(() => [
                  _createVNode(_component_v_alert, {
                    type: "info",
                    variant: "tonal",
                    border: "start"
                  }, {
                    default: _withCtx(() => [...(_cache[27] || (_cache[27] = [
                      _createTextVNode(" 暂无站点配置，请在 MoviePilot 的站点设置中添加 PT 站点 ", -1)
                    ]))]),
                    _: 1
                  })
                ]),
                _: 1
              }))
            : _createCommentVNode("", true)
        ]),
        _: 1
      }),
      (totalStats.value.total > 0)
        ? (_openBlock(), _createBlock(_component_v_row, {
            key: 0,
            class: "mt-4"
          }, {
            default: _withCtx(() => [
              _createVNode(_component_v_col, { cols: "12" }, {
                default: _withCtx(() => [
                  _createVNode(_component_v_card, null, {
                    default: _withCtx(() => [
                      _createVNode(_component_v_card_title, null, {
                        default: _withCtx(() => [
                          _createVNode(_component_v_icon, { class: "mr-2" }, {
                            default: _withCtx(() => [...(_cache[28] || (_cache[28] = [
                              _createTextVNode("mdi-chart-bar", -1)
                            ]))]),
                            _: 1
                          }),
                          _cache[29] || (_cache[29] = _createTextVNode(" 汇总统计 ", -1))
                        ]),
                        _: 1
                      }),
                      _createVNode(_component_v_card_text, null, {
                        default: _withCtx(() => [
                          _createVNode(_component_v_row, null, {
                            default: _withCtx(() => [
                              _createVNode(_component_v_col, {
                                cols: "6",
                                md: "3"
                              }, {
                                default: _withCtx(() => [
                                  _createVNode(_component_v_statistic, {
                                    label: "总上传量",
                                    value: formatSize(totalStats.value.upload)
                                  }, {
                                    default: _withCtx(() => [
                                      _createVNode(_component_v_icon, {
                                        color: "success",
                                        size: "small"
                                      }, {
                                        default: _withCtx(() => [...(_cache[30] || (_cache[30] = [
                                          _createTextVNode("mdi-arrow-up", -1)
                                        ]))]),
                                        _: 1
                                      })
                                    ]),
                                    _: 1
                                  }, 8, ["value"])
                                ]),
                                _: 1
                              }),
                              _createVNode(_component_v_col, {
                                cols: "6",
                                md: "3"
                              }, {
                                default: _withCtx(() => [
                                  _createVNode(_component_v_statistic, {
                                    label: "总下载量",
                                    value: formatSize(totalStats.value.download)
                                  }, {
                                    default: _withCtx(() => [
                                      _createVNode(_component_v_icon, {
                                        color: "error",
                                        size: "small"
                                      }, {
                                        default: _withCtx(() => [...(_cache[31] || (_cache[31] = [
                                          _createTextVNode("mdi-arrow-down", -1)
                                        ]))]),
                                        _: 1
                                      })
                                    ]),
                                    _: 1
                                  }, 8, ["value"])
                                ]),
                                _: 1
                              }),
                              _createVNode(_component_v_col, {
                                cols: "6",
                                md: "3"
                              }, {
                                default: _withCtx(() => [
                                  _createVNode(_component_v_statistic, {
                                    label: "总做种数",
                                    value: totalStats.value.seeding
                                  }, {
                                    default: _withCtx(() => [
                                      _createVNode(_component_v_icon, {
                                        color: "info",
                                        size: "small"
                                      }, {
                                        default: _withCtx(() => [...(_cache[32] || (_cache[32] = [
                                          _createTextVNode("mdi-seeding", -1)
                                        ]))]),
                                        _: 1
                                      })
                                    ]),
                                    _: 1
                                  }, 8, ["value"])
                                ]),
                                _: 1
                              }),
                              _createVNode(_component_v_col, {
                                cols: "6",
                                md: "3"
                              }, {
                                default: _withCtx(() => [
                                  _createVNode(_component_v_statistic, {
                                    label: "总 H&R",
                                    value: totalStats.value.hr
                                  }, {
                                    default: _withCtx(() => [
                                      _createVNode(_component_v_icon, {
                                        color: "error",
                                        size: "small"
                                      }, {
                                        default: _withCtx(() => [...(_cache[33] || (_cache[33] = [
                                          _createTextVNode("mdi-alert", -1)
                                        ]))]),
                                        _: 1
                                      })
                                    ]),
                                    _: 1
                                  }, 8, ["value"])
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
                  })
                ]),
                _: 1
              })
            ]),
            _: 1
          }))
        : _createCommentVNode("", true)
    ]),
    _: 1
  }))
}
}

};
const AppPage = /*#__PURE__*/_export_sfc(_sfc_main, [['__scopeId',"data-v-64010f76"]]);

export { AppPage as default };
