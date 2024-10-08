import React, { useState, useEffect } from "react";
import { Select, Spin } from "antd";
import axios from "axios";

const { Option } = Select;

interface AcademicYear {
  id: number;
  year: string;
  status: string;
}

const SelectYear: React.FC<{
  onChange?: (value: number) => void;
  value?: number;
}> = ({ onChange, value }) => {
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAcademicYears = async () => {
      setLoading(true);
      try {
        const response = await axios.get<AcademicYear[]>(
          "https://sep490-backend-production.up.railway.app/api/academic-years?status=ACTIVE"
        );
        setYears(response.data);
      } catch (error) {
        console.error("Error fetching academic years:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAcademicYears();
  }, []);

  return (
    <Select
      value={value}
      onChange={onChange}
      placeholder="Chọn năm học"
      loading={loading}
      style={{ width: "100%" }}
      allowClear
    >
      {loading ? (
        <Option value="loading" disabled>
          <Spin size="small" />
        </Option>
      ) : (
        years.map((year) => (
          <Option key={year.id} value={year.id}>
            {year.year}
          </Option>
        ))
      )}
    </Select>
  );
};

export default SelectYear;
