import { lazy } from "react";
import { Routes, Route, createBrowserRouter } from "react-router-dom";
import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import EnrollScreen from "../screens/EnrollScreen";
import EnrollListScreen from "../screens/EnrollListScreen";
import StudyGradesScreen from "../screens/StudyGradesScreen";
import EnrollDetailScreen from "../screens/EnrollDetailScreen";
import StudyAttendanceScreen from "../screens/StudyAttendanceScreen";
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
            path="/study-grades"
            element={
              <ProtectedRoute allowedRoles={["PARENT", "STUDENT"]}>
                <StudyGradesScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/study-attendance"
            element={
              <ProtectedRoute allowedRoles={["PARENT", "STUDENT"]}>
                <StudyAttendanceScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/classes/:id"
            element={
              <ProtectedRoute allowedRoles={["CATECHIST"]}>
                <StudentListScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/classes"
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
            path="/catechist-grade/:classId"
            element={
              <ProtectedRoute allowedRoles={["CATECHIST"]}>
                <CatechistClassGradeScreen />
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
            path="/user-list"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminUserListScreen />
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
        </Routes>
      </Layout>
    ),
  },
  {
    path: "/login",
    element: <LoginScreen />,
  },
]);
