// import React from "react"
import AppRoutes from "./routes/AppRoutes";
import { AvatarProvider } from "./contexts/AvatarContext";
import { IncomeProvider } from "./contexts/IncomeContext";

export default function App() {
  return (
    <>
      <AvatarProvider>
        <IncomeProvider>
          <AppRoutes />
        </IncomeProvider>
      </AvatarProvider>
    </>
  );
}
