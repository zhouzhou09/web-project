# React Hooks 扩展功能实现计划

**项目：** 课程管理系统 React Hooks 扩展  
**日期：** 2025-04-16  
**版本：** 1.0

---

## 概述

本实现计划基于 [`docs/react-hooks-extension-design.md`](react-hooks-extension-design.md:1) 中的设计文档，详细描述了为课程管理系统添加 React Hooks 功能的具体实现步骤。

---

## 实现步骤

### 步骤 1：创建自定义 Hook - useLocalStorage

**文件：** `src/hooks/useLocalStorage.js`

**任务：**
1. 创建 `src/hooks` 目录
2. 创建 `useLocalStorage.js` 文件
3. 实现 localStorage 读写逻辑
4. 添加错误处理

**代码实现：**
```javascript
import { useState, useEffect } from 'react'

function useLocalStorage(key, initialValue) {
  // 获取初始值
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  // 更新 localStorage
  const setValue = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      window.localStorage.setItem(key, JSON.stringify(valueToStore))
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }

  return [storedValue, setValue]
}

export default useLocalStorage
```

**验证：**
- [ ] Hook 正确导出
- [ ] localStorage 读写功能正常
- [ ] 错误处理正常工作

---

### 步骤 2：改造 App.jsx - 添加 useLocalStorage

**文件：** `src/App.jsx`

**任务：**
1. 导入 `useLocalStorage` Hook
2. 替换 `useState` 为 `useLocalStorage`
3. 保留初始课程数据

**代码修改：**
```javascript
// 添加导入
import useLocalStorage from './hooks/useLocalStorage'

// 替换状态管理
const [courses, setCourses] = useLocalStorage('courses', [
  { 
    id: 1, 
    name: 'React 基础', 
    description: '学习组件与 Hooks 核心概念', 
    category: '前端', 
    learnStatus: false 
  },
  { 
    id: 2, 
    name: 'Python 数据分析', 
    description: 'Pandas 与 NumPy 入门教程', 
    category: '数据', 
    learnStatus: true 
  },
  { 
    id: 3, 
    name: 'Java 后端开发', 
    description: 'Spring Boot 框架实战', 
    category: '后端', 
    learnStatus: false 
  },
])
```

**验证：**
- [ ] 页面刷新后课程数据保持不变
- [ ] localStorage 中正确存储课程数据

---

### 步骤 3：改造 App.jsx - 添加 useMemo

**文件：** `src/App.jsx`

**任务：**
1. 导入 `useMemo`
2. 使用 `useMemo` 包装过滤逻辑

**代码修改：**
```javascript
// 添加导入
import { useMemo } from 'react'

// 使用 useMemo 缓存过滤结果
const filteredCourses = useMemo(() => {
  return courses.filter((course) => {
    const matchesSearch = 
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      course.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = filterCategory === '全部' || course.category === filterCategory
    return matchesSearch && matchesCategory
  })
}, [courses, searchTerm, filterCategory])
```

**验证：**
- [ ] 搜索功能正常工作
- [ ] 过滤结果正确缓存

---

### 步骤 4：改造 App.jsx - 添加 useCallback

**文件：** `src/App.jsx`

**任务：**
1. 导入 `useCallback`
2. 使用 `useCallback` 包装所有事件处理函数
3. 添加编辑相关状态和处理函数

**代码修改：**
```javascript
// 添加导入
import { useCallback } from 'react'

// 添加编辑状态
const [editingCourse, setEditingCourse] = useState(null)

// 使用 useCallback 优化事件处理函数
const handleAddCourse = useCallback((newCourse) => {
  setCourses([...courses, newCourse])
}, [courses])

const handleDeleteCourse = useCallback((id) => {
  setCourses(courses.filter((c) => c.id !== id))
}, [courses])

const handleStudyCourse = useCallback((id) => {
  setCourses(courses.map((c) => 
    c.id === id ? { ...c, learnStatus: !c.learnStatus } : c
  ))
}, [courses])

const handleEditCourse = useCallback((updatedCourse) => {
  setCourses(courses.map((c) => 
    c.id === updatedCourse.id ? updatedCourse : c
  ))
}, [courses])

const handleOpenEdit = useCallback((course) => {
  setEditingCourse(course)
}, [])

const handleCloseEdit = useCallback(() => {
  setEditingCourse(null)
}, [])
```

**验证：**
- [ ] 所有事件处理函数正常工作
- [ ] 函数引用稳定，避免不必要的重渲染

---

### 步骤 5：改造 App.jsx - 添加编辑模态框

**文件：** `src/App.jsx`

**任务：**
1. 导入 `EditModal` 组件
2. 在 JSX 中添加编辑模态框
3. 传递必要的 props

**代码修改：**
```javascript
// 添加导入
import EditModal from './components/EditModal'

// 在 return 中添加编辑模态框
{editingCourse && (
  <EditModal
    course={editingCourse}
    onSave={handleEditCourse}
    onClose={handleCloseEdit}
  />
)}

// 更新 CourseList props
<CourseList
  courses={filteredCourses}
  onDelete={handleDeleteCourse}
  onStudy={handleStudyCourse}
  onEdit={handleOpenEdit}
/>
```

**验证：**
- [ ] 编辑模态框正确显示
- [ ] Props 正确传递

---

### 步骤 6：改造 CourseForm.jsx - 添加 useRef

**文件：** `src/components/CourseForm.jsx`

**任务：**
1. 导入 `useRef`
2. 创建 `nameInputRef`
3. 在提交成功后调用 `focus()`

**代码修改：**
```javascript
// 添加导入
import { useRef } from 'react'

const CourseForm = ({ onAddCourse }) => {
  const nameInputRef = useRef(null)
  // ... 其他代码

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // 输入校验
    if (!name.trim()) {
      setError('❌ 课程名称不能为空！')
      return
    }
    if (!description.trim()) {
      setError('❌ 课程简介不能为空！')
      return
    }

    // 添加课程
    onAddCourse({
      id: Date.now(),
      name,
      description,
      category,
      learnStatus: false
    })

    // 重置表单
    setName('')
    setDescription('')
    setCategory('前端')
    setError('')

    // 聚焦到名称输入框
    nameInputRef.current?.focus()
  }

  return (
    // ... JSX
    <input
      ref={nameInputRef}
      type="text"
      placeholder="课程名称 (例如：React 入门)"
      value={name}
      onChange={(e) => setName(e.target.value)}
      className="form-input"
    />
    // ... 其他 JSX
  )
}
```

**验证：**
- [ ] 添加课程后输入框自动聚焦
- [ ] ref 正确绑定到输入框

---

### 步骤 7：创建 EditModal.jsx 组件

**文件：** `src/components/EditModal.jsx`

**任务：**
1. 创建新组件文件
2. 实现表单状态管理
3. 使用 `useEffect` 同步课程数据
4. 实现保存和取消逻辑
5. 添加 PropTypes

**代码实现：**
```javascript
import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'

const EditModal = ({ course, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '前端'
  })
  const [error, setError] = useState('')

  // 同步课程数据到表单
  useEffect(() => {
    if (course) {
      setFormData({
        name: course.name,
        description: course.description,
        category: course.category
      })
    }
  }, [course])

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // 输入校验
    if (!formData.name.trim()) {
      setError('❌ 课程名称不能为空！')
      return
    }
    if (!formData.description.trim()) {
      setError('❌ 课程简介不能为空！')
      return
    }

    // 保存更新
    onSave({
      ...course,
      name: formData.name,
      description: formData.description,
      category: formData.category
    })
    
    onClose()
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <h2>✏️ 编辑课程</h2>
        <form onSubmit={handleSubmit} className="course-form">
          <div className="form-group">
            <input
              type="text"
              name="name"
              placeholder="课程名称"
              value={formData.name}
              onChange={handleChange}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <textarea
              name="description"
              placeholder="课程简介"
              value={formData.description}
              onChange={handleChange}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="form-input"
            >
              <option value="前端">前端开发</option>
              <option value="后端">后端开发</option>
              <option value="设计">UI 设计</option>
              <option value="数据">数据分析</option>
            </select>
          </div>
          {error && <div className="error-message">{error}</div>}
          <div className="modal-actions">
            <button type="button" className="btn btn-cancel" onClick={onClose}>
              取消
            </button>
            <button type="submit" className="btn btn-save">
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

EditModal.propTypes = {
  course: PropTypes.object.isRequired,
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
}

export default EditModal
```

**验证：**
- [ ] 模态框正确显示
- [ ] 表单数据正确同步
- [ ] 保存功能正常工作
- [ ] 取消功能正常工作

---

### 步骤 8：改造 CourseCard.jsx - 添加编辑按钮

**文件：** `src/components/CourseCard.jsx`

**任务：**
1. 添加 `onEdit` prop
2. 添加编辑按钮
3. 更新 PropTypes

**代码修改：**
```javascript
const CourseCard = ({ course, onDelete, onStudy, onEdit }) => {
  return (
    <div className="course-card">
      <div className="card-header">
        <span className={`category-tag tag-${course.category}`}>
          {course.category}
        </span>
        <div className="card-actions">
          <button 
            className="btn-edit" 
            onClick={() => onEdit(course)}
            title="编辑课程"
          >
            ✏️
          </button>
          <button 
            className="btn-delete" 
            onClick={() => onDelete(course.id)}
            title="删除课程"
          >
            🗑️
          </button>
        </div>
      </div>
      <h3 className="card-title">{course.name}</h3>
      <p className="card-desc">{course.description}</p>
      <div className="card-footer">
        <button
          className={`btn btn-study ${course.learnStatus ? 'studied' : ''}`}
          onClick={() => onStudy(course.id)}
        >
          {course.learnStatus ? '✅ 已学习' : '📖 开始学习'}
        </button>
      </div>
    </div>
  )
}

CourseCard.propTypes = {
  course: PropTypes.object.isRequired,
  onDelete: PropTypes.func.isRequired,
  onStudy: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired
}
```

**验证：**
- [ ] 编辑按钮正确显示
- [ ] 点击编辑按钮打开模态框

---

### 步骤 9：更新 App.css - 添加模态框样式

**文件：** `src/App.css`

**任务：**
1. 添加模态框遮罩样式
2. 添加模态框容器样式
3. 添加编辑按钮样式
4. 添加动画效果

**代码添加：**
```css
/* 模态框遮罩 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* 模态框容器 */
.modal-container {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from { 
    opacity: 0;
    transform: translateY(20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

/* 模态框标题 */
.modal-container h2 {
  margin: 0 0 1.5rem 0;
  color: #333;
}

/* 模态框操作按钮 */
.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

/* 编辑按钮样式 */
.btn-edit {
  background: #4a90e2;
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  margin-right: 0.5rem;
  transition: background 0.2s;
}

.btn-edit:hover {
  background: #357abd;
}

/* 取消按钮 */
.btn-cancel {
  background: #95a5a6;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  flex: 1;
  transition: background 0.2s;
}

.btn-cancel:hover {
  background: #7f8c8d;
}

/* 保存按钮 */
.btn-save {
  background: #27ae60;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  flex: 1;
  transition: background 0.2s;
}

.btn-save:hover {
  background: #229954;
}

/* 卡片操作按钮容器 */
.card-actions {
  display: flex;
  gap: 0.5rem;
}
```

**验证：**
- [ ] 模态框样式正确显示
- [ ] 动画效果正常
- [ ] 按钮样式正确

---

## 测试清单

### 功能测试

- [ ] 页面刷新后课程数据保持不变（localStorage）
- [ ] 添加课程后输入框自动聚焦
- [ ] 搜索功能实时响应
- [ ] 搜索结果正确缓存（useMemo）
- [ ] 编辑功能正常工作
- [ ] 删除功能正常工作
- [ ] 学习状态切换正常
- [ ] 课程数量统计正确显示

### 性能测试

- [ ] 搜索输入时不会频繁重新渲染子组件（useCallback）
- [ ] 过滤后的列表只在依赖项变化时重新计算（useMemo）

### 边界情况测试

- [ ] localStorage 为空时使用默认值
- [ ] localStorage 数据损坏时使用默认值
- [ ] 编辑空课程时正确处理
- [ ] 搜索无结果时显示空状态

---

## 完成标准

所有以下条件满足时，实现完成：

1. ✅ 所有代码实现完成
2. ✅ 所有功能测试通过
3. ✅ 所有性能测试通过
4. ✅ 代码符合 React 最佳实践
5. ✅ 组件职责清晰，易于维护

---

## 注意事项

1. **localStorage 限制**：localStorage 有大小限制（通常 5MB），不适合存储大量数据
2. **错误处理**：localStorage 操作可能失败（如隐私模式），需要做好错误处理
3. **useRef 使用**：ref 只在组件挂载后才有值，首次渲染时为 null
4. **useMemo 依赖**：确保依赖数组正确，避免缓存失效或过度缓存
5. **useCallback 依赖**：确保依赖数组正确，避免闭包陷阱
6. **PropTypes**：确保所有组件都正确声明 PropTypes
