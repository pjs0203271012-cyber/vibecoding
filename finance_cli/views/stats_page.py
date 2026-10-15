"""页面 3：分类统计。"""

import streamlit as st

from db import load_months, load_records, load_stats


def show_stats_page():
    """画「分类统计」页面：收支结余指标 + 柱状图 + 统计表。"""
    st.subheader("📊 分类统计")

    # ---- 筛选：月份（默认全部）+ 统计哪类（默认支出）----
    months = load_months()
    month = st.selectbox("按月份统计", ["全部"] + months)
    record_type = st.radio("统计哪类", ["支出", "收入"], horizontal=True)

    # ---- 指标卡：收入、支出、结余（结余只受月份影响，不看类型选择）----
    df_all = load_records(month)
    income = df_all[df_all["type"] == "收入"]["amount"].sum()
    expense = df_all[df_all["type"] == "支出"]["amount"].sum()
    col1, col2, col3 = st.columns(3)
    col1.metric("收入", f"¥{income:.2f}")
    col2.metric("支出", f"¥{expense:.2f}")
    col3.metric("结余", f"¥{income - expense:.2f}")

    # ---- 按分类汇总 ----
    stats = load_stats(month, record_type)
    if stats.empty:
        st.info("这个范围内还没有账目，先去「记一笔」页添加吧。")
        return

    # ---- 柱状图：横轴分类、纵轴金额合计 ----
    # 单色系柱状图，颜色取自校验过的色板：深色/浅色主题各用对应一档
    bar_color = "#3987e5" if st.get_option("theme.base") == "dark" else "#2a78d6"
    chart_data = stats.set_index("category")["total"].rename("金额")
    st.bar_chart(chart_data, color=bar_color)

    # ---- 统计表：中文列名 + 占比一列 ----
    table = stats.rename(columns={"category": "分类", "total": "总金额", "count": "笔数"})
    table["占比"] = (table["总金额"] / table["总金额"].sum() * 100).round(1).astype(str) + "%"
    st.dataframe(table, width="stretch", hide_index=True)
