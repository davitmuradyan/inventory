import { Link, useLocation } from "react-router-dom";

interface LayoutProps {
  children: React.ReactNode;
}

const navLinkClass = (active: boolean) =>
  `text-sm font-medium ${active ? "text-gray-900" : "text-gray-500 hover:text-gray-900"}`;

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const isProducts = location.pathname === "/";
  const isStores = location.pathname === "/stores" || location.pathname.startsWith("/stores/");

  return (
    <div className="min-h-screen bg-gray-50/80">
      <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="text-lg font-semibold tracking-tight text-gray-900 hover:text-gray-700"
            >
              Tiny Inventory
            </Link>
            <nav className="flex gap-6">
              <Link to="/stores" className={navLinkClass(isStores)}>
                Stores
              </Link>
              <Link to="/" className={navLinkClass(isProducts)}>
                Products
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">{children}</main>
    </div>
  );
}
