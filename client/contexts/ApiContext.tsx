import React, { createContext, useContext, ReactNode } from "react";
import { Experience, Review, Report, Service } from "@/services/api";

interface ApiContextType {
  // Cached data
  experiences: Experience[];
  reviews: Review[];
  reports: Report[];
  services: Service[];

  // Loading states
  loading: {
    experiences: boolean;
    reviews: boolean;
    reports: boolean;
    services: boolean;
  };

  // Error states
  errors: {
    experiences: string | null;
    reviews: string | null;
    reports: string | null;
    services: string | null;
  };

  // Actions
  refreshExperiences: () => Promise<void>;
  refreshReviews: () => Promise<void>;
  clearCache: () => void;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

interface ApiProviderProps {
  children: ReactNode;
}

export function ApiProvider({ children }: ApiProviderProps) {
  // This would contain the full implementation of API state management
  // For now, we'll use a simplified version that relies on individual hooks

  const contextValue: ApiContextType = {
    experiences: [],
    reviews: [],
    reports: [],
    services: [],
    loading: {
      experiences: false,
      reviews: false,
      reports: false,
      services: false,
    },
    errors: {
      experiences: null,
      reviews: null,
      reports: null,
      services: null,
    },
    refreshExperiences: async () => {},
    refreshReviews: async () => {},
    clearCache: () => {},
  };

  return (
    <ApiContext.Provider value={contextValue}>{children}</ApiContext.Provider>
  );
}

export function useApiContext() {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error("useApiContext must be used within an ApiProvider");
  }
  return context;
}

// Utility hook for optimistic updates
export function useOptimisticUpdate<T>(
  currentData: T[],
  updateFn: (data: T[]) => T[],
) {
  const [optimisticData, setOptimisticData] = React.useState(currentData);

  React.useEffect(() => {
    setOptimisticData(currentData);
  }, [currentData]);

  const update = React.useCallback((updateFunction: (data: T[]) => T[]) => {
    setOptimisticData(updateFunction);
  }, []);

  const revert = React.useCallback(() => {
    setOptimisticData(currentData);
  }, [currentData]);

  return {
    data: optimisticData,
    update,
    revert,
  };
}
