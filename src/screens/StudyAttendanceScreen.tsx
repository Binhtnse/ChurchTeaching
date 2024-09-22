import React, { useEffect, useState } from "react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useAuthState } from "../hooks/useAuthState";

interface AttendanceData {
  key: string;
  stt: number;
  date: string;
  class: string;
  status: string;
}

const columns: ColumnsType<AttendanceData> = [
  {
    title: "STT",
    dataIndex: "stt",
    key: "stt",
    width: 70,
  },
  {
    title: "Ngày",
    dataIndex: "date",
    key: "date",
  },
  {
    title: "Lớp",
    dataIndex: "class",
    key: "class",
  },
  {
    title: "Điểm danh",
    dataIndex: "status",
    key: "status",
    render: (status: string) => (
      <span
        className={`px-2 py-1 rounded-full ${
          status === "Có mặt"
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }`}
      >
        {status}
      </span>
    ),
  },
];

const StudyAttendanceScreen: React.FC = () => {
  const { isLoggedIn, role, userName } = useAuthState();
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([]);

  useEffect(() => {
    if (isLoggedIn) {
      // Fetch attendance data here
      // For now, we'll use dummy data
      const dummyData: AttendanceData[] = [
        {
          key: "1",
          stt: 1,
          date: "2023-05-01",
          class: "Lớp Giáo Lý",
          status: "Có mặt",
        },
        {
          key: "2",
          stt: 2,
          date: "2023-05-08",
          class: "Lớp Giáo Lý",
          status: "Vắng mặt",
        },
      ];
      setAttendanceData(dummyData);
    }
  }, [isLoggedIn]);
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Bảng điểm danh học viên</h1>
      <p className="mb-4">
        Welcome, {userName} ({role})
      </p>
      <Table
        columns={columns}
        dataSource={attendanceData}
        pagination={false}
        className="shadow-md"
      />
    </div>
  );
};

export default StudyAttendanceScreen;
