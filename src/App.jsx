import { Routes, Route, Navigate } from "react-router-dom";
import { AppShell } from "./components/layout/AppShell";
import { RequireAuth, RequirePermission } from "./components/layout/RouteGuards";

import LoginPage from "./pages/auth/LoginPage";
import DocsPage from "./pages/DocsPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import ExecutivePage from "./pages/dashboard/ExecutivePage";
import MyWorkPage from "./pages/dashboard/MyWorkPage";
import TasksPage from "./pages/tasks/TasksPage";
import KpisPage from "./pages/kpis/KpisPage";
import StrategyPage from "./pages/strategy/StrategyPage";
import ReportsPage from "./pages/reports/ReportsPage";
import MeetingsPage from "./pages/meetings/MeetingsPage";
import NotificationsPage from "./pages/notifications/NotificationsPage";
import CompanyPage from "./pages/company/CompanyPage";
import ProfilePage from "./pages/profile/ProfilePage";
import FinancePage from "./pages/finance/FinancePage";
import FoundersPage from "./pages/founders/FoundersPage";
import GovernancePage from "./pages/governance/GovernancePage";
import ApprovalsPage from "./pages/governance/ApprovalsPage";
import RiskPage from "./pages/governance/RiskPage";
import GrowthPage from "./pages/growth/GrowthPage";
import PartnershipsPage from "./pages/growth/PartnershipsPage";
import MarketingPage from "./pages/marketing/MarketingPage";
import BrandPage from "./pages/marketing/BrandPage";
import CampaignsPage from "./pages/marketing/CampaignsPage";
import ProductPage from "./pages/product/ProductPage";
import TechnologyPage from "./pages/product/TechnologyPage";
import RoadmapPage from "./pages/product/RoadmapPage";
import EngineeringPage from "./pages/product/EngineeringPage";
import OperationsPage from "./pages/operations/OperationsPage";
import LegalPage from "./pages/operations/LegalPage";
import CompliancePage from "./pages/operations/CompliancePage";
import ProcessesPage from "./pages/operations/ProcessesPage";
import NetworkPage from "./pages/network/NetworkPage";
import RelationshipsPage from "./pages/network/RelationshipsPage";
import NotFoundPage from "./pages/NotFoundPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/docs" element={<DocsPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/my-work" element={<MyWorkPage />} />

          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/kpis" element={<KpisPage />} />
          <Route path="/strategy" element={<StrategyPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/meetings" element={<MeetingsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/company" element={<CompanyPage />} />
          <Route path="/profile" element={<ProfilePage />} />

          {/* Executive & governance */}
          <Route
            path="/executive"
            element={
              <RequirePermission permission="executive.view">
                <ExecutivePage />
              </RequirePermission>
            }
          />
          <Route
            path="/finance"
            element={
              <RequirePermission permission="finance.view">
                <FinancePage />
              </RequirePermission>
            }
          />
          <Route
            path="/founders"
            element={
              <RequirePermission permission="founders.view">
                <FoundersPage />
              </RequirePermission>
            }
          />
          <Route
            path="/governance"
            element={
              <RequirePermission permission="governance.view">
                <GovernancePage />
              </RequirePermission>
            }
          />
          <Route
            path="/approvals"
            element={
              <RequirePermission permission="approvals.manage">
                <ApprovalsPage />
              </RequirePermission>
            }
          />
          <Route
            path="/risk"
            element={
              <RequirePermission permission="risk.manage">
                <RiskPage />
              </RequirePermission>
            }
          />

          {/* Strategy & growth */}
          <Route
            path="/growth"
            element={
              <RequirePermission permission="growth.view">
                <GrowthPage />
              </RequirePermission>
            }
          />
          <Route
            path="/partnerships"
            element={
              <RequirePermission permission="partnerships.view">
                <PartnershipsPage />
              </RequirePermission>
            }
          />

          {/* Marketing */}
          <Route
            path="/marketing"
            element={
              <RequirePermission permission="marketing.view">
                <MarketingPage />
              </RequirePermission>
            }
          />
          <Route
            path="/brand"
            element={
              <RequirePermission permission="marketing.view">
                <BrandPage />
              </RequirePermission>
            }
          />
          <Route
            path="/campaigns"
            element={
              <RequirePermission permission="marketing.view">
                <CampaignsPage />
              </RequirePermission>
            }
          />

          {/* Product & technology */}
          <Route
            path="/product"
            element={
              <RequirePermission permission="product.view">
                <ProductPage />
              </RequirePermission>
            }
          />
          <Route
            path="/technology"
            element={
              <RequirePermission permission="technology.view">
                <TechnologyPage />
              </RequirePermission>
            }
          />
          <Route
            path="/roadmap"
            element={
              <RequirePermission permission="product.view">
                <RoadmapPage />
              </RequirePermission>
            }
          />
          <Route
            path="/engineering"
            element={
              <RequirePermission permission="technology.view">
                <EngineeringPage />
              </RequirePermission>
            }
          />

          {/* Operations & legal */}
          <Route
            path="/operations"
            element={
              <RequirePermission permission="operations.view">
                <OperationsPage />
              </RequirePermission>
            }
          />
          <Route
            path="/legal"
            element={
              <RequirePermission permission="legal.view">
                <LegalPage />
              </RequirePermission>
            }
          />
          <Route
            path="/compliance"
            element={
              <RequirePermission permission="legal.view">
                <CompliancePage />
              </RequirePermission>
            }
          />
          <Route
            path="/processes"
            element={
              <RequirePermission permission="operations.view">
                <ProcessesPage />
              </RequirePermission>
            }
          />

          {/* Network */}
          <Route
            path="/network"
            element={
              <RequirePermission permission="network.view">
                <NetworkPage />
              </RequirePermission>
            }
          />
          <Route
            path="/relationships"
            element={
              <RequirePermission permission="network.view">
                <RelationshipsPage />
              </RequirePermission>
            }
          />

          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
