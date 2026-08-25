'use client';

import { useState } from 'react';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Share2, 
  ArrowRight,
  Sparkles,
  HelpCircle
} from 'lucide-react';

export default function ContactClient() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    institution: '',
    category: 'General Inquiry',
    subject: '',
    message: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessMessage('Thank you for contacting GNUTS. Your message has been received and logged into our executive registry. Our secretariat desk will reach out promptly.');
        setFormData({
          name: '',
          email: '',
          phone: '',
          institution: '',
          category: 'General Inquiry',
          subject: '',
          message: '',
        });
      } else {
        setErrorMessage(data.error || 'Failed to submit your message. Please verify your details or try calling our desk directly.');
      }
    } catch (err) {
      setErrorMessage('Network connection error. Please verify your internet connection or reach us via email directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-12 font-['Montserrat',sans-serif]">
      
      {/* 1. MAIN CONTACT GRID: INFO CARDS + SUBMISSION FORM */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Contact Secretariat Cards (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 border border-emerald-200 text-[#014900] text-[11px] font-extrabold uppercase tracking-widest rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              <span>National Secretariat</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 uppercase tracking-tight">
              Get in Touch
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 font-medium leading-relaxed">
              Have questions regarding student membership, TVET policy advocacy, technical innovations, or corporate partnerships? Contact the national desk.
            </p>
          </div>

          {/* Contact Info Cards (Curved & Polished) */}
          <div className="space-y-3.5">
            
            {/* Phone Card */}
            <div className="group p-4 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#014900] group-hover:bg-[#D9A000] text-white group-hover:text-[#014900] flex items-center justify-center shrink-0 transition-colors duration-300 shadow-sm">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone Lines</h3>
                  <div className="text-xs sm:text-sm font-extrabold text-gray-900 flex flex-col pt-0.5">
                    <a href="tel:+233243163135" className="hover:text-[#014900] transition-colors">+233 24 316 3135</a>
                    <a href="tel:+233302987654" className="hover:text-[#014900] transition-colors text-[11px] text-gray-500 font-medium">+233 (0) 302 987 654 (Secretariat Desk)</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Email Card */}
            <div className="group p-4 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#014900] group-hover:bg-[#D9A000] text-white group-hover:text-[#014900] flex items-center justify-center shrink-0 transition-colors duration-300 shadow-sm">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Email Addresses</h3>
                  <div className="text-xs sm:text-sm font-extrabold text-gray-900 flex flex-col pt-0.5">
                    <a href="mailto:infos@gnuts.org.gh" className="hover:text-[#014900] transition-colors">infos@gnuts.org.gh</a>
                    <a href="mailto:info@gnuts.org.gh" className="hover:text-[#014900] transition-colors text-[11px] text-gray-500 font-medium">info@gnuts.org.gh</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Location Card */}
            <div className="group p-4 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#014900] group-hover:bg-[#D9A000] text-white group-hover:text-[#014900] flex items-center justify-center shrink-0 transition-colors duration-300 shadow-sm">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">National Secretariat Location</h3>
                  <p className="text-xs sm:text-sm font-extrabold text-gray-900 leading-snug pt-0.5">
                    Accra Technical University Campus, Barnes Road, Accra, Ghana
                  </p>
                  <p className="text-[11px] text-gray-500 font-medium">P.O. Box LG 1237, Accra, Ghana</p>
                </div>
              </div>
            </div>

            {/* Office Hours Card */}
            <div className="group p-4 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#014900] group-hover:bg-[#D9A000] text-white group-hover:text-[#014900] flex items-center justify-center shrink-0 transition-colors duration-300 shadow-sm">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Working Hours</h3>
                  <p className="text-xs sm:text-sm font-extrabold text-gray-900 pt-0.5">
                    Monday – Friday: 8:00 AM – 5:00 PM
                  </p>
                  <p className="text-[11px] text-gray-500 font-medium">Weekends & Holidays: Closed for public inquiries</p>
                </div>
              </div>
            </div>

          </div>

          {/* OFFICIAL SOCIAL CHANNELS STRIP */}
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-2.5">
            <div className="flex items-center gap-2 text-[11px] font-extrabold text-gray-700 uppercase tracking-wider">
              <Share2 className="w-3.5 h-3.5 text-[#014900]" />
              <span>Connect On Social Platforms</span>
            </div>
            <div className="flex flex-wrap items-center gap-2.5">
              {/* WhatsApp */}
              <a
                href="https://wa.me/233243163135"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-white transition-colors text-xs font-bold"
              >
                <span>WhatsApp</span>
              </a>

              {/* Twitter / X */}
              <a
                href="https://twitter.com/gnutsonline"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-black text-gray-800 hover:text-white transition-colors text-xs font-bold"
              >
                <span>X (Twitter)</span>
              </a>

              {/* Facebook */}
              <a
                href="https://facebook.com/gnutsonline"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1877F2]/10 hover:bg-[#1877F2] text-[#1877F2] hover:text-white transition-colors text-xs font-bold"
              >
                <span>Facebook</span>
              </a>

              {/* LinkedIn */}
              <a
                href="https://linkedin.com/company/gnuts-ghana"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0A66C2]/10 hover:bg-[#0A66C2] text-[#0A66C2] hover:text-white transition-colors text-xs font-bold"
              >
                <span>LinkedIn</span>
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com/@gnutsghana"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FF0000]/10 hover:bg-[#FF0000] text-[#FF0000] hover:text-white transition-colors text-xs font-bold"
              >
                <span>YouTube</span>
              </a>
            </div>
          </div>

        </div>

        {/* Right Column: Contact Form (7 Cols) */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200 shadow-md space-y-5">
          
          <div className="space-y-1 pb-3 border-b border-gray-100">
            <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 uppercase tracking-wide">
              Send Us a Message
            </h3>
            <p className="text-xs text-gray-500 font-normal">
              Fill out the form below and an executive officer will respond to your inquiry.
            </p>
          </div>

          {/* Success Banner */}
          {successMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-start gap-2.5 rounded-2xl animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-black text-emerald-950 uppercase">Message Sent Successfully!</strong>
                <span>{successMessage}</span>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-300 text-rose-900 text-xs font-bold flex items-start gap-2.5 rounded-2xl animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-black text-rose-950 uppercase">Submission Failed</strong>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Kwame Mensah"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 text-xs font-medium text-gray-900 focus:bg-white focus:border-[#014900] focus:ring-1 focus:ring-[#014900] outline-none transition-all rounded-2xl"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. kwame@example.com"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 text-xs font-medium text-gray-900 focus:bg-white focus:border-[#014900] focus:ring-1 focus:ring-[#014900] outline-none transition-all rounded-2xl"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. +233 24 123 4567"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 text-xs font-medium text-gray-900 focus:bg-white focus:border-[#014900] focus:ring-1 focus:ring-[#014900] outline-none transition-all rounded-2xl"
                />
              </div>

              {/* Member Technical University / Institution */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">
                  Institution / Organization
                </label>
                <input
                  type="text"
                  name="institution"
                  value={formData.institution}
                  onChange={handleChange}
                  placeholder="e.g. Accra Technical University"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 text-xs font-medium text-gray-900 focus:bg-white focus:border-[#014900] focus:ring-1 focus:ring-[#014900] outline-none transition-all rounded-2xl"
                />
              </div>

            </div>

            {/* Subject */}
            <div className="space-y-1">
              <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">
                Subject <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                placeholder="What is your message regarding?"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 text-xs font-medium text-gray-900 focus:bg-white focus:border-[#014900] focus:ring-1 focus:ring-[#014900] outline-none transition-all rounded-2xl"
              />
            </div>

            {/* Message Body */}
            <div className="space-y-1">
              <label className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">
                Message Body <span className="text-red-500">*</span>
              </label>
              <textarea
                name="message"
                required
                rows={5}
                value={formData.message}
                onChange={handleChange}
                placeholder="Provide detailed description of your inquiry, proposal, or feedback..."
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 text-xs font-medium text-gray-900 focus:bg-white focus:border-[#014900] focus:ring-1 focus:ring-[#014900] outline-none transition-all rounded-2xl resize-none"
              />
            </div>

            {/* Submit Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#014900] hover:bg-[#D9A000] text-white hover:text-[#014900] text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-md hover:shadow-xl rounded-2xl cursor-pointer disabled:opacity-60"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? 'Transmitting Message...' : 'Submit Inquiries to Secretariat'}</span>
              </button>
            </div>

          </form>

        </div>

      </div>

      {/* 2. INTERACTIVE GOOGLE MAP EMBED SECTION */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-200 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-gray-900 uppercase">
              Locate Us in Greater Accra, Ghana
            </h3>
            <p className="text-xs text-gray-500 font-normal">
              Accra Technical University Campus, Barnes Road, Accra, Ghana
            </p>
          </div>
          <a
            href="https://maps.google.com/?q=Accra+Technical+University+Accra+Ghana"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#014900] hover:text-[#D9A000] underline"
          >
            <span>Open in Google Maps</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 shadow-inner">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3970.3672285627476!2d-0.051864526355732944!3d5.659911732598822!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfdf81002f0e4dc5%3A0xda91f42bccf2908a!2sGNUTS%20RESIDENT!5e0!3m2!1sen!2sgh!4v1766881325375!5m2!1sen!2sgh"
            className="absolute inset-0 w-full h-full border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="GNUTS Secretariat Map Location"
          />
        </div>
      </div>

      {/* 3. QUICK ASSISTANCE BANNER */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#014900] via-[#026b00] to-[#013300] text-white p-6 sm:p-10 rounded-3xl shadow-xl border border-emerald-800/40">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-xl">
            <h3 className="text-lg sm:text-xl font-extrabold text-white">
              Need Immediate Assistance?
            </h3>
            <p className="text-xs text-gray-100 font-normal">
              Our executive desk is standing by to assist technical university students and partners.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="tel:+233243163135"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#D9A000] hover:bg-yellow-500 text-[#014900] text-xs font-black uppercase tracking-wider rounded-2xl transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5"
            >
              <Phone className="w-3.5 h-3.5 text-[#014900]" />
              <span>Call Us Now</span>
            </a>

            <a
              href="mailto:infos@gnuts.org.gh"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-transparent border-2 border-white text-white hover:bg-white hover:text-[#014900] text-xs font-black uppercase tracking-wider rounded-2xl transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5"
            >
              <Mail className="w-3.5 h-3.5 text-[#D9A000]" />
              <span>Email Secretariat</span>
            </a>
          </div>
        </div>
      </div>

    </div>
  );
}
