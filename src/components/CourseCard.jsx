import React from 'react'

// 使用 props 接收课程数据和操作函数
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

export default CourseCard
