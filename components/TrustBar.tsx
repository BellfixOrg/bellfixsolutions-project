import { UserCheck, Zap, ShieldCheck, Home } from 'lucide-react';

export default function TrustBar() {
  const items = [
    {
      icon: UserCheck,
      title: 'Expert Technicians',
    },
    {
      icon: Zap,
      title: 'Quick Service',
    },
    {
      icon: ShieldCheck,
      title: 'Quality Assurance',
    },
    {
      icon: Home,
      title: 'At Your Doorstep',
    },
  ];

  return (
    <div className="bg-[#F5F8FA] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="flex items-center justify-center gap-2.5 text-center sm:text-left py-1"
              >
                <div className="text-[#1c71cd] shrink-0">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-[#101820] tracking-tight">
                  {item.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
