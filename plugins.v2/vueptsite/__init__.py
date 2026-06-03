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
    plugin_version = "1.0.10"
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
        return [{"nav_key": "main", "title": "PT Site", "icon": "mdi-web", "section": "organize", "permission": "manage", "order": 101}]

    def get_api(self) -> List[Dict[str, Any]]:
        return [
            {"path": "/sites", "endpoint": self._get_sites, "methods": ["GET"], "auth": "bear", "summary": "获取站点列表"},
            {"path": "/site/refresh", "endpoint": self._refresh_site, "methods": ["POST"], "auth": "bear", "summary": "刷新单个站点"},
            {"path": "/site/refresh-all", "endpoint": self._refresh_all_sites, "methods": ["POST"], "auth": "bear", "summary": "刷新所有站点"},
            {"path": "/run-now", "endpoint": self._run_now, "methods": ["POST"], "auth": "bear", "summary": "立即运行一次"},
            {"path": "/logs", "endpoint": self._get_logs, "methods": ["GET"], "auth": "bear", "summary": "获取运行日志"},
            {"path": "/config", "endpoint": self._get_config, "methods": ["GET"], "auth": "bear", "summary": "获取配置"},
            {"path": "/config", "endpoint": self._save_config, "methods": ["POST"], "auth": "bear", "summary": "保存配置"},
        ]

    def get_form(self) -> Tuple[Optional[List[dict]], Dict[str, Any]]:
        return None, self._get_config()

    def get_page(self) -> List[dict]:
        return []

    def get_service(self) -> List[Dict[str, Any]]:
        services: List[Dict[str, Any]] = []
        if self._enabled and self._auto_refresh and self._cron:
            try:
                services.append({"id": self.__class__.__name__.lower(), "name": f"{self.plugin_name} - 自动刷新", "trigger": CronTrigger.from_crontab(self._cron), "func": self._cron_refresh, "kwargs": {}})
            except Exception:
                pass
        return services

    def stop_service(self):
        try:
            Scheduler().remove_plugin_job(self.__class__.__name__.lower())
        except Exception:
            pass

    def _add_log(self, level: str, message: str):
        log_entry = {"time": datetime.now().strftime("%Y-%m-%d %H:%M:%S"), "level": level, "message": message}
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
        site_options = [{"title": getattr(site, "name", str(getattr(site, "id", ""))), "value": str(getattr(site, "id", ""))} for site in all_sites]
        return {"enabled": self._enabled, "display_sites": self._display_sites, "show_sidebar": self._show_sidebar, "auto_refresh": self._auto_refresh, "refresh_interval": self._refresh_interval, "cron": self._cron, "site_options": site_options}

    def _save_config(self, payload: dict) -> Dict[str, Any]:
        payload = payload or {}
        config = {"enabled": bool(payload.get("enabled", self._enabled)), "display_sites": payload.get("display_sites", self._display_sites), "show_sidebar": bool(payload.get("show_sidebar", self._show_sidebar)), "auto_refresh": bool(payload.get("auto_refresh", self._auto_refresh)), "refresh_interval": int(payload.get("refresh_interval", self._refresh_interval)), "cron": payload.get("cron", self._cron) or "0 */2 * * *"}
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

            icon_url = self._get_icon_url(site_domain)
            user_info = self._fetch_user_info(site_name, site_domain, site_cookie)
            if user_info:
                self._add_log("INFO", f"  -> 成功获取用户数据: {user_info.get('username', '未知')}")
                user_info["id"] = str(site_id)
                user_info["name"] = site_name
                user_info["url"] = site_domain
                user_info["icon"] = icon_url
                user_info["has_cookie"] = True
                user_info["error"] = None
                sites.append(user_info)
            else:
                self._add_log("WARNING", f"  -> 获取用户数据失败")
                sites.append(self._empty_site(site_id, site_name, site_domain, "获取用户数据失败"))

        self._add_log("INFO", f"获取完成，共 {len(sites)} 个站点")
        return {"success": True, "data": {"sites": sites, "total": len(sites)}}

    def _empty_site(self, site_id, site_name, site_domain, error_msg):
        return {"id": str(site_id), "name": site_name, "url": site_domain, "icon": self._get_icon_url(site_domain), "username": "", "level": "", "upload": 0, "download": 0, "ratio": "0.00", "bonus": 0, "seeding": 0, "seeding_time": "", "hr": 0, "join_time": "", "last_active": "", "has_cookie": False, "error": error_msg}

    def _get_icon_url(self, site_domain: str) -> str:
        """获取站点图标 URL"""
        if not site_domain:
            return ""
        domain = site_domain.rstrip("/")
        if not domain.startswith(("http://", "https://")):
            domain = f"https://{domain}"
        return f"{domain}/favicon.ico"

    def _normalize_domain(self, site_domain: str) -> str:
        """规范化域名"""
        domain = site_domain.rstrip("/")
        if not domain.startswith(("http://", "https://")):
            domain = f"https://{domain}"
        return domain

    def _fetch_user_info(self, site_name: str, site_domain: str, cookie: str) -> Optional[Dict[str, Any]]:
        """从站点获取用户信息"""
        if not site_domain or not cookie:
            return None

        base_url = self._normalize_domain(site_domain)
        user_url = f"{base_url}/userdetails.php"
        self._add_log("INFO", f"  -> 请求: {user_url}")

        try:
            headers = {"Cookie": cookie, "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36", "Referer": base_url}
            response = RequestUtils(headers=headers).get_res(url=user_url)
            if not response or response.status_code != 200:
                status = response.status_code if response else "无响应"
                self._add_log("WARNING", f"  -> 请求失败: HTTP {status}")
                return None

            self._add_log("INFO", f"  -> 响应成功: HTTP {response.status_code}, 内容长度: {len(response.text)}")
            # 保存 HTML 用于调试
            self._add_log("INFO", f"  -> HTML 片段: {response.text[:3000]}")
            return self._parse_user_page(response.text, base_url)

        except Exception as e:
            self._add_log("ERROR", f"  -> 请求异常: {e}")
            return None

    def _parse_user_page(self, html: str, base_url: str) -> Optional[Dict[str, Any]]:
        """解析用户页面 - 支持多种 PT 站点格式"""
        try:
            soup = BeautifulSoup(html, "html.parser")
            user_info = {}

            # 尝试 NexusPHP 格式
            nexusphp_data = self._parse_nexusphp(soup)
            if nexusphp_data and nexusphp_data.get("username"):
                user_info.update(nexusphp_data)
                self._add_log("INFO", f"  -> 使用 NexusPHP 格式解析")

            # 尝试 UNIT3D 格式
            if not user_info.get("username"):
                unit3d_data = self._parse_unit3d(soup)
                if unit3d_data and unit3d_data.get("username"):
                    user_info.update(unit3d_data)
                    self._add_log("INFO", f"  -> 使用 UNIT3D 格式解析")

            # 尝试 Gazelle 格式
            if not user_info.get("username"):
                gazelle_data = self._parse_gazelle(soup)
                if gazelle_data and gazelle_data.get("username"):
                    user_info.update(gazelle_data)
                    self._add_log("INFO", f"  -> 使用 Gazelle 格式解析")

            if user_info.get("username"):
                self._add_log("INFO", f"  -> 用户名: {user_info['username']}")
                self._add_log("INFO", f"  -> 等级: {user_info.get('level', '')}")
                self._add_log("INFO", f"  -> 上传: {user_info.get('upload', 0)}, 下载: {user_info.get('download', 0)}")
                self._add_log("INFO", f"  -> 分享率: {user_info.get('ratio', '0.00')}")
                self._add_log("INFO", f"  -> 魔力值: {user_info.get('bonus', 0)}")
                self._add_log("INFO", f"  -> 做种: {user_info.get('seeding', 0)}, 时间: {user_info.get('seeding_time', '')}")
                self._add_log("INFO", f"  -> H&R: {user_info.get('hr', 0)}")
                return user_info

            self._add_log("WARNING", f"  -> 无法解析用户页面")
            return None

        except Exception as e:
            self._add_log("ERROR", f"  -> 解析页面失败: {e}")
            return None

    def _parse_nexusphp(self, soup) -> Dict[str, Any]:
        """解析 NexusPHP 格式 - 支持 info_block 内联格式"""
        user_info = {}

        # 用户名
        for sel in ["span#info_block a[href*='userdetails.php']", "a[href*='userdetails.php'] b", "#info_block .username", "a[href*='userdetails.php']"]:
            elem = soup.select_one(sel)
            if elem:
                text = elem.get_text(strip=True)
                if text and len(text) < 50:
                    user_info["username"] = text
                    break

        if not user_info.get("username"):
            return {}

        # 等级
        for sel in ["span#info_block .level", "td.text span.level", "span[style*='color']"]:
            elem = soup.select_one(sel)
            if elem:
                text = elem.get_text(strip=True)
                if text and len(text) < 30:
                    user_info["level"] = text
                    break

        # 获取 #info_block 的完整文本
        info_block = soup.find(id="info_block")
        if info_block:
            info_text = info_block.get_text(" ", strip=True)
            self._add_log("INFO", f"  -> info_block 文本: {info_text[:500]}")

            # 魔力值: 983,260.2
            match = re.search(r"魔力值[^:：]*[：:]\s*([\d,\.]+)", info_text)
            if match:
                user_info["bonus"] = self._parse_number(match.group(1))

            # 分享率：6.317
            match = re.search(r"分享率[：:\s]*([\d.]+|Inf|∞)", info_text)
            if match:
                user_info["ratio"] = match.group(1)

            # 上傳量：4.636 TB
            match = re.search(r"上傳量[：:\s]*([\d.]+\s*[KMGT]i?B)", info_text)
            if match:
                user_info["upload"] = self._parse_size(match.group(1))

            # 下載量：751.60 GB
            match = re.search(r"下載量[：:\s]*([\d.]+\s*[KMGT]i?B)", info_text)
            if match:
                user_info["download"] = self._parse_size(match.group(1))

            # 當前活動：做種 1 下載 0
            seeding_match = re.search(r"當前做種.*?(\d+)", info_text)
            if seeding_match:
                user_info["seeding"] = int(seeding_match.group(1))

            # H&R: 0/0/20
            match = re.search(r"H&R.*?\[(\d+)/(\d+)/(\d+)\]", info_text)
            if match:
                user_info["hr"] = int(match.group(2))

        # 表格解析（备用）
        if not user_info.get("upload"):
            for tr in soup.find_all("tr"):
                cells = tr.find_all("td")
                if len(cells) < 2:
                    continue
                label = cells[0].get_text(strip=True)
                value = cells[1].get_text(strip=True)

                if "上傳" in label or "上传" in label or "Upload" in label:
                    user_info["upload"] = self._parse_size(value)
                elif "下載" in label or "下载" in label or "Download" in label:
                    user_info["download"] = self._parse_size(value)
                elif "分享率" in label or "Ratio" in label:
                    user_info["ratio"] = self._extract_ratio_value(value)
                elif "魔力" in label or "Bonus" in label or "积分" in label:
                    user_info["bonus"] = self._parse_number(value)
                elif "做種" in label or "做种" in label or "Seeding" in label:
                    match = re.search(r"(\d+)", value)
                    user_info["seeding"] = int(match.group(1)) if match else 0
                elif "做種時間" in label or "做种时间" in label or "Seeding Time" in label:
                    user_info["seeding_time"] = value
                elif "H&R" in label or "Hit&Run" in label:
                    match = re.search(r"(\d+)", value)
                    user_info["hr"] = int(match.group(1)) if match else 0
                elif "註冊" in label or "注册" in label or "Join" in label:
                    user_info["join_time"] = value
                elif "活躍" in label or "活跃" in label or "Last Active" in label:
                    user_info["last_active"] = value

        # 设置默认值
        user_info.setdefault("upload", 0)
        user_info.setdefault("download", 0)
        user_info.setdefault("ratio", "0.00")
        user_info.setdefault("bonus", 0)
        user_info.setdefault("seeding", 0)
        user_info.setdefault("seeding_time", "")
        user_info.setdefault("hr", 0)

        return user_info

    def _parse_unit3d(self, soup) -> Dict[str, Any]:
        """解析 UNIT3D 格式"""
        user_info = {}

        # 用户名
        elem = soup.select_one(".user-profile-name, .profile-user__name, h1.h4")
        if elem:
            user_info["username"] = elem.get_text(strip=True)

        if not user_info.get("username"):
            return {}

        # 上传/下载
        for div in soup.find_all(["div", "span"]):
            text = div.get_text(strip=True)
            if "Upload" in text or "上传" in text:
                match = re.search(r"([\d.]+\s*[KMGT]?i?B)", text)
                if match:
                    user_info["upload"] = self._parse_size(match.group(1))
            elif "Download" in text or "下载" in text:
                match = re.search(r"([\d.]+\s*[KMGT]?i?B)", text)
                if match:
                    user_info["download"] = self._parse_size(match.group(1))
            elif "Ratio" in text or "分享率" in text:
                user_info["ratio"] = self._extract_ratio_value(text)
            elif "Bonus" in text or "魔力" in text:
                user_info["bonus"] = self._parse_number(text)
            elif "Seeding" in text or "做种" in text:
                match = re.search(r"(\d+)", text)
                user_info["seeding"] = int(match.group(1)) if match else 0

        return user_info

    def _parse_gazelle(self, soup) -> Dict[str, Any]:
        """解析 Gazelle 格式"""
        user_info = {}

        # 用户名
        elem = soup.select_one("#username, .username, h1")
        if elem:
            user_info["username"] = elem.get_text(strip=True)

        if not user_info.get("username"):
            return {}

        # 上传/下载
        for stat in soup.select(".stat, .userstats div"):
            label = stat.select_one(".label, .stat-label")
            value = stat.select_one(".value, .stat-value")
            if label and value:
                label_text = label.get_text(strip=True)
                value_text = value.get_text(strip=True)
                if "Uploaded" in label_text:
                    user_info["upload"] = self._parse_size(value_text)
                elif "Downloaded" in label_text:
                    user_info["download"] = self._parse_size(value_text)
                elif "Ratio" in label_text:
                    user_info["ratio"] = self._extract_ratio_value(value_text)
                elif "Bonus" in label_text:
                    user_info["bonus"] = self._parse_number(value_text)

        return user_info

    def _extract_ratio_value(self, text: str) -> str:
        """从文本中提取分享率"""
        match = re.search(r"([\d.]+|Inf|∞)", text)
        return match.group(1) if match else "0.00"

    def _parse_size(self, text: str) -> int:
        """将大小文本转换为字节数"""
        text = text.strip().upper()
        match = re.match(r"([\d.]+)\s*([KMGT]I?B)", text)
        if not match:
            return 0
        value = float(match.group(1))
        unit = match.group(2)
        multipliers = {"B": 1, "IB": 1, "KB": 1024, "KIB": 1024, "MB": 1024 ** 2, "MIB": 1024 ** 2, "GB": 1024 ** 3, "GIB": 1024 ** 3, "TB": 1024 ** 4, "TIB": 1024 ** 4, "PB": 1024 ** 5, "PIB": 1024 ** 5}
        return int(value * multipliers.get(unit, 1))

    def _parse_number(self, text: str) -> int:
        """解析数字文本"""
        text = text.strip().replace(",", "").replace(" ", "")
        match = re.search(r"([\d.]+)", text)
        return int(float(match.group(1))) if match else 0

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
            user_info["id"] = str(site_id)
            user_info["name"] = site_name
            user_info["url"] = site_domain
            user_info["icon"] = self._get_icon_url(site_domain)
            user_info["has_cookie"] = True
            user_info["error"] = None
            return {"success": True, "message": f"站点 {site_name} 刷新成功", "data": user_info}
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
