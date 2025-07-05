"use client";
import Link from "next/link";
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, LogOut, Menu, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Logout } from "@/app/actions/auth/logout";

interface DropDownProps {
  title: string;
  url: { item: string; link: string }[];
  isOpen: boolean;
  onOpen: (index: number) => void;
  onClose: (index: number) => void;
  index: number;
  isMobile: boolean;
  closeMobileMenu?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const DropDown: React.FC<DropDownProps> = ({
  title,
  url,
  isOpen,
  onOpen,
  onClose,
  index,
  isMobile,
  closeMobileMenu,
}) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const submenuRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    if (!isMobile) {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
      }
      onOpen(index);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      timerRef.current = setTimeout(() => {
        const hoveredElement = document.querySelector(":hover");
        if (
          hoveredElement &&
          dropdownRef.current &&
          submenuRef.current &&
          !dropdownRef.current.contains(hoveredElement) &&
          !submenuRef.current.contains(hoveredElement)
        ) {
          onClose(index);
        }
      }, 100);
    }
  };

  const handleClick = () => {
    if (isMobile) {
      if (isOpen) {
        onClose(index);
      } else {
        onOpen(index);
      }
    }
  };

  useEffect(() => {
    return () => clearTimeout(timerRef.current as unknown as number);
  }, []);

  return (
    <div
      ref={dropdownRef}
      className="relative transition-all duration-300 ease-in-out max-lg:py-1 font-sans font-semibold"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={handleClick}
        className={`flex items-center justify-between gap-1 max-lg:py-2 hover:text-indigo-300 transition-colors rounded-sm ${
          isOpen ? "text-indigo-300" : ""
        }`}
      >
        {title}
        <ChevronDown
          className={`h-4 w-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          ref={submenuRef}
          className={`absolute z-10 text-black shadow-lg rounded-sm min-w-52 w-max mt-2 max-h-[70vh] overflow-y-auto ${
            isMobile
              ? "static mt-1 shadow-none ring-0 max-h-none overflow-visible"
              : "-left-1/2"
          }`}
        >
          <div className="w-full rounded-sm gap-2 flex flex-col p-2 bg-background text-white">
            {url.map((item, idx) => (
              <Link
                key={item.item}
                href={item.link}
                className={`block px-4 text-sm w-full py-1 hover:bg-indigo-300 rounded-sm hover:text-indigo-600 ${
                  idx === 0 || idx === url.length - 1 ? "rounded-sm" : ""
                }`}
                onClick={() => {
                  onClose(index);
                  if (isMobile && closeMobileMenu) closeMobileMenu();
                }}
              >
                {item.item}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function DropDownNav({ navItems }: { navItems: NavItem[] }) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const handleLogout = async () => {
    const response = await Logout();
    if (response.status === 200) {
      sessionStorage.removeItem("user");
      router.push("/");
    } else {
      console.error("Logout failed", response.error);
    }
  };

  return (
    <>
      <button
        className="px-2 focus:outline-none rounded-sm hover:bg-text-secondary transition-colors"
        type="button"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label={menuOpen ? "Close menu" : "Open menu"}
      >
        {menuOpen ? (
          <X className="h-6 w-6 text-text-secondary" />
        ) : (
          <Menu className="h-6 w-6 text-text-secondary" />
        )}
      </button>

      <div className="hidden lg:block">
        <ul className="flex items-center space-x-6">
          {navItems.map((item, index) => (
            <li key={index} className="relative text-text-secondary">
              <Link
                href={item.href}
                className="font-medium hover:text-indigo-300 transition-colors"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {menuOpen && (
        <div className="bg-black absolute top-full left-0 right-0 shadow-lg z-30 border-t pb-3 px-3 border-text-secondary min-h-fit overflow-y-auto">
          <ul className="flex flex-col font-semibold">
            {navItems.map((item, index) => (
              <li
                key={index}
                className="border-b border-text-secondary last:border-b-0"
              >
                <Link
                  href={item.href}
                  className="block py-2"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li className="pt-3">
              <button
                onClick={handleLogout}
                className="flex items-center justify-center bg-red-500 w-full rounded-md py-2"
              >
                <LogOut className="h-5 w-5" />
                <span className="ml-2">Logout</span>
              </button>
            </li>
          </ul>
        </div>
      )}
    </>
  );
}
