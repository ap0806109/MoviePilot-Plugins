import json
import time
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple
from apscheduler.triggers.cron import CronTrigger
from app.log import logger
from app.plugins import _PluginBase
from app.scheduler import Scheduler
from app.db.site_oper import SiteOper
from app.schemas.types import NotificationType


class VuePtSite(_PluginBase):
    """PT 站点用户信息统计插件 (Vue)"""

    plugin_name = "Vue PT Site"
    plugin_desc = "显示 PT 站点用户信息统计，包括等级、上传、下载、做种时间等"
    plugin_icon = "https://raw.githubusercontent.com/ap0806109/MoviePilot-Plugins/refs/heads/main/icons/ptpiler.png"
    plugin_version = "1.0.0"
    plugin_author = "ap0806109"
    author_url = "https://github.com/ap0806109/MoviePilot-Plugins"
    plugin_config_prefix = "vueptsite_"
    plugin_order = 101
    auth_level = 1

    _enabled = False
    _display_sites: List[str] = []
    _show_sidebar = True
    _auto_refresh = False
    _refresh_interval = 60
    _cron = "0 */2 * * *"

    def __init__(self):
        super().__init__()
        self.siteoper = SiteOper()

    def init_plugin(self, config: dict = None):
        """初始化插件"""
        config = config or {}
        self._enabled = bool(config.get("enabled"))
        self._display_sites = config.get("display_sites", [])
        self._show_sidebar = bool(config.get("show_sidebar", True))
        self._auto_refresh = bool(config.get("auto_refresh"))
        self._refresh_interval = int(config.get("refresh_interval", 60))
        self._cron = config.get("cron", "0 */2 * * *") or "0 */2 * * *"

    def get_state(self) -> bool:
        return self._enabled

    @staticmethod
    def get_command() -> List[Dict[str, Any]]:
        return []

    def get_render_mode(self) -> Tuple[str, Optional[str]]:
        """使用 Vue 联邦模式渲染"""
        return "vue", "dist/assets"

    def get_sidebar_nav(self) -> List[Dict[str, Any]]:
        """注册侧栏菜单入口"""
        if not self._show_sidebar:
            return []
        return [
            {
                "nav_key": "main",
                "title": "PT Site",
                "icon": "mdi-web",
                "section": "organize",
                "permission": "manage",
                "order": 101,
            },
        ]

    def get_api(self) -> List[Dict[str, Any]]:
        """注册插件 API"""
        return [
            {
                "path": "/sites",
                "endpoint": self._get_sites,
                "methods": ["GET"],
                "auth": "bear",
                "summary": "获取站点列表",
            },
            {
                "path": "/site/refresh",
                "endpoint": self._refresh_site,
                "methods": ["POST"],
                "auth": "bear",
                "summary": "刷新单个站点",
            },
            {
                "path": "/site/refresh-all",
                "endpoint": self._refresh_all_sites,
                "methods": ["POST"],
                "auth": "bear",
                "summary": "刷新所有站点",
            },
            {
                "path": "/config",
                "endpoint": self._get_config,
                "methods": ["GET"],
                "auth": "bear",
                "summary": "获取配置",
            },
            {
                "path": "/config",
                "endpoint": self._save_config,
                "methods": ["POST"],
                "auth": "bear",
                "summary": "保存配置",
            },
        ]

    def get_form(self) -> Tuple[Optional[List[dict]], Dict[str, Any]]:
        """配置页面 - Vue 模式"""
        return None, self._get_config()

    def get_page(self) -> List[dict]:
        """详情页 - Vue 联邦模式"""
        return []

    def get_service(self) -> List[Dict[str, Any]]:
        """注册定时任务"""
        services: List[Dict[str, Any]] = []
        if self._enabled and self._auto_refresh and self._cron:
            try:
                services.append(
                    {
                        "id": self.__class__.__name__.lower(),
                        "name": f"{self.plugin_name} - 自动刷新",
                        "trigger": CronTrigger.from_crontab(self._cron),
                        "func": self._cron_refresh,
                        "kwargs": {},
                    }
                )
            except Exception:
                pass
        return services

    def stop_service(self):
        """停止服务"""
        try:
            Scheduler().remove_plugin_job(self.__class__.__name__.lower())
        except Exception:
            pass

    def _get_config(self) -> Dict[str, Any]:
        """获取配置"""
        all_sites = self.siteoper.list_sites() or []
        site_options = [
            {"title": site.name, "value": str(site.id)}
            for site in all_sites
        ]
        return {
            "enabled": self._enabled,
            "display_sites": self._display_sites,
            "show_sidebar": self._show_sidebar,
            "auto_refresh": self._auto_refresh,
            "refresh_interval": self._refresh_interval,
            "cron": self._cron,
            "site_options": site_options,
        }

    def _save_config(self, payload: dict) -> Dict[str, Any]:
        """保存配置"""
        payload = payload or {}
        config = {
            "enabled": bool(payload.get("enabled", self._enabled)),
            "display_sites": payload.get("display_sites", self._display_sites),
            "show_sidebar": bool(payload.get("show_sidebar", self._show_sidebar)),
            "auto_refresh": bool(payload.get("auto_refresh", self._auto_refresh)),
            "refresh_interval": int(payload.get("refresh_interval", self._refresh_interval)),
            "cron": payload.get("cron", self._cron) or "0 */2 * * *",
        }
        self.stop_service()
        self.init_plugin(config)
        self.update_config(config)
        return {"success": True, "message": "配置已保存", "data": self._get_config()}

    def _get_sites(self) -> Dict[str, Any]:
        """获取站点列表"""
        all_sites = self.siteoper.list_sites() or []
        sites = []
        for site in all_sites:
            if self._display_sites and str(site.id) not in self._display_sites:
                continue
            note = {}
            try:
                note = json.loads(site.note) if site.note else {}
            except Exception:
                pass
            user_info = note.get("user_info", {})
            sites.append(
                {
                    "id": str(site.id),
                    "name": site.name,
                    "url": site.domain,
                    "username": user_info.get("username", ""),
                    "level": user_info.get("level", ""),
                    "upload": user_info.get("upload", 0),
                    "download": user_info.get("download", 0),
                    "ratio": user_info.get("ratio", "0.00"),
                    "bonus": user_info.get("bonus", 0),
                    "seeding": user_info.get("seeding", 0),
                    "seeding_time": user_info.get("seeding_time", ""),
                    "hr": user_info.get("hr", 0),
                    "join_time": user_info.get("join_time", ""),
                    "last_active": user_info.get("last_active", ""),
                }
            )
        return {"success": True, "data": {"sites": sites, "total": len(sites)}}

    def _refresh_site(self, payload: dict) -> Dict[str, Any]:
        """刷新单个站点"""
        site_id = payload.get("site_id")
        if not site_id:
            return {"success": False, "message": "缺少站点 ID"}
        site = self.siteoper.get(int(site_id))
        if not site:
            return {"success": False, "message": "未找到站点"}
        try:
            note = json.loads(site.note) if site.note else {}
        except Exception:
            note = {}
        user_info = note.get("user_info", {})
        return {
            "success": True,
            "message": f"站点 {site.name} 刷新成功",
            "data": {
                "id": str(site.id),
                "name": site.name,
                "username": user_info.get("username", ""),
                "level": user_info.get("level", ""),
                "upload": user_info.get("upload", 0),
                "download": user_info.get("download", 0),
                "ratio": user_info.get("ratio", "0.00"),
                "bonus": user_info.get("bonus", 0),
                "seeding": user_info.get("seeding", 0),
                "seeding_time": user_info.get("seeding_time", ""),
                "hr": user_info.get("hr", 0),
            },
        }

    def _refresh_all_sites(self, payload: dict = None) -> Dict[str, Any]:
        """刷新所有站点"""
        return self._get_sites()

    def _cron_refresh(self):
        """定时刷新任务"""
        logger.info(f"[{self.plugin_name}] 执行定时刷新")
        try:
            self._get_sites()
        except Exception as e:
            logger.error(f"[{self.plugin_name}] 定时刷新失败: {e}")
