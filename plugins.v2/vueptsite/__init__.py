import json
import re
import time
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple
from urllib.parse import urljoin
from bs4 import BeautifulSoup
from apscheduler.triggers.cron import CronTrigger
from app.log import logger
from app.plugins import _PluginBase
from app.scheduler import Scheduler
from app.db.site_oper import SiteOper
from app.utils.http import RequestUtils


class VuePtSite(_PluginBase):
    """PT 站点用户信息统计插件 (Vue)"""

    plugin_name = "Vue PT Site"
    plugin_desc = "显示 PT 站点用户信息统计，包括等级、上传、下载、做种时间等"
    plugin_icon = "https://raw.githubusercontent.com/ap0806109/MoviePilot-Plugins/refs/heads/main/icons/ptpiler.png"
    plugin_version = "1.0.6"
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
        return "vue", "dist/assets"

    def get_sidebar_nav(self) -> List[Dict[str, Any]]:
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
        return None, self._get_config()

    def get_page(self) -> List[dict]:
        return []

    def get_service(self) -> List[Dict[str, Any]]:
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
        try:
            Scheduler().remove_plugin_job(self.__class__.__name__.lower())
        except Exception:
            pass

    def _add_log(self, level: str, message: str):
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
        return {"success": True, "data": {"logs": self._logs}}

    def _get_config(self) -> Dict[str, Any]:
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
            site_cookie = getattr(site, "cookie", "")
            self._add_log("INFO", f"[{idx}/{len(all_sites)}] 处理站点: {site_name} (ID={site_id})")

            if self._display_sites and str(site_id) not in self._display_sites:
                self._add_log("INFO", f"  -> 跳过 (不在显示列表中)")
                continue

            if not site_cookie:
                self._add_log("WARNING", f"  -> 跳过: 没有配置 Cookie")
                sites.append(self._empty_site(site_id, site_name, site_domain, "没有配置 Cookie"))
                continue

            user_info = self._fetch_user_info(site_name, site_domain, site_cookie)
            if user_info:
                self._add_log("INFO", f"  -> 成功获取用户数据: {user_info.get('username', '未知')}")
                sites.append(
                    {
                        "id": str(site_id),
                        "name": site_name,
                        "url": site_domain,
                        "username": user_info.get("username", ""),
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
                        "has_cookie": True,
                        "error": None,
                    }
                )
            else:
                self._add_log("WARNING", f"  -> 获取用户数据失败")
                sites.append(self._empty_site(site_id, site_name, site_domain, "获取用户数据失败"))

        self._add_log("INFO", f"获取完成，共 {len(sites)} 个站点")
        return {"success": True, "data": {"sites": sites, "total": len(sites)}}

    def _empty_site(self, site_id, site_name, site_domain, error_msg):
        return {
            "id": str(site_id),
            "name": site_name,
            "url": site_domain,
            "username": "",
            "level": "",
            "upload": 0,
            "download": 0,
            "ratio": "0.00",
            "bonus": 0,
            "seeding": 0,
            "seeding_time": "",
            "hr": 0,
            "join_time": "",
            "last_active": "",
            "has_cookie": False,
            "error": error_msg,
        }

    def _fetch_user_info(self, site_name: str, site_domain: str, cookie: str) -> Optional[Dict[str, Any]]:
        """从站点获取用户信息"""
        if not site_domain or not cookie:
            return None

        site_domain = site_domain.rstrip("/")
        if not site_domain.startswith(("http://", "https://")):
            site_domain = f"https://{site_domain}"

        user_url = f"{site_domain}/userdetails.php"
        self._add_log("INFO", f"  -> 请求: {user_url}")

        try:
            headers = {
                "Cookie": cookie,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                "Referer": site_domain,
            }
            response = RequestUtils(headers=headers).get_res(url=user_url)
            if not response or response.status_code != 200:
                status = response.status_code if response else "无响应"
                self._add_log("WARNING", f"  -> 请求失败: HTTP {status}")
                return None

            self._add_log("INFO", f"  -> 响应成功: HTTP {response.status_code}, 内容长度: {len(response.text)}")
            return self._parse_user_page(response.text, site_domain)

        except Exception as e:
            self._add_log("ERROR", f"  -> 请求异常: {e}")
            return None

    def _parse_user_page(self, html: str, site_domain: str) -> Optional[Dict[str, Any]]:
        """解析用户页面 HTML"""
        try:
            soup = BeautifulSoup(html, "html.parser")
            user_info = {}

            username = self._extract_username(soup)
            if username:
                user_info["username"] = username
                self._add_log("INFO", f"  -> 用户名: {username}")

            level = self._extract_level(soup)
            if level:
                user_info["level"] = level
                self._add_log("INFO", f"  -> 等级: {level}")

            upload, download = self._extract_traffic(soup)
            user_info["upload"] = upload
            user_info["download"] = download
            self._add_log("INFO", f"  -> 上传: {upload}, 下载: {download}")

            ratio = self._extract_ratio(soup)
            user_info["ratio"] = ratio
            self._add_log("INFO", f"  -> 分享率: {ratio}")

            bonus = self._extract_bonus(soup)
            user_info["bonus"] = bonus
            self._add_log("INFO", f"  -> 魔力值: {bonus}")

            seeding, seeding_time = self._extract_seeding(soup)
            user_info["seeding"] = seeding
            user_info["seeding_time"] = seeding_time
            self._add_log("INFO", f"  -> 做种: {seeding}, 时间: {seeding_time}")

            hr = self._extract_hr(soup)
            user_info["hr"] = hr
            self._add_log("INFO", f"  -> H&R: {hr}")

            join_time = self._extract_join_time(soup)
            user_info["join_time"] = join_time

            last_active = self._extract_last_active(soup)
            user_info["last_active"] = last_active

            return user_info if user_info.get("username") else None

        except Exception as e:
            self._add_log("ERROR", f"  -> 解析页面失败: {e}")
            return None

    def _extract_username(self, soup) -> str:
        """提取用户名"""
        # 尝试多种选择器
        for selector in [
            "span#info_block a[href*='userdetails.php']",
            "a[href*='userdetails.php'] b",
            "#info_block .username",
            "a[href*='userdetails.php']",
            "td.text/big",
        ]:
            elem = soup.select_one(selector)
            if elem:
                text = elem.get_text(strip=True)
                if text and len(text) < 50:
                    return text
        return ""

    def _extract_level(self, soup) -> str:
        """提取用户等级"""
        for selector in [
            "span#info_block .level",
            "td.text span.level",
            "a[href*='userdetails.php'] + span",
        ]:
            elem = soup.select_one(selector)
            if elem:
                return elem.get_text(strip=True)
        # 尝试从文本中提取
        text = soup.get_text()
        match = re.search(r"等级[：:\s]*([^\s,，]+)", text)
        if match:
            return match.group(1)
        return ""

    def _extract_traffic(self, soup) -> Tuple[int, int]:
        """提取上传和下载量"""
        upload = 0
        download = 0

        # 尝试从表格中提取
        for td in soup.find_all("td"):
            text = td.get_text(strip=True)
            if "上傳" in text or "上传" in text or "Upload" in text:
                next_td = td.find_next_sibling("td")
                if next_td:
                    upload = self._parse_size(next_td.get_text(strip=True))
            if "下載" in text or "下载" in text or "Download" in text:
                next_td = td.find_next_sibling("td")
                if next_td:
                    download = self._parse_size(next_td.get_text(strip=True))

        # 尝试从 span 中提取
        if upload == 0 and download == 0:
            for span in soup.find_all("span"):
                text = span.get_text(strip=True)
                if "上傳" in text or "Upload" in text:
                    match = re.search(r"([\d.]+\s*[KMGT]?i?B)", text)
                    if match:
                        upload = self._parse_size(match.group(1))
                if "下載" in text or "Download" in text:
                    match = re.search(r"([\d.]+\s*[KMGT]?i?B)", text)
                    if match:
                        download = self._parse_size(match.group(1))

        return upload, download

    def _extract_ratio(self, soup) -> str:
        """提取分享率"""
        for td in soup.find_all("td"):
            text = td.get_text(strip=True)
            if "分享率" in text or "Ratio" in text:
                next_td = td.find_next_sibling("td")
                if next_td:
                    ratio_text = next_td.get_text(strip=True)
                    match = re.search(r"([\d.]+|Inf|∞)", ratio_text)
                    if match:
                        return match.group(1)
        return "0.00"

    def _extract_bonus(self, soup) -> int:
        """提取魔力值"""
        for td in soup.find_all("td"):
            text = td.get_text(strip=True)
            if "魔力" in text or "Bonus" in text or "积分" in text:
                next_td = td.find_next_sibling("td")
                if next_td:
                    return self._parse_number(next_td.get_text(strip=True))
        return 0

    def _extract_seeding(self, soup) -> Tuple[int, str]:
        """提取做种数和做种时间"""
        seeding = 0
        seeding_time = ""

        for td in soup.find_all("td"):
            text = td.get_text(strip=True)
            if "做種" in text or "做种" in text or "Seeding" in text:
                next_td = td.find_next_sibling("td")
                if next_td:
                    match = re.search(r"(\d+)", next_td.get_text(strip=True))
                    if match:
                        seeding = int(match.group(1))
            if "做種時間" in text or "做种时间" in text or "Seeding Time" in text:
                next_td = td.find_next_sibling("td")
                if next_td:
                    seeding_time = next_td.get_text(strip=True)

        return seeding, seeding_time

    def _extract_hr(self, soup) -> int:
        """提取 H&R 数量"""
        for td in soup.find_all("td"):
            text = td.get_text(strip=True)
            if "H&R" in text or "Hit&Run" in text:
                next_td = td.find_next_sibling("td")
                if next_td:
                    match = re.search(r"(\d+)", next_td.get_text(strip=True))
                    if match:
                        return int(match.group(1))
        return 0

    def _extract_join_time(self, soup) -> str:
        """提取注册时间"""
        for td in soup.find_all("td"):
            text = td.get_text(strip=True)
            if "註冊" in text or "注册" in text or "Join" in text:
                next_td = td.find_next_sibling("td")
                if next_td:
                    return next_td.get_text(strip=True)
        return ""

    def _extract_last_active(self, soup) -> str:
        """提取最后活跃时间"""
        for td in soup.find_all("td"):
            text = td.get_text(strip=True)
            if "活躍" in text or "活跃" in text or "Last Active" in text:
                next_td = td.find_next_sibling("td")
                if next_td:
                    return next_td.get_text(strip=True)
        return ""

    def _parse_size(self, text: str) -> int:
        """将大小文本转换为字节数"""
        text = text.strip().upper()
        match = re.match(r"([\d.]+)\s*([KMGT]I?B)", text)
        if not match:
            return 0
        value = float(match.group(1))
        unit = match.group(2)
        multipliers = {
            "B": 1, "IB": 1,
            "KB": 1024, "KIB": 1024,
            "MB": 1024 ** 2, "MIB": 1024 ** 2,
            "GB": 1024 ** 3, "GIB": 1024 ** 3,
            "TB": 1024 ** 4, "TIB": 1024 ** 4,
            "PB": 1024 ** 5, "PIB": 1024 ** 5,
        }
        return int(value * multipliers.get(unit, 1))

    def _parse_number(self, text: str) -> int:
        """解析数字文本"""
        text = text.strip().replace(",", "").replace(" ", "")
        match = re.search(r"([\d.]+)", text)
        if match:
            return int(float(match.group(1)))
        return 0

    def _refresh_site(self, payload: dict) -> Dict[str, Any]:
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
        site_domain = getattr(site, "domain", "")
        site_cookie = getattr(site, "cookie", "")

        if not site_cookie:
            return {"success": True, "message": f"站点 {site_name} 没有配置 Cookie", "data": self._empty_site(site_id, site_name, site_domain, "没有配置 Cookie")}

        user_info = self._fetch_user_info(site_name, site_domain, site_cookie)
        if user_info:
            return {
                "success": True,
                "message": f"站点 {site_name} 刷新成功",
                "data": {
                    "id": str(site_id),
                    "name": site_name,
                    "url": site_domain,
                    "username": user_info.get("username", ""),
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
                    "has_cookie": True,
                    "error": None,
                },
            }
        else:
            return {"success": False, "message": f"站点 {site_name} 获取用户数据失败"}

    def _refresh_all_sites(self, payload: dict = None) -> Dict[str, Any]:
        return self._get_sites()

    def _cron_refresh(self):
        self._add_log("INFO", "执行定时刷新")
        try:
            self._get_sites()
        except Exception as e:
            self._add_log("ERROR", f"定时刷新失败: {e}")
