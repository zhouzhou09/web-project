import React, { useState, useRef } from 'react'

// 使用 props 接收添加课程的处理函数
const CourseForm = ({ onAddCourse }) => {
  const nameInputRef = useRef(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('前端')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // 输入校验：课程名称不能为空
    if (!name.trim()) {
      setError('❌ 课程名称不能为空！')
      return
    }
    if (!description.trim()) {
      setError('❌ 课程简介不能为空！')
      return
    }

    // 数据传递：将表单数据传递给父组件
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
        <div className="form-group">
          <textarea
            placeholder="课程简介"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="form-input"
          />
        </div>
        <div className="form-group">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="form-input"
          >
            <option value="前端">前端开发</option>
            <option value="后端">后端开发</option>
            <option value="设计">UI 设计</option>
            <option value="数据">数据分析</option>
          </select>
        </div>
        {error && <div className="error-message">{error}</div>}
        <button type="submit" className="btn btn-add">添加课程</button>
      </form>
    </div>
  )
}

export default CourseForm
