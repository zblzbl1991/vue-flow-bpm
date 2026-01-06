# Capability: bpmn-xml-import

## ADDED Requirements

### Requirement: BPMN XML 文件导入到编辑器

系统 SHALL 支持从 BPMN 2.0 XML 文件导入工作流到编辑器中。

#### Scenario: 导入有效的 BPMN XML
- **GIVEN** 一个符合 BPMN 2.0 规范的 XML 文件
- **WHEN** 用户点击"Load BPMN"按钮并选择该文件
- **THEN** 系统解析 XML 并转换为 vue-flow 格式
- **AND** 编辑器状态更新为转换后的工作流
- **AND** 显示成功消息，包含节点和边的数量

#### Scenario: 导入包含流程属性的 BPMN XML
- **GIVEN** BPMN XML 包含 process 属性（id、name、version、executable 等）
- **WHEN** 用户导入该文件
- **THEN** processInfo 状态正确更新
- **AND** 所有流程属性映射到编辑器状态

#### Scenario: 导入包含扩展属性的 BPMN XML
- **GIVEN** BPMN XML 包含 Flowable/Camunda 扩展属性
- **WHEN** 用户导入该文件
- **THEN** 扩展属性正确映射到节点数据
- **AND** 用户可在属性面板中查看和编辑这些属性

### Requirement: BPMN XML 导入工具栏入口

系统 SHALL 在编辑器工具栏提供 BPMN XML 导入按钮。

#### Scenario: 工具栏显示导入按钮
- **GIVEN** 用户在 BPMN 编辑器页面
- **THEN** 工具栏显示"Load BPMN"按钮
- **AND** 按钮位置与"Load JSON"按钮相邻
- **AND** 按钮图标表示 BPMN/XML 文件

#### Scenario: 点击导入按钮触发文件选择
- **WHEN** 用户点击"Load BPMN"按钮
- **THEN** 打开系统文件选择对话框
- **AND** 文件类型过滤器设置为 .bpmn 和 .xml

### Requirement: BPMN XML 导入验证

系统 SHALL 在导入后验证工作流的有效性。

#### Scenario: 导入后显示验证警告
- **GIVEN** 导入的 BPMN XML 生成的工作流有结构问题（如孤立节点）
- **WHEN** 导入完成
- **THEN** 显示警告通知
- **AND** 列出发现的问题
- **AND** 允许用户继续编辑工作流

#### Scenario: 导入成功无警告
- **GIVEN** 导入的 BPMN XML 生成的工作流结构完整
- **WHEN** 导入完成
- **THEN** 显示成功通知
- **AND** 不显示任何警告

### Requirement: BPMN XML 导入错误处理

系统 SHALL 为 BPMN XML 导入失败提供清晰的错误信息。

#### Scenario: BPMN XML 格式无效
- **WHEN** 用户选择无效的 XML 文件
- **THEN** 显示错误消息
- **AND** 消息说明 XML 格式无效
- **AND** 编辑器状态保持不变

#### Scenario: BPMN XML 缺少必需元素
- **GIVEN** XML 有效但不包含 BPMN process 元素
- **WHEN** 用户导入该文件
- **THEN** 显示错误消息
- **AND** 说明文件中未找到有效的 BPMN 流程

#### Scenario: BPMN XML 包含不支持的元素
- **GIVEN** BPMN XML 包含不支持的元素类型（如子流程、中间事件）
- **WHEN** 用户导入该文件
- **THEN** 显示错误消息
- **AND** 列出不支持的元素类型和 ID
- **AND** 说明当前版本的限制

#### Scenario: BPMN XML 命名空间不支持
- **GIVEN** BPMN XML 使用未知的命名空间
- **WHEN** 用户导入该文件
- **THEN** 显示警告消息
- **AND** 说明某些属性可能无法正确解析
- **AND** 尝试继续导入

### Requirement: BPMN XML 导入覆盖确认

当编辑器中已有内容时，系统 SHALL 提示用户确认是否覆盖。

#### Scenario: 编辑器中有内容时导入 BPMN
- **GIVEN** 编辑器中已有节点和边
- **WHEN** 用户尝试导入新的 BPMN XML 文件
- **THEN** 显示确认对话框
- **AND** 说明导入将替换当前内容
- **AND** 用户可选择继续或取消

### Requirement: BPMN XML 导入文件大小限制

系统 SHALL 限制导入文件的大小以防止性能问题。

#### Scenario: 导入超大 BPMN XML 文件
- **WHEN** 用户选择超过 10MB 的 BPMN 文件
- **THEN** 显示文件过大错误
- **AND** 建议用户简化流程或联系支持
- **AND** 不执行导入操作

#### Scenario: 导入大型 BPMN XML 显示进度
- **GIVEN** BPMN XML 文件较大（超过 1MB）
- **WHEN** 用户导入该文件
- **THEN** 显示加载进度指示器
- **AND** 指示器在解析过程中更新
