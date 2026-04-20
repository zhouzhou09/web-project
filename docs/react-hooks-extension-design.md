# React Hooks 扩展功能设计文档

**项目：** 课程管理系统 React Hooks 扩展  
**日期：** 2025-04-16  
**版本：** 1.0

---

## 1. 概述

本文档描述了在现有课程管理系统基础上，通过添加 React Hooks 功能来增强系统的设计方案。目标是展示各种 React Hooks 的实际应用场景，包括 `useEffect`、`useRef`、`useMemo`、`useCallback` 和自定义 Hook。

### 1.1 目标

- 使用 `useEffect` 将课程数据保存到 localStorage
- 使用 `useEffect` 在页面首次加载时读取本地课程数据
- 使用 `useRef` 实现添加课程后输入框自动聚焦
- 使用 `useMemo` 对搜索后的课程列表结果进行缓存
- 使用 `useCallback` 优化学习、删除等事件处理函数
- 封装自定义 Hook `useLocalStorage`
- 增加课程搜索功能（实时响应）
- 增加课程数量统计功能
- 实现编辑课程功能（模态框方式）

### 1.2 技术要求

- React 函数组件
- JSX
- useState
- useEffect
- props
- 事件绑定
- map 列表渲染
- CSS 基础样式
- useRef（建议使用）
- useMemo（建议使用）
- useCallback（建议使用）
- localStorage（建议使用）
- 条件渲染
- 受控组件
- 组件拆分
- 合理命名与目录整理

---

## 2. 架构设计

### 2.1 整体架构

采用渐进式增强的方式，在现有代码基础上添加 Hooks 功能，保持代码结构清晰。

### 2.2 组件结构

```
src/
├── App.jsx                    # 主应用组件（添加 useEffect, useMemo, useCallback）
├── hooks/
│   └── useLocalStorage.js     # 自定义 Hook：localStorage 持久化
├── components/
│   ├── Header.jsx             # 页面头部（已有，保持不变）
│   ├── Footer.jsx             # 页面底部（已有，保持不变）
│   ├── CourseForm.jsx         # 课程表单（添加 useRef 自动聚焦）
│   ├── CourseList.jsx         # 课程列表（已有，保持不变）
│   ├── CourseCard.jsx         # 课程卡片（添加编辑按钮）
│   └── EditModal.jsx          # 编辑模态框（新增）
└── App.css                    # 样式文件（添加模态框样式）
```

### 2.3 数据流

```
localStorage ←→ useLocalStorage ←→ App.jsx (courses state)
                                    ↓
                              CourseForm.jsx (添加课程)
                              CourseList.jsx (显示列表)
                              EditModal.jsx (编辑课程)
```

### 2.4 核心功能分配

| 功能 | 实现位置 | 使用的 Hook |
|------|---------|------------|
| 课程数据持久化 | `App.jsx` + `useLocalStorage.js` | `useEffect`, 自定义 `useLocalStorage` |
| 搜索结果缓存 | `App.jsx` | `useMemo` |
| 事件函数优化 | `App.jsx` | `useCallback` |
| 输入框自动聚焦 | `CourseForm.jsx` | `useRef` |
| 编辑课程 | `EditModal.jsx` | `useState`, `useEffect` |

---

## 3. 自定义 Hook 设计

### 3.1 useLocalStorage Hook

**文件：** `src/hooks/useLocalStorage.js`

**功能：** 封装 localStorage 的读写操作，提供类似 useState 的 API

**接口：**
```javascript
useLocalStorage(key, initialValue)
// 返回: [value, setValue]
```

**实现要点：**
- 初始化时从 localStorage 读取数据
- 数据变化时自动保存到 localStorage
- 处理 JSON 解析错误（返回初始值）
- 支持函数式更新（类似 useState）

**使用示例：**
```javascript
const [courses, setCourses] = useLocalStorage('courses', initialCourses)
```

**实现代码：**
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

---

## 4. App.jsx 改造

### 4.1 状态管理

使用 `useLocalStorage` 替换原有的 `useState`：

```javascript
// 原有代码
const [courses, setCourses] = useState([...])

// 改造后
import useLocalStorage from './hooks/useLocalStorage'

const [courses, setCourses] = useLocalStorage('courses', [
  { 
    id: 1, 
    name: 'React 基础', 
    description: '学习组件与 Hooks 核心概念', 
    category: '前端', 
    learnStatus: false 
  },
  // ... 其他初始课程
])
```

### 4.2 useMemo - 搜索结果缓存

```javascript
import { useMemo } from 'react'

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

### 4.3 useCallback - 事件处理函数优化

```javascript
import { useCallback } from 'react'

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
```

### 4.4 编辑模态框状态

```javascript
const [editingCourse, setEditingCourse] = useState(null)

// 打开编辑模态框
const handleOpenEdit = useCallback((course) => {
  setEditingCourse(course)
}, [])

// 关闭编辑模态框
const handleCloseEdit = useCallback(() => {
  setEditingCourse(null)
}, [])
```

### 4.5 传递编辑相关 props

```javascript
<CourseList
  courses={filteredCourses}
  onDelete={handleDeleteCourse}
  onStudy={handleStudyCourse}
  onEdit={handleOpenEdit}
/>

{/* 编辑模态框 */}
{editingCourse && (
  <EditModal
    course={editingCourse}
    onSave={handleEditCourse}
    onClose={handleCloseEdit}
  />
)}
```

---

## 5. CourseForm.jsx 改造

### 5.1 useRef - 输入框自动聚焦

```javascript
import { useRef } from 'react'

const CourseForm = ({ onAddCourse }) => {
  const nameInputRef = useRef(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('前端')
  const [error, setError] = useState('')

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
    <div className="course-form-container">
      <h2>➕ 新增课程</h2>
      <form onSubmit={handleSubmit} className="course-form">
        <div className="form-group">
          <input
            ref={nameInputRef}
            type="text"
            placeholder="课程名称 (例如：React 入门)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-input"
          />
        </div>
        {/* ... 其他表单字段 */}
      </form>
    </div>
  )
}
```

---

## 6. EditModal.jsx 新组件

### 6.1 组件功能

- 显示编辑表单的模态框
- 预填充当前课程数据
- 支持修改课程名称、简介、分类
- 保存或取消操作

### 6.2 Props 接口

```javascript
EditModal.propTypes = {
  course: PropTypes.object,      // 当前编辑的课程对象
  onSave: PropTypes.func,        // 保存回调函数
  onClose: PropTypes.func         // 关闭回调函数
}
```

### 6.3 完整实现

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

---

## 7. CourseCard.jsx 改造

### 7.1 添加编辑按钮

在卡片头部添加编辑按钮：

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

---

## 8. 样式更新

### 8.1 模态框样式（App.css）

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

---

## 9. 实现步骤

### 9.1 创建自定义 Hook

1. 创建 `src/hooks/useLocalStorage.js`
2. 实现 localStorage 读写逻辑
3. 添加错误处理

### 9.2 改造 App.jsx

1. 导入 `useLocalStorage`、`useMemo`、`useCallback`
2. 替换 `useState` 为 `useLocalStorage`
3. 使用 `useMemo` 包装过滤逻辑
4. 使用 `useCallback` 包装事件处理函数
5. 添加编辑相关状态和处理函数

### 9.3 改造 CourseForm.jsx

1. 导入 `useRef`
2. 创建 `nameInputRef`
3. 在提交成功后调用 `focus()`

### 9.4 创建 EditModal.jsx

1. 创建新组件文件
2. 实现表单状态管理
3. 使用 `useEffect` 同步课程数据
4. 实现保存和取消逻辑

### 9.5 改造 CourseCard.jsx

1. 添加 `onEdit` prop
2. 添加编辑按钮
3. 更新 PropTypes

### 9.6 更新样式

1. 添加模态框相关样式
2. 添加编辑按钮样式
3. 添加动画效果

---

## 10. 测试要点

### 10.1 功能测试

- [ ] 页面刷新后课程数据保持不变（localStorage）
- [ ] 添加课程后输入框自动聚焦
- [ ] 搜索功能实时响应
- [ ] 搜索结果正确缓存（useMemo）
- [ ] 编辑功能正常工作
- [ ] 删除功能正常工作
- [ ] 学习状态切换正常

### 10.2 性能测试

- [ ] 搜索输入时不会频繁重新渲染子组件（useCallback）
- [ ] 过滤后的列表只在依赖项变化时重新计算（useMemo）

---

## 11. 注意事项

1. **localStorage 限制**：localStorage 有大小限制（通常 5MB），不适合存储大量数据
2. **错误处理**：localStorage 操作可能失败（如隐私模式），需要做好错误处理
3. **useRef 使用**：ref 只在组件挂载后才有值，首次渲染时为 null
4. **useMemo 依赖**：确保依赖数组正确，避免缓存失效或过度缓存
5. **useCallback 依赖**：确保依赖数组正确，避免闭包陷阱

---

## 12. 总结

本设计方案通过渐进式增强的方式，在现有课程管理系统基础上添加了多种 React Hooks 功能。每个功能都有明确的实现位置和代码示例，便于理解和实现。设计遵循 React 最佳实践，代码结构清晰，易于维护和扩展。
