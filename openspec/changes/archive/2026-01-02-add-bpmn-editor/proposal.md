# Change: BPMN Workflow Editor with BPMN 2.0 XML Export

## Why

用户需要在线绘制工作流，并能够导出为符合 Flowable 可用的 BPMN 2.0 规范的 XML 文件。当前项目缺乏可视化工作流编辑器和格式转换功能。

## What Changes

- 添加基于 vue-flow 的可视化 BPMN 编辑器
- 实现 vue-flow JSON 到 BPMN 2.0 XML 的转换器
- 集成 bpmn-js 用于验证生成的 XML 正确性
- 支持预览模式验证（点击验证按钮后显示）

支持的 BPMN 元素包括：
- 开始/结束事件
- 用户任务
- 服务任务
- 排他网关
- 并行网关
- 连接线

## Impact

- Affected specs:
  - `bpmn-editor` (new) - 可视化编辑器功能
  - `bpmn-conversion` (new) - JSON 到 XML 转换
  - `bpmn-validation` (new) - BPMN XML 验证
- Affected code:
  - 新增 Vue 3 组件和组合式函数
  - 新增转换工具函数
  - 新增验证集成
