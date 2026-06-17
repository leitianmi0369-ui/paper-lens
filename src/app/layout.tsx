import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { Toaster } from "react-hot-toast";
import { Sparkles } from "lucide-react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PaperLens - 人文社科论文阅读助手",
  description: "AI驱动的智能论文阅读工具，支持中英文翻译、大纲生成、思维导图、案例理论提取",
};

// PaperLens Logo - 放大镜与文档
function PaperLensLogo({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M4 3C4 1.89543 4.89543 1 6 1H17L23 7V26C23 27.1046 22.1046 28 21 28H6C4.89543 28 4 27.1046 4 26V3Z" fill="currentColor" fillOpacity="0.9" />
      <path d="M17 1L23 7H19C17.8954 7 17 6.10457 17 5V1Z" fill="currentColor" fillOpacity="0.6" />
      <line x1="7" y1="11" x2="16" y2="11" stroke="white" strokeOpacity="0.6" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="7" y1="15" x2="14" y2="15" stroke="white" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="7" y1="19" x2="15" y2="19" stroke="white" strokeOpacity="0.4" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="24" cy="22" r="6" stroke="currentColor" strokeWidth="2" fill="none" />
      <line x1="28.5" y1="26.5" x2="31" y2="29" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#FFFBF5]">
        {/* Navigation */}
        <nav className="bg-white/90 backdrop-blur-sm border-b border-[#E8D5C4] sticky top-0 z-50">
          <div className="container mx-auto px-6">
            <div className="flex items-center justify-between h-16">
              <Link href="/" className="flex items-center gap-3">
                <div className="p-2 bg-[#C54B3C] rounded-lg">
                  <PaperLensLogo className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-[#2D2A26] tracking-tight">
                  Paper<span className="text-[#C54B3C]">Lens</span>
                </span>
              </Link>
              <div className="flex items-center gap-6">
                <Link href="/" className="text-[#6B5B4E] hover:text-[#C54B3C] transition-colors font-medium text-sm">
                  首页
                </Link>
                <Link
                  href="/upload"
                  className="flex items-center gap-2 bg-[#C54B3C] text-white px-5 py-2.5 rounded-lg hover:bg-[#A63D30] transition-colors text-sm font-medium"
                >
                  <Sparkles className="h-4 w-4" />
                  上传论文
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer className="bg-[#2D2A26] text-[#D4C5B5] py-10">
          <div className="container mx-auto px-6">
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#C54B3C] rounded-md">
                  <PaperLensLogo className="h-4 w-4 text-white" />
                </div>
                <span className="font-semibold text-white">PaperLens</span>
              </div>
              <p className="text-sm text-[#A89888]">
                博学之，审问之，慎思之，明辨之，笃行之
              </p>
              <p className="text-xs text-[#8B7B6B]">
                by 宇宙第一无敌爆好命小女孩（Emily_0369）｜未名湖是个海洋
              </p>
            </div>
          </div>
        </footer>

        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#2D2A26',
              color: '#F5F0EB',
              borderRadius: '8px',
              fontSize: '14px',
            },
          }}
        />
      </body>
    </html>
  );
}
