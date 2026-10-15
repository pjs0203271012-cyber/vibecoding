"""页面 2：账单列表 + 删除账目。"""

import streamlit as st

from config import CATEGORIES
from db import delete_record, load_months, load_records


def show_list_page():
    """画「账单列表」页面：筛选 → 删除区 → 合计 → 表格。"""
    st.subheader("📋 账单列表")

    # ---- 筛选：月份选项来自已有数据，分类多选框不选 = 全部 ----
    months = load_months()
    month = st.selectbox("按月份筛选", ["全部"] + months)
    categories = st.multiselect("按分类筛选（不选 = 全部）", CATEGORIES)

    # ---- 删除区：放在表格上方，删除后表格才能立即刷新 ----
    with st.expander("🗑️ 删除账目（展开）"):
        del_id = st.number_input("要删除的账目编号", min_value=1, step=1)
        confirm = st.checkbox("我确认删除这条账目")
        if st.button("删除", type="primary", disabled=not confirm):
            if delete_record(int(del_id)):
                st.success(f"已删除编号为 {int(del_id)} 的账目")
            else:
                st.error(f"编号 {int(del_id)} 不存在，没有删除任何东西")

    # ---- 数据区：按上面的筛选条件查询 ----
    df = load_records(month, categories)
    if df.empty:
        st.info("还没有符合条件的账目，先去「记一笔」页添加吧。")
        return

    # 合计指标卡：收入、支出分开统计
    expense_total = df[df["type"] == "支出"]["amount"].sum()
    income_total = df[df["type"] == "收入"]["amount"].sum()
    col1, col2 = st.columns(2)
    col1.metric("支出合计", f"¥{expense_total:.2f}")
    col2.metric("收入合计", f"¥{income_total:.2f}")

    # 表格：把列名换成中文，方便阅读
    display = df.rename(
        columns={
            "id": "编号",
            "type": "类型",
            "date": "日期",
            "category": "分类",
            "amount": "金额",
            "note": "备注",
        }
    )
    st.dataframe(display, width="stretch", hide_index=True)
