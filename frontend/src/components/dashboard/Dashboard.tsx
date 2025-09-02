"use client";

import React, { useEffect, useState } from "react";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import { useSidebar } from "@/context/SidebarContext";
import { getDashboardData } from "@/services/userService";
import { DashboardData } from "@/types/user";


interface Props {
  children?: React.ReactNode;
}

export default function AdminDashboard({ children }: Props) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    total_users: 0,
    role_counts: { management: 0, hotel_staff: 0, guest: 0 },
  });
  const [loading, setLoading] = useState(true);

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[290px]"
    : "lg:ml-[90px]";

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      try {
        const data = await getDashboardData();
        setDashboardData(data);
      } catch (err) {
        console.error("Failed to fetch dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const cardStyle =
    "p-5 rounded-lg shadow transition hover:shadow-lg hover:scale-[1.02]";

  return (
    <div className="min-h-screen xl:flex">
      <AppSidebar />
      <Backdrop />
      <div className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}>
        <AppHeader />
        <div className="p-4 mx-auto max-w-7xl md:p-6">
          {!loading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              {/* Total Users */}
              <div className={`${cardStyle} bg-gradient-to-r from-gray to-gray-100`}>
                <h3 className="text-lg font-semibold text-gray-800">Total Users</h3>
                <p className="mt-2 text-2xl font-bold text-gray-900">
                  {dashboardData.total_users}
                </p>
              </div>

              {/* Management */}
              <div className={`${cardStyle} bg-gradient-to-r from-sky to-blue-100`}>
                <h3 className="text-lg font-semibold text-gray-800">Management</h3>
                <p className="mt-2 text-2xl font-bold text-blue-800">
                  {dashboardData.role_counts.management}
                </p>
              </div>

              {/* Hotel Staff */}
              <div className={`${cardStyle} bg-gradient-to-r from-green to-green-100`}>
                <h3 className="text-lg font-semibold text-gray-800">Hotel Staff</h3>
                <p className="mt-2 text-2xl font-bold text-green-800">
                  {dashboardData.role_counts.hotel_staff}
                </p>
              </div>

              {/* Guests */}
              <div className={`${cardStyle} bg-gradient-to-r from-yellow to-yellow-100`}>
                <h3 className="text-lg font-semibold text-gray-800">Guests</h3>
                <p className="mt-2 text-2xl font-bold text-yellow-800">
                  {dashboardData.role_counts.guest}
                </p>
              </div>
            </div>
          ) : (
            <p>Loading dashboard...</p>
          )}

          {/* Children content */}
          {children}
        </div>
      </div>
    </div>
  );
}
