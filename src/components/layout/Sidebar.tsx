import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  ArrowDownCircle,
  ArrowUpCircle,
  PiggyBank,
  Building2,
  Users,
  Settings,
  LogOut,
} from "lucide-react";
import logo from '/assets/images/logo/urfinance.png'
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/user/useAuth";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: ArrowDownCircle, label: "Entradas", path: "/entradas" },
  { icon: ArrowUpCircle, label: "Saídas", path: "/saidas" },
  { icon: PiggyBank, label: "Poupança", path: "/poupancas" },
  { icon: Building2, label: "Financiamentos", path: "/financiamentos" },
  { icon: Users, label: "Espaços", path: "/espacos" },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleSignOut = async () => {
    await logout();
    navigate("/login");
  };
  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-sidebar-border bg-sidebar">
      <div className="flex h-full flex-col">
        <div className="flex h-20 items-center gap-1 border-b border-sidebar-border px-6">
            <img alt="Urfinance logo" src={logo} className="h-20" />
          <div>
            <h1 className="font-display text-xl font-bold text-sidebar-foreground">Urfinance</h1>
            <p className="text-[0.635rem] text-muted-foreground">Gerenciador de Finanças</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Menu Principal
          </p>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-sidebar-accent text-sidebar-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-primary"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive && "text-sidebar-primary")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <Link
            to="/configuracoes"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-all duration-200 hover:bg-sidebar-accent/50 hover:text-sidebar-primary"
          >
            <Settings className="h-5 w-5" />
            Configurações
          </Link>
          <button
            onClick={handleSignOut}
            className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-200 hover:bg-destructive/10 hover:text-destructive"
          >
            <LogOut className="h-5 w-5" />
            Sair
          </button>
        </div>
      </div>
    </aside>
  );
}
