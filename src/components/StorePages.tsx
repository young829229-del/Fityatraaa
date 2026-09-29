import { useState } from 'react';
import { StorePageType } from './Footer';
import ContactSection from './ContactSection';
import { saveEmailSubscriberToFirestore } from '../services/firestoreService';

interface StorePagesProps {
  page: StorePageType;
  onNavigatePage: (page: StorePageType) => void;
}

function SubscribeEmailsBlock() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    const submittedEmail = email.trim();
    setSubscribed(true);
    setEmail('');
    try {
      await saveEmailSubscriberToFirestore(submittedEmail, 'policy_page');
    } catch (err) {
      console.warn('Error saving policy page subscriber:', err);
    }
  };

  return (
    <section className="w-full bg-[#f3f3f3] py-12 px-6 text-center border-t border-neutral-200/60">
      <div className="max-w-md mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#121212] leading-tight">
          Subscribe to our emails
        </h2>
        <p className="mt-3 text-sm sm:text-base text-neutral-600 leading-relaxed">
          Join our email list for exclusive offers and the latest news.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            className="w-full bg-[#f3f3f3] border border-neutral-500 rounded-lg px-4 py-3.5 text-sm text-neutral-900 placeholder-neutral-600 focus:outline-none focus:border-black"
          />
          <button
            type="submit"
            className="w-full bg-[#121212] hover:bg-neutral-800 text-white font-bold text-sm py-3.5 rounded-lg transition-colors cursor-pointer"
          >
            {subscribed ? 'Subscribed!' : 'Sign up'}
          </button>
        </form>
      </div>
    </section>
  );
}

export default function StorePages({ page, onNavigatePage }: StorePagesProps) {
  if (page === 'contact') {
    return <ContactSection showContactDetails={true} />;
  }

  if (page === 'shipping') {
    return (
      <div className="bg-white text-[#121212]">
        <div className="max-w-xl mx-auto px-5 pt-10 pb-14 space-y-6 text-sm sm:text-base leading-relaxed text-neutral-800">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#121212] text-center mb-6">
            Shipping Policy
          </h1>

          <p>
            At FitYatra, we&apos;re dedicated to providing{' '}
            <strong className="font-bold text-[#121212]">100% authentic supplements</strong> right
            to your doorstep with promptness and care.
          </p>

          <div className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-[#121212]">
              📦 Delivery Time
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="font-bold text-[#121212]">Inside Kathmandu Valley:</strong> Very
                next day
              </li>
              <li>
                <strong className="font-bold text-[#121212]">
                  Outside Valley (All Provinces):
                </strong>{' '}
                12-48 Hours
              </li>
            </ul>
            <p className="italic text-neutral-700 pt-1">
              Tip: Place your order before 12 PM for the fastest delivery
            </p>
          </div>

          <div className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-[#121212]">
              💸 Shipping Cost
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="font-bold text-[#121212]">Inside Kathmandu Valley:</strong> Rs
                120
              </li>
              <li>
                <strong className="font-bold text-[#121212]">Outside Kathmandu Valley:</strong> Rs
                180
              </li>
            </ul>
            <p className="pt-1">
              <strong className="font-bold text-[#121212]">Free Shipping:</strong> Complimentary
              shipping across the nation for orders over Rs 4,499 or when purchasing multiple items
              – No hidden fees.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-[#121212]">
              📫 Tracking
            </h2>
            <p>
              Customers who provide their email address during the checkout process will receive{' '}
              <strong className="font-bold text-[#121212]">tracking numbers</strong>.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-[#121212]">
              📅 Delivery Days
            </h2>
            <p>
              We are available 24/7 except during major{' '}
              <strong className="font-bold text-[#121212]">festivals</strong>.
            </p>
          </div>
        </div>

        <SubscribeEmailsBlock />
      </div>
    );
  }

  if (page === 'refund') {
    return (
      <div className="bg-white text-[#121212]">
        <div className="max-w-xl mx-auto px-5 pt-10 pb-14 space-y-6 text-sm sm:text-base leading-relaxed text-neutral-800">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#121212] text-center mb-6 leading-tight">
            Refund &amp; Return Policy
          </h1>

          <div className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-[#121212]">
              💸 Refund &amp; Return Policy
            </h2>
            <p>
              We are committed to ensuring the authenticity and quality of our products. If anything
              is amiss, we will correct it.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-[#121212]">
              ✅ Refund Eligibility:
            </h2>
            <p>You qualify for a refund or replacement only if:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>
                The supplement is fake, damaged, or defective at the time of delivery.
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-[#121212]">
              ⏳ Return Window:
            </h2>
            <p>
              You need to get in touch with us within{' '}
              <strong className="font-bold text-[#121212]">3 days</strong> of receiving your order.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-[#121212]">
              ❌ Non-Returnable Items:
            </h2>
            <p>
              Items that have been opened, used, or altered will not be eligible for return.
            </p>
          </div>

          <div className="space-y-2">
            <h2 className="text-base sm:text-lg font-bold text-[#121212]">
              🔄 Cancellations:
            </h2>
            <p>
              You may cancel your order before it has been shipped. No questions asked.
            </p>
          </div>

          <hr className="border-neutral-200 my-6" />

          <div className="space-y-3">
            <h2 className="text-base sm:text-lg font-bold text-[#121212]">
              📧 Contact Us:
            </h2>
            <p>
              <strong className="font-bold text-[#121212]">Email:</strong>{' '}
              <a
                href="mailto:support@fityatra.store"
                className="underline underline-offset-4 text-neutral-800 hover:text-black"
              >
                support@fityatra.store
              </a>
            </p>
            <div className="space-y-1">
              <p className="font-bold text-[#121212]">Website Contact Form:</p>
              <button
                type="button"
                onClick={() => onNavigatePage('contact')}
                className="underline underline-offset-4 text-neutral-800 hover:text-black text-left cursor-pointer"
              >
                https://www.fityatra.store/contact
              </button>
            </div>
          </div>
        </div>

        <SubscribeEmailsBlock />
      </div>
    );
  }

  // Terms & Conditions / Privacy Policy
  return (
    <div className="bg-white text-[#121212]">
      <div className="max-w-xl mx-auto px-5 pt-10 pb-14 space-y-5 text-sm sm:text-base leading-relaxed text-neutral-800">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#121212] text-center mb-6">
          Terms &amp; Conditions
        </h1>

        <p>Welcome to FitYatra!</p>

        <p>
          These terms and conditions outline the rules and regulations for the use of FitYatra&apos;s
          Website, located at{' '}
          <a href="https://www.fityatra.store" className="underline">
            https://www.fityatra.store
          </a>
          .
        </p>

        <p>
          By accessing this website, we assume you accept these terms and conditions. Do not
          continue to use FitYatra if you do not agree to take all of the terms and conditions
          stated on this page.
        </p>

        <h2 className="text-xs font-bold text-[#121212] pt-2">Cookies:</h2>
        <p>
          The website uses cookies to help personalize your online experience. By accessing
          FitYatra, you agreed to use the required cookies.
        </p>
        <p>
          A cookie is a text file that is placed on your hard disk by a web page server. Cookies
          cannot be used to run programs or deliver viruses to your computer. Cookies are uniquely
          assigned to you and can only be read by a web server in the domain that issued the cookie
          to you.
        </p>
        <p>
          We may use cookies to collect, store, and track information for statistical or marketing
          purposes to operate our website. You have the ability to accept or decline optional
          Cookies. There are some required Cookies that are necessary for the operation of our
          website. These cookies do not require your consent as they always work. Please keep in
          mind that by accepting required Cookies, you also accept third-party Cookies, which might
          be used via third-party provided services if you use such services on our website, for
          example, a video display window provided by third parties and integrated into our website.
        </p>

        <h2 className="text-xs font-bold text-[#121212] pt-2">License:</h2>
        <p>
          Unless otherwise stated, FitYatra and/or its licensors own the intellectual property
          rights for all material on FitYatra. All intellectual property rights are reserved. You
          may access this from FitYatra for your own personal use subjected to restrictions set in
          these terms and conditions.
        </p>
        <p>You must not:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Copy or republish material from FitYatra</li>
          <li>Sell, rent, or sub-license material from FitYatra</li>
          <li>Reproduce, duplicate or copy material from FitYatra</li>
          <li>Redistribute content from FitYatra</li>
        </ul>
        <p>This Agreement shall begin on the date hereof.</p>
        <p>
          Parts of this website offer users an opportunity to post and exchange opinions and
          information in certain areas of the website. FitYatra does not filter, edit, publish or
          review Comments before their presence on the website. Comments do not reflect the views
          and opinions of FitYatra, its agents, and/or affiliates. Comments reflect the views and
          opinions of the person who posts their views and opinions. To the extent permitted by
          applicable laws, FitYatra shall not be liable for the Comments or any liability, damages,
          or expenses caused and/or suffered as a result of any use of and/or posting of and/or
          appearance of the Comments on this website.
        </p>
        <p>
          FitYatra reserves the right to monitor all Comments and remove any Comments that can be
          considered inappropriate, offensive, or causes breach of these Terms and Conditions.
        </p>
        <p>You warrant and represent that:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            You are entitled to post the Comments on our website and have all necessary licenses and
            consents to do so;
          </li>
          <li>
            The Comments do not invade any intellectual property right, including without limitation
            copyright, patent, or trademark of any third party;
          </li>
          <li>
            The Comments do not contain any defamatory, libelous, offensive, indecent, or otherwise
            unlawful material, which is an invasion of privacy.
          </li>
          <li>
            The Comments will not be used to solicit or promote business or custom or present
            commercial activities or unlawful activity.
          </li>
        </ul>
        <p>
          You hereby grant FitYatra a non-exclusive license to use, reproduce, edit and authorize
          others to use, reproduce and edit any of your Comments in any and all forms, formats, or
          media.
        </p>

        <h2 className="text-xs font-bold text-[#121212] pt-2">Hyperlinking to our Content:</h2>
        <p>
          The following organizations may link to our Website without prior written approval:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Government agencies;</li>
          <li>Search engines;</li>
          <li>News organizations;</li>
          <li>
            Online directory distributors may link to our Website in the same manner as they
            hyperlink to the Websites of other listed businesses; and
          </li>
          <li>
            System-wide Accredited Businesses except soliciting non-profit organizations, charity
            shopping malls, and charity fundraising groups which may not hyperlink to our Web site.
          </li>
        </ul>
        <p>
          These organizations may link to our home page, to publications, or to other Website
          information so long as the link: (a) is not in any way deceptive; (b) does not falsely
          imply sponsorship, endorsement, or approval of the linking party and its products and/or
          services; and (c) fits within the context of the linking party&apos;s site.
        </p>
        <p>
          We may consider and approve other link requests from the following types of organizations:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Commonly-known consumer and/or business information sources;</li>
          <li>Dot.com community sites;</li>
          <li>Associations or other groups representing charities;</li>
          <li>Online directory distributors;</li>
          <li>Internet portals;</li>
          <li>Accounting, law, and consulting firms; and</li>
          <li>Educational institutions and trade associations.</li>
        </ul>
        <p>
          We will approve link requests from these organizations if we decide that: (a) the link
          would not make us look unfavorably to ourselves or to our accredited businesses; (b) the
          organization does not have any negative records with us; (c) the benefit to us from the
          visibility of the hyperlink compensates the absence of FitYatra; and (d) the link is in
          the context of general resource information.
        </p>
        <p>
          These organizations may link to our home page so long as the link: (a) is not in any way
          deceptive; (b) does not falsely imply sponsorship, endorsement, or approval of the linking
          party and its products or services; and (c) fits within the context of the linking
          party&apos;s site.
        </p>
        <p>
          If you are one of the organizations listed in paragraph 2 above and are interested in
          linking to our website, you must inform us by sending an e-mail to FitYatra. Please
          include your name, your organization name, contact information as well as the URL of your
          site, a list of any URLs from which you intend to link to our Website, and a list of the
          URLs on our site to which you would like to link. Wait 2-3 weeks for a response.
        </p>
        <p>Approved organizations may hyperlink to our Website as follows:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>By use of our corporate name; or</li>
          <li>By use of the uniform resource locator being linked to; or</li>
          <li>
            Using any other description of our Website being linked to that makes sense within the
            context and format of content on the linking party&apos;s site.
          </li>
        </ul>
        <p>
          No use of FitYatra&apos;s logo or other artwork will be allowed for linking absent a
          trademark license agreement.
        </p>

        <h2 className="text-xs font-bold text-[#121212] pt-2">Content Liability:</h2>
        <p>
          We shall not be held responsible for any content that appears on your Website. You agree
          to protect and defend us against all claims that are raised on your Website. No link(s)
          should appear on any Website that may be interpreted as libelous, obscene, or criminal, or
          which infringes, otherwise violates, or advocates the infringement or other violation of,
          any third party rights.
        </p>

        <h2 className="text-xs font-bold text-[#121212] pt-2">Reservation of Rights:</h2>
        <p>
          We reserve the right to request that you remove all links or any particular link to our
          Website. You approve to immediately remove all links to our Website upon request. We also
          reserve the right to amend these terms and conditions and its linking policy at any time.
          By continuously linking to our Website, you agree to be bound to and follow these linking
          terms and conditions.
        </p>

        <h2 className="text-xs font-bold text-[#121212] pt-2">
          Removal of links from our website:
        </h2>
        <p>
          If you find any link on our Website that is offensive for any reason, you are free to
          contact and inform us at any moment. We will consider requests to remove links, but we are
          not obligated to or so or to respond to you directly.
        </p>
        <p>
          We do not ensure that the information on this website is correct. We do not warrant its
          completeness or accuracy, nor do we promise to ensure that the website remains available
          or that the material on the website is kept up to date.
        </p>

        <h2 className="text-xs font-bold text-[#121212] pt-2">Disclaimer:</h2>
        <p>
          To the maximum extent permitted by applicable law, we exclude all representations,
          warranties, and conditions relating to our website and the use of this website. Nothing in
          this disclaimer will:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Limit or exclude our or your liability for death or personal injury;</li>
          <li>
            Limit or exclude our or your liability for fraud or fraudulent misrepresentation;
          </li>
          <li>
            Limit any of our or your liabilities in any way that is not permitted under applicable
            law; or
          </li>
          <li>
            Exclude any of our or your liabilities that may not be excluded under applicable law.
          </li>
        </ul>
        <p>
          The limitations and prohibitions of liability set in this Section and elsewhere in this
          disclaimer: (a) are subject to the preceding paragraph; and (b) govern all liabilities
          arising under the disclaimer, including liabilities arising in contract, in tort, and for
          breach of statutory duty.
        </p>
        <p>
          As long as the website and the information and services on the website are provided free
          of charge, we will not be liable for any loss or damage of any nature.
        </p>
      </div>

      <SubscribeEmailsBlock />
    </div>
  );
}
