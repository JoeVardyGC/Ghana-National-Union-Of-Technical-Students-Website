import { Metadata } from 'next';
import ContactClient from '@/components/ContactClient';

export const metadata: Metadata = {
  title: 'Contact Us | GNUTS - Ghana National Union of Technical Students',
  description: 'Get in touch with the National Secretariat of GNUTS. Reach out for student welfare inquiries, scholarship support, innovation programs, or union membership.',
};

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] font-sans">
      
      {/* Page Hero Header - Clean proportional typography */}
      <section className="relative text-white py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-b-4 border-[#D9A000] overflow-hidden bg-gray-900">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('https://res.cloudinary.com/dslngzls6/image/upload/v1787052593/slide1_wghgqa.jpg')` }}
        />
        {/* Semi-transparent Green Overlay (50% Green Opacity) */}
        <div className="absolute inset-0 bg-[#014900]/50 backdrop-brightness-90" />

        <div className="max-w-7xl mx-auto text-center relative z-10 space-y-2">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-md uppercase">
            Contact Us
          </h1>
          <p className="text-gray-100 text-xs sm:text-sm max-w-xl mx-auto font-medium drop-shadow-sm">
            Get in touch with the Ghana National Union of Technical Students National Secretariat
          </p>
        </div>
      </section>

      {/* Main Content Component */}
      <section className="py-6 flex-grow">
        <ContactClient />
      </section>

    </div>
  );
}
