"use client";

import Image from "next/image";
import ResumeUploader from "../components/ResumeUploader";
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen min-w-full bg-gradient-to-r from-[#c5c4c4] via-[#E2C2A4] to-[#c5c4c4] flex justify-center items-center">
      <div className="w-full p-3">
        <div className="flex justify-center items-center">
          <Link href="/">
            <Image
              src="/interview-logo.png"
              alt="InterviewGPT logo"
              width={300}
              height={75}
            />
          </Link>
        </div>
        <ResumeUploader />
        <div className="flex justify-center items-center mt-4"><p className="text-sm text-stone-600/80">Developed by <Link href="https://www.linkedin.com/in/rajea-bilal/" target="_blank" className="text-stone-600/80 hover:text-zinc-50 transition-colors">Rajea Bilal</Link></p></div>
      </div>
    </main>
  );
}