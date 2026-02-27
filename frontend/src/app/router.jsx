import { createBrowserRouter } from "react-router-dom";
import AppLayout from "../layouts/AppLayout";
import TimelinePage from "../features/timeline/TimelinePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      { index: true, element: <TimelinePage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
    ],
  },
]);
