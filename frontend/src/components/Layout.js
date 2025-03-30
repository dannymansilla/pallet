import React, { useState } from "react";
import { Flex, Box } from "@chakra-ui/react";
import Header from "./Header";
import Footer from "./Footer";
import SideNav from "./SideNav";
import { useAuth } from "../context/AuthContext";

const Layout = ({ children }) => {
  const { user } = useAuth();
  const isApproved = user?.organization?.approval_status === 'approved';
  const isAdmin = user?.role === 'admin';

  // State for horizontal collapse
  const [isCollapsed, setIsCollapsed] = useState(false);

  // The side nav is 200px wide normally, 60px when collapsed
  const sidebarWidth = isCollapsed ? 60 : 200;

  return (
    <Flex direction="column" minH="100vh">
      {/* Header (fixed) */}
      <Box as="header" w="100%">
        <Header />
      </Box>

      {/* SideNav (fixed left, top=70px in the component itself) */}
      {/* Pass isCollapsed and the toggle callback */}
      <Box>
        {(isApproved && !isAdmin) && (
          <SideNav
            user={user}
            isCollapsed={isCollapsed}
            onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
          />
        )}
      </Box>

      {/* Main Content Area */}
      <Box
        as="main"
        flex="1"
        pt="70px"
        ml={(isApproved && !isAdmin) ? `${sidebarWidth}px` : "0"}
        transition="margin-left 0.2s ease"
      >
        {children}
      </Box>

      {/* Footer */}
      <Box 
        as="footer"
        ml={(isApproved && !isAdmin) ? `${sidebarWidth}px` : "0"}
        transition="margin-left 0.2s ease"
      >
        <Footer />
      </Box>
    </Flex>
  );
};

export default Layout;
