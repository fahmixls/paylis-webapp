import { ChevronRight, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "~/lib/utils";
import ConnectButtonCustom from "./ConnectButtonCustom";

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
        "transition-all duration-300 shadow-lg ease-in w-[18rem] h-full fixed left-auto z-50 top-0 flex justify-start",
        isOpen ? "translate-x-0 " : `-translate-x-[18rem]`,
      )}
    >
      <nav
        className="w-[18rem] h-full relative bg-white p-3 pt-20 border-r border-gray-300"
        aria-label="Main navigation"
      >
        <button
          type="button"
          onClick={() => setOpen(!isOpen)}
          className="inline-flex absolute right-3 top-3 items-center justify-center p-2 bg-transparent hover:bg-white/10 text-wp rounded-md hover:ring-indigo-500 transition duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          aria-label="Toggle navigation menu"
          aria-controls="mobile-menu"
          aria-expanded={isOpen}
        >
          <span className="sr-only">Open/close side menu</span>
          {!isOpen ? (
            <ChevronRight className="size-10" aria-hidden="true" />
          ) : (
            <X className="size-10" aria-hidden="true" />
          )}
        </button>
        <h2 id="menu-heading" className="sr-only">
          Main menu
        </h2>
        <ul className="space-y-2 text-wp">
          <li>
            <a
              href="/"
              className="block px-3 py-2 rounded hover:bg-gray-200 font-medium"
            >
              Home
            </a>
          </li>
          <li>
            <a
              href="/about"
              className="block px-3 py-2 rounded hover:bg-gray-200 font-medium"
            >
              About
            </a>
          </li>
          <li>
            <a
              href="/dashboard"
              className="block px-3 py-2 rounded hover:bg-gray-200 font-medium"
            >
              Dashboard
            </a>
          </li>
          <li>
            <a
              href="/docs"
              className="block px-3 py-2 rounded hover:bg-gray-200 font-medium"
            >
              Docs
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
};

const Header = () => {
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
        className="flex items-center justify-between px-6 py-4 max-h-20 text-wp shadow-sm bg-white relative z-50"
        role="banner"
      >
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="inline-flex items-center justify-center p-2 rounded-md hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-500"
          aria-label="Toggle navigation menu"
          aria-controls="mobile-menu"
          aria-expanded={isOpen}
        >
          <Menu className="size-8" aria-hidden="true" />
        </button>
        <ConnectButtonCustom />
      </header>

      <MenuAside isOpen={isOpen} setOpen={setOpen} />
    </>
  );
};

export default Header;
