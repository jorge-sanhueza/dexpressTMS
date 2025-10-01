import React from "react";
import { Outlet } from "react-router-dom";

export const RootLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EFF4F9] to-blue-100">
      <Outlet />
    </div>
  );
};
