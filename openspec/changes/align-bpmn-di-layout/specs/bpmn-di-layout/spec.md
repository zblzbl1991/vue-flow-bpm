# bpmn-di-layout Specification

## Purpose
定义 BPMN DI (Diagram Interchange) 布局信息的解析、渲染和导出行为，确保与 bpmn-js 的视觉一致性。

## ADDED Requirements

### Requirement: BPMNEdge 航点提取

导入器 SHALL 从 BPMN DI 的 `BPMNEdge` 元素中提取所有航点（waypoints），用于精确重建边的路径。

#### Scenario: 提取简单直连边的航点
- **GIVEN** BPMN XML 包含一个只有两个航点的序列流（起点和终点）
- **WHEN** 导入该文件
- **THEN** 边的 `data.waypoints` 包含两个航点对象 `[{x, y}, {x, y}]`
- **AND** 边的 `data.path` 包含对应的 SVG 路径字符串 `"M x1 y1 L x2 y2"`

#### Scenario: 提取多段路径边的航点
- **GIVEN** BPMN XML 包含一个有四个航点的序列流（如 U 型绕行路径）
- **WHEN** 导入该文件
- **THEN** 边的 `data.waypoints` 包含所有四个航点对象
- **AND** 边的 `data.path` 包含完整的多段 SVG 路径字符串 `"M x1 y1 L x2 y2 L x3 y3 L x4 y4"`
- **AND** 渲染时边的路径遵循原始 BPMN 文件定义的走向

#### Scenario: 处理不同命名空间的航点
- **GIVEN** BPMN XML 使用 `omgdi:waypoint` 或 `di:waypoint` 命名空间
- **WHEN** 导入该文件
- **THEN** 正确提取所有航点，无论使用哪种命名空间前缀
- **AND** 航点坐标解析为数值类型

#### Scenario: 缺少航点信息的边
- **GIVEN** BPMN XML 中的序列流没有对应的 `BPMNEdge` DI 信息
- **WHEN** 导入该文件
- **THEN** 边的 `data.waypoints` 为 undefined
- **AND** 边使用 Vue Flow 的默认贝塞尔曲线渲染

### Requirement: 航点到 SVG 路径转换

系统 SHALL 将 BPMN 航点数组转换为 SVG 路径命令，用于自定义边的渲染。

#### Scenario: 两点路径转换
- **GIVEN** 航点数组 `[{x: 100, y: 150}, {x: 200, y: 150}]`
- **WHEN** 调用 `waypointsToSvgPath()`
- **THEN** 返回字符串 `"M 100 150 L 200 150"`

#### Scenario: 多点路径转换
- **GIVEN** 航点数组包含三个或更多点
- **WHEN** 调用 `waypointsToSvgPath()`
- **THEN** 返回以 `M` 开头、后跟多个 `L` 命令的路径字符串
- **AND** 每个航点按顺序转换为对应的坐标指令

#### Scenario: 空航点数组处理
- **GIVEN** 航点数组为空或只有一个点
- **WHEN** 调用 `waypointsToSvgPath()`
- **THEN** 返回空字符串或抛出错误
- **AND** 边回退到默认贝塞尔曲线渲染

### Requirement: 使用航点渲染边

Vue Flow 边组件 SHALL 优先使用从 BPMN DI 提取的航点路径，否则使用默认贝塞尔曲线。

#### Scenario: 渲染带航点的边
- **GIVEN** 边数据包含 `data.path` 字段（来自 BPMN 航点）
- **WHEN** 渲染该边
- **THEN** 使用 `data.path` 作为边的 SVG 路径
- **AND** 边的视觉走向与原始 BPMN 文件一致

#### Scenario: 渲染无航点的边
- **GIVEN** 边数据不包含 `data.path` 字段
- **WHEN** 渲染该边
- **THEN** 使用 Vue Flow 的 `getBezierPath()` 计算默认路径
- **AND** 边使用标准的平滑曲线连接源节点和目标节点

#### Scenario: 边路径与节点连接点对齐
- **GIVEN** 边使用航点路径渲染
- **WHEN** 源节点或目标节点位置改变
- **THEN** 航点路径保持原始坐标（不自动更新）
- **AND** 用户需要手动调整边或重新导入以更新路径

### Requirement: 导出时保留航点信息

导出器 SHALL 在生成 BPMN XML 时保留从原始文件导入的航点信息。

#### Scenario: 导出带原始航点的边
- **GIVEN** 边数据包含 `data.waypoints` 数组（从原始 BPMN 导入）
- **WHEN** 导出为 BPMN XML
- **THEN** 生成的 `BPMNEdge` 包含所有原始航点
- **AND** 每个 `di:waypoint` 元素包含正确的 `x` 和 `y` 属性
- **AND** 航点数量和顺序与导入时一致

#### Scenario: 导出新增的边
- **GIVEN** 边数据不包含 `data.waypoints`（用户在编辑器中创建的新边）
- **WHEN** 导出为 BPMN XML
- **THEN** 生成的 `BPMNEdge` 包含两个计算出的航点
- **AND** 第一个航点位于源节点右边缘中心
- **AND** 第二个航点位于目标节点左边缘中心

#### Scenario: 航点坐标精度
- **GIVEN** 边的航点包含浮点数坐标（如 `x: 150.4333333333333`）
- **WHEN** 导出为 BPMN XML
- **THEN** 航点坐标保持原始精度或合理舍入
- **AND** 避免过度舍入导致的路径偏差

### Requirement: 往返测试验证

系统 SHALL 支持导入 → 导出 → 再导入的往返测试，确保布局信息不丢失。

#### Scenario: 简单流程往返测试
- **GIVEN** 一个包含开始事件、任务、结束事件的 BPMN 文件
- **WHEN** 执行导入 → 导出 → 再导入
- **THEN** 第二次导入的节点位置与第一次一致
- **AND** 第二次导入的边路径与第一次一致
- **AND** 生成的 BPMN XML 结构与原始文件等价

#### Scenario: 复杂边路径往返测试
- **GIVEN** 一个包含多段边路径（如 ExpenseProcess.bpmn20.xml 的驳回流）的 BPMN 文件
- **WHEN** 执行导入 → 导出 → 再导入
- **THEN** 多段边的所有航点被保留
- **AND** 边的路径形状在往返过程中保持不变

#### Scenario: 新增边的往返测试
- **GIVEN** 导入一个 BPMN 文件后，用户添加新的边
- **WHEN** 执行导出 → 再导入
- **THEN** 新增的边使用计算出的简单两点路径
- **AND** 原有边的航点路径不受影响

## MODIFIED Requirements

### Requirement: BPMN DI 布局信息提取

导入器 SHALL 从 BPMN DI 信息中提取节点位置和边路径信息，确保与 bpmn-js 视觉一致。

原始需求只覆盖节点位置，现在扩展到包含边的路径信息。

#### Scenario: 提取完整 DI 布局信息
- **GIVEN** BPMN XML 包含完整的 BPMN DI 信息（BPMNShape 和 BPMNEdge）
- **WHEN** 导入该文件
- **THEN** 节点的位置使用 `BPMNShape` 的 bounds 坐标
- **AND** 边的路径使用 `BPMNEdge` 的 waypoints 坐标
- **AND** 导入后的视觉布局与 bpmn-js 渲染一致
