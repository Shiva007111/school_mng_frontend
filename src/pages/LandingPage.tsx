import { Navbar } from '@/components/landing/Navbar';
import { Hero } from '@/components/landing/Hero';
import './LandingPage.css';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0b1b35]">
      <Navbar />
      <Hero />
    </div>
  );
}
