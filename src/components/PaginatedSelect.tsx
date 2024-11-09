import React, { useState, useEffect } from "react";
import { Select, Spin } from "antd";
import axios from "axios";

const { Option } = Select;
interface Major {
  id: number;
  name: string;
  ageRange: string;
  description: string;
}

interface Item {
  id: number;
  name: string;
  age: number;
  description: string;
  major: Major;
}

interface PageResponse {
  currentPage: number;
  totalPage: number;
  pageSize: number;
  nextPage: number | null;
  previousPage: number | null;
}

interface ApiResponse {
  status: string;
  message: string | null;
  timestamp: string;
  pageResponse: PageResponse;
  data: Item[];
}
interface PaginatedSelectProps {
  onChange?: (value: number | undefined) => void; // Hàm gọi lại khi có sự thay đổi giá trị
  value?: number; // Giá trị hiện tại (có thể không có)
  options?: { label: string; value: number }[]; // Các tùy chọn có thể chọn
}
const PaginatedSelect: React.FC<PaginatedSelectProps> = ({
  onChange,
  value,
  options,
}) => {
  const [data, setData] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    fetchData(page);
  }, [page]);

  const fetchData = async (pageNumber: number) => {
    setLoading(true);
    try {
      const response = await axios.get<ApiResponse>(
        `https://sep490-backend-production.up.railway.app/api/v1/grade?page=${pageNumber}&size=10`
      );
      // Use Set to prevent duplicate entries
      const uniqueData = Array.from(
        new Set([...data, ...response.data.data.map((item) => item.id)])
      ).map((id) =>
        response.data.data.find((item) => item.id === id)
      ) as Item[];

      setData(uniqueData);
      setTotalPages(response.data.pageResponse.totalPage);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      setFetching(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const bottom =
      target.scrollHeight === target.scrollTop + target.clientHeight;
    if (bottom && page < totalPages && !fetching) {
      setFetching(true);
      setPage((prevPage) => prevPage + 1);
    }
  };
  return (
    <Select
      value={value}
      onChange={onChange}
      options={options}
      placeholder="Chọn khối"
      loading={loading}
      style={{ width: "100%" }}
      showSearch
      filterOption={false}
      onPopupScroll={handleScroll}
      notFoundContent={loading ? <Spin size="small" /> : null}
      allowClear
    >
      {data.map((item) => (
        <Option key={item.id} value={item.id}>
          {item.name}
        </Option>
      ))}
    </Select>
  );
};

export default PaginatedSelect;
