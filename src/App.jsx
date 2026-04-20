import React, { useState, useMemo, useCallback } from 'react'
import Header from './components/Header'
import CourseForm from './components/CourseForm'
import CourseList from './components/CourseList'
import Footer from './components/Footer'
import EditModal from './components/EditModal'
import useLocalStorage from './hooks/useLocalStorage'
import './App.css'

function App() {
  // 状态管理：课程列表（使用 useLocalStorage 持久化）
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

  // 状态管理：搜索关键词
  const [searchTerm, setSearchTerm] = useState('')
  
  // 状态管理：筛选分类
  const [filterCategory, setFilterCategory] = useState('全部')

  // 状态管理：编辑课程
  const [editingCourse, setEditingCourse] = useState(null)

  // 事件处理：添加课程（使用 useCallback 优化）
  const handleAddCourse = useCallback((newCourse) => {
    setCourses([...courses, newCourse])
  }, [courses])

  // 事件处理：删除课程（使用 useCallback 优化）
  const handleDeleteCourse = useCallback((id) => {
    setCourses(courses.filter((c) => c.id !== id))
  }, [courses])

  // 事件处理：学习按钮交互（使用 useCallback 优化）
  const handleStudyCourse = useCallback((id) => {
    setCourses(courses.map((c) =>
      c.id === id ? { ...c, learnStatus: !c.learnStatus } : c
    ))
  }, [courses])

  // 事件处理：编辑课程（使用 useCallback 优化）
  const handleEditCourse = useCallback((updatedCourse) => {
    setCourses(courses.map((c) =>
      c.id === updatedCourse.id ? updatedCourse : c
    ))
  }, [courses])

  // 事件处理：打开编辑模态框（使用 useCallback 优化）
  const handleOpenEdit = useCallback((course) => {
    setEditingCourse(course)
  }, [])

  // 事件处理：关闭编辑模态框（使用 useCallback 优化）
  const handleCloseEdit = useCallback(() => {
    setEditingCourse(null)
  }, [])

  // 逻辑处理：筛选与搜索（使用 useMemo 缓存结果）
  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchesSearch =
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = filterCategory === '全部' || course.category === filterCategory
      return matchesSearch && matchesCategory
    })
  }, [courses, searchTerm, filterCategory])

  return (
    <div className="app-container">
      {/* 1. 页面标题区域 (包含统计) */}
      <Header count={courses.length} />

      <div className="main-wrapper">
        {/* 2. 课程输入区域 */}
        <CourseForm onAddCourse={handleAddCourse} />

        {/* 筛选与搜索栏 */}
        <div className="filter-bar">
          <input
            type="text"
            placeholder="🔍 搜索课程名称或简介..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="filter-select"
          >
            <option value="全部">全部分类</option>
            <option value="前端">前端开发</option>
            <option value="后端">后端开发</option>
            <option value="设计">UI 设计</option>
            <option value="数据">数据分析</option>
          </select>
        </div>

        {/* 3. 课程列表展示区域 */}
        <CourseList
          courses={filteredCourses}
          onDelete={handleDeleteCourse}
          onStudy={handleStudyCourse}
          onEdit={handleOpenEdit}
        />
      </div>

      {/* 编辑模态框 */}
      {editingCourse && (
        <EditModal
          course={editingCourse}
          onSave={handleEditCourse}
          onClose={handleCloseEdit}
        />
      )}

      {/* 4. 页面底部说明区域 */}
      <Footer />
    </div>
  )
}

export default App
