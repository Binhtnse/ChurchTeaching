/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { Row, Col, Carousel, List, Card, message, Spin, Layout, Menu, Button } from 'antd';
import axios from 'axios';
import { FacebookOutlined, YoutubeOutlined, InstagramOutlined, UserOutlined } from '@ant-design/icons';

const { Header, Footer, Content } = Layout;

interface PostDTO {
  id: number;
  title: string;
  linkImage: string;
  content: string;
  customCSS: string;
  categoryId: number;
  userId: number;
  category: any;
}

const HomeScreen: React.FC = () => {
  const [spotlightPosts, setSpotLightPosts] = useState<PostDTO[]>([]);
  const [gridPosts, setGridPosts] = useState<PostDTO[]>([]);
  const [latestPosts, setLatestPosts] = useState<PostDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await axios.get<PostDTO[]>(
        "https://sep490-backend-production.up.railway.app/api/posts"
      );
      const fetchedPosts = response.data;
      setSpotLightPosts(fetchedPosts.filter((post) => post.category.id === 3));
      setGridPosts(fetchedPosts.filter((post) => post.category.id === 4));
      setLatestPosts(fetchedPosts.slice(0, 5));
    } catch (error) {
      console.log(error);
      message.error("Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '20px auto' }} />;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Header hàng đầu tiên: Tiêu đề và biểu tượng mạng xã hội */}
      <Header style={{ backgroundColor: '#3273DC', color: '#fff', padding: '10px 50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ color: '#fff', fontSize: '20px', fontWeight: 'bold' }}>
          NHÀ THỜ THIÊN CHÚA GIÁO
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <FacebookOutlined style={{ color: '#fff', fontSize: '20px' }} />
          <YoutubeOutlined style={{ color: '#fff', fontSize: '20px' }} />
          <InstagramOutlined style={{ color: '#fff', fontSize: '20px' }} />
          <UserOutlined style={{ color: '#fff', fontSize: '20px' }} />
        </div>
      </Header>

      {/* Navigation Bar hàng thứ hai */}
      <Header style={{ backgroundColor: '#FFFFFF', padding: '0 50px', borderBottom: '1px solid #e8e8e8' }}>
        <Menu mode="horizontal" style={{ display: 'flex', justifyContent: 'center', fontWeight: 'bold', fontSize: '16px', borderBottom: 'none', width: '100%' }}>
          <Menu.Item key="home" style={{ flex: 1, textAlign: 'center' }} onClick={() => (window.location.href = '/')}>
            Trang Chủ
          </Menu.Item>
          <Menu.Item key="documents" style={{ flex: 1, textAlign: 'center' }}>Tư Liệu</Menu.Item>
          <Menu.Item key="policy" style={{ flex: 1, textAlign: 'center' }}>Chính Sách</Menu.Item>
          <Menu.Item key="register" style={{ flex: 1, textAlign: 'center' }} onClick={() => (window.location.href = '/enroll')}>
            Đăng Kí Học
          </Menu.Item>
          <Menu.Item key="login" style={{ flex: 1, textAlign: 'center' }}>
            <Button type="link" onClick={() => (window.location.href = '/login')} style={{ fontWeight: 'bold', fontSize: '16px', padding: 0 }}>
              Đăng Nhập
            </Button>
          </Menu.Item>
        </Menu>
      </Header>

      {/* Content */}
      <Content style={{ width: '70%', margin: '0 auto', padding: '32px 0' }}>
        <Row gutter={32}>
          <Col span={16}>
            <Carousel autoplay dots>
              {spotlightPosts.map((post, index) => (
                <div key={index}>
                  <Card
                    onClick={() => (window.location.href = `/post/${post.id}`)}
                    hoverable
                    cover={<img src={post.linkImage} alt={post.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />}
                  >
                    <Card.Meta title={post.title} description={<div dangerouslySetInnerHTML={{ __html: post.content }} />} />
                  </Card>
                </div>
              ))}
            </Carousel>
          </Col>
          <Col span={8} style={{ maxHeight: '300px', overflowY: 'auto' }}>
            <List
              header={<h2><b>Bài Viết Mới Nhất</b></h2>}
              itemLayout="horizontal"
              dataSource={latestPosts}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <div
                        style={{ textAlign: 'center', cursor: 'pointer', textDecoration: 'underline', color: 'blue' }}
                        onClick={() => (window.location.href = `/post/${item.id}`)}
                      >
                        {item.title}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Col>
        </Row>
        <Row gutter={32} style={{ marginTop: '32px' }}>
          <Col span={24}>
            <List
              grid={{ gutter: 16, column: 4 }}
              pagination={{
                pageSize: 8,
                total: gridPosts.length,
                showSizeChanger: false,
              }}
              dataSource={gridPosts}
              renderItem={item => (
                <List.Item>
                  <Card
                    onClick={() => (window.location.href = `/post/${item.id}`)}
                    hoverable
                    cover={<img src={item.linkImage} alt={item.title} style={{ width: '100%', height: '150px', objectFit: 'cover' }} />}
                    title={item.title}
                  >
                    <div
                      style={{
                        display: '-webkit-box',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 4,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      dangerouslySetInnerHTML={{ __html: item.content }}
                    />
                  </Card>
                </List.Item>
              )}
            />
          </Col>
        </Row>
      </Content>

      {/* Footer */}
      <Footer style={{ backgroundColor: '#f5f5f5', padding: '40px 0', borderTop: '1px solid #e0e0e0' }}>
        <Row justify="center" gutter={16} style={{ textAlign: 'center', color: '#333', paddingBottom: '20px' }}>
          <Col span={6} style={{ textAlign: 'center' }}>
            <img src="https://via.placeholder.com/80" alt="Logo" style={{ marginBottom: '10px' }} />
            <h3>NHÀ THỜ THIÊN CHÚA GIÁO</h3>
          </Col>
          <Col span={6}>
            <h3>Liên Hệ</h3>
            <p>1234 Đường số 6, Phường 1, Quận Tân Bình, TP. Hồ Chí Minh.</p>
            <p>+84 (777) 123 456</p>
            <p>contact@example.com</p>
          </Col>
          <Col span={6}>
            <h3>Mạng Xã Hội</h3>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <FacebookOutlined style={{ fontSize: '20px', color: '#3b5998' }} />
              <YoutubeOutlined style={{ fontSize: '20px', color: '#ff0000' }} />
              <InstagramOutlined style={{ fontSize: '20px', color: '#bc2a8d' }} />
            </div>
          </Col>
        </Row>
        <div style={{ backgroundColor: '#333', color: '#fff', padding: '10px 0', textAlign: 'center' }}>
          ©2024 - nhathothienchuagia.net. All rights reserved. Sài Gòn - Giữ bản quyền.
        </div>
      </Footer>
    </Layout>
  );
};

export default HomeScreen;
