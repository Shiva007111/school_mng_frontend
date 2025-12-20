import { Users, BookOpen, Calendar, BarChart3 } from 'lucide-react';

const features = [
  {
    name: 'Student Management',
    description: 'Track attendance, grades, and behavioral records in one secure place.',
    icon: Users,
  },
  {
    name: 'Academic Planning',
    description: 'Create schedules, manage curriculum, and track lesson progress effortlessly.',
    icon: BookOpen,
  },
  {
    name: 'Smart Scheduling',
    description: 'Automated timetable generation that resolves conflicts instantly.',
    icon: Calendar,
  },
  {
    name: 'Advanced Analytics',
    description: 'Gain insights into school performance with detailed reports and dashboards.',
    icon: BarChart3,
  },
];

export const Features = () => {
  return (
    <div className="py-12 bg-gray-50" id="features">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Features</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need to run your school
          </p>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            A complete suite of tools designed to simplify school administration and improve the educational experience.
          </p>
        </div>

        <div className="mt-10">
          <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
            {features.map((feature) => (
              <div key={feature.name} className="relative">
                <dt>
                  <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                    <feature.icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.name}</p>
                </dt>
                <dd className="mt-2 ml-16 text-base text-gray-500">{feature.description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
};
