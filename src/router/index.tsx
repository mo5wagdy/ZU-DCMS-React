import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";

import Landing from "@/pages/public/Landing";
import Unauthorized from "@/pages/public/Unauthorized";
import NotFoundPage from "@/pages/public/NotFoundPage";

import PatientLogin from "@/pages/auth/PatientLogin";
import StaffLogin from "@/pages/auth/StaffLogin";
import Register from "@/pages/auth/Register";
import ForgotPhone from "@/pages/auth/ForgotPhone";

import PatientDashboard from "@/pages/patient/PatientDashboard";
import PatientProfile from "@/pages/patient/PatientProfile";
import BookNew from "@/pages/patient/BookNew";
import BookFollowup from "@/pages/patient/BookFollowup";
import MyBookings from "@/pages/patient/MyBookings";

import InternDashboard from "@/pages/intern/InternDashboard";
import SessionPatients from "@/pages/intern/SessionPatients";
import DiagnosePatient from "@/pages/intern/DiagnosePatient";

import StudentDashboard from "@/pages/student/StudentDashboard";
import MyCases from "@/pages/student/MyCases";
import CaseDetail from "@/pages/student/CaseDetail";
import StudentProgress from "@/pages/student/StudentProgress";

import TADashboard from "@/pages/ta/TADashboard";
import ReviewCase from "@/pages/ta/ReviewCase";

import AdminDashboard from "@/pages/admin/AdminDashboard";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminTerms from "@/pages/admin/AdminTerms";
import AdminConfigs from "@/pages/admin/AdminConfigs";
import AdminRequirements from "@/pages/admin/AdminRequirements";
import AdminUserDetail from "@/pages/admin/AdminUserDetail";

import ViewDashboard from "@/pages/view/ViewDashboard";
import ViewStudents from "@/pages/view/ViewStudents";
import ViewStudentDetail from "@/pages/view/ViewStudentDetail";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <Landing /> },
      { path: "auth/login", element: <PatientLogin /> },
      { path: "auth/staff-login", element: <StaffLogin /> },
      { path: "auth/register", element: <Register /> },
      { path: "auth/forgot-phone", element: <ForgotPhone /> },
      { path: "unauthorized", element: <Unauthorized /> },

      // Patient
      {
        element: <ProtectedRoute allowedRoles={["Patient"]} />,
        children: [
          { path: "patient/dashboard", element: <PatientDashboard /> },
          { path: "patient/profile", element: <PatientProfile /> },
          { path: "patient/bookings", element: <MyBookings /> },
          { path: "booking/new", element: <BookNew /> },
          { path: "booking/followup", element: <BookFollowup /> },
        ],
      },

      // Intern
      {
        element: <ProtectedRoute allowedRoles={["InternDoctor", "Admin"]} />,
        children: [
          { path: "intern/dashboard", element: <InternDashboard /> },
          { path: "intern/session/:sessionId", element: <SessionPatients /> },
          { path: "intern/diagnose/:bookingId", element: <DiagnosePatient /> },
        ],
      },

      // Student
      {
        element: <ProtectedRoute allowedRoles={["Student"]} />,
        children: [
          { path: "student/dashboard", element: <StudentDashboard /> },
          { path: "student/cases", element: <MyCases /> },
          { path: "student/case/:id", element: <CaseDetail /> },
          { path: "student/progress", element: <StudentProgress /> },
        ],
      },

      // TA
      {
        element: <ProtectedRoute allowedRoles={["TeachingAssistant"]} />,
        children: [
          { path: "ta/dashboard", element: <TADashboard /> },
          { path: "ta/review/:caseId", element: <ReviewCase /> },
        ],
      },

      // View-only (Dean / ViceDean / Professor / Admin)
      {
        element: (
          <ProtectedRoute
            allowedRoles={["Dean", "ViceDean", "Professor", "Admin"]}
          />
        ),
        children: [
          { path: "view/dashboard", element: <ViewDashboard /> },
          { path: "view/students", element: <ViewStudents /> },
          { path: "view/student/:id", element: <ViewStudentDetail /> },
        ],
      },

      // Admin
      {
        element: <ProtectedRoute allowedRoles={["Admin"]} />,
        children: [
          { path: "admin/dashboard", element: <AdminDashboard /> },
          { path: "admin/users", element: <AdminUsers /> },
          { path: "admin/users/:id", element: <AdminUserDetail /> },
          { path: "admin/terms", element: <AdminTerms /> },
          { path: "admin/configs", element: <AdminConfigs /> },
          { path: "admin/requirements", element: <AdminRequirements /> },
        ],
      },

      // Legacy /index → /
      { path: "index", element: <Navigate to="/" replace /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
