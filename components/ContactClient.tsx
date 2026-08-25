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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 font-['Montserrat',sans-serif]">
      
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
          <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3">
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
                className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366] text-[#25D366] hover:text-white transition-all duration-300 text-xs font-bold border border-[#25D366]/20 shadow-2xs hover:shadow-md hover:scale-105"
                title="Connect on WhatsApp"
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                <span>WhatsApp</span>
              </a>

              {/* Twitter / X */}
              <a
                href="https://twitter.com/gnutsonline"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-black text-gray-800 hover:text-white transition-all duration-300 text-xs font-bold border border-gray-200 shadow-2xs hover:shadow-md hover:scale-105"
                title="Follow on X (Twitter)"
              >
                <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>X (Twitter)</span>
              </a>

              {/* Facebook */}
              <a
                href="https://facebook.com/gnutsonline"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#1877F2]/10 hover:bg-[#1877F2] text-[#1877F2] hover:text-white transition-all duration-300 text-xs font-bold border border-[#1877F2]/20 shadow-2xs hover:shadow-md hover:scale-105"
                title="Follow on Facebook"
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>Facebook</span>
              </a>

              {/* LinkedIn */}
              <a
                href="https://linkedin.com/company/gnuts-ghana"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0A66C2]/10 hover:bg-[#0A66C2] text-[#0A66C2] hover:text-white transition-all duration-300 text-xs font-bold border border-[#0A66C2]/20 shadow-2xs hover:shadow-md hover:scale-105"
                title="Connect on LinkedIn"
              >
                <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
                <span>LinkedIn</span>
              </a>

              {/* YouTube */}
              <a
                href="https://youtube.com/@gnutsghana"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#FF0000]/10 hover:bg-[#FF0000] text-[#FF0000] hover:text-white transition-all duration-300 text-xs font-bold border border-[#FF0000]/20 shadow-2xs hover:shadow-md hover:scale-105"
                title="Subscribe on YouTube"
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
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
