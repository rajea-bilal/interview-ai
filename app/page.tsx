// This will be your new landing page
import Link from 'next/link'
import Image from 'next/image'

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-[#c5c4c4] via-[#E2C2A4] to-[#c5c4c4]">
      <div className="p-2 text-center gap-10 flex flex-col items-center justify-center">
        {/* Logo/Header Image */}
        <Link href="/">
        <Image
          src="/interview-logo.png"
          alt="InterviewAI Logo"
          width={700}
          height={700}
          className='w-[400px] md:w-[500px] lg:w-[700px] h-auto'
          priority
        />
        </Link>
        
      
        
        {/* Description */}
        <div className="flex flex-col items-center justify-center gap-8">
        <p className="text-stone-600/90 text-xl md:text-2xl lg:text-3xl max-w-xl md:max-w-2xl md:leading-relaxed lg:leading-relaxed lg:max-w-3xl mx-auto ">
          Practice your technical interviews with our AI-powered interviewer. 
          Get real-time feedback and improve your skills.
        </p>
        
        {/* CTA Button */}
        <Link 
          href="/interview"
          className="inline-block px-8 py-4 text-lg md:text-xl font-semibold text-orange-100 bg-orange-600/50 rounded-lg hover:bg-orange-500/50 transition-colors duration-200"
        >
          Start Interview
        </Link>

        </div>
      </div>
    </main>
  )
}
