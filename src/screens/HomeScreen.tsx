/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { Row, Col, Carousel, List, Card, message, Spin} from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// const { Content } = Layout;
import React, { useEffect, useState } from "react";
import { Row, Col, Carousel, List, Card, message, Spin } from "antd";
import axios from "axios";
import styled from "styled-components";

interface UserDTO {
  id: number;
  fullName: string;
}

interface PostDTO {
  id: number;
  title: string;
  linkImage: string;
  content: string;
  customCSS: string;
  categoryId: number;
  userId: number;
  category: any;
  createdDate?: string; // Ngày đăng bài
  user?: UserDTO; // Thông tin người đăng bài
}

const HomeScreen: React.FC = () => {
  const [spotlightPosts, setSpotLightPosts] = useState<PostDTO[]>([]);
  const [gridPosts, setGridPosts] = useState<PostDTO[]>([]);
  const [latestPosts, setLatestPosts] = useState<PostDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

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
      console.error("Error fetching posts:", error);
      message.error("Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  const truncateContent = (content: string) => {
    const lines = content.split("\n");
    if (lines.length > 5) {
      return lines.slice(0, 5).join("\n") + "...";
    }
    return content;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) {
      return "No date available";
    }
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? "Invalid Date"
      : date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
  };

  if (loading)
    return <Spin size="large" style={{ display: "block", margin: "20px auto" }} />;

  return (
    <div className="home-container" style={{ 
      minHeight: '100vh', 
      width: '80%', // Increased width for better content display
      margin: '0 auto',
      padding: '40px 0' // Increased padding
    }}>
      {/* Hero Section */}
      <Row gutter={[32, 32]}>
        <Col xs={24} lg={16}>
          <Carousel 
            autoplay 
            dots 
            effect="fade"
            style={{
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            {spotlightPosts.map((post, index) => (
              <div key={index}>
                <Card
                  onClick={() => (navigate(`/post/${post.id}`))}
                  hoverable
                  className="spotlight-card"
                  cover={
                    <img 
                      src={post.linkImage} 
                      alt={post.title} 
                      style={{ 
                        width: '100%', 
                        height: '400px', // Increased height
                        objectFit: 'cover'
                      }} 
                    />
                  }
                >
                  <Card.Meta 
                    title={<h2 style={{ fontSize: '1.5rem', margin: 0 }}>{post.title}</h2>}
                    description={
                      <div
                        style={{
                          display: '-webkit-box',
                          WebkitBoxOrient: 'vertical',
                          WebkitLineClamp: 3,
                          overflow: 'hidden',
                          fontSize: '1.1rem',
                          lineHeight: '1.6'
                        }}
                        dangerouslySetInnerHTML={{ __html: post.content }}
                      />
                    }
                  />
                </Card>
              </div>
            ))}
          </Carousel>
        </Col>

        <Col xs={24} lg={8}>
          <Card 
            className="latest-posts-card"
            style={{ 
              height: '100%',
              borderRadius: '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}
          >
            <List
              header={
                <h2 style={{ 
                  borderBottom: '2px solid #1890ff',
                  paddingBottom: '10px',
                  color: '#1890ff'
                }}>
                  Bài Viết Mới Nhất
                </h2>
              }
              itemLayout="horizontal"
              dataSource={latestPosts}
              renderItem={item => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <div
                        style={{ 
                          cursor: 'pointer',
                          fontSize: '1.1rem',
                          color: '#1890ff',
                          transition: 'color 0.3s'
                        }}
                        onClick={() => (navigate(`/post/${item.id}`))}
                        onMouseOver={(e) => e.currentTarget.style.color = '#40a9ff'}
                        onMouseOut={(e) => e.currentTarget.style.color = '#1890ff'}
                      >
                        {item.title}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* Grid Posts Section */}
      <div style={{ marginTop: '40px' }}>
        <h2 style={{ 
          fontSize: '2rem', 
          marginBottom: '24px',
          textAlign: 'center',
          color: '#1890ff'
        }}>
          Bài Viết Nổi Bật
        </h2>
        <List
          grid={{ 
            gutter: 24,
            xs: 1,    // 1 column on extra small screens
            sm: 2,    // 2 columns on small screens
            md: 3,    // 3 columns on medium screens
            lg: 4,    // 4 columns on large screens
            xl: 4,    // 4 columns on extra large screens
            xxl: 4    // 4 columns on extra extra large screens
          }}
          pagination={{
            pageSize: 8,
            total: gridPosts.length,
            showSizeChanger: false,
          }}
          dataSource={gridPosts}
          renderItem={item => (
            <List.Item>
              <Card
                onClick={() => (navigate(`/post/${item.id}`))}
                hoverable
                style={{ 
                  borderRadius: '8px',
                  overflow: 'hidden',
                  height: '100%'
                }}
                cover={
                  <img 
                    src={item.linkImage} 
                    alt={item.title} 
                    style={{ 
                      height: '200px',
                      objectFit: 'cover'
                    }} 
                  />
                }
              >
                <Card.Meta
                  title={<div style={{ fontSize: '1.2rem' }}>{item.title}</div>}
                  description={
                    <div
                      style={{
                        display: '-webkit-box',
                        WebkitBoxOrient: 'vertical',
                        WebkitLineClamp: 3,
                        overflow: 'hidden',
                        lineHeight: '1.5'
                      }}
                      dangerouslySetInnerHTML={{ __html: item.content }}
                    />
                  }
                />
              </Card>
            </List.Item>
          )}
        />
      </div>
    </div>
  );
};

export default HomeScreen;

// Styled Components
const ContentTruncate = styled.div`
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4; /* Giới hạn số dòng hiển thị */
  overflow: hidden;
  text-overflow: ellipsis;
`;

const StyledCard = styled(Card)`
  height: 330px; /* Chiều cao cố định cho các thẻ Card */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden; /* Đảm bảo nội dung không vượt quá khung */
`;

const StyledImage = styled.img`
  width: 100%;
  height: 140px; /* Chiều cao cố định cho hình ảnh */
  object-fit: cover; /* Đảm bảo hình ảnh không bị tràn ra ngoài */
  border-radius: 8px 8px 0 0; /* Tùy chỉnh góc bo tròn nếu cần */
`;
