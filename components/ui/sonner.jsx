"use client";
import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";

const Toaster = ({ ...props }) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-neutral-900 group-[.toaster]:text-white group-[.toaster]:border-lime-500 group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-neutral-400",
          actionButton:
            "group-[.toast]:bg-lime-500 group-[.toast]:text-black hover:bg-lime-600 transition-all duration-200",
          cancelButton:
            "group-[.toast]:bg-neutral-700 group-[.toast]:text-neutral-200 hover:bg-neutral-600 transition-all duration-300",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
