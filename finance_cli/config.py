"""配置常量：想改分类、改数据库位置，都来这里改。"""

from pathlib import Path

# 预设的 6 个账目分类（收入、支出共用；想加分类就在这个列表里加）
CATEGORIES = ["餐饮", "交通", "购物", "娱乐", "居住", "其他"]

# 数据库文件位置：就在本项目文件夹里，首次运行自动生成
DB_PATH = Path(__file__).parent / "finance.db"
