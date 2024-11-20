import { lazy } from "react";
import { Routes, Route, createBrowserRouter } from "react-router-dom";
import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import EnrollScreen from "../screens/EnrollScreen";
import EnrollListScreen from "../screens/EnrollListScreen";
import EnrollDetailScreen from "../screens/EnrollDetailScreen";
import StudentListScreen from "../screens/StudentListScreen";
import AccountDetailScreen from "../screens/AccountDetailScreen";
import AdminUserListScreen from "../screens/AdminUserListScreen";
import AdminClassListScreen from "../screens/AdminClassListScreen";
import AddSyllabusScreen from "../screens/AddSyllabusScreen";
import ListSyllabusScreen from "../screens/ListSyllabusScreen";
import SyllabusDetailScreen from "../screens/SyllabusDetailScreen";
import CatechistClassGradeScreen from "../screens/CatechistClassGradeScreen";
import AdminClassDetailScreen from "../screens/AdminClassDetailScreen";
import CatechistScheduleScreen from "../screens/CatechistScheduleScreen";
import CatechistClassList from "../screens/CatechistClassList";
import StudentScheduleScreen from "../screens/StudentScheduleScreen";
import PolicyListScreen from "../screens/PolicyListScreen";
import AdminPostScreen from "../screens/AdminPostScreen";
import CatechistAttendanceScreen from "../screens/CatechistAttendanceScreen";
import TransactionHistoryScreen from "../screens/TransactionHistoryScreen";
import UserTransactionHistoryScreen from "../screens/UserTransactionHistoryScreen";
import AddPolicyScreen from "../screens/AddPolicyScreen";
import ParentScheduleScreen from "../screens/ParentScheduleScreen";
import ParentTransactionScreen from "../screens/ParentTransactionScreen";
import AdminStudentList from "../screens/AdminStudentList";
import ParentGradesProgressScreen from "../screens/ParentGradesProgressScreen";
import StudentGradesProgressScreen from "../screens/StudentGradesProgressScreen";
import ParentAttendanceProgressScreen from "../screens/ParentAttendanceProgressScreen";
import StudentAttendanceProgressScreen from "../screens/StudentAttendanceProgressScreen";
import  PostDetail  from "../screens/PostDetailScreen";
import AdminDashboardScreen from "../screens/AdminDashboardScreen";
import AdminCatechistListScreen from "../screens/AdminCatechistListScreen";
import StudentTransactionScreen from "../screens/StudentTransactionScreen";
import CatechistLeaveRequestListScreen from "../screens/CatechistLeaveRequestListScreen";
import ParentLeaveRequestListScreen from "../screens/ParentLeaveRequestListScreen";
import AdminLeaveRequestListScreen from "../screens/AdminLeaveRequestListScreen";
import AdminUserDetailScreen from "../screens/AdminUserDetailScreen";
import AdminGradeLeaderScreen from "../screens/AdminGradeLeaderScreen";
import AdminCertificateListScreen from "../screens/AdminCertificateListScreen";
import ParentCertificateListScreen from "../screens/ParentCertificateListScreen";
import StudentCertificateListScreen from "../screens/StudentCertificateListScreen";
import StudentExamScheduleScreen from "../screens/StudentExamScheduleScreen";
import ParentExamScheduleScreen from "../screens/ParentExamScheduleScreen";
import CatechistExamScheduleScreen from "../screens/CatechistExamScheduleScreen";
import AdminScheduleMapScreen from "../screens/AdminScheduleMapScreen";

const Layout = lazy(() => import("../components/MainLayout"));
const ProtectedRoute = lazy(() => import("../utils/ProtectedRoute"));

export const AppRoutes = createBrowserRouter([
  {
    path: "*",
    element: (
      <Layout>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute
                allowedRoles={[
                  "GUEST",
                  "PARENT",
                  "ADMIN",
                  "STUDENT",
                  "CATECHIST",
                ]}
              >
                <HomeScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/enroll"
            element={
              <ProtectedRoute allowedRoles={["PARENT", "GUEST"]}>
                <EnrollScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/enroll-list"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <EnrollListScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transaction-history-user"
            element={
              <ProtectedRoute allowedRoles={["PARENT", "STUDENT"]}>
                <UserTransactionHistoryScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent-schedule"
            element={
              <ProtectedRoute allowedRoles={["PARENT"]}>
                <ParentScheduleScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent-schedule-exam"
            element={
              <ProtectedRoute allowedRoles={["PARENT"]}>
                <ParentExamScheduleScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transaction-pay-parent"
            element={
              <ProtectedRoute allowedRoles={["PARENT"]}>
                <ParentTransactionScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/study-grades-parent"
            element={
              <ProtectedRoute allowedRoles={["PARENT"]}>
                <ParentGradesProgressScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/study-attendance-parent"
            element={
              <ProtectedRoute allowedRoles={["PARENT"]}>
                <ParentAttendanceProgressScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leave-requests-parent"
            element={
              <ProtectedRoute allowedRoles={["PARENT"]}>
                <ParentLeaveRequestListScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent-certificate-list"
            element={
              <ProtectedRoute allowedRoles={["PARENT"]}>
                <ParentCertificateListScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/classes-catechist/:classId"
            element={
              <ProtectedRoute allowedRoles={["CATECHIST"]}>
                <StudentListScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/classes-catechist"
            element={
              <ProtectedRoute allowedRoles={["CATECHIST"]}>
                <CatechistClassList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/schedule"
            element={
              <ProtectedRoute allowedRoles={["CATECHIST"]}>
                <CatechistScheduleScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/schedule-exam"
            element={
              <ProtectedRoute allowedRoles={["CATECHIST"]}>
                <CatechistExamScheduleScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/schedule/attendance/:timeTableId"
            element={
              <ProtectedRoute allowedRoles={["CATECHIST"]}>
                <CatechistAttendanceScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/catechist-grade/:classId"
            element={
              <ProtectedRoute allowedRoles={["CATECHIST"]}>
                <CatechistClassGradeScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leave-requests/:timeTableId"
            element={
              <ProtectedRoute allowedRoles={["CATECHIST"]}>
                <CatechistLeaveRequestListScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/enroll-list/:id"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <EnrollDetailScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/post"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminPostScreen />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminDashboardScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute allowedRoles={["PARENT", "STUDENT", "CATECHIST"]}>
                <AccountDetailScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student-schedule"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <StudentScheduleScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student-schedule-exam"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <StudentExamScheduleScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/study-grades"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <StudentGradesProgressScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/study-attendance"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <StudentAttendanceProgressScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transaction-pay-children"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <StudentTransactionScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student-certificate-list"
            element={
              <ProtectedRoute allowedRoles={["STUDENT"]}>
                <StudentCertificateListScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-list"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminUserListScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account/:id"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminUserDetailScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/class-list"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminClassListScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/class/:classId"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminClassDetailScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-syllabus"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AddSyllabusScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/list-syllabus"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <ListSyllabusScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transaction-history"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <TransactionHistoryScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-student-list"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminStudentList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/assign-schedule"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminScheduleMapScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/certificate-list"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminCertificateListScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/grade-leader-list"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminGradeLeaderScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin-catechist-list"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminCatechistListScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leave-request-history"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminLeaveRequestListScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/syllabus-detail/:id"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <SyllabusDetailScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/policy-list"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <PolicyListScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/add-policy"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AddPolicyScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/post/:id"
            element={
              <ProtectedRoute
                allowedRoles={["GUEST", "PARENT", "STUDENT", "CATECHIST"]}
              >
                <PostDetail />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Layout>
    ),
  },
  {
    path: "/login",
    element: <LoginScreen />,
  },
]);
