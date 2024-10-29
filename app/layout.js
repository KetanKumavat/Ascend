import { Space_Grotesk } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./../components/theme-provider";
import Header from "./../components/header";
import Footer from "./../components/footer";

const space = Space_Grotesk({ subsets: ["latin"] });

export const metadata = {
  title: "Ascend",
  description:
    "Elevate your team's productivity with Ascend—a collaborative project management app designed to streamline workflows, enhance communication, and drive success. Get things done together, effortlessly!",
};

export default function RootLayout({ children }) {
  return (
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
  );
}
