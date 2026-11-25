import { Calendar, Headphones, Home, CheckCircle2, ArrowRight } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      number: '1',
      icon: Calendar,
      title: 'Book a Service',
      description: 'Contact us or request your required home service online in under a minute.',
    },
    {
      number: '2',
      icon: Headphones,
      title: 'We Confirm',
      description: 'Our team will call to confirm your diagnosis details and schedule a convenient time.',
    },
    {
      number: '3',
      icon: Home,
      title: 'Get It Done',
      description: 'Our certified expert arrives at your doorstep equipped to complete the job cleanly.',
    },
    {
      number: '4',
      icon: CheckCircle2,
      title: "You're All Set",
      description: 'Enjoy hassle-free operation, tested results, and reliable ongoing support.',
    },
  ];

  return (
    <section className="py-6 sm:py-10 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#1c71cd] mb-1.5 inline-block font-nav">
            PROCESS
          </span>
          <h2 className="text-[24px] sm:text-[32px] font-semibold text-[#101820] tracking-tight mb-2.5 font-heading">
            How It Works
          </h2>
          <p className="text-xs sm:text-sm text-[#667085] leading-relaxed font-body">
            Getting the right home service is simple, transparent, and quick.
          </p>
        </div>

        {/* 4 Steps in Boxes */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isLast = index === steps.length - 1;

            return (
              <div
                key={index}
                className="bg-[#F8FAFC] border border-gray-100 rounded-xl sm:rounded-2xl p-3 sm:p-5 lg:p-6 flex flex-col items-center text-center relative group hover:bg-white hover:border-[#1c71cd]/30 hover:shadow-md transition-all duration-300 h-full"
              >
                {/* Step Icon Badge */}
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-white text-[#1c71cd] flex items-center justify-center mb-2.5 sm:mb-4 relative z-10 group-hover:bg-[#1c71cd] group-hover:text-white transition-colors duration-300 shadow-xs border border-gray-100">
                  <Icon className="w-4 h-4 sm:w-5.5 sm:h-5.5 stroke-[2]" />
                </div>

                <h3 className="text-xs sm:text-sm lg:text-[15px] font-semibold text-[#101820] mb-1 sm:mb-2 tracking-tight font-heading leading-tight whitespace-nowrap">
                  {step.title}
                </h3>
                <p className="text-[10px] sm:text-xs text-[#667085] leading-snug sm:leading-relaxed max-w-xs font-body">
                  {step.description}
                </p>

                {/* Connecting Arrow between Boxes (no background) */}
                {!isLast && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 -translate-y-1/2 translate-x-1/2 z-20 text-gray-300 pointer-events-none group-hover:text-[#1c71cd] transition-colors">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
