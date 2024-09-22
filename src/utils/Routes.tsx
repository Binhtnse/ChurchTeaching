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

const Layout = lazy(() => import("../components/MainLayout"));
const ProtectedRoute = lazy(() => import("../utils/ProtectedRoute"));

export const AppRoutes = createBrowserRouter([
  {
    path: "*",
    element: (
      <Layout>
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route
            path="/enroll"
            element={
              <ProtectedRoute allowedRoles={["PARENT"]}>
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
            path="/student-list"
            element={
              <ProtectedRoute allowedRoles={["CATECHIST"]}>
                <StudentListScreen />
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
        </Routes>
      </Layout>
    ),
  },
  {
    path: '/login',
    element: (
      <LoginScreen/>
    )
  }
]);
