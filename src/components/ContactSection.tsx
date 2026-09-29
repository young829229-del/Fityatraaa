import { useState } from 'react';
import { Mail, Phone, MessageSquare, Check } from 'lucide-react';
import { submitContactMessageToFirestore } from '../services/firestoreService';

interface ContactSectionProps {
  showContactDetails?: boolean;
}

export default function ContactSection({ showContactDetails = false }: ContactSectionProps) {
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [comment, setComment] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await submitContactMessageToFirestore({
        name,
        email,
        phone,
        comment,
        source: showContactDetails ? 'contact_page' : 'homepage_contact'
      });
      setContactSubmitted(true);
      setName('');
      setEmail('');
      setPhone('');
      setComment('');
    } catch (err) {
      console.warn('Error saving contact submission:', err);
      setContactSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact-section" className="bg-white text-[#121212]">
      <div className="max-w-xl mx-auto px-5 pt-10 pb-14">
        {showContactDetails && (
          <>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#121212] text-center mb-8">
              Get in touch
            </h1>

            {/* Contact Info Cards */}
            <div className="space-y-4 mb-12">
              <a
                href="mailto:support@fityatra.store"
                className="flex flex-col items-center justify-center bg-[#f5f5f5] rounded-xl py-7 px-6 text-center hover:bg-neutral-200/70 transition-colors"
              >
                <Mail className="w-6 h-6 text-[#121212] mb-2.5 stroke-[1.75]" />
                <span className="text-sm font-bold text-[#121212]">Email</span>
                <span className="text-sm text-neutral-600 mt-1">support@fityatra.store</span>
              </a>

              <a
                href="tel:9705283444"
                className="flex flex-col items-center justify-center bg-[#f5f5f5] rounded-xl py-7 px-6 text-center hover:bg-neutral-200/70 transition-colors"
              >
                <Phone className="w-6 h-6 text-[#121212] mb-2.5 stroke-[1.75]" />
                <span className="text-sm font-bold text-[#121212]">Phone</span>
                <span className="text-sm text-neutral-600 mt-1">970-5283444</span>
              </a>

              <a
                href="https://wa.me/919705283444"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center bg-[#f5f5f5] rounded-xl py-7 px-6 text-center hover:bg-neutral-200/70 transition-colors"
              >
                <MessageSquare className="w-6 h-6 text-[#121212] mb-2.5 stroke-[1.75]" />
                <span className="text-sm font-bold text-[#121212]">WhatsApp</span>
                <span className="text-sm text-neutral-600 mt-1">970-5283444</span>
              </a>
            </div>
          </>
        )}

        <h2 className="text-xl sm:text-2xl font-bold text-[#121212] text-center mb-6 leading-snug">
          Get in Touch. We&apos;re Here to Help!
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="w-full border border-neutral-300 rounded-lg px-4 py-3.5 text-sm text-neutral-900 placeholder-neutral-500 focus:outline-none focus:border-[#0c1a3b]"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email *"
            required
            className="w-full border border-neutral-300 rounded-lg px-4 py-3.5 text-sm text-neutral-900 placeholder-neutral-500 focus:outline-none focus:border-[#0c1a3b]"
          />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone number"
            className="w-full border border-neutral-300 rounded-lg px-4 py-3.5 text-sm text-neutral-900 placeholder-neutral-500 focus:outline-none focus:border-[#0c1a3b]"
          />
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Comment"
            rows={4}
            className="w-full border border-neutral-300 rounded-lg px-4 py-3.5 text-sm text-neutral-900 placeholder-neutral-500 focus:outline-none focus:border-[#0c1a3b]"
          />

          <button
            type="submit"
            className="w-full bg-[#0c1a3b] hover:bg-[#162957] text-white font-bold text-sm py-3.5 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            {contactSubmitted ? (
              <>
                <Check className="w-4 h-4" />
                <span>Sent</span>
              </>
            ) : (
              <span>Send</span>
            )}
          </button>
        </form>
      </div>
    </section>
  );
}
