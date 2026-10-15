# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

Claude Code 配置与工作空间仓库，用于存储 Claude Code 的 settings、memory、skills 等配置，以及相关实验代码。

## 配置说明

- `.claude/settings.local.json` — 本地权限配置（allow/deny 规则）
- `.claude/settings.json` — 项目级共享配置
- `CLAUDE.md`（全局，位于 `~\.claude\`）— 用户级行为指令
- `claude.md`（本文件）— 项目级 Claude Code 指引

## 注意事项

- `.claude/settings.local.json` 应保持与全局 CLAUDE.md 红线操作一致的限制
- 敏感文件（.env、密钥、证书）不要提交到 Git


## 可用 Skills

- 创建 React 组件时，请读取 `.claude/skills/react-component/SKILL.md` 并严格遵循其中的规范
