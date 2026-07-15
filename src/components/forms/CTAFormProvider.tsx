"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { AnimatePresence, motion } from "framer-motion";
import FreeQuoteForm from "./FreeQuoteForm";
import ShowroomVisitForm from "./ShowroomVisitForm";
import { lockScroll, unlockScroll } from "@/lib/scroll-lock";

type FormType = "quote" | "showroom";

interface CTAFormContextValue {
  activeForm: FormType | null;
  openFreeQuoteForm: () => void;
  openShowroomVisitForm: () => void;
  closeForm: () => void;
}

const CTAFormContext = createContext<CTAFormContextValue>({
  activeForm: null,
  openFreeQuoteForm: () => {},
  openShowroomVisitForm: () => {},
  closeForm: () => {},
});

export function useCTAForms() {
  return useContext(CTAFormContext);
}

export function CTAFormProvider({ children }: { children: React.ReactNode }) {
  const [activeForm, setActiveForm] = useState<FormType | null>(null);

  const openFreeQuoteForm = useCallback(() => setActiveForm("quote"), []);
  const openShowroomVisitForm = useCallback(() => setActiveForm("showroom"), []);
  const closeForm = useCallback(() => setActiveForm(null), []);

  // Lock body scroll while a drawer is open, via the shared ref-counted helper.
  // On touch devices this uses the position:fixed technique so iOS Safari does
  // not scroll the background behind the drawer.
  useEffect(() => {
    if (!activeForm) return;
    lockScroll();
    return () => unlockScroll();
  }, [activeForm]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeForm();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closeForm]);

  return (
    <CTAFormContext.Provider
      value={{ activeForm, openFreeQuoteForm, openShowroomVisitForm, closeForm }}
    >
      {children}
      <AnimatePresence>
        {activeForm && (
          <div key="cta-modal" className="fixed inset-0 z-[200] flex">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
              onClick={closeForm}
              aria-hidden="true"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
              role="dialog"
              aria-modal="true"
              aria-label={
                activeForm === "quote" ? "Get a Free Quote" : "Book Showroom Visit"
              }
              className="relative ml-auto w-full md:w-[600px] lg:w-[640px] h-full bg-white flex flex-col shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {activeForm === "quote" ? (
                <FreeQuoteForm onClose={closeForm} />
              ) : (
                <ShowroomVisitForm onClose={closeForm} />
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </CTAFormContext.Provider>
  );
}
