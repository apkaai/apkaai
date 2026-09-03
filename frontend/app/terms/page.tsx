import Link from 'next/link'
import { FileText, Mail } from 'lucide-react'

const sections = [
  {
    title: '1. Acceptance of Terms',
    content: `By accessing and using ApkaAI (apkaai.com), you agree to be bound by these Terms of Service. If you do not agree, please do not use our website.

ApkaAI is operated by Ashutosh Kumar Pandey, Ace City, Greater Noida, Uttar Pradesh, India.`
  },
  {
    title: '2. Description of Service',
    content: `ApkaAI is an AI tools discovery and comparison platform. We provide:

• A curated directory of AI tools with descriptions and pricing information
• Side-by-side comparison of AI tools
• Links to third-party AI tool websites
• Blog articles and guides about AI tools

ApkaAI does not provide AI tools itself — we aggregate information about third-party tools.`
  },
  {
    title: '3. Accuracy of Information',
    content: `We strive to keep all AI tool information, pricing, and descriptions accurate. However:

• Pricing and features may change without notice — always verify on the tool's official website
• We are not responsible for inaccuracies in third-party tool descriptions
• User reviews and ratings are provided for informational purposes only

If you find inaccurate information, please email ashutoshkumarpandey@apkaai.com and we will correct it promptly.`
  },
  {
    title: '4. Affiliate Disclosure',
    content: `ApkaAI participates in affiliate marketing programs. Some links on this website are affiliate links, meaning we may earn a commission when you click a link and make a purchase, at no additional cost to you.

Affiliate relationships do not influence our reviews, ratings, or recommendations. We only feature tools we believe provide genuine value.`
  },
  {
    title: '5. Intellectual Property',
    content: `All content on ApkaAI — including text, graphics, logo, and comparison data — is the property of ApkaAI / Ashutosh Kumar Pandey unless otherwise noted.

You may not copy, reproduce, or distribute our content without explicit written permission. AI tool names, logos, and trademarks belong to their respective owners.`
  },
  {
    title: '6. User Conduct',
    content: `You agree not to:

• Use ApkaAI for any unlawful purpose
• Scrape or systematically download our AI tools data
• Submit false or misleading information via our contact form
• Attempt to gain unauthorized access to our systems
• Use our platform to spam or harass others`
  },
  {
    title: '7. Third-Party Links',
    content: `ApkaAI contains links to third-party AI tool websites. We are not responsible for the content, accuracy, privacy practices, or availability of these external sites. Visiting external sites is at your own risk.`
  },
  {
    title: '8. Disclaimer of Warranties',
    content: `ApkaAI is provided "as is" without any warranties of any kind, express or implied. We do not guarantee that the website will be available at all times, error-free, or free of viruses.

We are not responsible for any decisions made based on information found on ApkaAI.`
  },
  {
    title: '9. Limitation of Liability',
    content: `To the maximum extent permitted by law, ApkaAI and Ashutosh Kumar Pandey shall not be liable for any indirect, incidental, or consequential damages arising from your use of this website or any third-party tools discovered through it.`
  },
  {
    title: '10. Governing Law',
    content: `These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Greater Noida, Uttar Pradesh, India.`
  },
  {
    title: '11. Changes to Terms',
    content: `We reserve the right to modify these Terms at any time. Changes will be posted on this page. Continued use of ApkaAI after changes constitutes acceptance.`
  },
  {
    title: '12. Contact',
    content: `For questions about these Terms:

Ashutosh Kumar Pandey
Email: ashutoshkumarpandey@apkaai.com
Ace City, Greater Noida, Uttar Pradesh, India`
  },
]

export default function TermsPage() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">

        <div className="text-center mb-12">
          <div className="w-14 h-14 rounded-2xl bg-purple-900/40 border border-purple-700/40 flex items-center justify-center mx-auto mb-5">
            <FileText className="w-7 h-7 text-purple-400" />
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-3">Terms of Service</h1>
          <p className="text-slate-400">Last updated: September 2026</p>
        </div>

        <div className="glow-border rounded-2xl p-6 bg-purple-900/20 border-purple-700/40 mb-8">
          <p className="text-slate-300 text-sm leading-relaxed">
            <strong className="text-white">Summary:</strong> Use ApkaAI responsibly. We provide AI tool information in good faith. Some links are affiliate links. Content belongs to us; tool names belong to their owners.
          </p>
        </div>

        <div className="space-y-6">
          {sections.map(s => (
            <div key={s.title} className="glow-border rounded-xl p-7 bg-[#0F0A1E]">
              <h2 className="text-lg font-bold text-white mb-4">{s.title}</h2>
              <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">{s.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-slate-400 mb-4">Questions about these terms?</p>
          <a href="mailto:ashutoshkumarpandey@apkaai.com"
            className="btn-primary inline-flex items-center gap-2 text-white font-bold px-8 py-3.5 rounded-xl">
            <Mail className="w-5 h-5" /> Contact Us
          </a>
        </div>
      </div>
    </div>
  )
}
