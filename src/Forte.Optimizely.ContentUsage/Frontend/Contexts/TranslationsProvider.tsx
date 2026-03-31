import React, { createContext, useContext } from "react";
import { translations } from "./../translations";

const TranslationsContext = createContext<typeof translations>(translations);

interface TranslationsProviderProps {
  children?: React.ReactNode;
}

const TranslationsProvider = ({ children }: TranslationsProviderProps) => {
  return (
    <TranslationsContext.Provider value={translations}>
      {children}
    </TranslationsContext.Provider>
  );
};

export default TranslationsProvider;

export function useTranslations() {
  return useContext(TranslationsContext);
}
