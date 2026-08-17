import { Link, useNavigate } from "react-router-dom";
import { FiLogOut, FiBarChart2, FiHome } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-10">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-sm font-bold text-white">
            P
          </div>
          <span className="text-lg font-bold text-slate-900">PrepPilot AI</span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          <Link
            to="/dashboard"
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            <FiHome size={15} /> Dashboard
          </Link>
          <Link
            to="/analytics"
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            <FiBarChart2 size={15} /> Analytics
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-2 sm:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
              {user?.avatarInitials || "U"}
            </div>
            <span className="text-sm font-medium text-slate-700">{user?.name}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
          >
            <FiLogOut size={15} /> Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
