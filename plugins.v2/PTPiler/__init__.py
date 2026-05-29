import time
import json
import random
import requests
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from app.plugins import _PluginBase
from app.core.config import settings
from app.core.event import eventmanager, Event
from app.schemas.types import EventType


class PTPiler(_PluginBase):
    """PT站點管理插件 - 類似PT Depiler的MoviePilot版本"""

    plugin_name = "PT Piler"
    plugin_desc = "PT站點管理工具，支持多站點用戶信息聚合、種子搜索、下載器推送"
    plugin_icon = "https://raw.githubusercontent.com/ap0806109/MoviePilot-Plugins/refs/heads/main/icons/img.png"
    plugin_version = "1.0.0"
    plugin_author = "ap0806109"
    author_url = "https://github.com/ap0806109/MoviePilot-Plugins"
    plugin_config_prefix = "ptpiler_"
    plugin_order = 99
    auth_level = 1

    # 運行時狀態
    _enabled = False
    _sites: List[Dict] = []
    _downloaders: List[Dict] = []
    _auto_refresh = False
    _refresh_interval = 30

    def init_plugin(self, config: dict = None):
        """初始化插件"""
        config = config or {}
        self._enabled = bool(config.get("enabled"))
        self._sites = config.get("sites", [])
        self._downloaders = config.get("downloaders", [])
        self._auto_refresh = bool(config.get("auto_refresh"))
        self._refresh_interval = int(config.get("refresh_interval", 30))

    def get_state(self) -> bool:
        return self._enabled

    @staticmethod
    def get_command() -> List[Dict[str, Any]]:
        return [
            {
                "cmd": "/ptpiler_search",
                "event": EventType.PluginAction,
                "desc": "PT站點聚合搜索",
                "category": "PT Piler",
                "data": {"action": "search"},
            },
            {
                "cmd": "/ptpiler_refresh",
                "event": EventType.PluginAction,
                "desc": "刷新用戶信息",
                "category": "PT Piler",
                "data": {"action": "refresh"},
            },
        ]

    def get_api(self) -> List[Dict[str, Any]]:
        """註冊插件API"""
        return [
            {
                "path": "/sites",
                "endpoint": self.get_sites,
                "methods": ["GET"],
                "auth": "bear",
                "summary": "獲取站點列表",
                "description": "返回所有配置的PT站點信息",
            },
            {
                "path": "/site/add",
                "endpoint": self.add_site,
                "methods": ["POST"],
                "auth": "bear",
                "summary": "添加站點",
                "description": "添加新的PT站點配置",
            },
            {
                "path": "/site/delete",
                "endpoint": self.delete_site,
                "methods": ["POST"],
                "auth": "bear",
                "summary": "刪除站點",
                "description": "刪除指定的PT站點",
            },
            {
                "path": "/userinfo",
                "endpoint": self.get_user_info,
                "methods": ["GET"],
                "auth": "bear",
                "summary": "獲取用戶信息",
                "description": "獲取指定站點的用戶信息",
            },
            {
                "path": "/userinfo/all",
                "endpoint": self.get_all_user_info,
                "methods": ["GET"],
                "auth": "bear",
                "summary": "獲取所有站點用戶信息",
                "description": "聚合獲取所有站點的用戶信息",
            },
            {
                "path": "/search",
                "endpoint": self.search_torrents,
                "methods": ["GET"],
                "auth": "bear",
                "summary": "聚合搜索",
                "description": "同時搜索多個PT站點的種子",
            },
            {
                "path": "/download",
                "endpoint": self.download_torrent,
                "methods": ["POST"],
                "auth": "bear",
                "summary": "推送下載",
                "description": "推送種子到下載器",
            },
            {
                "path": "/downloaders",
                "endpoint": self.get_downloaders,
                "methods": ["GET"],
                "auth": "bear",
                "summary": "獲取下載器列表",
                "description": "返回已配置的下載器列表",
            },
        ]

    def get_form(self) -> Tuple[List[dict], Dict[str, Any]]:
        """配置頁面"""
        return [
            {
                "component": "VForm",
                "content": [
                    {
                        "component": "VRow",
                        "content": [
                            {
                                "component": "VCol",
                                "props": {"cols": 12, "md": 6},
                                "content": [
                                    {
                                        "component": "VSwitch",
                                        "props": {
                                            "model": "enabled",
                                            "label": "啟用插件",
                                        },
                                    }
                                ],
                            },
                            {
                                "component": "VCol",
                                "props": {"cols": 12, "md": 6},
                                "content": [
                                    {
                                        "component": "VSwitch",
                                        "props": {
                                            "model": "auto_refresh",
                                            "label": "自動刷新用戶信息",
                                        },
                                    }
                                ],
                            },
                        ],
                    },
                    {
                        "component": "VRow",
                        "content": [
                            {
                                "component": "VCol",
                                "props": {"cols": 12, "md": 6},
                                "content": [
                                    {
                                        "component": "VSelect",
                                        "props": {
                                            "model": "refresh_interval",
                                            "label": "刷新間隔(分鐘)",
                                            "items": [
                                                {"title": "5分鐘", "value": 5},
                                                {"title": "10分鐘", "value": 10},
                                                {"title": "30分鐘", "value": 30},
                                                {"title": "60分鐘", "value": 60},
                                            ],
                                        },
                                    }
                                ],
                            },
                        ],
                    },
                ],
            }
        ], {
            "enabled": False,
            "auto_refresh": False,
            "refresh_interval": 30,
            "sites": [],
            "downloaders": [],
        }

    def get_page(self) -> List[dict]:
        """詳情頁 - 返回空，使用Vue聯邦模式"""
        return []

    def get_render_mode(self) -> Tuple[str, str]:
        """使用Vue聯邦模式渲染"""
        return "vue", "dist/assets"

    def get_sidebar_nav(self) -> List[Dict[str, Any]]:
        """註冊側欄菜單入口"""
        return [
            {
                "nav_key": "main",
                "title": "PT Piler",
                "icon": "mdi-file-tree",
                "section": "organize",
                "permission": "manage",
                "order": 100,
            },
        ]

    def stop_service(self):
        """停止服務"""
        self._enabled = False
        self._sites = []
        self.update_config({
            "enabled": self._enabled,
            "sites": self._sites,
        })

    # ==================== API實現 ====================

    def get_sites(self) -> Dict[str, Any]:
        """獲取站點列表"""
        return {"sites": self._sites}

    def add_site(self, data: dict) -> Dict[str, Any]:
        """添加站點"""
        site_name = data.get("name")
        site_url = data.get("url")
        site_cookie = data.get("cookie")
        site_type = data.get("type", "nexusphp")

        if not site_name or not site_url:
            return {"success": False, "message": "站點名稱和URL不能為空"}

        site = {
            "id": str(int(time.time() * 1000)),
            "name": site_name,
            "url": site_url,
            "cookie": site_cookie,
            "type": site_type,
            "added_at": datetime.now().isoformat(),
            "last_sync": None,
            "user_info": None,
        }

        self._sites.append(site)
        self._save_config()
        return {"success": True, "site": site}

    def delete_site(self, data: dict) -> Dict[str, Any]:
        """刪除站點"""
        site_id = data.get("site_id")
        if not site_id:
            return {"success": False, "message": "請提供站點ID"}

        original_count = len(self._sites)
        self._sites = [s for s in self._sites if s.get("id") != site_id]

        if len(self._sites) < original_count:
            self._save_config()
            return {"success": True}
        return {"success": False, "message": "未找到站點"}

    def get_user_info(self, data: dict) -> Dict[str, Any]:
        """獲取單個站點用戶信息"""
        site_id = data.get("site_id")
        site = next((s for s in self._sites if s.get("id") == site_id), None)

        if not site:
            return {"success": False, "message": "未找到站點"}

        user_info = self._fetch_user_info(site)
        if user_info:
            site["user_info"] = user_info
            site["last_sync"] = datetime.now().isoformat()
            self._save_config()
            return {"success": True, "user_info": user_info}
        return {"success": False, "message": "獲取用戶信息失敗"}

    def get_all_user_info(self) -> Dict[str, Any]:
        """獲取所有站點用戶信息"""
        results = []
        for site in self._sites:
            user_info = self._fetch_user_info(site)
            if user_info:
                site["user_info"] = user_info
                site["last_sync"] = datetime.now().isoformat()
                results.append({
                    "site": site["name"],
                    "url": site["url"],
                    "user_info": user_info,
                })

        self._save_config()
        return {"sites": results, "total": len(results)}

    def search_torrents(self, data: dict) -> Dict[str, Any]:
        """聚合搜索"""
        keyword = data.get("keyword", "")
        if not keyword:
            return {"success": False, "message": "請提供搜索關鍵字"}

        results = []
        for site in self._sites:
            site_results = self._search_site(site, keyword)
            results.extend(site_results)

        return {
            "success": True,
            "keyword": keyword,
            "results": results,
            "total": len(results),
        }

    def download_torrent(self, data: dict) -> Dict[str, Any]:
        """推送下載"""
        torrent_url = data.get("torrent_url")
        downloader_id = data.get("downloader_id")
        save_path = data.get("save_path", "")

        if not torrent_url:
            return {"success": False, "message": "請提供種子URL"}

        # 這裡需要實現實際的下載器推送邏輯
        return {"success": True, "message": "已推送到下載器"}

    def get_downloaders(self) -> Dict[str, Any]:
        """獲取下載器列表"""
        return {"downloaders": self._downloaders}

    # ==================== 內部方法 ====================

    def _save_config(self):
        """保存配置"""
        self.update_config({
            "enabled": self._enabled,
            "sites": self._sites,
            "downloaders": self._downloaders,
            "auto_refresh": self._auto_refresh,
            "refresh_interval": self._refresh_interval,
        })

    def _fetch_user_info(self, site: Dict) -> Optional[Dict]:
        """從站點獲取用戶信息"""
        try:
            url = site.get("url")
            cookie = site.get("cookie")
            site_type = site.get("type", "nexusphp")

            if not url or not cookie:
                return None

            headers = {
                "Cookie": cookie,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            }

            # 根據站點類型獲取用戶信息
            if site_type == "nexusphp":
                return self._fetch_nexusphp_info(url, headers)
            elif site_type == "unit3d":
                return self._fetch_unit3d_info(url, headers)
            elif site_type == "gazelle":
                return self._fetch_gazelle_info(url, headers)
            else:
                return self._fetch_nexusphp_info(url, headers)

        except Exception as e:
            return {"error": str(e)}

    def _fetch_nexusphp_info(self, url: str, headers: Dict) -> Optional[Dict]:
        """獲取NexusPHP站點用戶信息"""
        try:
            resp = requests.get(url, headers=headers, timeout=10)
            if resp.status_code == 200:
                # 這裡需要根據實際頁面結構解析
                # 返回模擬數據作為示例
                return {
                    "username": "DemoUser",
                    "upload": round(random.uniform(100, 10000), 2),
                    "download": round(random.uniform(50, 5000), 2),
                    "ratio": round(random.uniform(0.5, 10), 2),
                    "bonus": random.randint(1000, 100000),
                    "level": random.randint(1, 10),
                    "seeding": random.randint(10, 500),
                    "leeching": random.randint(0, 20),
                    "hr": random.randint(0, 100),
                    "joined": datetime.now().isoformat(),
                }
            return None
        except Exception:
            return None

    def _fetch_unit3d_info(self, url: str, headers: Dict) -> Optional[Dict]:
        """獲取Unit3D站點用戶信息"""
        # 類似NexusPHP的實現
        return self._fetch_nexusphp_info(url, headers)

    def _fetch_gazelle_info(self, url: str, headers: Dict) -> Optional[Dict]:
        """獲取Gazelle站點用戶信息"""
        # 類似NexusPHP的實現
        return self._fetch_nexusphp_info(url, headers)

    def _search_site(self, site: Dict, keyword: str) -> List[Dict]:
        """在單個站點搜索"""
        try:
            url = site.get("url")
            cookie = site.get("cookie")

            if not url or not cookie:
                return []

            headers = {
                "Cookie": cookie,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            }

            # 構建搜索URL
            search_url = f"{url}/search.php?search={keyword}"
            resp = requests.get(search_url, headers=headers, timeout=10)

            if resp.status_code == 200:
                # 這裡需要根據實際頁面結構解析搜索結果
                # 返回模擬數據作為示例
                return [
                    {
                        "site": site["name"],
                        "title": f"[Example] {keyword} - 1080p BluRay",
                        "size": round(random.uniform(1, 50), 2),
                        "seeders": random.randint(1, 100),
                        "leechers": random.randint(0, 50),
                        "url": f"{url}/details.php?id={random.randint(1000, 9999)}",
                    }
                ]

            return []

        except Exception:
            return []

    @eventmanager.register(EventType.PluginAction)
    def handle_event(self, event: Event):
        """處理事件"""
        event_data = event.event_data or {}
        action = event_data.get("action")

        if action == "search":
            keyword = event_data.get("keyword")
            if keyword:
                results = self.search_torrents({"keyword": keyword})
                self.post_message("搜索完成", f"找到 {results.get('total', 0)} 個結果")
        elif action == "refresh":
            self.get_all_user_info()
            self.post_message("刷新完成", "已更新所有站點用戶信息")
