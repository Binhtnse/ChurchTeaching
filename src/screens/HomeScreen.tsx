/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { Row, Col, Carousel, List, Card, message, Spin } from 'antd';
import axios from 'axios';


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
      setSpotLightPosts(fetchedPosts.filter((post) => post.category.id === 3))

      setGridPosts(fetchedPosts.filter((post) => post.category.id === 4));

      setLatestPosts(fetchedPosts.slice(0,5));

      // setPosts(fetchedPosts);
    } catch (error) {
      console.log(error);
      message.error("Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };
  if (loading) return <Spin size="large" style={{ display: 'block', margin: '20px auto' }} />;

  return (
    <div style={{ width: '70%', margin: '0 auto' }}>
      <Row gutter={32}>
        <Col span={16}>
          <Carousel autoplay dots>
            {spotlightPosts.map((post, index) => (
              <div key={index}>
                <Card
                  onClick={() => window.location.href = `/post/${post.id}`}
                  hoverable
                  cover={<img src={post.linkImage} alt={post.title} style={{ width: '100%', height: '200px', objectFit: 'cover' }} />}
                >
                  <Card.Meta title={post.title} description={<div dangerouslySetInnerHTML={{ __html: post.content }} />} />
                </Card>
              </div>
            ))}
          </Carousel>
        </Col>
        <Col span={8}  style={{ maxHeight: '300px', overflowY: 'auto' }}>
          <List
            header={<h2><b>Bài Viết Mới Nhất</b></h2>}
            className='text-center'
            itemLayout="horizontal"
            dataSource={latestPosts}
            renderItem={item => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <div
                      style={{ textAlign: 'center', cursor: 'pointer', textDecoration: 'underline', color: 'blue' }}
                      onClick={() => window.location.href = `/post/${item.id}`}
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
                  onClick={() => window.location.href = `/post/${item.id}`}
                  hoverable
                  cover={
                    <img
                      src={item.linkImage}
                      alt={item.title}
                      style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                    />
                  }
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
    </div>
  );
};

export default HomeScreen;

