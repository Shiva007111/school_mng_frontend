import { Link } from 'react-router-dom';
import { Button } from '@/components/Button';
import { ArrowRight, CheckCircle } from 'lucide-react';

export const Hero = () => {
  return (
    <div className="relative bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
          <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
            <div className="sm:text-center lg:text-left">
              <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block xl:inline">Manage your school</span>{' '}
                <span className="block text-indigo-600 xl:inline">with confidence</span>
              </h1>
              <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                Streamline administration, enhance communication, and improve learning outcomes with our comprehensive school management platform.
              </p>
              <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                <div className="rounded-md shadow">
                  <Link to="/login">
                    <Button className="w-full flex items-center justify-center px-8 py-3 text-base font-medium md:py-4 md:text-lg md:px-10">
                      Get Started <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-3">
                  <Button variant="secondary" className="w-full flex items-center justify-center px-8 py-3 text-base font-medium md:py-4 md:text-lg md:px-10">
                    Live Demo
                  </Button>
                </div>
              </div>

              <div className="mt-8 border-t border-gray-100 pt-8">
                <p className="text-sm text-gray-500 font-medium uppercase tracking-wide mb-4">Trusted by leading institutions</p>
                <div className="flex gap-4 text-gray-400">
                  <div className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /> <span>500+ Schools</span></div>
                  <div className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /> <span>50k+ Students</span></div>
                  <div className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /> <span>99.9% Uptime</span></div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
        <img
          className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
          src="/hero.png"
          alt="Students learning"
        />
      </div>
    </div>
  );
};
