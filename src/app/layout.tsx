import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import { TooltipProvider } from "@/client/components/ui/tooltip";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "鍵貸与管理システム",
  description: "鍵の借用・返却を管理するシステム",
};

type Props = React.PropsWithChildren;
const RootLayout: React.FC<Props> = ({ children }: Props) => {
  return (
    <html
      lang="ja"
      className={`h-full antialiased font-sans ${inter.variable} ${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider>{children}</TooltipProvider>
      </body>
    </html>
  );
};

export default RootLayout;
