import { Suspense } from "react";
import { useRoutes, Routes, Route, BrowserRouter } from "react-router-dom";
import Home from "./components/home";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import CustomSignIn from "./components/auth/CustomSignIn";
import CustomSignUp from "./components/auth/CustomSignUp";
import CustomUserProfile from "./components/auth/CustomUserProfile";
import Dashboard from "./components/dashboard/Dashboard";
import SuccessPage from "./components/success/SuccessPage";
import PricingPage from "./components/pricing/PricingPage";
import { Toaster } from "@/components/ui/toaster";
import routes from "tempo-routes";

function App() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sign-in/*" element={<CustomSignIn />} />
          <Route path="/sign-up/*" element={<CustomSignUp />} />
          <Route path="/user-profile/*" element={<CustomUserProfile />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
        <Toaster />
        {import.meta.env.VITE_TEMPO === "true" && useRoutes(routes)}
      </>
    </Suspense>
  );
}

export default App;