import React, { useEffect, useState, useCallback } from "react";
import { Table, Tag, Select, message, Card } from "antd";
import { useAuthState } from "../hooks/useAuthState";
import ForbiddenScreen from "./ForbiddenScreen";
import axios from "axios";
import usePageTitle from "../hooks/usePageTitle";
import dayjs from "dayjs";

const { Option } = Select;

interface LeaveRequest {
    id: number;
    requestTime: string;
    reason: string;
    studentName: string;
    className: string;
    status: string;
    timeTableName: string;
    timeTableTime: string;
}

const AdminLeaveRequestListScreen: React.FC = () => {
    const { isLoggedIn, role } = useAuthState();
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [grades, setGrades] = useState<{ id: number; name: string }[]>([]);
    const [selectedGrade, setSelectedGrade] = useState<number | null>(null);
    console.log(selectedGrade)
    const [academicYears, setAcademicYears] = useState<
        { id: number; year: string; timeStatus: string }[]
    >([]);
    const [selectedAcademicYear, setSelectedAcademicYear] = useState<number | null>(null);
    console.log(selectedAcademicYear)
    const { setPageTitle } = usePageTitle();

    useEffect(() => {
        setPageTitle("Danh sách đơn xin nghỉ", "#4154f1");
    }, [setPageTitle]);

    const fetchAcademicYears = async () => {
        try {
            const response = await axios.get(
                "https://sep490-backend-production.up.railway.app/api/academic-years?status=ACTIVE"
            );
            setAcademicYears(response.data);
        } catch (error) {
            console.error("Error fetching academic years:", error);
            message.error("Failed to fetch academic years");
        }
    };

    const fetchGrades = async () => {
        try {
            const token = localStorage.getItem("accessToken");
            const response = await axios.get(
                "https://sep490-backend-production.up.railway.app/api/v1/grade?page=1&size=10",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (response.data.status === "success") {
                setGrades(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching grades:", error);
            message.error("Failed to fetch grades");
        }
    };

    const fetchLeaveRequests = useCallback(async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("accessToken");
            const response = await axios.get(
                "https://sep490-backend-production.up.railway.app/api/v1/leave-requests",
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            setLeaveRequests(response.data.data);
        } catch (error) {
            console.error("Error fetching leave requests:", error);
            message.error("Failed to fetch leave requests");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isLoggedIn && role === "ADMIN") {
            fetchAcademicYears();
            fetchGrades();
            fetchLeaveRequests();
        }
    }, [isLoggedIn, role, fetchLeaveRequests]);

    const columns = [
        {
            title: "STT",
            key: "index",
            width: "5%",
            render: (_: unknown, __: unknown, index: number) => index + 1,
        },
        {
            title: "Học sinh",
            dataIndex: "studentName",
            key: "studentName",
        },
        {
            title: "Lớp",
            dataIndex: "className",
            key: "className",
        },
        {
            title: "Thời gian xin nghỉ",
            dataIndex: "timeTableTime",
            key: "timeTableTime",
            render: (time: string) => dayjs(time).format("DD/MM/YYYY HH:mm"),
        },
        {
            title: "Lý do",
            dataIndex: "reason",
            key: "reason",
        },
        {
            title: "Trạng thái",
            dataIndex: "status",
            key: "status",
            render: (status: string) => (
                <Tag color={status === "TRUE" ? "green" : "red"}>
                    {status === "TRUE" ? "Đã duyệt" : "Chưa duyệt"}
                </Tag>
            ),
        },
    ];

    if (!isLoggedIn || role !== "ADMIN") {
        return <ForbiddenScreen />;
    }

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-blue-600 pb-2 border-b-2 border-blue-600 mb-4">
                Danh sách đơn xin nghỉ
            </h1>

            <Card className="mb-6 shadow-lg rounded-xl border border-indigo-100">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600">Niên khóa</label>
                        <Select
                            className="w-full"
                            placeholder="Chọn niên khóa"
                            onChange={setSelectedAcademicYear}
                            allowClear
                        >
                            {academicYears.map((year) => (
                                <Option key={year.id} value={year.id}>
                                    {year.year}
                                    {year.timeStatus === "NOW" && (
                                        <Tag color="blue" className="ml-2">Hiện tại</Tag>
                                    )}
                                </Option>
                            ))}
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-600">Khối</label>
                        <Select
                            className="w-full"
                            placeholder="Chọn khối"
                            onChange={setSelectedGrade}
                            allowClear
                        >
                            {grades.map((grade) => (
                                <Option key={grade.id} value={grade.id}>
                                    {grade.name}
                                </Option>
                            ))}
                        </Select>
                    </div>
                </div>
            </Card>

            <Table
                dataSource={leaveRequests}
                columns={columns}
                loading={loading}
                rowKey="id"
                className="mb-4 overflow-x-auto"
                rowClassName="hover:bg-gray-50"
            />
        </div>
    );
};

export default AdminLeaveRequestListScreen;