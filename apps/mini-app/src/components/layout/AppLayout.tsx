import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export function AppLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-tg-secondary-bg">
      <main className="flex-1 pb-20 page-transition">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
