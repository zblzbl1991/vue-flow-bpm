# Implementation Tasks: test-bpmn20-files-comprehensive

## Phase 1: 测试基础设施 (Foundation)

### Task 1.1: 创建测试文件结构 ✅
- [x] 在 `tests/fixtures/bpmn20/` 下创建子目录，为每个 `.bpmn20.xml` 文件建立对应的测试目录
- [x] 复制 7 个 `.bpmn20.xml` 文件到对应的测试目录
- [x] 为每个文件创建对应的 `.json` 期望输出（初始版本可能为空或手动生成）

### Task 1.2: 设置视觉回归测试环境
- [ ] 评估并选择视觉回归测试工具（Playwright vs 其他）
- [ ] 安装必要的依赖
- [ ] 创建基础的截图对比辅助函数
- [ ] 配置测试运行时环境（需要支持浏览器/图形环境）

### Task 1.3: 创建测试辅助工具 ✅
- [x] 创建 `tests/helpers/bpmn20-test-helpers.ts`，包含：
  - `loadBpmn20File(filename)` - 加载指定的 BPMN 2.0 文件
  - `importBpmn20(xml)` - 执行导入和转换
  - `exportBpmn20(workflow)` - 执行导出
  - `testBpmn20Roundtrip(filename)` - 往返转换测试
  - `validateBpmn20File(filename)` - 文件验证
  - `testWithPerformance(filename)` - 性能测试

---

## Phase 2: 核心测试用例实现 (Core Test Implementation)

### Task 2.1: 实现基础导入测试 ✅
- [x] 为每个 `.bpmn20.xml` 文件创建导入测试
- [x] 验证 XML 能被正确解析
- [x] 验证生成的节点和边数量正确
- [x] 验证流程属性（id、name、executable 等）正确导入

### Task 2.2: 实现基础导出测试 ✅
- [x] 为每个 `.bpmn20.xml` 文件创建导出测试
- [x] 导入 XML → 转换为 JSON → 导出为 XML
- [x] 验证导出的 XML 符合 BPMN 2.0 规范
- [x] 验证关键元素和属性保持不变

### Task 2.3: 实现往返转换测试 ✅
- [x] 为每个文件实现往返转换测试（XML → JSON → XML）
- [x] 验证节点类型和连接关系保持一致
- [x] 验证关键属性（label、条件、assignee 等）保持不变
- [x] 记录允许的差异（如自动生成的 ID）

### Task 2.4: 实现渲染对比测试
- [ ] 为每个文件创建 vue-flow 和 bpmn-js 的并排渲染测试
- [ ] 验证两者渲染的流程图在功能上等价
- [ ] 检测明显的布局差异（位置、大小）
- [ ] 生成对比报告

---

## Phase 3: 特定场景测试 (Specific Scenario Tests)

### Task 3.1: 子流程测试 (collapsed-subprocess.bpmn20.xml) ✅
- [x] 验证折叠子流程的正确显示
- [x] 验证子流程内部的节点和边
- [x] 验证文本注释和关联的导入导出
- [x] 验证多层嵌套的子流程

### Task 3.2: 扩展元素测试 (extensions.bpmn20.xml) ✅
- [x] 验证 Flowable 命名空间的正确处理
- [x] 验证自定义命名空间（`custom:`）的导入导出
- [x] 验证扩展元素的嵌套结构
- [x] 验证 `extensionElements` 的完整性

### Task 3.3: 脚本监听器测试 (eventlistenerscript.bpmn20.xml) ✅
- [x] 验证 taskListener 的导入导出
- [x] 验证 script 语言和内容的正确性
- [x] 验证 field 元素的映射
- [x] 验证 executionListener 的处理

### Task 3.4: 补偿关联测试 (ProcessWithCompensationAssociation.bpmn20.xml)
- [ ] 验证补偿事件的正确处理
- [ ] 验证关联方向和引用
- [ ] 验证补偿关系的功能等价性

### Task 3.5: 重试配置测试 (servicetaskfailedjobretrytimecyclemodel.bpmn20.xml)
- [ ] 验证失败重试配置的导入导出
- [ ] 验证时间周期表达式的正确性
- [ ] 验证扩展属性的完整性

### Task 3.6: 其他扩展场景测试
- [ ] 测试 eventlistenersmodel.bpmn20.xml（事件监听器模型）
- [ ] 测试 extensionsXmlLocation.bpmn20.xml（扩展 XML 位置）

---

## Phase 4: 视觉回归测试 (Visual Regression Tests)

### Task 4.1: 建立基准截图
- [ ] 使用 bpmn-js 为每个文件生成基准截图
- [ ] 使用 vue-flow 为每个文件生成基准截图
- [ ] 保存基准截图到 `tests/screenshots/baseline/`

### Task 4.2: 实现自动截图对比
- [ ] 在测试运行时自动生成当前截图
- [ ] 与基准截图进行像素级对比
- [ ] 生成差异高亮图像
- [ ] 配置合理的容差阈值（允许微小的渲染差异）

### Task 4.3: 集成到 CI/CD
- [ ] 配置 CI 环境支持视觉测试（可能需要 Docker 容器）
- [ ] 设置基准截图的存储和版本控制
- [ ] 提供更新基准截图的流程（当变更合理时）

---

## Phase 5: 测试报告和文档 (Reporting and Documentation)

### Task 5.1: 生成测试覆盖率报告
- [ ] 集成 Vitest 的覆盖率工具
- [ ] 生成 HTML 格式的覆盖率报告
- [ ] 确保关键转换逻辑的覆盖率 > 80%

### Task 5.2: 创建测试结果仪表板
- [ ] 创建测试结果汇总页面
- [ ] 显示每个文件的测试状态（通过/失败/pending）
- [ ] 显示转换统计信息（节点数、边数、转换时间）
- [ ] 提供失败测试的详细日志链接

### Task 5.3: 记录已知限制和问题 ✅
- [x] 创建 `tests/known-limitations.md` 文档
- [x] 记录每个测试文件的已知问题
- [x] 标记 pending 的测试及其原因
- [x] 提供问题追踪链接（如有）

---

## Phase 6: 性能测试 (Performance Tests)

### Task 6.1: 建立性能基准
- [ ] 为每个文件测量导入时间
- [ ] 为每个文件测量导出时间
- [ ] 为每个文件测量渲染时间（vue-flow 和 bpmn-js）
- [ ] 记录基准数据到 `tests/benchmarks.json`

### Task 6.2: 实现性能回归检测
- [ ] 创建性能测试套件，标记为 `@slow`
- [ ] 配置性能阈值（如超过基准 20% 则警告）
- [ ] 在 CI 中可选运行性能测试

---

## Task Dependencies

```
Phase 1 (Foundation)
  ↓
Phase 2 (Core Tests) ← Phase 3 (Specific Tests) [可并行]
  ↓
Phase 4 (Visual Tests)
  ↓
Phase 5 (Reporting)
  ↓
Phase 6 (Performance) [可独立进行]
```

**并行化机会**:
- Phase 2 和 Phase 3 可以部分并行（不同的文件可独立开发测试）
- Phase 6 可以与 Phase 2-5 并行开发
- 不同文件的测试用例可以由不同的开发者并行实现

## Estimated Task Order (按优先级排序)

1. **必须先完成** (P0):
   - Task 1.1, 1.3 (测试基础设施)
   - Task 2.1, 2.2, 2.3 (核心测试)

2. **高优先级** (P1):
   - Task 3.1, 3.2, 3.3 (主要场景测试)
   - Task 5.3 (记录已知限制)

3. **中优先级** (P2):
   - Task 3.4, 3.5, 3.6 (其他场景)
   - Task 4.1, 4.2 (视觉测试)
   - Task 5.1, 5.2 (测试报告)

4. **低优先级** (P3):
   - Task 1.2, 4.3 (CI 集成)
   - Task 6.1, 6.2 (性能测试)

## Definition of Done

每个测试文件被视为"完成"当：
- [ ] 所有 P0 和 P1 测试通过
- [ ] P2 测试至少有初步实现（可以标记为 pending）
- [ ] 测试失败时有清晰的错误消息
- [ ] 测试可以在本地和 CI 中稳定运行
- [ ] 相关文档已更新

整个变更被视为"完成"当：
- [ ] 所有 7 个文件都达到"完成"状态
- [ ] 测试覆盖率报告生成
- [ ] 已知限制文档完整
- [ ] 至少一次完整的测试套件运行通过
