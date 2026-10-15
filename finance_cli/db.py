"""数据库操作：建表、增、查、删、统计。

页面文件（views/ 里的文件）不直接碰数据库，都通过这里的函数读写数据。
"""

import sqlite3
from contextlib import closing

import pandas as pd

from config import DB_PATH


def _connect():
    """建立数据库连接。用 with 使用：退出时自动关闭（closing 的作用）。"""
    return closing(sqlite3.connect(DB_PATH))


def init_db():
    """建表（表不存在时才建，已存在则什么都不做）。程序启动时自动调用。"""
    with _connect() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS records (
                id       INTEGER PRIMARY KEY AUTOINCREMENT,  -- 编号，删除后不补位，正常现象
                type     TEXT NOT NULL,                      -- '收入' 或 '支出'
                amount   REAL NOT NULL,                      -- 金额，正数
                category TEXT NOT NULL,                      -- 预设分类之一
                date     TEXT NOT NULL,                      -- 日期，格式 YYYY-MM-DD
                note     TEXT DEFAULT ''                     -- 备注，可留空
            )
            """
        )
        conn.commit()


def add_record(record_type, amount, category, date, note):
    """新增一条账目。record_type 传 '收入' 或 '支出'，date 传 'YYYY-MM-DD' 字符串。"""
    with _connect() as conn:
        conn.execute(
            "INSERT INTO records (type, amount, category, date, note) VALUES (?, ?, ?, ?, ?)",
            (record_type, amount, category, date, note),
        )
        conn.commit()


def load_months():
    """取出数据里出现过的所有月份（如 '2026-10'），新的在前，供下拉框用。"""
    with _connect() as conn:
        rows = conn.execute(
            "SELECT DISTINCT substr(date, 1, 7) AS month FROM records ORDER BY month DESC"
        ).fetchall()
    return [row[0] for row in rows]


def load_records(month=None, categories=None):
    """按筛选条件查账目列表，按日期倒序（新的在前）返回 DataFrame。

    month: 形如 '2026-10' 的月份字符串；None 或 '全部' 表示不按月份筛选
    categories: 分类列表；为空或 None 表示不按分类筛选
    """
    sql = "SELECT id, type, date, category, amount, note FROM records WHERE 1=1"
    params = []
    if month and month != "全部":
        sql += " AND substr(date, 1, 7) = ?"
        params.append(month)
    if categories:
        placeholders = ",".join("?" * len(categories))
        sql += f" AND category IN ({placeholders})"
        params.extend(categories)
    sql += " ORDER BY date DESC, id DESC"
    with _connect() as conn:
        return pd.read_sql_query(sql, conn, params=params)


def delete_record(record_id):
    """按编号删除一条账目，返回是否真的删掉（编号不存在时返回 False）。"""
    with _connect() as conn:
        cur = conn.execute("DELETE FROM records WHERE id = ?", (record_id,))
        conn.commit()
    return cur.rowcount > 0


def load_stats(month=None, record_type="支出"):
    """按分类汇总金额和笔数，返回 DataFrame（列：category、total、count）。

    month: 形如 '2026-10' 的月份字符串；None 或 '全部' 表示所有月份
    record_type: '收入' 或 '支出'
    """
    sql = (
        "SELECT category, SUM(amount) AS total, COUNT(*) AS count "
        "FROM records WHERE type = ?"
    )
    params = [record_type]
    if month and month != "全部":
        sql += " AND substr(date, 1, 7) = ?"
        params.append(month)
    sql += " GROUP BY category ORDER BY total DESC"
    with _connect() as conn:
        return pd.read_sql_query(sql, conn, params=params)
