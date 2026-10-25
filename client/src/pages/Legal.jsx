import { useParams } from 'react-router-dom';
import { FileText, ShieldCheck, TriangleAlert } from 'lucide-react';
import MarketingNav from '../components/MarketingNav';
import MarketingFooter from '../components/MarketingFooter';
import { useDocumentTitle } from '../lib/useDocumentTitle';
import NotFound from './NotFound';

const DOCS = {
  privacy: {
    title: 'Privacy policy',
    updated: 'October 2026',
    intro:
      'Paylune is a demonstration product. This policy explains what the demo stores locally and how it is handled.',
    sections: [
      {
        id: 'what-we-collect',
        heading: 'What we collect',
        body: [
          'When you create a demo account, Paylune stores the name, email address, company, country, and hashed password that you provide. Optional notes attached to simulated transfers are also stored.',
          'Transaction records, payment links, virtual card details, and balances are generated as mock data. Paylune does not collect real payment credentials, government IDs, or bank account numbers.',
        ],
      },
      {
        id: 'how-we-store-it',
        heading: 'How data is stored',
        body: [
          'All data lives in a local SQLite database on the machine running this demo (server/data/paylune.db). Nothing is sent to a third-party analytics, advertising, or payment processor.',
          'Passwords are salted and hashed with scrypt before storage. Session tokens are signed JWTs kept in your browser’s localStorage and expire after seven days.',
        ],
      },
      {
        id: 'how-we-use-it',
        heading: 'How we use it',
        body: [
          'Account details are used only to render your demo workspace, identify recipients for simulated transfers, and personalise receipts and payment-link checkouts.',
          'We do not sell data, send marketing emails, or share information with advertisers. There is no profiling or automated decision-making.',
        ],
      },
      {
        id: 'your-choices',
        heading: 'Your choices',
        body: [
          'You can update your profile from Settings. To remove your demo data, stop the server and delete server/data/paylune.db. The next start will seed a fresh demo.',
          'Because this is a local demo, there is no self-service account deletion or data export beyond the CSV export in the transactions view.',
        ],
      },
      {
        id: 'contact',
        heading: 'Contact',
        body: [
          'Questions about this policy can be sent to demo@paylune.app. Do not send sensitive personal or financial information to that address.',
        ],
      },
    ],
  },
  terms: {
    title: 'Terms of use',
    updated: 'October 2026',
    intro:
      'These terms cover your use of the Paylune demonstration application. By using it, you accept that it is not a real financial service.',
    sections: [
      {
        id: 'demo-only',
        heading: '1. Demo-only service',
        body: [
          'Paylune is a software portfolio demonstration. It is not a bank, money transmitter, payment processor, or financial institution. No account is a real deposit account, and no balance represents funds you own or can withdraw.',
          'All transfers, top-ups, card transactions, and payment-link checkouts are simulated within a local database. No money moves between any real parties.',
        ],
      },
      {
        id: 'accounts',
        heading: '2. Demo accounts',
        body: [
          'You may create a demo account with any name and email address you control. Do not reuse a production password. You are responsible for maintaining the confidentiality of your demo credentials.',
          'The seeded demo account is shared for exploration. Its data may be modified by anyone using this copy of the demo.',
        ],
      },
      {
        id: 'acceptable-use',
        heading: '3. Acceptable use',
        body: [
          'Do not use Paylune to misrepresent a real payment, solicit real funds, or suggest that a simulated receipt is evidence of a genuine transfer. Do not attempt to attack, overload, or interfere with the demo environment.',
          'Do not enter real card numbers, bank details, or other sensitive financial information. The demo is not designed to receive or protect it.',
        ],
      },
      {
        id: 'no-warranty',
        heading: '4. No warranty',
        body: [
          'The software is provided “as is” without warranties of any kind. It may contain bugs, lose demo data, or change without notice. Use it at your own risk.',
          'To the maximum extent permitted by law, Paylune and its authors are not liable for any loss arising from use of this demonstration.',
        ],
      },
      {
        id: 'changes',
        heading: '5. Changes',
        body: [
          'These terms may be updated as the demo evolves. The “last updated” date at the top reflects the current version. Continued use after an update means you accept the revised terms.',
        ],
      },
    ],
  },
  notice: {
    title: 'Demo notice',
    updated: 'October 2026',
    intro:
      'Paylune is a fictional product built to demonstrate a payments experience. Read this before exploring.',
    sections: [
      {
        id: 'not-a-bank',
        heading: 'Not a financial institution',
        body: [
          'Paylune is not affiliated with PayPal, Payoneer, or any bank or card network. It is not licensed or regulated as a financial service and does not provide banking, custody, remittance, or e-money services.',
          'The balances shown are arbitrary numbers in a local database. They cannot be redeemed, transferred, or withdrawn.',
        ],
      },
      {
        id: 'no-real-money',
        heading: 'No real money or cards',
        body: [
          'Every transaction is simulated. No payment is initiated, no card is charged, and no recipient receives funds. The “test card” on the checkout page is decorative and does not represent a real card.',
          'Any payment link you share points to this demo environment. It cannot be used to collect real money.',
        ],
      },
      {
        id: 'never-share',
        heading: 'Never share sensitive details',
        body: [
          'Do not enter real passwords, card numbers, bank account details, or identity documents. The demo collects only the basic profile and payment-link form fields described in the privacy policy.',
        ],
      },
      {
        id: 'demo-account',
        heading: 'Demo credentials',
        body: [
          'Use demo@paylune.app with the password demo1234 to explore the seeded account, or create your own account with $1,000 in simulated funds.',
        ],
      },
    ],
  },
};

const ICONS = {
  privacy: ShieldCheck,
  terms: FileText,
  notice: TriangleAlert,
};

export default function Legal() {
  const { page } = useParams();
  const doc = DOCS[page];
  useDocumentTitle(doc ? doc.title : 'Legal');

  if (!doc) return <NotFound />;

  const Icon = ICONS[page];

  return (
    <div className="min-h-dvh bg-ink">
      <MarketingNav />
      <main className="pt-[76px]">
        <section className="relative overflow-hidden border-b border-white/[0.06]">
          <div
            className="pointer-events-none absolute inset-0 grid-fade opacity-60"
            aria-hidden="true"
          />
          <div className="marketing-x relative py-14 sm:py-20">
            <span className="eyebrow text-lime/70">
              <Icon className="h-3.5 w-3.5" />
              Legal
            </span>
            <h1 className="mt-4 max-w-2xl font-display text-[38px] font-semibold leading-[1.05] tracking-[-0.045em] text-cream sm:text-[52px]">
              {doc.title}
            </h1>
            <p className="mt-4 max-w-xl text-[14px] leading-7 text-cream/50">{doc.intro}</p>
            <p className="mt-5 text-[10.5px] uppercase tracking-[0.15em] text-cream/25">
              Last updated · {doc.updated}
            </p>
          </div>
        </section>

        <section className="bg-cream text-ink">
          <div className="marketing-x grid gap-10 py-12 sm:py-16 lg:grid-cols-[220px_1fr] lg:gap-16">
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-ink/30">
                On this page
              </p>
              <nav className="mt-3 space-y-1.5" aria-label="On this page">
                {doc.sections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="block rounded-lg px-2 py-1.5 text-[12px] text-ink/55 transition hover:bg-white hover:text-ink"
                  >
                    {section.heading}
                  </a>
                ))}
              </nav>
              <div className="mt-6 rounded-xl border border-ink/[0.07] bg-white p-3.5 text-[10.5px] leading-4 text-slate-ink">
                Paylune is a demo. No real funds, cards, or financial services are involved.
              </div>
            </aside>

            <article className="max-w-[720px]">
              {doc.sections.map((section, index) => (
                <section
                  key={section.id}
                  id={section.id}
                  className={
                    index === 0
                      ? 'scroll-mt-24'
                      : 'mt-10 scroll-mt-24 border-t border-ink/[0.07] pt-10'
                  }
                >
                  <h2 className="font-display text-[21px] font-semibold tracking-[-0.03em] text-ink sm:text-[24px]">
                    {section.heading}
                  </h2>
                  <div className="mt-3 space-y-3">
                    {section.body.map((paragraph) => (
                      <p key={paragraph.slice(0, 40)} className="text-[13.5px] leading-7 text-ink/65">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </section>
              ))}
              <div className="mt-12 rounded-2xl bg-ink px-5 py-5 text-cream sm:px-6">
                <p className="font-display text-[15px] font-semibold">Questions?</p>
                <p className="mt-1 text-[12px] leading-5 text-cream/45">
                  Reach the demo maintainer at{' '}
                  <a
                    href="mailto:demo@paylune.app"
                    className="text-lime underline decoration-lime/30 underline-offset-4 hover:decoration-lime"
                  >
                    demo@paylune.app
                  </a>
                  . Never send real financial or identity documents.
                </p>
              </div>
            </article>
          </div>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}
