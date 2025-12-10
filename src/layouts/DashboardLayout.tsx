import React from "react";
import Sidebar from "../components/Sidebar";
import Header from "../Global/Header";

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex">

      {/* FIXED SIDEBAR */}
      <Sidebar />

      {/* RIGHT CONTENT AREA */}
      <div className="flex flex-col flex-1 ml-0 md:ml-64 min-h-screen">

        <Header />

        <main className="p-6 bg-slate-100 flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
