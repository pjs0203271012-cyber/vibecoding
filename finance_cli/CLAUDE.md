# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目简介

个人记账 Web 工具（面向编程新手）：网页表单记收支账目、按月/分类筛选账单列表、按 ID 删除、分类统计（柱状图 + 统计表）。本机运行，数据存本地 SQLite 文件，无需部署服务器。界面与注释全部使用中文。

## 技术栈与常用命令

- Python 3.9+ / Streamlit / sqlite3（标准库）/ pandas（随 streamlit 自动安装），无其他依赖
- 安装依赖：`pip install streamlit`（下载慢时改用镜像：`pip install streamlit -i https://pypi.tuna.tsinghua.edu.cn/simple`）
- 启动：`streamlit run app.py`，浏览器自动打开 http://localhost:8501；停止：终端按 Ctrl+C
- 无测试框架，验证靠手工清单（见文末）

## 架构

代码按职责拆成小模块，跨文件用 `import` 调用：

- `app.py` — 唯一入口：`st.set_page_config` → `init_db()` → 侧边栏 radio 三页导航，按选择调用 views 里对应页面的 `show_xxx_page()`
- `config.py` — 唯一放常量的文件：`CATEGORIES`（6 个预设分类）、`DB_PATH`（数据库路径）。想改分类只改这里
- `db.py` — 唯一操作数据库的文件：建表、增、查、删、统计，查询用 `pandas.read_sql_query` 返回 DataFrame
- `views/*.py` — 页面文件，每个只导出 `show_xxx_page()`；只写界面，不直接碰 sqlite3，数据操作一律调用 db.py
- `finance.db` — 运行时自动生成，不手动创建、不进 git（已在 .gitignore）

## 数据库

单表 `records`：`id`（自增主键，删除后不补位）/ `type`（'收入' 或 '支出'）/ `amount`（REAL，正数）/ `category`（预设分类之一）/ `date`（TEXT，'YYYY-MM-DD'）/ `note`（TEXT，可空）

## 约定

- 金额一律存正数，收支由 `type` 字段区分
- 收入、支出共用同一套 6 个分类（餐饮、交通、购物、娱乐、居住、其他）
- 删除账目：列表页表格上方的折叠区，输入 ID + 勾选「我确认删除」；ID 不存在时红字提示
- 记账页用 `st.form` 包住输入框，点提交才写入

## 验证清单（改动后逐条试）

1. `streamlit run app.py` 启动无报错（无 ImportError 说明模块拆分正确）
2. 记支出、收入各一笔 → 列表出现且类型正确
3. 月份/分类筛选后，表格与合计数字一致
4. 删除：不存在的 ID 红字报错；存在的 ID 删除后列表立即刷新
5. 统计页柱状图数值与统计表一致；切换月份/收支类型结果正确
6. 重启应用后数据仍在（持久化）
