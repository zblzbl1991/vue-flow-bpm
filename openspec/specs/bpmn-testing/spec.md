# bpmn-testing Specification

## Purpose
TBD - created by archiving change add-bpmnjs-testing. Update Purpose after archive.
## Requirements
### Requirement: BPMN 测试页面

系统 SHALL 提供一个独立的测试页面,用于手动验证 BPMN 转换功能。

#### Scenario: 访问测试页面
- **WHEN** 用户导航到测试页面路由（如 /testing）
- **THEN** 显示测试页面界面
- **AND** 页面包含两个主要区域:上传区和预览区

#### Scenario: 上传 vue-flow JSON 进行导出测试
- **WHEN** 用户在测试页面上传 vue-flow JSON 文件
- **THEN** 系统解析 JSON 并生成 BPMN XML
- **AND** 在预览区使用 bpmn-js 渲染 BPMN 图
- **AND** 显示转换统计信息（节点数、边数、生成时间）

#### Scenario: 上传 BPMN XML 进行导入测试
- **WHEN** 用户在测试页面上传 BPMN XML 文件
- **THEN** 系统解析 XML 并转换为 vue-flow JSON
- **AND** 在预览区使用 vue-flow 渲染流程图
- **AND** 显示转换统计信息和解析警告

#### Scenario: 并排对比视图
- **GIVEN** 用户已上传文件（JSON 或 XML）
- **WHEN** 转换成功完成
- **THEN** 显示并排对比视图
- **AND** 左侧显示 vue-flow 渲染结果
- **AND** 右侧显示 bpmn-js 渲染结果
- **AND** 两个视图同步缩放和平移

### Requirement: 测试辅助工具

系统 SHALL 提供测试辅助工具函数,简化测试代码的编写。

#### Scenario: 创建模拟 bpmn-js 查看器
- **WHEN** 测试需要模拟 bpmn-js 查看器
- **THEN** `bpmnjs-test-helpers.ts` 提供 `mockBpmnViewer()` 函数
- **AND** 模拟查看器支持 `importXML()` 和 `destroy()` 方法
- **AND** 模拟查看器触发相应的事件

#### Scenario: 加载测试 fixture 文件
- **WHEN** 测试需要加载 fixture 数据
- **THEN** `bpmnjs-test-helpers.ts` 提供 `loadFixture(path)` 函数
- **AND** 自动处理 JSON 和 XML 格式
- **AND** 返回解析后的数据对象

#### Scenario: XML 解析和验证辅助
- **WHEN** 测试需要验证 XML 内容
- **THEN** `xml-test-helpers.ts` 提供 XML 操作函数
- **AND** 包含 `parseXml()` 解析 XML 字符串
- **AND** 包含 `assertXmlNamespace()` 验证命名空间
- **AND** 包含 `assertXmlElement()` 查找和验证元素
- **AND** 包含 `normalizeXml()` 格式化 XML 用于比较

#### Scenario: 转换测试辅助
- **WHEN** 测试需要验证往返转换
- **THEN** `conversion-test-helpers.ts` 提供转换测试函数
- **AND** 包含 `testRoundtrip()` 执行 JSON → XML → JSON 转换并比较
- **AND** 包含 `assertNodesEqual()` 比较节点数组
- **AND** 包含 `assertEdgesEqual()` 比较边数组

### Requirement: 测试 Fixture 集合

系统 SHALL 提供一组涵盖各种场景的测试 fixture 文件。

#### Scenario: 基础流程 fixtures
- **GIVEN** 测试需要验证基本转换功能
- **THEN** `tests/fixtures/simple/` 包含:
  - `linear-flow.{json,bpmn.xml}` - 线性流程（开始 → 任务 → 结束）
  - `single-branch.{json,bpmn.xml}` - 单分支流程（包含一个排他网关）
  - `single-loop.{json,bpmn.xml}` - 单循环流程（任务回环到自身）

#### Scenario: 复杂流程 fixtures
- **GIVEN** 测试需要验证复杂转换功能
- **THEN** `tests/fixtures/complex/` 包含:
  - `nested-gateways.{json,bpmn.xml}` - 嵌套网关（网关内包含网关）
  - `parallel-merge.{json,bpmn.xml}` - 并行分支和合并
  - `complex-conditions.{json,bpmn.xml}` - 多条件表达式和复杂网关逻辑

#### Scenario: 边界情况 fixtures
- **GIVEN** 测试需要验证边界情况
- **THEN** `tests/fixtures/edge-cases/` 包含:
  - `large-flow.{json,bpmn.xml}` - 大流程图（100+ 节点）
  - `special-chars.{json,bpmn.xml}` - 特殊字符（Unicode、表情符号、引号等）
  - `boundary-values.{json,bpmn.xml}` - 边界值（最长 ID、最深嵌套等）

#### Scenario: Fixture 格式要求
- **GIVEN** 每个 fixture 场景
- **THEN** 提供 JSON 格式（.json 文件）
- **AND** 提供对应的 BPMN XML 格式（.bpmn.xml 文件）
- **AND** 两个文件表示相同的逻辑流程
- **AND** 文件名清晰描述场景

### Requirement: 往返转换测试

系统 SHALL 提供测试,验证 JSON → XML → JSON 转换的一致性。

#### Scenario: 完全一致的往返转换
- **GIVEN** 一个 vue-flow JSON workflow
- **WHEN** 执行 JSON → XML → JSON 转换
- **THEN** 生成的 JSON 与原始 JSON 在结构上等价
- **AND** 节点类型和连接关系保持不变
- **AND** 关键属性（label、条件、assignee 等）保持不变

#### Scenario: 允许的往返转换差异
- **GIVEN** 一个 vue-flow JSON workflow
- **WHEN** 执行 JSON → XML → JSON 转换
- **THEN** 某些次要差异是可接受的:
  - 自动生成的 ID 可能不同
  - 节点位置可能略有差异（由于 DI 重建）
  - 格式化和空白字符可能不同
- **AND** 测试使用模糊比较或选择性验证

#### Scenario: 往返转换测试覆盖所有 fixture
- **GIVEN** 所有可用的 fixture 文件
- **WHEN** 运行往返转换测试套件
- **THEN** 每个 fixture 都被测试
- **AND** 失败的测试提供详细的差异信息

### Requirement: BPMN 规范合规性测试

系统 SHALL 提供测试,验证生成的 BPMN XML 符合 BPMN 2.0 规范。

#### Scenario: 验证 XML 结构合规性
- **GIVEN** 生成的 BPMN XML
- **WHEN** 使用 bpmn-js moddle 验证
- **THEN** XML 结构符合 BPMN 2.0 规范
- **AND** 所有必需的属性和元素存在
- **AND** 命名空间声明正确

#### Scenario: 验证元素类型合规性
- **GIVEN** 导出的 BPMN XML
- **WHEN** 检查每个元素类型
- **THEN** 所有元素类型是有效的 BPMN 2.0 元素
- **AND** 元素属性符合 BPMN 2.0 规范

#### Scenario: 验证序列流合规性
- **GIVEN** 导出的 BPMN XML
- **WHEN** 检查序列流
- **THEN** 所有序列流正确引用源和目标元素
- **AND** 条件表达式符合 BPMN 2.0 格式
- **AND** 网关默认流正确标记

### Requirement: Flowable/Camunda 扩展兼容性测试

系统 SHALL 提供测试,验证 Flowable 和 Camunda 扩展属性的兼容性。

#### Scenario: 验证 Flowable 扩展导出
- **GIVEN** 包含 Flowable 扩展属性的节点
- **WHEN** 导出为 BPMN XML
- **THEN** 所有 Flowable 扩展正确导出
- **AND** 使用正确的 Flowable 命名空间
- **AND** 属性名称和值符合 Flowable 规范

#### Scenario: 验证 Flowable 扩展导入
- **GIVEN** 包含 Flowable 扩展的 BPMN XML
- **WHEN** 导入为 vue-flow JSON
- **THEN** 所有 Flowable 扩展属性正确导入
- **AND** 属性映射到正确的节点数据字段

#### Scenario: 验证 Camunda 扩展兼容性
- **GIVEN** 包含 Camunda 扩展的 BPMN XML
- **WHEN** 导入为 vue-flow JSON
- **THEN** Camunda 扩展属性被正确识别
- **AND** 属性映射到相应的节点数据字段

### Requirement: 性能测试

系统 SHALL 提供性能测试,确保转换和渲染在合理时间内完成。

#### Scenario: 小型流程性能测试
- **GIVEN** 一个包含 10 个节点的流程
- **WHEN** 执行导出和导入操作
- **THEN** JSON → XML 转换在 500ms 内完成
- **AND** XML → JSON 转换在 500ms 内完成
- **AND** bpmn-js 渲染在 1s 内完成

#### Scenario: 中型流程性能测试
- **GIVEN** 一个包含 50 个节点的流程
- **WHEN** 执行导出和导入操作
- **THEN** JSON → XML 转换在 2s 内完成
- **AND** XML → JSON 转换在 2s 内完成
- **AND** bpmn-js 渲染在 3s 内完成

#### Scenario: 大型流程性能测试
- **GIVEN** 一个包含 100+ 节点的流程
- **WHEN** 执行导出和导入操作
- **THEN** JSON → XML 转换在 5s 内完成
- **AND** XML → JSON 转换在 5s 内完成
- **AND** bpmn-js 渲染在 10s 内完成
- **AND** 测试标记为 `@slow` 以便在 CI 中选择性运行

### Requirement: 集成测试

系统 SHALL 提供端到端集成测试,验证完整的转换和预览流程。

#### Scenario: JSON 上传到 BPMN 预览的完整流程
- **WHEN** 用户在测试页面上传 vue-flow JSON 文件
- **THEN** 系统完成以下步骤:
  1. 解析 JSON 文件
  2. 转换为 BPMN XML
  3. 使用 bpmn-js 渲染
  4. 显示预览
- **AND** 每个步骤都成功完成
- **AND** 错误在任何步骤失败时被正确处理

#### Scenario: BPMN XML 上传到 vue-flow 预览的完整流程
- **WHEN** 用户在测试页面上传 BPMN XML 文件
- **THEN** 系统完成以下步骤:
  1. 解析 XML 文件
  2. 转换为 vue-flow JSON
  3. 使用 vue-flow 渲染
  4. 显示预览
- **AND** 每个步骤都成功完成
- **AND** 错误在任何步骤失败时被正确处理

#### Scenario: 测试页面组件测试
- **GIVEN** 测试页面组件
- **WHEN** 渲染和交互
- **THEN** 组件正确渲染所有子组件
- **AND** 文件上传触发正确的处理函数
- **AND** 预览区域正确显示转换结果
- **AND** 错误消息正确显示给用户

### Requirement: 错误处理测试

系统 SHALL 提供测试,验证各种错误情况的处理。

#### Scenario: 无效 JSON 文件处理
- **WHEN** 用户上传无效的 JSON 文件
- **THEN** 系统显示清晰的错误消息
- **AND** 错误消息指出 JSON 语法错误的位置
- **AND** 预览区域保持为空或显示占位符

#### Scenario: 无效 BPMN XML 处理
- **WHEN** 用户上传无效的 BPMN XML 文件
- **THEN** 系统显示清晰的错误消息
- **AND** 错误消息指出 XML 验证错误
- **AND** 不执行转换操作

#### Scenario: 不支持的元素类型处理
- **WHEN** BPMN XML 包含不支持的元素类型
- **THEN** 系统显示错误消息
- **AND** 错误消息列出不支持的元素
- **AND** 建议用户如何修复

#### Scenario: 转换过程中的异常处理
- **WHEN** 转换过程中发生未预期的异常
- **THEN** 系统捕获异常并显示用户友好的错误消息
- **AND** 错误消息包含足够的调试信息
- **AND** 应用程序不会崩溃或卡死

