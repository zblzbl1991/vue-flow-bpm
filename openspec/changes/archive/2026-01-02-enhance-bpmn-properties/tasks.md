# Tasks: Enhanced BPMN Editor Properties System

## Phase 1: 基础类型和状态管理扩展

### 1.1 扩展类型定义
- [x] 扩展 `BpmnNodeData` 接口，添加新属性字段
- [x] 添加 `Listener` 接口定义（执行监听器、任务监听器）
- [x] 添加 `FormProperty` 接口定义
- [x] 添加 `MultiInstanceConfig` 接口定义
- [x] 添加 `Parameter` 接口定义（输入/输出参数）
- [x] 扩展 `BpmnEdgeData` 接口，添加 name 和 documentation

### 1.2 扩展编辑器状态管理
- [x] 在 `useBpmnEditor.ts` 中添加 `processInfo` 的完整字段
- [x] 添加 `updateNodeId` 方法（处理 ID 修改和引用更新）
- [x] 添加 `deleteSelected` 方法（统一删除选中元素）
- [x] 扩展 `updateNode` 方法支持嵌套对象更新
- [x] 添加 ID 唯一性验证函数

## Phase 2: 元素删除功能实现

### 2.1 键盘快捷键删除
- [x] 在 `BpmnEditor.vue` 中添加键盘事件监听
- [x] 实现 Delete/Backspace 键删除选中元素
- [x] 添加删除确认对话框（可选）
- [x] 处理删除后的选择状态清理

### 2.2 属性面板删除按钮修复
- [x] 验证 PropertyPanel 删除按钮的事件绑定
- [x] 确保删除事件正确传递到 BpmnEditor
- [x] 测试节点删除（包括关联边）
- [x] 测试边删除

### 2.3 右键菜单
- [x] 创建 `ContextMenu.vue` 组件
- [x] 实现右键菜单显示/隐藏逻辑
- [x] 添加"删除"菜单项
- [x] 添加"复制"菜单项（可选）
- [x] 添加菜单定位逻辑（跟随鼠标）

## Phase 3: 属性面板组件重构

### 3.1 属性面板容器重构
- [x] 重构 `PropertyPanel.vue` 为容器组件
- [x] 实现动态组件加载逻辑
- [x] 添加标签页分组（基础、高级、监听器、表单）
- [x] 实现属性变更事件的统一处理

### 3.2 流程属性组件
- [x] 创建 `ProcessProperties.vue`
- [x] 添加 Process ID 编辑（带验证）
- [x] 添加 Process Name 编辑
- [x] 添加 Process Version 编辑
- [x] 添加 Executable 复选框
- [x] 添加 Documentation 多行文本
- [x] 添加 Candidate Starter Groups 编辑

### 3.3 通用属性组件
- [x] 创建 `CommonProperties.vue`
- [x] 添加 ID 编辑（带验证）
- [x] 添加 Name/Label 编辑
- [x] 添加 Documentation 多行文本

### 3.4 用户任务属性组件
- [x] 创建 `UserTaskProperties.vue`
- [x] 添加 Assignee 编辑（支持表达式）
- [x] 添加 Candidate Users 编辑（多行，逗号分隔）
- [x] 添加 Candidate Groups 编辑（多行，逗号分隔）
- [x] 添加 Priority 编辑（数字）
- [x] 添加 Due Date 编辑（日期选择器或文本）
- [x] 添加 Form Key 编辑
- [x] 添加 Skip Expression 编辑
- [x] 添加 Async Before/After 复选框

### 3.5 服务任务属性组件
- [x] 创建 `ServiceTaskProperties.vue`
- [x] 添加 Expression 编辑
- [x] 添加 Delegate Expression 编辑
- [x] 添加 Class 编辑
- [x] 添加 Async 复选框
- [x] 添加 Async Before/After 复选框
- [x] 添加 Triggerable 复选框

### 3.6 网关属性组件
- [x] 创建 `GatewayProperties.vue`
- [x] 添加 Default Flow 下拉选择
- [x] 添加 Documentation 编辑
- [x] 显示连接的序列流列表

### 3.7 序列流属性组件
- [x] 创建 `SequenceFlowProperties.vue`
- [x] 添加 Name 编辑
- [x] 添加 Condition Expression 编辑
- [x] 添加 Documentation 编辑
- [x] 添加"设为默认流"按钮（对网关）

### 3.8 事件属性组件
- [x] 创建 `EventProperties.vue`
- [x] 添加 Name 编辑
- [x] 添加 Documentation 编辑
- [x] 添加特定事件类型的属性（如定时器事件）

## Phase 4: 高级配置组件

### 4.1 监听器配置组件
- [x] 创建 `ListenerConfig.vue`
- [x] 实现监听器列表显示
- [x] 实现监听器类型选择（执行/任务）
- [x] 实现 Event 类型下拉（start/end/take/create/complete/delete）
- [x] 实现 Implementation 类型选择（class/expression/delegateExpression）
- [x] 实现 Value 编辑
- [x] 实现 Fields 子组件
- [x] 实现添加/删除监听器

### 4.2 表单属性配置组件
- [x] 创建 `FormPropertiesConfig.vue`
- [x] 实现表单属性列表显示
- [x] 实现 ID 编辑（带验证）
- [x] 实现 Name 编辑
- [x] 实现类型下拉（string/long/double/boolean/date/enum）
- [x] 实现 Required/Writable/Readable 复选框
- [x] 实现 Default Value 编辑
- [x] 实现 Enum Values 子组件（当类型为 enum 时）
- [x] 实现添加/删除表单属性

### 4.3 多实例配置组件
- [x] 创建 `MultiInstanceConfig.vue`
- [x] 实现 Sequential/Parallel 单选按钮
- [x] 实现 Collection 编辑
- [x] 实现 Element Variable 编辑
- [x] 实现 Completion Condition 编辑
- [x] 实现 Cardinality 编辑
- [x] 添加启用/禁用多实例的开关

### 4.4 输入输出参数配置组件
- [x] 创建 `ParametersConfig.vue`
- [x] 实现参数列表显示
- [x] 实现参数名称编辑
- [x] 实现参数值/表达式编辑
- [x] 实现添加/删除参数

## Phase 5: XML 转换扩展

### 5.1 Flowable 命名空间更新
- [x] 修改 `BPMN_NAMESPACES` 添加 `flowable`
- [x] 更新所有 `camunda:` 前缀为 `flowable:`

### 5.2 监听器转换
- [x] 实现 `convertListenersToXml` 函数
- [x] 支持执行监听器 XML 生成
- [x] 支持任务监听器 XML 生成
- [x] 支持监听器字段转换

### 5.3 表单属性转换
- [x] 实现 `convertFormPropertiesToXml` 函数
- [x] 支持各种数据类型
- [x] 支持 enum 值数组

### 5.4 多实例转换
- [x] 实现 `convertMultiInstanceToXml` 函数
- [x] 生成 `multiInstanceLoopCharacteristics` 元素
- [x] 支持顺序/并行模式

### 5.5 参数转换
- [x] 实现 `convertInputParametersToXml` 函数
- [x] 实现 `convertOutputParametersToXml` 函数
- [x] 支持 Flowable extension 元素

### 5.6 扩展节点转换
- [x] 更新 `convertNodeToBpmnElement` 支持所有新属性
- [x] 添加 Documentation 元素生成
- [x] 添加异步属性生成

### 5.7 流程属性转换
- [x] 扩展流程定义 XML 生成
- [x] 支持 candidateStarterGroups
- [x] 支持 executable 标志

## Phase 6: 验证和测试

### 6.1 功能验证
- [x] 测试所有元素类型的属性编辑
- [x] 测试删除功能（键盘、按钮、右键）
- [x] 测试 ID 修改和验证
- [x] 测试监听器配置
- [x] 测试表单属性配置
- [x] 测试多实例配置

### 6.2 XML 导出验证
- [x] 验证生成的 XML 符合 BPMN 2.0 规范
- [ ] 使用 Flowable 测试导入
- [x] 验证所有属性正确导出
- [x] 验证监听器正确生成
- [x] 验证多实例配置正确生成

### 6.3 边界情况测试
- [x] 测试特殊字符输入（ID、表达式）
- [x] 测试空值处理
- [x] 测试无效输入验证
- [x] 测试大量监听器/表单属性的性能

## Phase 7: 文档和 UX 优化

### 7.1 帮助提示
- [x] 为每个属性添加 tooltip 说明
- [x] 添加表达式语法帮助
- [x] 添加监听器配置示例

### 7.2 样式优化
- [x] 优化属性面板布局（标签页分组）
- [x] 添加错误状态样式
- [x] 添加必填字段标识

### 7.3 用户文档
- [x] 编写属性配置指南
- [x] 编写监听器使用说明
- [x] 编写 Flowable 部署指南
