---
slug: l6-mcp
title: MCP：统一连接方式，不替你授权
collection: cme295
lecture: 6
description: 用书籍服务解释Host、Client、Server和Tools、Resources、Prompts，区分协议兼容与信任。
order: 70
kind: lesson
status: published
tags: [MCP, Protocol, Tools, Resources]
---

## 1. 为什么需要标准化？

PDF第87–90页。同一组后端能力若要适配多个应用，逐对编写连接器容易重复。MCP = Model Context Protocol，为工具和数据提供共同交互约定。

教学类比：3个应用接4组服务，朴素逐对最多12条连接；共用标准接口可从两侧各适配，概念上3+4=7个适配点。现实仍有认证、功能差异、版本与部署工作，不保证总工程量严格从12降到7。

## 2. 三种角色

| 角色 | 职责 |
| --- | --- |
| Host | 用户交互应用，管理模型、连接、上下文与权限策略 |
| Client | Host内面向某个Server的协议通信组件 |
| Server | 暴露工具、资源、提示等能力，可调用自己的后端 |

不是模型权重直接打开网络连接；通常是host/client代为通信。多个server也不等于多个自主Agent。

## 3. Tools、Resources、Prompts

以诗集服务为例：

- Tools：搜索书名、推荐书籍等可调用接口。
- Resources：用户授权的已有藏书等数据，可供宿主读取和提供上下文。
- Prompts：可复用的交互模板／工作流入口，如按偏好推荐。

Resource不是“另一个带副作用的工具”的同义词，prompt模板也不凭其来自server而拥有更高指令权限。具体控制与使用方式由客户端和协议版本决定。

## 4. 标准化不解决哪些问题？

MCP不会自动保证工具描述正确、服务可信、请求已授权或执行安全。仍需身份认证、最小权限、连接来源审查、输入输出验证和审计。

后端密钥不应交给模型或塞进普通工具结果。远程服务返回的内容需当外部数据处理；只在用户授权范围内把必要信息传出。

本文只是协议角色说明，没有安装真实server、没有访问任何账户；也不承诺课件中的SDK片段在当前版本直接可跑。

## 5. MCP和普通Function calling

Function calling通常描述模型输出结构化请求的接口；MCP描述应用怎样连接能力提供方。宿主可把MCP工具转换成模型理解的工具定义，两层可以结合。

不是“支持MCP就不需要工具prompt和评估”，也不是MCP取代后端业务逻辑。Agent之间委派任务的A2A则在[Harness篇](l6-harness.html)讨论，两者关注层次不同。

## 理解检查

<details><summary>MCP Server一定是自主Agent吗？</summary><p>不是，它可以只是暴露查询和数据的服务，不必有自主循环。</p></details>
<details><summary>协议符合标准，是否就可信？</summary><p>不。兼容性和可信性不同，仍需连接与权限审查。</p></details>

来源：PDF第87–90页；连接数量和信任边界为教学补充。
