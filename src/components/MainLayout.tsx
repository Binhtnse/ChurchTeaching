import { Layout } from "antd";
import MyContent from "./Content";
import Sidebar from "./Sidebar";
import Header from "./Header";
import MyFooter from "./Footer";
import { useAuthState } from "../hooks/useAuthState";
import ChatboxAI from '../components/ChatboxAI';

const { Content } = Layout;

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { role, isLoggedIn, userName } = useAuthState();

  return (
     <Layout className="min-h-screen">
      <Header isLoggedIn={isLoggedIn} userName={userName} />
      <Layout className="flex-1 flex flex-row">
        <Sidebar role={role} />
        <Layout className="flex flex-col flex-1">
          <Content className="flex-1 mt-0">
            <MyContent>{children}</MyContent>
            {role === 'STUDENT' && <ChatboxAI/>}
          </Content>
        </Layout>
      </Layout>
      <MyFooter />
    </Layout> 
  );
};

export default MainLayout;