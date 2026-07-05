import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

function AppLayout({ children }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const sidebarWidth = sidebarCollapsed ? 72 : 280;

  return (
    <div style={{ minHeight: "100vh" }}>
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />

      <div
        style={{
          marginLeft: `${sidebarWidth}px`,
          minHeight: "100vh",
          transition: "margin-left 0.2s ease",
        }}
      >
        <Header />

        <main className="page-container">{children}</main>
      </div>
    </div>
  );
}

export default AppLayout;