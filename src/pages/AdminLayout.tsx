import { Link, Outlet } from "react-router-dom";
import { Home, Library, Book as BookIcon, Users, BookOpen } from "lucide-react";

export default function AdminLayout() {
  return (
    <div className="flex h-screen bg-background text-foreground">
      <aside className="w-64 flex flex-col border-r bg-card">
        <div className="p-4 flex items-center gap-2 border-b">
          <Library className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-bold">Admin</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/admin" className="flex items-center gap-2 p-2 rounded-md hover:bg-muted">
            <BookIcon className="h-5 w-5" />
            <span>Books Management</span>
          </Link>
          <Link to="/admin/analytics" className="flex items-center gap-2 p-2 rounded-md hover:bg-muted">
            <Users className="h-5 w-5" />
            <span>Analytics</span>
          </Link>
          <Link to="/admin/logs" className="flex items-center gap-2 p-2 rounded-md hover:bg-muted">
            <BookOpen className="h-5 w-5" />
            <span>Logs</span>
          </Link>
        </nav>
        <div className="p-4 border-t">
          <Link to="/" className="flex items-center gap-2 p-2 rounded-md hover:bg-muted">
            <Home className="h-5 w-5" />
            <span>Back to Library</span>
          </Link>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
