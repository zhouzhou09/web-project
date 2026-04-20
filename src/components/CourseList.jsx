import React from 'react'
import CourseCard from './CourseCard'

// 使用 props 接收课程列表和操作函数
// 使用 map 进行列表渲染
const CourseList = ({ courses, onDelete, onStudy, onEdit }) => {
  if (courses.length === 0) {
    return <div className="empty-list">暂无课程，请添加新课程 🌱</div>
  }

  return (
    <div className="course-list">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          onDelete={onDelete}
          onStudy={onStudy}
          onEdit={onEdit}
        />
      ))}
    </div>
  )
}

export default CourseList
