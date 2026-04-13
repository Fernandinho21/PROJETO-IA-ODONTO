import React from 'react';

type Tab = 'chat' | 'quiz';

interface HeaderProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  return (
    <header className="header">
      <div className="logo">
        <span className="logo-icon">🦷</span>
        <h1>OdontoIA</h1>
      </div>
      <p>Seu assistente de estudos odontológicos</p>
      <nav className="nav">
        <button
          className={`nav-btn ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => onTabChange('chat')}
        >
          Chat IA
        </button>
        <button
          className={`nav-btn ${activeTab === 'quiz' ? 'active' : ''}`}
          onClick={() => onTabChange('quiz')}
        >
          Quiz
        </button>
      </nav>
    </header>
  );
};

export default Header;