# Spec: BPMN Element Management

## ADDED Requirements

### Requirement: 删除选中的 BPMN 元素

The system MUST allow users to delete nodes and sequence flows from the BPMN canvas through multiple methods.

#### Scenario: 通过键盘快捷键删除元素

**Given** 用户已在 BPMN 编辑器画布上选中一个节点或连接线

**When** 用户按下 `Delete` 或 `Backspace` 键

**Then**
- 选中的元素应从画布上移除
- 如果删除的是节点，所有连接到该节点的序列流也应被删除
- 选择状态应被清除

#### Scenario: 通过属性面板删除按钮删除元素

**Given** 用户已选中一个元素，属性面板显示该元素的属性

**When** 用户点击属性面板底部的"Delete"按钮

**Then**
- 选中的元素应从画布上移除
- 如果删除的是节点，所有连接到该节点的序列流也应被删除
- 选择状态应被清除

#### Scenario: 通过右键菜单删除元素

**Given** 用户在画布上的某个元素上右键点击

**When** 用户从右键菜单中选择"删除"选项

**Then**
- 右键点击的元素应从画布上移除
- 如果删除的是节点，所有连接到该节点的序列流也应被删除
- 右键菜单应被关闭

### Requirement: 编辑元素 ID

The system MUST allow users to edit the ID of any BPMN element to maintain consistency with external system references.

#### Scenario: 修改节点 ID

**Given** 用户选中一个节点并在属性面板中查看其属性

**When** 用户在 ID 输入框中输入新的 ID 并失去焦点

**Then**
- 如果新 ID 格式有效（符合 XML NCName 规则）且唯一，节点 ID 应被更新
- 如果新 ID 无效或已存在，应显示错误提示并保持原 ID

#### Scenario: ID 验证规则

**Given** 用户正在编辑元素 ID

**When** 用户输入的 ID 符合以下规则之一：
  - 以字母或下划线开头
  - 只包含字母、数字、下划线、连字符

**Then** ID 应被视为有效格式

**When** 用户输入的 ID 违反上述规则

**Then** 应显示格式错误提示

### Requirement: 选择和反选元素

The system MUST allow users to select elements to view and edit their properties, and deselect by clicking on empty canvas areas.

#### Scenario: 点击选择节点

**Given** 画布上有多个节点

**When** 用户点击某个节点

**Then**
- 该节点应显示为选中状态（如高亮边框）
- 属性面板应显示该节点的属性
- 之前选中的其他元素应被取消选择

#### Scenario: 点击选择序列流

**Given** 画布上有多个序列流

**When** 用户点击某条序列流

**Then**
- 该序列流应显示为选中状态（如改变颜色或加粗）
- 属性面板应显示该序列流的属性
- 之前选中的其他元素应被取消选择

#### Scenario: 点击空白处取消选择

**Given** 用户已选中某个元素

**When** 用户点击画布空白区域（非节点、非序列流）

**Then**
- 所有元素应取消选中状态
- 属性面板应显示"未选择任何元素"的提示
