# bpmn-validation Specification

## Purpose
TBD - created by archiving change add-bpmn-editor. Update Purpose after archive.
## Requirements
### Requirement: BPMN XML 验证预览

系统 SHALL 提供 BPMN XML 验证功能，使用 bpmn-js 在预览模式中渲染和验证生成的 XML。

#### Scenario: 打开验证预览
- **WHEN** 用户点击「验证」按钮
- **THEN** 显示预览模态框
- **AND** bpmn-js Viewer 加载当前生成的 BPMN XML
- **AND** 模态框显示验证状态（成功/失败）

#### Scenario: 验证成功
- **GIVEN** 生成的 BPMN XML 符合 BPMN 2.0 规范
- **WHEN** 用户点击「验证」按钮
- **THEN** 预览模态框显示 BPMN 流程图
- **AND** 显示「验证成功」的提示消息

#### Scenario: 验证失败
- **GIVEN** 生成的 BPMN XML 存在格式或结构错误
- **WHEN** 用户点击「验证」按钮
- **THEN** 预览模态框显示错误列表
- **AND** 每个错误包含错误位置和描述
- **AND** 不显示 BPMN 流程图

### Requirement: 错误定位和高亮

验证模块 SHALL 在验证失败时帮助用户定位问题源。

#### Scenario: 显示错误详情
- **WHEN** 验证失败
- **THEN** 错误列表包含：错误类型、位置（元素 ID）、具体描述

#### Scenario: 错误元素关联
- **WHEN** 用户点击错误列表中的某一项
- **THEN** 编辑器中对应的节点被高亮显示
- **AND** 画布自动定位到该节点

### Requirement: 预览交互功能

预览模式 SHALL 提供基本的 BPMN 图查看交互。

#### Scenario: 缩放预览图
- **WHEN** 用户在预览模态框中使用鼠标滚轮
- **THEN** BPMN 图以鼠标位置为中心缩放

#### Scenario: 平移预览图
- **WHEN** 用户在预览模态框中拖拽画布
- **THEN** BPMN 图随拖拽方向移动

#### Scenario: 查看元素详情
- **WHEN** 用户点击预览图中的某个元素
- **THEN** 显示该元素的类型和 ID 信息

### Requirement: 预览模式性能

预览模块 SHALL 在合理时间内完成 BPMN XML 的加载和渲染。

#### Scenario: 小型流程验证
- **GIVEN** 流程包含少于 20 个元素
- **WHEN** 用户点击「验证」按钮
- **THEN** 预览在 2 秒内完成加载

#### Scenario: 大型流程验证
- **GIVEN** 流程包含 20-100 个元素
- **WHEN** 用户点击「验证」按钮
- **THEN** 预览在 5 秒内完成加载
- **AND** 如果加载时间过长，显示加载进度提示

### Requirement: 验证结果导出

系统 SHALL 允许用户将验证通过的 BPMN XML 导出为文件。

#### Scenario: 导出验证通过的 XML
- **GIVEN** 验证结果显示 BPMN XML 符合规范
- **WHEN** 用户点击「导出 XML」按钮
- **THEN** 下载 `.bpmn` 或 `.xml` 格式的文件
- **AND** 文件名基于流程 ID

#### Scenario: 阻止导出验证失败的 XML
- **GIVEN** 验证结果显示 BPMN XML 存在错误
- **WHEN** 用户尝试点击「导出 XML」按钮
- **THEN** 按钮被禁用或显示警告
- **AND** 提示用户先修复错误

### Requirement: bpmn-js 集成配置

验证模块 SHALL 正确配置 bpmn-js Viewer 以支持 BPMN 2.0 和 Flowable。

#### Scenario: 初始化 bpmn-js Viewer
- **WHEN** 预览组件被挂载
- **THEN** bpmn-js Viewer 使用正确的配置初始化
- **AND** 包含 BPMN 2.0 建模规范
- **AND** 支持自定义模块（如果需要）

#### Scenario: 加载自定义样式
- **WHEN** bpmn-js 渲染 BPMN 图
- **THEN** 应用默认的 BPMN 样式
- **AND** 确保不同元素类型有正确的视觉区分

### Requirement: 验证缓存机制

系统 SHALL 缓存最近一次的验证结果以提高响应速度。

#### Scenario: 缓存验证结果
- **WHEN** 用户首次点击「验证」按钮
- **THEN** 验证结果被缓存
- **AND** 缓存与当前 BPMN XML 内容关联

#### Scenario: 检测内容变化
- **WHEN** 用户修改了工作流（添加/删除节点或连接）
- **THEN** 缓存被标记为无效
- **AND** 下次验证时重新加载 bpmn-js

#### Scenario: 重复验证使用缓存
- **WHEN** 用户在工作流未修改的情况下再次点击「验证」
- **THEN** 直接显示缓存的验证结果
- **AND** 避免重复的渲染开销

### Requirement: 预览模式关闭和清理

预览模块 SHALL 在关闭时正确清理资源。

#### Scenario: 关闭预览模态框
- **WHEN** 用户点击关闭按钮或按 ESC 键
- **THEN** 模态框被关闭
- **AND** bpmn-js 实例被销毁
- **AND** 相关事件监听器被移除

#### Scenario: 导航离开时清理
- **WHEN** 用户在预览打开时导航离开页面
- **THEN** 预览组件正确卸载
- **AND** 防止内存泄漏

