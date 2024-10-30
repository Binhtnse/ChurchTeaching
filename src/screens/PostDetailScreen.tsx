import { Alert, Card, Spin } from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface PostDTO {
    id: number;
    title: string;
    linkImage: any;
    content: string;
    customCSS: string;
    categoryId: number;
    userId: number;
    category: any
}

export const PostDetail: React.FC = () => {
    const [post, setPost] = useState<PostDTO | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { id } = useParams();

    useEffect(() => {
        fetchPost();
    }, [id]);

    const fetchPost = async () => {
        try {
            const response = await axios.get<PostDTO>(`https://sep490-backend-production.up.railway.app/api/posts/${id}`);
            const postData = response.data;

            // Assuming the API returns image URL as part of the post content
            setPost({
                id: postData.id,
                title: postData!.title,
                linkImage: postData!.linkImage[0],
                content: postData!.content,
                customCSS: postData!.customCSS,
                categoryId: postData!.category.id,
                userId: postData!.userId,
                category: postData!.category
            });
        } catch (err) {
            setError('Failed to load post details.');
        } finally {
            setLoading(false);
        }
    };


    if (loading) return <Spin size="large" style={{ display: 'block', margin: '20px auto' }} />;
    if (error) return <Alert message={error} type="error" showIcon style={{ textAlign: 'center' }} />;

    return post ? <Card style={{ width: '70%', margin: '0 auto', textAlign: 'center' }}>
        <h1 className="my-5">{post.title}</h1>
        <img src={post.linkImage} alt={post.title} style={{ width: '100%', height: 'auto' }} />
        <div dangerouslySetInnerHTML={{ __html: post.content }} style={{ marginTop: '16px' }} />
    </Card> : null;
};