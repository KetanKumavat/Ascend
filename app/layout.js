import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./../components/header";
import Footer from "./../components/footer";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Toaster } from "@/components/ui/sonner";
// const space = Space_Grotesk({ subsets: ["latin"] });
import PageWrapper from "@/components/landing-wrapper";
const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    manifest: "/manifest.json",
    title: "Ascend | Collaborative Project Management App",
    description:
        "Elevate your team's productivity with Ascend—a collaborative project management app designed to streamline workflows, enhance communication, and drive success. Get things done together, effortlessly!",
};

const customDarkTheme = {
    baseTheme: dark,
    variables: {
        colorPrimary: "#3a3a3a",
        colorText: "#e5e5e5",
        colorBackground: "#0d0d0d",
        colorInputBackground: "#2a2a2a",
        colorInputText: "#f2f2f2",
        colorButtonBackground: "transparent",
        colorButtonText: "#ffffff",
        colorButtonHoverBackground: "#3a3a3a",
        colorButtonHoverText: "#ffffff",
    },
    elements: {
        card: {
            backgroundColor: "#1f1f1f",
            borderColor: "#2b2b2b",
            borderRadius: "10px",
            boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
            padding: "16px",
        },
        input: {
            backgroundColor: "#2a2a2a",
            color: "#f2f2f2",
            borderColor: "#3b3b3b",
            borderRadius: "6px",
            padding: "10px",
            transition: "border-color 0.3s ease, background-color 0.3s ease",
            hover: {
                borderColor: "#606060",
            },
        },
        button: {
            color: "#ffffff",
            padding: "5px 10px",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
            transition: "background-color 0.3s ease, transform 0.2s",

            hover: {
                backgroundColor: "#3a3a3a",
                transform: "scale(1.03)",
            },
        },

        link: {
            color: "#d4af37",
            transition: "color 0.3s ease",
            hover: {
                color: "#ffdb58",
            },
        },
    },
};

export default function RootLayout({ children }) {
    return (
        <ClerkProvider appearance={{ baseTheme: customDarkTheme }}>
            <html lang="en" className="dark" suppressHydrationWarning={true}>
                <body
                    className={`${inter.className} antialiased  flex flex-col mt-24 min-h-screen`}
                >
                    {/* <ThemeProvider attribute="class" defaultTheme="system" enableSystem> */}
                    <Header />
                    <PageWrapper>{children}</PageWrapper>
                    <Footer />
                    {/* </ThemeProvider> */}
                    <Toaster />
                </body>
            </html>
        </ClerkProvider>
    );
}
