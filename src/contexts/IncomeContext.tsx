import { createContext, useContext } from "react";
import { useIncomes } from "@/hooks/incomes/useIncomes";

const IncomeContext = createContext<unknown>(null);

export function IncomeProvider({ children }: { children: React.ReactNode }) {
  const income = useIncomes();
  return (
    <IncomeContext.Provider value={income}>
      {children}
    </IncomeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useIncomeContext() {
  return useContext(IncomeContext);
}
