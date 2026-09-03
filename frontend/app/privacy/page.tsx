import Link from 'next/link'
import { Shield, Mail } from 'lucide-react'

const sections = [
  {
    title: '1. Information We Collect',
    content: `We collect minimal information necessary to provide our services:
    
• Contact form submissions: name, email address, and message content
• Usage data: pages visited, tools clicked, search queries (anonymized)
• Cookies: session cookies for site functionality and analytics

We do NOT collect payment information, passwords, or sensitive personal data. ApkaAI does not require account registration.`
  },
  {
    title: '2. How We Use Your Information',
    content: `Information collected is used solely to:

• Respond to your contact form submissions and support queries
• Improve our AI tools directory and user experience
• Send occasional newsletters if you opt in (you can unsubscribe at any time)
• Monitor site performance and fix technical issues

We never sell, rent, or trade your personal information to third parties.`
  },
  {
    title: '3. Cookies',
    content: `ApkaAI uses the following types of cookies:

• Essential cookies: Required for the website to function properly
• Analytics cookies: Anonymous data to understand how users interact with our site (via privacy-respecting analytics)
• Preference cookies: Remember your filter and sort preferences

You can disable cookies in your browser settings. Essential cookies cannot be disabled as they are required for the site to work.`
  },
  {
    title: '4. Third-Party Links',
    content: `ApkaAI links to external AI tool websites. We are not responsible for the privacy practices of these third-party sites. We recommend reading the privacy policy of every tool you use.

Some links on ApkaAI are affiliate links. When you click these links and make a purchase, we may earn a small commission at no extra cost to you. This helps us keep ApkaAI free.`
  },
  {
    title: '5. Data Security',
    content: `We take reasonable measures to protect the information submitted through our contact form:

• All data is transmitted over HTTPS (SSL encrypted)
• Contact form data is stored in AWS DynamoDB with access controls
• We regularly review our security practices

However, no method of transmission over the Internet is 100% secure. Please do not submit highly sensitive information through our contact form.`
  },
  {
    title: '6. Data Retention',
    content: `Contact form submissions are retained for up to 12 months for support purposes, then deleted. Analytics data is retained in anonymized form for up to 24 months.

You may request deletion of your personal data at any time by emailing ashutoshkumarpandey@apkaai.com.`
  },
  {
    title: '7. Children\'s Privacy',
    content: `ApkaAI is not directed at children under the age of 13. We do not knowingly collect personal information from children. If you are a parent or guardian and believe your child has submitted information to us, please contact us immediately.`
  },
  {
    title: '8. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated "Last Updated" date. Continued use of ApkaAI after changes constitutes acceptance of the new policy.`
  },
  {
    title: '9. Contact Us',
    content: `For any privacy-related questions or requests, contact:

Ashutosh Kumar Pandey
Email: ashutoshkumarpandey@apkaai.com
Location: Ace City, Greater Noida, Uttar Pradesh, India`
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">

        <div className="text-center mb-12">
          <div className="w-14 h-14 rounded-2xl bg-purple-900/40 border border-purple-700/40 flex items-center justify-center mx-auto mb-5">
            <Shield className="w-7 h-7 text-purple-400" />
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-3">Privacy Policy</h1>
          <p className="text-slate-400">Last updated: September 2026</p>
        </div>

        <div className="glow-border rounded-2xl p-6 bg-purple-900/20 border-purple-700/40 mb-8">
          <p className="text-slate-300 text-sm leading-relaxed">
            <strong className="text-white">Summary:</strong> ApkaAI collects minimal data, never sells your information, and uses it only to improve your experience. We are committed to your privacy.
          </p>
        </div>

        <div className="space-y-8">
          {sections.map(s => (
            <div key={s.title} className="glow-border rounded-xl p-7 bg-[#0F0A1E]">
              <h2 className="text-lg font-bold text-white mb-4">{s.title}</h2>
              <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">{s.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <p className="text-slate-400 mb-4">Questions about this privacy policy?</p>
          <a href="mailto:ashutoshkumarpandey@apkaai.com"
            className="btn-primary inline-flex items-center gap-2 text-white font-bold px-8 py-3.5 rounded-xl">
            <Mail className="w-5 h-5" /> Email Us
          </a>
        </div>
      </div>
    </div>
  )
}
