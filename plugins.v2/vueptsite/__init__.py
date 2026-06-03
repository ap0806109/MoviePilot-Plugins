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
    plugin_version = "1.0.4"
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
    _logs: List[Dict[str, Any]] = []
    _max_logs = 200

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
                "section": "discovery",
                "permission": "manage",
                "order": 19,
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
                "path": "/run-now",
                "endpoint": self._run_now,
                "methods": ["POST"],
                "auth": "bear",
                "summary": "立即运行一次",
            },
            {
                "path": "/logs",
                "endpoint": self._get_logs,
                "methods": ["GET"],
                "auth": "bear",
                "summary": "获取运行日志",
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

    def _add_log(self, level: str, message: str):
        """添加日志"""
        from datetime import datetime
        log_entry = {
            "time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "level": level,
            "message": message,
        }
        self._logs.insert(0, log_entry)
        if len(self._logs) > self._max_logs:
            self._logs = self._logs[:self._max_logs]
        if level == "ERROR":
            logger.error(f"[{self.plugin_name}] {message}")
        elif level == "WARNING":
            logger.warning(f"[{self.plugin_name}] {message}")
        else:
            logger.info(f"[{self.plugin_name}] {message}")

    def _run_now(self, payload: dict = None) -> Dict[str, Any]:
        """立即运行一次"""
        self._add_log("INFO", "开始立即运行...")
        try:
            result = self._get_sites()
            site_count = result.get("data", {}).get("total", 0)
            self._add_log("INFO", f"运行完成，获取到 {site_count} 个站点")
            return {"success": True, "message": f"运行完成，获取到 {site_count} 个站点", "data": result.get("data", {})}
        except Exception as e:
            self._add_log("ERROR", f"运行失败: {e}")
            return {"success": False, "message": f"运行失败: {e}"}

    def _get_logs(self, payload: dict = None) -> Dict[str, Any]:
        """获取运行日志"""
        return {"success": True, "data": {"logs": self._logs}}

    def _get_config(self) -> Dict[str, Any]:
        """获取配置"""
        try:
            all_sites = self.siteoper.list() or []
        except Exception:
            all_sites = []
        site_options = [
            {"title": getattr(site, "name", str(getattr(site, "id", ""))), "value": str(getattr(site, "id", ""))}
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
        self._add_log("INFO", "开始获取站点列表...")

        try:
            all_sites = self.siteoper.list() or []
            self._add_log("INFO", f"从 SiteOper 获取到 {len(all_sites)} 个站点")
        except Exception as e:
            self._add_log("ERROR", f"获取站点列表失败: {e}")
            all_sites = []

        sites = []
        for idx, site in enumerate(all_sites, 1):
            site_id = getattr(site, "id", None)
            site_name = getattr(site, "name", "未知")
            site_domain = getattr(site, "domain", "")
            self._add_log("INFO", f"[{idx}/{len(all_sites)}] 处理站点: {site_name} (ID={site_id}, Domain={site_domain})")

            if self._display_sites and str(site_id) not in self._display_sites:
                self._add_log("INFO", f"  -> 跳过 (不在显示列表中)")
                continue

            site_cookie = getattr(site, "cookie", "")
            site_note_raw = getattr(site, "note", None) or "{}"
            self._add_log("INFO", f"  -> Cookie: {'有' if site_cookie else '无'}, Note长度: {len(str(site_note_raw))}")

            note = {}
            try:
                note = json.loads(site_note_raw) if isinstance(site_note_raw, str) else (site_note_raw or {})
                self._add_log("INFO", f"  -> Note keys: {list(note.keys()) if isinstance(note, dict) else '非字典'}")
            except Exception as e:
                self._add_log("WARNING", f"  -> 解析 note 失败: {e}")

            user_info = note.get("user_info", note.get("userInfo", {}))
            if not isinstance(user_info, dict):
                user_info = {}
                self._add_log("INFO", f"  -> 未找到 user_info 数据")
            else:
                self._add_log("INFO", f"  -> user_info keys: {list(user_info.keys())}")

            sites.append(
                {
                    "id": str(site_id),
                    "name": site_name,
                    "url": site_domain,
                    "username": user_info.get("username", user_info.get("user_name", "")),
                    "level": str(user_info.get("level", "")),
                    "upload": int(user_info.get("upload", 0) or 0),
                    "download": int(user_info.get("download", 0) or 0),
                    "ratio": str(user_info.get("ratio", "0.00")),
                    "bonus": int(user_info.get("bonus", 0) or 0),
                    "seeding": int(user_info.get("seeding", 0) or 0),
                    "seeding_time": str(user_info.get("seeding_time", "")),
                    "hr": int(user_info.get("hr", 0) or 0),
                    "join_time": str(user_info.get("join_time", "")),
                    "last_active": str(user_info.get("last_active", "")),
                    "has_cookie": bool(site_cookie),
                }
            )
            self._add_log("INFO", f"  -> 添加成功: {site_name}")

        self._add_log("INFO", f"获取完成，共 {len(sites)} 个站点")
        return {"success": True, "data": {"sites": sites, "total": len(sites)}}

    def _refresh_site(self, payload: dict) -> Dict[str, Any]:
        """刷新单个站点"""
        site_id = payload.get("site_id")
        if not site_id:
            return {"success": False, "message": "缺少站点 ID"}
        try:
            site = self.siteoper.get(int(site_id))
        except Exception as e:
            return {"success": False, "message": f"获取站点失败: {e}"}
        if not site:
            return {"success": False, "message": "未找到站点"}

        site_name = getattr(site, "name", "未知")
        site_note_raw = getattr(site, "note", None) or "{}"
        note = {}
        try:
            note = json.loads(site_note_raw) if isinstance(site_note_raw, str) else (site_note_raw or {})
        except Exception:
            pass
        user_info = note.get("user_info", note.get("userInfo", {}))
        if not isinstance(user_info, dict):
            user_info = {}

        return {
            "success": True,
            "message": f"站点 {site_name} 刷新成功",
            "data": {
                "id": str(site_id),
                "name": site_name,
                "username": user_info.get("username", user_info.get("user_name", "")),
                "level": str(user_info.get("level", "")),
                "upload": int(user_info.get("upload", 0) or 0),
                "download": int(user_info.get("download", 0) or 0),
                "ratio": str(user_info.get("ratio", "0.00")),
                "bonus": int(user_info.get("bonus", 0) or 0),
                "seeding": int(user_info.get("seeding", 0) or 0),
                "seeding_time": str(user_info.get("seeding_time", "")),
                "hr": int(user_info.get("hr", 0) or 0),
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
