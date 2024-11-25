/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { Row, Col, List, Card, message, Spin } from "antd";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import axios from "axios";

interface UserDTO {
  id: number;
  fullName: string;
  createdDate?: string;
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
  user?: UserDTO;
}

const HomeScreen: React.FC = () => {
  const [spotlightPosts, setSpotlightPosts] = useState<PostDTO[]>([]);
  const [gridPosts, setGridPosts] = useState<PostDTO[]>([]);
  const [latestPosts, setLatestPosts] = useState<PostDTO[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (spotlightPosts.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) =>
          prevIndex === spotlightPosts.length - 1 ? 0 : prevIndex + 1
        );
      }, 7000); // Chuyển bài viết sau 7 giây
      return () => clearInterval(interval); // Clear interval khi component unmount
    }
  }, [spotlightPosts]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await axios.get<PostDTO[]>(
        "https://sep490-backend-production.up.railway.app/api/posts"
      );
      const fetchedPosts = response.data;
      setSpotlightPosts(fetchedPosts.filter((post) => post.category.id === 3)); // Bài viết tiêu điểm
      setGridPosts(fetchedPosts.filter((post) => post.category.id === 4)); // Các bài viết dưới
      setLatestPosts(fetchedPosts.slice(0, 5)); // Bài viết mới nhất
    } catch (error) {
      console.error("Error fetching posts:", error);
      message.error("Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
  };

  const truncateContent = (content: string) => {
    const lines = content.split("\n");
    if (lines.length > 4) {
      return lines.slice(0, 4).join("\n") + "...";
    }
    return content;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) {
      return "Chưa có ngày";
    }
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? "Ngày không hợp lệ"
      : date.toLocaleDateString("vi-VN", {
          year: "numeric",
          month: "long",
          day: "numeric",
      });
  };

  if (loading)
    return (
      <Spin size="large" style={{ display: "block", margin: "20px auto" }} />
    );

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "97%",
        margin: "auto",
        padding: "20px 0",
      }}
    >
      {/* Spotlight Posts */}
      <Row gutter={32}>
        <Col span={16}>
          <SectionTitle>
            <b>Bài Viết Tiêu Điểm</b>
          </SectionTitle>
          {spotlightPosts.length > 0 && (
            <div>
              <SpotlightCard
                onClick={() =>
                  navigate(`/post/${spotlightPosts[currentIndex].id}`)
                }
                hoverable
              >
                <StyledImage
                  src={spotlightPosts[currentIndex].linkImage}
                  alt={spotlightPosts[currentIndex].title}
                />
                <Card.Meta
                  title={
                    <SpotlightTitle>
                      {spotlightPosts[currentIndex].title}
                    </SpotlightTitle>
                  }
                  description={
                    <>
                      <small style={{ color: "gray", fontStyle: "italic" }}>
                        Đăng vào ngày:{" "}
                        {formatDate(
                          spotlightPosts[currentIndex].user?.createdDate
                        )}{" "}
                        bởi{" "}
                        {spotlightPosts[currentIndex].user?.fullName ||
                          "Unknown"}
                      </small>
                      <ContentTruncate
                        dangerouslySetInnerHTML={{
                          __html: truncateContent(
                            spotlightPosts[currentIndex].content
                          ),
                        }}
                      />
                    </>
                  }
                />
              </SpotlightCard>
              <DotContainer>
                {spotlightPosts.map((_, index) => (
                  <Dot
                    key={index}
                    active={index === currentIndex}
                    onClick={() => handleDotClick(index)}
                  />
                ))}
              </DotContainer>
            </div>
          )}
        </Col>

        {/* Latest Posts */}
        <Col span={8}>
          <SectionTitle>
            <b>Bài Viết Mới Nhất</b>
          </SectionTitle>
          <LatestPostsContainer>
            <List
              itemLayout="vertical"
              dataSource={latestPosts}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <div
                        style={{
                          textAlign: "left",
                          cursor: "pointer",
                          textDecoration: "underline",
                          color: "blue",
                        }}
                        onClick={() => navigate(`/post/${item.id}`)}
                      >
                        {item.title}
                      </div>
                    }
                    description={
                      <small style={{ color: "gray", fontStyle: "italic" }}>
                        Đăng vào ngày: {formatDate(item.user?.createdDate)} bởi{" "}
                        {item.user?.fullName || "Unknown"}
                      </small>
                    }
                  />
                </List.Item>
              )}
            />
          </LatestPostsContainer>
        </Col>
      </Row>

      {/* Grid Posts */}
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
                  hoverable
                  onClick={() => navigate(`/post/${item.id}`)}
                >
                  <StyledImage src={item.linkImage} alt={item.title} />
                  <Card.Meta
                    title={item.title}
                    description={
                      <>
                        <small style={{ color: "gray", fontStyle: "italic" }}>
                          Đăng vào ngày: {formatDate(item.user?.createdDate)} bởi{" "}
                          {item.user?.fullName || "Unknown"}
                        </small>
                        <ContentTruncate
                          dangerouslySetInnerHTML={{
                            __html: truncateContent(item.content),
                          }}
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
const SpotlightCard = styled(Card)`
  height: 300px; /* Giới hạn chiều cao bài viết tiêu điểm */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden; /* Ẩn nội dung vượt quá */
  cursor: pointer;
`;

const SpotlightTitle = styled.h3`
  font-size: 1.5em;
  font-weight: bold;
  margin: 0;
`;

const StyledCard = styled(Card)`
  height: 300px; /* Chiều cao đồng nhất */
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;
`;

const StyledImage = styled.img`
  width: 100%;
  height: 140px;
  object-fit: cover;
  border-radius: 8px 8px 0 0;
`;

const LatestPostsContainer = styled.div`
  max-height: 300px; /* Chiều cao cố định */
  overflow-y: auto; /* Hiển thị thanh cuộn khi nội dung vượt quá */
  padding-right: 10px; /* Đệm để thanh cuộn không che nội dung */
`;

const ContentTruncate = styled.div`
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4; /* Giới hạn số dòng */
  overflow: hidden;
  text-overflow: ellipsis;
`;

const DotContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 5px;
  margin-top: 10px;
`;

const Dot = styled.div<{ active: boolean }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${(props) => (props.active ? "blue" : "gray")};
  cursor: pointer;
`;
const SectionTitle = styled.h2`
  font-size: 1.5em; /* Tăng kích thước chữ */
  font-weight: bold;
  margin-bottom: 20px;
`;
