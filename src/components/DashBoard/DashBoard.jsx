import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, Wallet, Users, LogOut } from "lucide-react";
import { logout } from "../../store/authSlice";
import apiSlice from "../../store/apiSlice";
import Logo from "../Logo";
import Avatar from "../Avatar";
import Modal from "../Modal";
import Button from "../Button";
import { useState } from "react";

const NAV_ITEMS = [
  { id: "overview", path: "/", label: "Overview", icon: LayoutDashboard },
  { id: "individual", path: "/expenses", label: "My Expenses", icon: Wallet },
  { id: "groups", path: "/groups", label: "Groups", icon: Users },
];

function DashBoard() {
  const currentUser = useSelector((state) => state.auth.userData);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const getActiveNav = () => {
    if (location.pathname.startsWith("/groups")) return "groups";
    if (location.pathname.startsWith("/expenses")) return "individual";
    return "overview";
  };

  const activeNavPage = getActiveNav();

  const handleNavChange = (item) => {
    navigate(item.path);
  };

  const onLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    dispatch(logout());
    dispatch(apiSlice.util.resetApiState());
    navigate("/login");
  };

  const userName = currentUser?.name || "User";
  const userEmail = currentUser?.email || "";

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar — desktop only */}
      <aside className="hidden lg:flex flex-col w-64 bg-card border-r border-border shrink-0">
        {/* Brand */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
          <Logo />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1" id="sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeNavPage === item.id;
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => handleNavChange(item)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                  isActive
                    ? "bg-secondary text-primary font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User profile */}
        <div className="px-3 py-4 border-t border-border space-y-1">
          <div className="flex items-center gap-3 px-4 py-3">
            <Avatar name={userName} />
            <div className="flex-1 min-w-0">
              <p className="text-foreground truncate font-medium text-sm">
                {userName}
              </p>
              <p className="text-muted-foreground truncate text-xs">
                {userEmail}
              </p>
            </div>
          </div>
          <button
            onClick={onLogout}
            id="sidebar-logout-btn"
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20 lg:pb-0 hide-scrollbar">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between px-5 py-4 bg-card border-b border-border sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <Logo />
          </div>
          <Avatar name={userName} size="sm" />
        </div>

        {/* Page content rendered by React Router */}
        <Outlet />
      </main>

      {/* Bottom nav — mobile only */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border flex z-30"
        id="mobile-nav"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeNavPage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavChange(item)}
              className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span
                className={`text-[0.65rem] ${isActive ? "font-semibold" : ""}`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
        <button
          onClick={onLogout}
          className="flex-1 flex flex-col items-center gap-1 py-3 text-muted-foreground transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[0.65rem]">Sign Out</span>
        </button>
      </nav>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <Modal title="Sign Out" onClose={() => setShowLogoutConfirm(false)}>
          <div className="p-6">
            <p className="text-foreground mb-6">
              Are you sure you want to sign out?
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="secondary"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </Button>
              <Button variant="danger" onClick={confirmLogout}>
                Sign Out
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default DashBoard;
