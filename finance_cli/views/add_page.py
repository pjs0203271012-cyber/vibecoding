"""页面 1：记一笔。"""

import streamlit as st

from config import CATEGORIES
from db import add_record


def show_add_page():
    """画「记一笔」页面：表单填写后点提交，写入数据库。"""
    st.subheader("📝 记一笔")

    # st.form 把输入框包起来：只有点「提交」才写入，输入过程中不会误触发
    with st.form("add_form", clear_on_submit=True):
        record_type = st.radio("类型", ["支出", "收入"], horizontal=True)
        amount = st.number_input("金额（元）", min_value=0.01, step=0.01, format="%.2f")
        category = st.selectbox("分类", CATEGORIES)
        date = st.date_input("日期")  # 默认今天
        note = st.text_input("备注（可选）")
        submitted = st.form_submit_button("记下这笔")

    if submitted:
        add_record(record_type, amount, category, str(date), note.strip())
        st.success(f"已记下：{record_type} ¥{amount:.2f} · {category}")
