import { createContext, useContext, ReactNode } from "react";

interface RTLContextType {
  isRTL: boolean;
  direction: "rtl" | "ltr";
}

const RTLContext = createContext<RTLContextType>({
  isRTL: true,
  direction: "rtl",
});

export const useRTL = () => useContext(RTLContext);

interface RTLProviderProps {
  children: ReactNode;
  direction?: "rtl" | "ltr";
}

export function RTLProvider({ children, direction = "rtl" }: RTLProviderProps) {
  const isRTL = direction === "rtl";

  return (
    <RTLContext.Provider value={{ isRTL, direction }}>
      <div dir={direction} className={`text-${isRTL ? "end" : "start"}`}>
        {children}
      </div>
    </RTLContext.Provider>
  );
}

// Utility hook for conditional RTL classes
export function useRTLClasses() {
  const { isRTL } = useRTL();

  return {
    // Margin utilities
    ms: (size: string) => (isRTL ? `me-${size}` : `ms-${size}`),
    me: (size: string) => (isRTL ? `ms-${size}` : `me-${size}`),

    // Padding utilities
    ps: (size: string) => (isRTL ? `pe-${size}` : `ps-${size}`),
    pe: (size: string) => (isRTL ? `ps-${size}` : `pe-${size}`),

    // Text alignment
    textStart: isRTL ? "text-end" : "text-start",
    textEnd: isRTL ? "text-start" : "text-end",

    // Float utilities
    floatStart: isRTL ? "float-right" : "float-left",
    floatEnd: isRTL ? "float-left" : "float-right",

    // Border radius
    roundedStart: isRTL ? "rounded-e" : "rounded-s",
    roundedEnd: isRTL ? "rounded-s" : "rounded-e",
  };
}
