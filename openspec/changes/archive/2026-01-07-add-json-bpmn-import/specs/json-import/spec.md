# Capability: json-import

## ADDED Requirements

### Requirement: JSON 文件导入

系统 SHALL 支持从 JSON 文件导入工作流数据到编辑器中。

#### Scenario: 导入有效的 JSON 工作流
- **GIVEN** 一个有效的 vue-flow JSON 导出文件（包含 nodes、edges 数组）
- **WHEN** 用户点击"Load JSON"按钮并选择该文件
- **THEN** 系统解析 JSON 并加载所有节点和边
- **AND** 编辑器状态更新为导入的工作流
- **AND** 显示成功消息，包含节点和边的数量

#### Scenario: 导入包含流程信息的 JSON
- **GIVEN** JSON 文件包含 process 信息（id、name、version 等）
- **WHEN** 用户导入该文件
- **THEN** processInfo 状态正确更新
- **AND** 流程名称和 ID 显示在属性面板中

#### Scenario: JSON 文件格式错误
- **WHEN** 用户选择格式错误的 JSON 文件
- **THEN** 显示清晰的错误消息
- **AND** 消息说明文件格式无效
- **AND** 编辑器状态保持不变

#### Scenario: JSON 结构验证失败
- **GIVEN** JSON 格式正确但缺少必需字段（如 nodes、edges）
- **WHEN** 用户导入该文件
- **THEN** 显示验证错误消息
- **AND** 指出缺少的字段
- **AND** 编辑器状态保持不变

### Requirement: 导入文件大小限制

系统 SHALL 限制导入文件的大小以防止性能问题。

#### Scenario: 导入超大 JSON 文件
- **WHEN** 用户选择超过 5MB 的 JSON 文件
- **THEN** 显示文件过大错误
- **AND** 建议用户拆分工作流或联系支持
- **AND** 不执行导入操作

### Requirement: JSON 导入覆盖确认

当编辑器中已有内容时，系统 SHALL 提示用户确认是否覆盖。

#### Scenario: 编辑器中有内容时导入
- **GIVEN** 编辑器中已有节点和边
- **WHEN** 用户尝试导入新的 JSON 文件
- **THEN** 显示确认对话框
- **AND** 说明导入将替换当前内容
- **AND** 用户可选择继续或取消

#### Scenario: 用户确认导入
- **GIVEN** 确认对话框显示中
- **WHEN** 用户点击"继续"
- **THEN** 清除当前内容并加载新工作流
- **AND** 显示导入成功消息

#### Scenario: 用户取消导入
- **GIVEN** 确认对话框显示中
- **WHEN** 用户点击"取消"
- **THEN** 关闭对话框
- **AND** 保留当前编辑器内容

### Requirement: JSON 导入错误处理

系统 SHALL 为 JSON 导入错误提供详细的诊断信息。

#### Scenario: 节点类型不支持
- **GIVEN** JSON 包含不支持类型的节点
- **WHEN** 用户导入该文件
- **THEN** 显示警告消息
- **AND** 列出不支持的节点类型和 ID
- **AND** 跳过不支持的节点继续导入

#### Scenario: 边引用了不存在的节点
- **GIVEN** JSON 中的边引用了不存在的 source 或 target 节点
- **WHEN** 用户导入该文件
- **THEN** 显示警告消息
- **AND** 列出无效的边
- **AND** 跳过无效的边继续导入

### Requirement: JSON 导入用户反馈

系统 SHALL 在 JSON 导入过程中提供清晰的视觉反馈。

#### Scenario: 导入成功通知
- **WHEN** JSON 导入成功完成
- **THEN** 显示成功通知（toast/消息框）
- **AND** 通知包含导入的节点数和边数
- **AND** 通知在 3 秒后自动消失

#### Scenario: 导入失败通知
- **WHEN** JSON 导入失败
- **THEN** 显示错误通知
- **AND** 通知包含失败原因
- **AND** 通知保持显示直到用户关闭
