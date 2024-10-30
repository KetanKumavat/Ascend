import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./../components/theme-provider";
import Header from "./../components/header";
import Footer from "./../components/footer";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
const space = Space_Grotesk({ subsets: ["latin"] });

export const metadata = {
  title: "Ascend",
  description:
    "Elevate your team's productivity with Ascend—a collaborative project management app designed to streamline workflows, enhance communication, and drive success. Get things done together, effortlessly!",
};

const customDarkTheme = {
  baseTheme: dark,
  variables: {
    colorPrimary: "#3a3a3a", // Slightly deeper gray
    colorText: "#e5e5e5", // Softer white for readability
    colorBackground: "#0d0d0d", // Darker background for contrast
    colorInputBackground: "#2a2a2a", // Softer dark gray
    colorInputText: "#f2f2f2",
    colorButtonBackground: "transparent", // Transparent button background
    colorButtonText: "#ffffff",
    colorButtonHoverBackground: "#3a3a3a",
    colorButtonHoverText: "#ffffff",
  },
  elements: {
    card: {
      backgroundColor: "#1f1f1f",
      borderColor: "#2b2b2b",
      borderRadius: "10px", // Rounded corners for a more modern look
      boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)", // Slightly stronger shadow for depth
      padding: "16px", // Add padding for a comfortable layout
    },
    input: {
      backgroundColor: "#2a2a2a",
      color: "#f2f2f2",
      borderColor: "#3b3b3b",
      borderRadius: "6px", // Slightly more rounded
      padding: "10px", // Increase padding for better UX
      transition: "border-color 0.3s ease, background-color 0.3s ease", // Smooth transitions
      hover: {
        borderColor: "#606060",
      },
    },
    button: {
      // backgroundColor: "#2f2f2f",
      color: "#ffffff",
      // borderRadius: "6px",
      padding: "15px 20px", // Add padding for a bolder look
      // boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)", // Light shadow for button depth
      transition: "background-color 0.3s ease, transform 0.2s", // Smooth hover effects

      hover: {
        backgroundColor: "#3a3a3a",
        transform: "scale(1.03)", // Subtle zoom effect on hover
      },
    },
    link: {
      color: "#d4af37", // Gold accent for links
      transition: "color 0.3s ease",
      hover: {
        color: "#ffdb58", // Brighter gold on hover
      },
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider appearance={customDarkTheme}>
      <html lang="en" suppressHydrationWarning>
        <body className={`${space.className}`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange>
            <Header />
            <main className="min-h-screen">{children}</main>
            <Footer />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
