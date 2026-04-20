import React, { useState, useEffect } from 'react'

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

export default EditModal
