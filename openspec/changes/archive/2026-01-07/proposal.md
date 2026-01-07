# Change: Add Component Tests

## Why

当前项目缺乏对 Vue 组件的单元测试覆盖，特别是：
- BPMN 节点组件（StartEvent, EndEvent, UserTask, ServiceTask, Gateway, SubProcess 等）
- 编辑器组件（BpmnEditor, ControlPanel, PropertyPanel 等）
- 属性配置组件

添加组件测试可以：
1. 确保组件行为正确性和稳定性
2. 防止回归问题
3. 提高代码质量
4. 方便重构和维护

## What Changes

- 为所有 BPMN 节点组件添加单元测试
- 为编辑器核心组件添加单元测试
- 为属性配置组件添加单元测试
- 所有测试文件遵循项目规范放置在 `bpm-test` 目录下
- 使用 Vitest 和 @vue/test-utils 作为测试框架
- 测试覆盖渲染、Props、事件、用户交互等方面

## Impact

- Affected specs: `component-tests` (新增)
- Affected code:
  - `src/components/nodes/*.vue` (所有节点组件)
  - `src/components/BpmnEditor/*.vue` (编辑器组件)
  - `src/components/BpmnEditor/properties/*.vue` (属性组件)
- 新增目录: `bpm-test/`
