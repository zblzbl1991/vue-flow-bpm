## ADDED Requirements

### Requirement: 组件测试框架
项目 SHALL 使用 Vitest 和 @vue/test-utils 作为组件测试框架，所有测试文件 SHALL 放置在 `bpm-test` 目录下。

#### Scenario: 测试框架配置
- **GIVEN** 项目已安装 Vitest 和 @vue/test-utils
- **WHEN** 配置测试运行脚本
- **THEN** 可以通过 `npm test` 命令运行测试

#### Scenario: 测试文件位置
- **GIVEN** 新建组件测试文件
- **WHEN** 按组件类型组织测试目录
- **THEN** 测试文件位于 `bpm-test/components/[category]/[ComponentName].test.ts`

### Requirement: BPMN 节点组件测试
所有 BPMN 节点组件 SHALL 有对应的单元测试，测试 SHALL 覆盖组件渲染、Props、事件处理和样式。

#### Scenario: StartEvent 节点测试
- **GIVEN** StartEvent 组件
- **WHEN** 渲染组件
- **THEN** 显示圆形 SVG、源 Handle、标签（可选）

#### Scenario: EndEvent 节点测试
- **GIVEN** EndEvent 组件
- **WHEN** 渲染组件
- **THEN** 显示粗边框圆形 SVG、目标 Handle、标签（可选）

#### Scenario: UserTask 节点测试
- **GIVEN** UserTask 组件
- **WHEN** 渲染组件
- **THEN** 显示圆角矩形 SVG、用户图标、目标和源 Handle、标签和负责人（可选）

#### Scenario: ServiceTask 节点测试
- **GIVEN** ServiceTask 组件
- **WHEN** 渲染组件
- **THEN** 显示圆角矩形 SVG、齿轮图标、目标和源 Handle、标签（可选）

#### Scenario: ExclusiveGateway 节点测试
- **GIVEN** ExclusiveGateway 组件
- **WHEN** 渲染组件
- **THEN** 显示菱形 SVG、X 标记、目标和源 Handle、标签（可选）

#### Scenario: ParallelGateway 节点测试
- **GIVEN** ParallelGateway 组件
- **WHEN** 渲染组件
- **THEN** 显示菱形 SVG、+ 标记、目标和源 Handle、标签（可选）

#### Scenario: SubProcess 节点测试
- **GIVEN** SubProcess 组件
- **WHEN** 渲染组件
- **THEN** 显示带圆角矩形边框、目标和源 Handle、标签（可选）

#### Scenario: 节点选中状态测试
- **GIVEN** 任意节点组件
- **WHEN** 设置 `selected` prop 为 true
- **THEN** 应用选中样式类

#### Scenario: 节点尺寸自定义测试
- **GIVEN** 节点组件
- **WHEN** 传入自定义 `width` 和 `height`
- **THEN** SVG 使用指定尺寸渲染

### Requirement: 编辑器组件测试
BPMN 编辑器核心组件 SHALL 有单元测试覆盖，测试 SHALL 包括渲染、用户交互、事件发射和状态管理。

#### Scenario: BpmnEditor 组件渲染
- **GIVEN** BpmnEditor 组件
- **WHEN** 渲染组件
- **THEN** 显示 VueFlow 容器、控制面板、属性面板、工具栏

#### Scenario: BpmnEditor 节点点击
- **GIVEN** BpmnEditor 组件
- **WHEN** 点击节点
- **THEN** 调用 `selectNode` 方法并更新属性面板

#### Scenario: BpmnEditor 连接创建
- **GIVEN** BpmnEditor 组件
- **WHEN** 从一个节点拖拽到另一个节点
- **THEN** 创建连接边并调用 `addEdge` 方法

#### Scenario: ControlPanel 元素添加
- **GIVEN** ControlPanel 组件
- **WHEN** 点击元素类型按钮
- **THEN** 发射 `add-element` 事件并传入元素类型

#### Scenario: ControlPanel 清空画布
- **GIVEN** ControlPanel 组件
- **WHEN** 点击清空按钮
- **THEN** 发射 `clear` 事件

#### Scenario: PropertyPanel 属性更新
- **GIVEN** PropertyPanel 组件和选中的节点
- **WHEN** 修改属性值
- **THEN** 发射 `update-node` 事件并传入更新数据

#### Scenario: ContextMenu 操作
- **GIVEN** ContextMenu 组件
- **WHEN** 点击复制或删除选项
- **THEN** 发射对应的事件（copy 或 delete）

#### Scenario: ImportNotification 显示
- **GIVEN** ImportNotification 组件
- **WHEN** 导入成功或失败
- **THEN** 显示相应类型的通知（success/error/warning）

### Requirement: 属性配置组件测试
属性配置组件 SHALL 有单元测试，测试 SHALL 包括表单输入、验证和事件发射。

#### Scenario: GatewayProperties 默认流设置
- **GIVEN** GatewayProperties 组件
- **WHEN** 选择默认流出边
- **THEN** 发射 `set-default-flow` 事件

#### Scenario: SequenceFlowProperties 条件表达式
- **GIVEN** SequenceFlowProperties 组件
- **WHEN** 输入条件表达式
- **THEN** 发射 `update-edge` 事件并更新条件

#### Scenario: UserTaskProperties 负责人设置
- **GIVEN** UserTaskProperties 组件
- **WHEN** 输入负责人值
- **THEN** 发射 `update-node` 事件并更新 assignee

#### Scenario: ServiceTaskProperties 表达式设置
- **GIVEN** ServiceTaskProperties 组件
- **WHEN** 输入表达式
- **THEN** 发射 `update-node` 事件并更新表达式

#### Scenario: FormPropertiesConfig 表单字段配置
- **GIVEN** FormPropertiesConfig 组件
- **WHEN** 添加或编辑表单字段
- **THEN** 更新表单属性数组

#### Scenario: ListenerConfig 监听器配置
- **GIVEN** ListenerConfig 组件
- **WHEN** 添加事件监听器
- **THEN** 更新监听器数组

### Requirement: 测试覆盖率要求
组件测试覆盖率 SHALL 达到以下标准：语句覆盖率 >= 80%，分支覆盖率 >= 70%，函数覆盖率 >= 80%。

#### Scenario: 覆盖率检查
- **GIVEN** 所有组件测试已编写
- **WHEN** 运行 `npm run test:coverage`
- **THEN** 覆盖率报告显示满足最低要求

#### Scenario: 覆盖率报告生成
- **GIVEN** 测试覆盖率检查
- **WHEN** 覆盖率不满足要求
- **THEN** 在报告中标识未覆盖的代码行

### Requirement: VueFlow 组件 Mock
测试 SHALL 正确 mock VueFlow 组件（Handle、Position 等）以隔离测试目标组件。

#### Scenario: VueFlow Handle Mock
- **GIVEN** 使用 VueFlow Handle 的组件
- **WHEN** 编写测试
- **THEN** Handle 被 mock 为简单的占位符组件

#### Scenario: VueFlow Position Mock
- **GIVEN** 使用 VueFlow Position 的组件
- **WHEN** 编写测试
- **THEN** Position 被正确 mock 和导入
