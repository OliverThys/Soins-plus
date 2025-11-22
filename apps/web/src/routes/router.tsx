import { createBrowserRouter, Navigate } from "react-router-dom";
import { PublicLayout } from "../layouts/PublicLayout";
import { UserLayout } from "../layouts/UserLayout";
import { AdminLayout } from "../layouts/AdminLayout";
import { TrainerLayout } from "../layouts/TrainerLayout";
import { HomePage } from "../pages/HomePage";
import { CatalogPage } from "../pages/CatalogPage";
import { TrainingDetailPage } from "../pages/TrainingDetailPage";
import { DashboardPage } from "../pages/DashboardPage";
import { MyTrainingsPage } from "../pages/MyTrainingsPage";
import { SubscriptionPage } from "../pages/SubscriptionPage";
import { AdminTrainingsPage } from "../pages/admin/AdminTrainingsPage";
import { AdminTrainingDetailPage } from "../pages/admin/AdminTrainingDetailPage";
import { AdminContentPage } from "../pages/admin/AdminContentPage";
import { AdminUsersPage } from "../pages/admin/AdminUsersPage";
import { AdminAnalyticsPage } from "../pages/admin/AdminAnalyticsPage";
import { AdminConfigPage } from "../pages/admin/AdminConfigPage";
import { AdminTicketsPage } from "../pages/admin/AdminTicketsPage";
import { TrainerDashboardPage } from "../pages/trainer/TrainerDashboardPage";
import { TrainerTrainingDetailPage } from "../pages/trainer/TrainerTrainingDetailPage";
import { LegalPage } from "../pages/LegalPage";
import { NewsDetailPage } from "../pages/NewsDetailPage";
import { NewsArchivePage } from "../pages/NewsArchivePage";
import { LoginPage } from "../pages/auth/LoginPage";
import { RegisterPage } from "../pages/auth/RegisterPage";
import { RegisterSuccessPage } from "../pages/auth/RegisterSuccessPage";
import { ForgotPasswordPage } from "../pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "../pages/auth/ResetPasswordPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <PublicLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "catalogue", element: <CatalogPage /> },
      { path: "formations/:id", element: <TrainingDetailPage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "inscription/succes", element: <RegisterSuccessPage /> },
      { path: "mot-de-passe-oublie", element: <ForgotPasswordPage /> },
      { path: "reinitialisation-mot-de-passe", element: <ResetPasswordPage /> },
      { path: "legal", element: <LegalPage /> },
      { path: "abonnement", element: <SubscriptionPage /> },
      { path: "actualites", element: <NewsArchivePage /> },
      { path: "actualites/:id", element: <NewsDetailPage /> },
    ],
  },
  {
    path: "/app",
    element: <UserLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "catalogue", element: <CatalogPage /> },
      { path: "mes-formations", element: <MyTrainingsPage /> },
      { path: "abonnement", element: <SubscriptionPage /> },
      { path: "juridique", element: <LegalPage /> },
    ],
  },
  {
    path: "/admin",
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to="formations" replace /> },
      { path: "formations", element: <AdminTrainingsPage /> },
      { path: "formations/:id", element: <AdminTrainingDetailPage /> },
      { path: "contenu", element: <AdminContentPage /> },
      { path: "utilisateurs", element: <AdminUsersPage /> },
      { path: "tickets", element: <AdminTicketsPage /> },
      { path: "analytics", element: <AdminAnalyticsPage /> },
      { path: "configuration", element: <AdminConfigPage /> },
    ],
  },
  {
    path: "/formateur",
    element: <TrainerLayout />,
    children: [
      { index: true, element: <TrainerDashboardPage /> },
      { path: "formations/:id", element: <TrainerTrainingDetailPage /> },
    ],
  },
]);

