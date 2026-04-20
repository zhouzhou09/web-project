import React from 'react'

// 使用 props 接收课程数量
const Header = ({ count }) => {
  return (
    <header className="app-header">
      <div className="header-content">
        <h1>🎓 在线课程管理平台</h1>
        <div className="stats-box">
          <span>当前课程总数：</span>
          <span className="count-number">{count}</span>
        </div>
      </div>
    </header>
  )
}

export default Header
