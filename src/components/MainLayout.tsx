import { Layout } from "antd";
import MyContent from "./Content";
import Sidebar from "./Sidebar";
import { useAuthState } from "../hooks/useAuthState";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
    const { role, isLoggedIn } = useAuthState();
  
    return (
      <Layout className="min-h-screen">
        <Sidebar role={role} isLoggedIn={isLoggedIn} />
        <Layout>
          <MyContent children={children} />
        </Layout>
      </Layout>
    );
  };
  
  export default MainLayout;