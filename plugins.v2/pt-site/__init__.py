import json
import time
import re
from datetime import datetime
from typing import Any, Dict, List, Optional, Tuple
from bs4 import BeautifulSoup
from app.core.event import eventmanager, Event
from app.schemas.types import EventType
from app.plugins import _PluginBase
from app.db.site_oper import SiteOper


class PTSite(_PluginBase):
    """PT 站点信息统计插件"""

    plugin_name = "PT Site"
    plugin_desc = "显示 PT 站点用户信息统计，包括等级、上传、下载、做种时间等"
    plugin_icon = "https://raw.githubusercontent.com/ap0806109/MoviePilot-Plugins/refs/heads/main/icons/ptpiler.png"
    plugin_version = "1.0.0"
    plugin_author = "ap0806109"
    author_url = "https://github.com/ap0806109/MoviePilot-Plugins"
    plugin_config_prefix = "ptsite_"
    plugin_order = 100
    auth_level = 1

    _enabled = False
    _sites: List[Dict] = []
    _auto_refresh = False
    _refresh_interval = 60

    def init_plugin(self, config: dict = None):
        """初始化插件"""
        config = config or {}
        self._enabled = bool(config.get("enabled"))
        self._auto_refresh = bool(config.get("auto_refresh"))
        self._refresh_interval = int(config.get("refresh_interval", 60))
        
        site_oper = SiteOper()
        all_sites = site_oper.list_sites()
        self._sites = []
        for site in all_sites:
            site_dict = {
                "id": str(site.id),
                "name": site.name,
                "url": site.domain,
                "cookie": site.cookie,
                "note": json.loads(site.note) if site.note else {},
                "last_sync": None,
                "user_info": None,
                "error": None,
            }
            self._sites.append(site_dict)

    def get_state(self) -> bool:
        return self._enabled

    @staticmethod
    def get_command() -> List[Dict[str, Any]]:
        return [
            {
                "cmd": "/ptsite_refresh",
                "event": EventType.PluginAction,
                "desc": "刷新所有站点信息",
                "category": "PT Site",
                "data": {"action": "refresh"},
            },
        ]

    def get_api(self) -> List[Dict[str, Any]]:
        """注册插件 API"""
        return [
            {
                "path": "/sites",
                "endpoint": self.get_sites,
                "methods": ["GET"],
                "auth": "bear",
                "summary": "获取站点列表",
                "description": "返回所有配置的 PT 站点信息及用户数据",
            },
            {
                "path": "/site/refresh",
                "endpoint": self.refresh_site,
                "methods": ["POST"],
                "auth": "bear",
                "summary": "刷新单个站点",
                "description": "刷新指定站点的用户信息",
            },
            {
                "path": "/site/refresh-all",
                "endpoint": self.refresh_all_sites,
                "methods": ["POST"],
                "auth": "bear",
                "summary": "刷新所有站点",
                "description": "刷新所有站点的用户信息",
            },
            {
                "path": "/stats/summary",
                "endpoint": get_stats_summary,
                "methods": ["GET"],
                "auth": "bear",
                "summary": "获取统计摘要",
                "description": "获取所有站点的汇总统计数据",
            },
        ]

    def get_form(self) -> Tuple[List[dict], Dict[str, Any]]:
        """配置页面"""
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
                                            "label": "启用插件",
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
                                            "label": "自动刷新",
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
                                            "label": "刷新间隔 (分钟)",
                                            "items": [
                                                {"title": "30 分钟", "value": 30},
                                                {"title": "60 分钟", "value": 60},
                                                {"title": "120 分钟", "value": 120},
                                                {"title": "360 分钟", "value": 360},
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
            "refresh_interval": 60,
        }

    def get_page(self) -> List[dict]:
        """详情页 - 返回空，使用 Vue 联邦模式"""
        return []

    def get_render_mode(self) -> Tuple[str, str]:
        """使用 Vue 联邦模式渲染"""
        return "vue", "dist/assets"

    def get_sidebar_nav(self) -> List[Dict[str, Any]]:
        """注册侧栏菜单入口"""
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

    def stop_service(self):
        """停止服务"""
        self._enabled = False

    def get_sites(self) -> Dict[str, Any]:
        """获取站点列表"""
        return {"sites": self._sites, "total": len(self._sites)}

    def refresh_site(self, data: dict) -> Dict[str, Any]:
        """刷新单个站点"""
        site_id = data.get("site_id")
        site = next((s for s in self._sites if s.get("id") == site_id), None)
        
        if not site:
            return {"success": False, "message": "未找到站点"}
        
        user_info, error = self._fetch_user_info(site)
        site["user_info"] = user_info
        site["error"] = error
        site["last_sync"] = datetime.now().isoformat()
        
        self._save_config()
        
        if error:
            return {"success": False, "message": error, "site": site}
        return {"success": True, "message": "刷新成功", "site": site}

    def refresh_all_sites(self) -> Dict[str, Any]:
        """刷新所有站点"""
        results = []
        for site in self._sites:
            user_info, error = self._fetch_user_info(site)
            site["user_info"] = user_info
            site["error"] = error
            site["last_sync"] = datetime.now().isoformat()
            results.append({
                "site": site["name"],
                "success": error is None,
                "error": error,
            })
        
        self._save_config()
        return {"success": True, "results": results, "total": len(results)}

    def _save_config(self):
        """保存配置"""
        site_data = []
        for site in self._sites:
            site_copy = site.copy()
            if site.get("user_info"):
                site_copy["user_info"] = site["user_info"]
            site_data.append(site_copy)
        
        self.update_config({
            "enabled": self._enabled,
            "auto_refresh": self._auto_refresh,
            "refresh_interval": self._refresh_interval,
            "sites": site_data,
        })

    def _fetch_user_info(self, site: Dict) -> Tuple[Optional[Dict], Optional[str]]:
        """从站点获取用户信息"""
        try:
            import requests
            
            url = site.get("url")
            cookie = site.get("cookie")
            
            if not url or not cookie:
                return None, "站点配置不完整"
            
            headers = {
                "Cookie": cookie,
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8",
            }
            
            resp = requests.get(url, headers=headers, timeout=15)
            
            if resp.status_code != 200:
                return None, f"HTTP {resp.status_code}"
            
            soup = BeautifulSoup(resp.text, 'html.parser')
            
            user_info = self._parse_nexusphp(soup, url)
            if user_info:
                return user_info, None
            
            return None, "无法解析用户信息"
            
        except requests.exceptions.Timeout:
            return None, "请求超时"
        except requests.exceptions.ConnectionError:
            return None, "连接错误"
        except Exception as e:
            return None, str(e)

    def _parse_nexusphp(self, soup: BeautifulSoup, base_url: str) -> Optional[Dict]:
        """解析 NexusPHP 站点用户信息"""
        try:
            username = None
            level = None
            upload = 0
            download = 0
            ratio = 0
            bonus = 0
            seeding = 0
            leeching = 0
            seeding_size = 0
            hr = 0
            
            level_table = soup.find('table', class_='table_userinfo')
            if not level_table:
                level_table = soup.find('table', attrs={'width': '100%'})
            
            if level_table:
                rows = level_table.find_all('tr')
                for row in rows:
                    cells = row.find_all('td')
                    if len(cells) >= 2:
                        label = cells[0].get_text(strip=True)
                        value = cells[1].get_text(strip=True)
                        
                        if '用户名' in label or 'Username' in label:
                            username = value
                        elif '等级' in label or 'Class' in label:
                            level = value
                        elif '上传' in label or 'Uploaded' in label:
                            upload = self._parse_size(value)
                        elif '下载' in label or 'Downloaded' in label:
                            download = self._parse_size(value)
                        elif '分享率' in label or 'Ratio' in label:
                            try:
                                ratio = float(value)
                            except:
                                pass
                        elif '魔力' in label or 'Bonus' in label:
                            try:
                                bonus = int(value.replace(',', ''))
                            except:
                                pass
            
            seedbox = soup.find('div', class_='seedbox')
            if seedbox:
                text = seedbox.get_text()
                seeding_match = re.search(r'做种\s*(\d+)', text) or re.search(r'Seeding\s*(\d+)', text)
                leeching_match = re.search(r'做种中\s*(\d+)', text) or re.search(r'Leeching\s*(\d+)', text)
                seeding_size_match = re.search(r'做种体积\s*([\d.]+\s*[TGM]+)', text) or re.search(r'Seeding Size\s*([\d.]+\s*[TGM]+)', text)
                
                if seeding_match:
                    seeding = int(seeding_match.group(1))
                if leeching_match:
                    leeching = int(leeching_match.group(1))
                if seeding_size_match:
                    seeding_size = self._parse_size(seeding_size_match.group(1))
            
            hr_table = soup.find('table', id='hitandrun')
            if hr_table:
                hr_rows = hr_table.find_all('tr')[1:]
                hr = len(hr_rows)
            
            if not username:
                avatar = soup.find('img', class_='avatar')
                if avatar and avatar.get('alt'):
                    username = avatar.get('alt')
            
            if not username:
                welcome = soup.find(string=re.compile(r'欢迎|Welcome'))
                if welcome:
                    match = re.search(r'([\w\s]+)', welcome)
                    if match:
                        username = match.group(1).strip()
            
            seeding_time = self._parse_seeding_time(soup)
            
            return {
                "username": username or "Unknown",
                "level": level or "Unknown",
                "upload": upload,
                "download": download,
                "ratio": round(ratio, 2),
                "bonus": bonus,
                "seeding": seeding,
                "leeching": leeching,
                "seeding_size": seeding_size,
                "hr": hr,
                "seeding_time": seeding_time,
            }
            
        except Exception:
            return None

    def _parse_size(self, size_str: str) -> float:
        """解析大小字符串为字节"""
        if not size_str:
            return 0
        
        units = {
            'B': 1,
            'KB': 1024,
            'MB': 1024 ** 2,
            'GB': 1024 ** 3,
            'TB': 1024 ** 4,
            'PB': 1024 ** 5,
        }
        
        size_str = size_str.upper().strip()
        
        for unit, multiplier in units.items():
            if unit in size_str:
                try:
                    num = float(re.sub(r'[^\d.]', '', size_str))
                    return num * multiplier
                except:
                    pass
        
        try:
            return float(re.sub(r'[^\d.]', '', size_str))
        except:
            return 0

    def _parse_seeding_time(self, soup: BeautifulSoup) -> Optional[Dict]:
        """解析做种时间"""
        try:
            seedbox = soup.find('div', class_='seedbox')
            if seedbox:
                text = seedbox.get_text()
                
                days_match = re.search(r'(\d+)\s*[天天 days?]', text)
                hours_match = re.search(r'(\d+)\s*[时时 hours?]', text)
                mins_match = re.search(r'(\d+)\s*[分分 minutes?]', text)
                
                days = int(days_match.group(1)) if days_match else 0
                hours = int(hours_match.group(1)) if hours_match else 0
                mins = int(mins_match.group(1)) if mins_match else 0
                
                total_minutes = days * 24 * 60 + hours * 60 + mins
                
                if total_minutes > 0:
                    return {
                        "total_minutes": total_minutes,
                        "days": days,
                        "hours": hours,
                        "minutes": mins,
                    }
        except:
            pass
        
        return None


def get_stats_summary() -> Dict[str, Any]:
    """获取统计摘要 (需要实例化插件调用)"""
    pass
