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
    <div className="bg-transparent sm:bg-[#F8FAFC] py-4 sm:py-7 border-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4 lg:gap-6">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="bg-[#F8FAFC] sm:bg-white rounded-xl sm:rounded-2xl border-none p-3 sm:p-4 shadow-none sm:shadow-[0_2px_6px_rgba(0,0,0,0.03)] flex items-center justify-start gap-2.5 sm:gap-3 transition-all hover:shadow-md"
              >
                <div className="text-[#1c71cd] shrink-0">
                  <Icon className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className="text-xs sm:text-sm font-bold text-[#101820] tracking-tight leading-tight">
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
