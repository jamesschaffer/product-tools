import { NavLink } from 'react-router-dom';

const views = [
  { path: '/edit', label: 'Edit' },
  { path: '/gantt', label: 'Gantt' },
  { path: '/slide', label: 'Slide' },
];

export function ViewSwitcher() {
  return (
    <nav className="flex gap-1 rounded-lg bg-gray-100 p-1">
      {views.map((view) => (
        <NavLink
          key={view.path}
          to={view.path}
          className={({ isActive }) =>
            `px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`
          }
        >
          {view.label}
        </NavLink>
      ))}
    </nav>
  );
}
