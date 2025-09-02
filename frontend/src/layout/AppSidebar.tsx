"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useSidebar } from "../context/SidebarContext";
import { ChevronDownIcon } from "../icons/index";
import { logoutUser } from "@/services/userService";
import { getRole } from "@/utils/auth"; // adjust path to your auth util


const AppSidebar: React.FC = () => {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();

  const [openSubmenu, setOpenSubmenu] = useState(false);
  const subMenuRef = useRef<HTMLDivElement | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState(0);

  // ✅ Get role from localStorage
  const [role, setRole] = useState<string | null>(null);
  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
  }, []);

  const isActive = useCallback((path: string) => path === pathname, [pathname]);

  useEffect(() => {
    if (openSubmenu && subMenuRef.current) {
      setSubMenuHeight(subMenuRef.current.scrollHeight);
    } else {
      setSubMenuHeight(0);
    }
  }, [openSubmenu]);

  const toggleSubmenu = () => setOpenSubmenu(!openSubmenu);

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 
        bg-gradient-to-b from-white via-gray-50 to-gray-100
        dark:from-gray-900 dark:via-gray-800 dark:to-gray-700
        text-gray-900 dark:text-gray-100
        h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 dark:border-gray-800
        ${isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]"}
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo */}
      <div className={`py-8 flex ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
        <Link href="/dashboard">
          {isExpanded || isHovered || isMobileOpen ? (
            <h1 className="text-2xl font-bold text-blue-800 dark:text-white/90">HMS Admin Panel</h1>
          ) : (
            <Image src="/images/logo/logo-icon.svg" alt="Logo" width={32} height={32} />
          )}
        </Link>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto duration-300 ease-linear no-scrollbar">
        <ul className="flex flex-col gap-4">


                    {/* ✅ Example: Guest Dashboard link */}
          {role === "guest" && (
            <li>
              <Link
                href="/guest-dashboard"
                className={`menu-item group flex items-center w-full cursor-pointer p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
                  isActive("/guest-dashboard") ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span className="menu-item-icon-inactive mr-2">🏠</span>
                {(isExpanded || isHovered || isMobileOpen) && <span className="menu-item-text">Dashboard</span>}
              </Link>
            </li>
          )}

                   {role !== "guest" && (
            <li>
              <Link
                href="/dashboard"
                className={`menu-item group flex items-center w-full cursor-pointer p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
                  isActive("/dashboard") ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span className="menu-item-icon-inactive mr-2">🏠</span>
                {(isExpanded || isHovered || isMobileOpen) && <span className="menu-item-text">Dashboard</span>}
              </Link>
            </li>
          )}

          {/* ✅ Users Menu (only for management) */}
          {role === "management" && (
            <li>
              <button
                onClick={toggleSubmenu}
                className={`menu-item group flex items-center w-full cursor-pointer p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
                  openSubmenu ? "menu-item-active" : "menu-item-inactive"
                } ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}`}
              >
                <span className="menu-item-icon-inactive mr-2">👤</span>
                {(isExpanded || isHovered || isMobileOpen) && <span className="menu-item-text">Users</span>}
                {(isExpanded || isHovered || isMobileOpen) && (
                  <ChevronDownIcon
                    className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                      openSubmenu ? "rotate-180 text-brand-500" : ""
                    }`}
                  />
                )}
              </button>

              <div
                ref={subMenuRef}
                className="overflow-hidden transition-all duration-300"
                style={{ height: openSubmenu ? `${subMenuHeight}px` : "0px" }}
              >
                <ul className="mt-2 space-y-1 ml-9">
                  <li>
                    <Link
                      href="/users/hotel-staff"
                      className={`menu-dropdown-item ${
                        isActive("/users/hotel-staff")
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      Hotel Staff
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/users/guest"
                      className={`menu-dropdown-item ${
                        isActive("/users/guest")
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      Guest
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/users/management"
                      className={`menu-dropdown-item ${
                        isActive("/users/management")
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      Management
                    </Link>
                  </li>
                </ul>
              </div>
            </li>
          )}

         {(role === "guest" || role === "management") && (
  <>
    {/* Services Menu */}
    <li>
      <Link
        href="/services"
        className={`menu-item group flex items-center w-full cursor-pointer p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
          isActive("/services") ? "menu-item-active" : "menu-item-inactive"
        } ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}`}
      >
        <span className="menu-item-icon-inactive mr-2">🛎️</span>
        {(isExpanded || isHovered || isMobileOpen) && (
          <span className="menu-item-text">Services</span>
        )}
      </Link>
    </li>

    {/* Meals Menu */}
    <li>
      <Link
        href="/meals"
        className={`menu-item group flex items-center w-full cursor-pointer p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
          isActive("/meals") ? "menu-item-active" : "menu-item-inactive"
        } ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}`}
      >
        <span className="menu-item-icon-inactive mr-2">🍽️</span>
        {(isExpanded || isHovered || isMobileOpen) && (
          <span className="menu-item-text">Meals</span>
        )}
      </Link>
    </li>

        <li>
              <Link
                href="/rooms"
                className={`menu-item group flex items-center w-full cursor-pointer p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
                  isActive("/rooms") ? "menu-item-active" : "menu-item-inactive"
                } ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}`}
              >
                <span className="menu-item-icon-inactive mr-2">🏨</span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">Rooms</span>
                )}
              </Link>
            </li>
  </>
)}

  <li>
    <Link
      href="/services/book"
      className={`menu-item group flex items-center w-full cursor-pointer p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
        isActive("/services/book") ? "menu-item-active" : "menu-item-inactive"
      } ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}`}
    >
      <span className="menu-item-icon-inactive mr-2">📅</span>
      {(isExpanded || isHovered || isMobileOpen) && (
        <span className="menu-item-text">Service Bookings</span>
      )}
    </Link>
  </li>


        </ul>
      </nav>

<div className="mt-auto mb-6">
  <button
    onClick={async () => {
      try {
        await logoutUser(); // call logout API
        router.push("/signin"); // redirect to sign-in page
      } catch (error) {
        console.error("Logout failed:", error);
      }
    }}
    className="flex items-center gap-3 px-3 py-2 mt-3 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
  >
    <svg
      className="fill-gray-500 group-hover:fill-gray-700 dark:group-hover:fill-gray-300"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.1007 19.247C14.6865 19.247 14.3507 18.9112 14.3507 18.497L14.3507 14.245H12.8507V18.497C12.8507 19.7396 13.8581 20.747 15.1007 20.747H18.5007C19.7434 20.747 20.7507 19.7396 20.7507 18.497L20.7507 5.49609C20.7507 4.25345 19.7433 3.24609 18.5007 3.24609H15.1007C13.8581 3.24609 12.8507 4.25345 12.8507 5.49609V9.74501L14.3507 9.74501V5.49609C14.3507 5.08188 14.6865 4.74609 15.1007 4.74609L18.5007 4.74609C18.9149 4.74609 19.2507 5.08188 19.2507 5.49609L19.2507 18.497C19.2507 18.9112 18.9149 19.247 18.5007 19.247H15.1007ZM3.25073 11.9984C3.25073 12.2144 3.34204 12.4091 3.48817 12.546L8.09483 17.1556C8.38763 17.4485 8.86251 17.4487 9.15549 17.1559C9.44848 16.8631 9.44863 16.3882 9.15583 16.0952L5.81116 12.7484L16.0007 12.7484C16.4149 12.7484 16.7507 12.4127 16.7507 11.9984C16.7507 11.5842 16.4149 11.2484 16.0007 11.2484L5.81528 11.2484L9.15585 7.90554C9.44864 7.61255 9.44847 7.13767 9.15547 6.84488C8.86248 6.55209 8.3876 6.55226 8.09481 6.84525L3.52309 11.4202C3.35673 11.5577 3.25073 11.7657 3.25073 11.9984Z"
        fill=""
      />
    </svg>
    Sign out
  </button>
</div>
    </aside>
  );
};

export default AppSidebar;
