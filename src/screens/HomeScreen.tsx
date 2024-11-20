/* eslint-disable @typescript-eslint/no-explicit-any */
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
    <div style={{ minHeight: "100vh", width: "97%", margin: "auto", padding: "20px 0" }}>
      <Row gutter={32}>
        <Col span={16}>
          <Carousel autoplay dots>
            {spotlightPosts.map((post, index) => (
              <div key={index}>
                <Card
                  onClick={() => (window.location.href = `/post/${post.id}`)}
                  hoverable
                  cover={<StyledImage src={post.linkImage} alt={post.title} />}
                >
                  <Card.Meta
                    title={post.title}
                    description={
                      <>
                        <small style={{ color: "gray", fontStyle: "italic" }}>
                          Published on: {formatDate(post.createdDate)} by {post.user?.fullName || "Unknown"}
                        </small>
                        <ContentTruncate
                          dangerouslySetInnerHTML={{ __html: truncateContent(post.content) }}
                        />
                      </>
                    }
                  />
                </Card>
              </div>
            ))}
          </Carousel>
        </Col>
        <Col span={8} style={{ maxHeight: "300px", overflowY: "auto" }}>
          <List
            header={<h2><b>Bài Viết Mới Nhất</b></h2>}
            itemLayout="horizontal"
            dataSource={latestPosts}
            renderItem={(item) => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <div
                      style={{
                        textAlign: "center",
                        cursor: "pointer",
                        textDecoration: "underline",
                        color: "blue",
                      }}
                      onClick={() => (window.location.href = `/post/${item.id}`)}
                    >
                      {item.title}
                    </div>
                  }
                  description={
                    <small style={{ color: "gray", fontStyle: "italic" }}>
                      Published on: {formatDate(item.createdDate)} by {item.user?.fullName || "Unknown"}
                    </small>
                  }
                />
              </List.Item>
            )}
          />
        </Col>
      </Row>
      <Row gutter={32} style={{ marginTop: "32px" }}>
        <Col span={24}>
          <List
            grid={{ gutter: 16, column: 4 }}
            pagination={{
              pageSize: 8,
              total: gridPosts.length,
              showSizeChanger: false,
            }}
            dataSource={gridPosts}
            renderItem={(item) => (
              <List.Item>
                <StyledCard
                  onClick={() => (window.location.href = `/post/${item.id}`)}
                  hoverable
                  cover={<StyledImage src={item.linkImage} alt={item.title} />}
                >
                  <Card.Meta
                    title={item.title}
                    description={
                      <>
                        <small style={{ color: "gray", fontStyle: "italic" }}>
                          Published on: {formatDate(item.createdDate)} by {item.user?.fullName || "Unknown"}
                        </small>
                        <ContentTruncate
                          dangerouslySetInnerHTML={{ __html: truncateContent(item.content) }}
                        />
                      </>
                    }
                  />
                </StyledCard>
              </List.Item>
            )}
          />
        </Col>
      </Row>
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