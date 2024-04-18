"use client";

import { store } from "@/redux/store";
import { Provider } from "react-redux";
import { ThemeProvider } from "next-themes";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider
        attribute="class"
        defaultTheme={"light"}
        themes={["light", "dark"]}
      >
        {children}
      </ThemeProvider>
    </Provider>
  );
}
