import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  
  return (
    <nav className="fixed left-0 top-0 h-screen w-64 bg-[#2C3639] text-white shadow-xl z-50">
      <div className="flex flex-col h-full">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-2xl font-bold text-[#DCD7C9]">Coffee Hub</h1>
        </div>
        <div className="p-4 flex-1 overflow-y-auto">
          {[
            { path: '/', label: 'Menu', icon: '☕' },
            { path: '/statistics', label: 'Analytics', icon: '📊' },
            { path: '/settings', label: 'Settings', icon: '⚙️' },
          ].map(({ path, label, icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center px-4 py-3 rounded-lg mb-2 transition-all duration-200 ${
                location.pathname === path
                  ? 'bg-[#A27B5C] text-white'
                  : 'text-gray-300 hover:bg-[#3F4E4F] hover:text-white'
              }`}
            >
              <span className="mr-3 text-xl">{icon}</span>
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Sidebar;