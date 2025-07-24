import { Menu, SidebarClose, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "~/lib/utils";

const MenuAside = ({
  isOpen,
  setOpen,
}: {
  isOpen: boolean;
  setOpen: (b: boolean) => void;
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    if (isOpen) document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <div
      id="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-labelledby="menu-heading"
      className={cn(
        "transition-all duration-500 shadow-lg ease-in-out w-full max-w-screen-sm h-full fixed left-auto z-50 top-0 flex justify-end",
        isOpen ? "translate-x-0 bg-black/20" : `translate-x-full`,
      )}
    >
      <nav
        className="w-full h-full relative max-w-[16rem] bg-white p-3 pt-20 border-r border-gray-300"
        aria-label="Main navigation"
      >
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="inline-flex absolute left-3 top-3 items-center justify-center p-2 bg-transparent hover:bg-white/10 text-slate-800 rounded-md hover:ring-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          aria-label="Toggle navigation menu"
          aria-controls="mobile-menu"
          aria-expanded={isOpen}
        >
          <X className="size-10" aria-hidden="true" />
        </button>
        <h2 id="menu-heading" className="sr-only">
          Main menu
        </h2>
        <ul className="space-y-2">
          <li>
            <a
              href="/"
              className="block px-3 py-2 rounded hover:bg-gray-200 text-gray-800 font-medium"
            >
              Home
            </a>
          </li>
          <li>
            <a
              href="/about"
              className="block px-3 py-2 rounded hover:bg-gray-200 text-gray-800 font-medium"
            >
              About
            </a>
          </li>
          <li>
            <a
              href="/dashboard"
              className="block px-3 py-2 rounded hover:bg-gray-200 text-gray-800 font-medium"
            >
              Dashboard
            </a>
          </li>
          <li>
            <a
              href="/docs"
              className="block px-3 py-2 rounded hover:bg-gray-200 text-gray-800 font-medium"
            >
              Docs
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
};

const HeaderSection = () => {
  const [isOpen, setOpen] = useState(false);

  return (
    <>
      <a
        href="#main-content"
        className="absolute top-0 left-0 m-2 px-4 py-2 bg-indigo-600 text-white rounded shadow focus:block z-50 sr-only focus:not-sr-only"
      >
        Skip to content
      </a>
      <header
        className="flex items-center justify-between px-6 py-4 max-h-20 text-slate-700 shadow-sm bg-[#fefefe] relative z-50"
        role="banner"
      >
        <a
          href="/"
          className="text-2xl font-bold tracking-tight hover:text-indigo-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
          aria-label="Paylis homepage"
        >
          Paylis
        </a>

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex items-center justify-center p-2 rounded-md hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
          aria-label="Toggle navigation menu"
          aria-controls="mobile-menu"
          aria-expanded={isOpen}
        >
          <Menu className="w-6 h-6" aria-hidden="true" />
        </button>
      </header>

      <MenuAside isOpen={isOpen} setOpen={setOpen} />
    </>
  );
};

export default HeaderSection;
