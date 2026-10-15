"""程序入口：启动数据库，侧边栏导航到 3 个页面。

启动方式：在终端输入  streamlit run app.py
"""

import streamlit as st

from db import init_db
from views.add_page import show_add_page
from views.list_page import show_list_page
from views.stats_page import show_stats_page

# 浏览器标签页标题和图标（必须放在页面代码的最前面）
st.set_page_config(page_title="我的记账本", page_icon="💰", layout="wide")

# 首次运行时自动创建数据库文件 finance.db
init_db()

# 侧边栏导航：选了哪个功能，就调用哪个页面文件
page = st.sidebar.radio("请选择功能", ["📝 记一笔", "📋 账单列表", "📊 分类统计"])
if page == "📝 记一笔":
    show_add_page()
elif page == "📋 账单列表":
    show_list_page()
else:
    show_stats_page()
