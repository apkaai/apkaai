import { Cookie, Mail } from 'lucide-react'

export default function CookiesPage() {
  return (
    <div className="min-h-screen pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">

        <div className="text-center mb-12">
          <div className="w-14 h-14 rounded-2xl bg-purple-900/40 border border-purple-700/40 flex items-center justify-center mx-auto mb-5">
            <Cookie className="w-7 h-7 text-purple-400" />
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-3">Cookie Policy</h1>
          <p className="text-slate-400">Last updated: September 2026</p>
        </div>

        <div className="space-y-6">
          {[
            {
              title: 'What Are Cookies?',
              content: 'Cookies are small text files stored on your device when you visit a website. They help websites remember your preferences and improve your experience. ApkaAI uses cookies minimally and responsibly.'
            },
            {
              title: 'Types of Cookies We Use',
              content: null,
              table: [
                { type: 'Essential', purpose: 'Required for the website to function (navigation, security)', duration: 'Session', canDisable: 'No' },
                { type: 'Preference', purpose: 'Remember your filter settings, sort preferences, and dark mode', duration: '30 days', canDisable: 'Yes' },
                { type: 'Analytics', purpose: 'Understand how visitors use our site (anonymized data only)', duration: '2 years', canDisable: 'Yes' },
              ]
            },
            {
              title: 'What We Do NOT Use Cookies For',
              content: 'We do NOT use cookies to:\n• Track you across other websites\n• Build advertising profiles\n• Sell your data to third parties\n• Store sensitive personal information'
            },
            {
              title: 'Third-Party Cookies',
              content: 'When you click links to external AI tool websites, those sites may set their own cookies. ApkaAI has no control over third-party cookies. Please review the cookie policies of those sites separately.'
            },
            {
              title: 'How to Manage Cookies',
              content: 'You can control cookies through your browser settings:\n\n• Chrome: Settings → Privacy → Cookies\n• Firefox: Options → Privacy & Security → Cookies\n• Safari: Preferences → Privacy → Manage\n• Edge: Settings → Cookies and site permissions\n\nDisabling essential cookies may affect website functionality.'
            },
            {
              title: 'Updates to This Policy',
              content: 'We may update this Cookie Policy occasionally. Check this page for the latest information.'
            },
            {
              title: 'Contact',
              content: 'Questions about our cookie use?\nEmail: ashutoshkumarpandey@apkaai.com\nAce City, Greater Noida, Uttar Pradesh, India'
            },
          ].map(s => (
            <div key={s.title} className="glow-border rounded-xl p-7 bg-[#0F0A1E]">
              <h2 className="text-lg font-bold text-white mb-4">{s.title}</h2>
              {s.content && <p className="text-slate-400 text-sm leading-relaxed whitespace-pre-line">{s.content}</p>}
              {s.table && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-purple-900/30">
                        <th className="text-left text-slate-300 font-semibold pb-3 pr-4">Type</th>
                        <th className="text-left text-slate-300 font-semibold pb-3 pr-4">Purpose</th>
                        <th className="text-left text-slate-300 font-semibold pb-3 pr-4">Duration</th>
                        <th className="text-left text-slate-300 font-semibold pb-3">Can Disable?</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-900/20">
                      {s.table.map(row => (
                        <tr key={row.type}>
                          <td className="py-3 pr-4 text-purple-300 font-medium">{row.type}</td>
                          <td className="py-3 pr-4 text-slate-400">{row.purpose}</td>
                          <td className="py-3 pr-4 text-slate-400">{row.duration}</td>
                          <td className={`py-3 font-semibold ${row.canDisable === 'Yes' ? 'text-emerald-400' : 'text-amber-400'}`}>{row.canDisable}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <a href="mailto:ashutoshkumarpandey@apkaai.com"
            className="btn-primary inline-flex items-center gap-2 text-white font-bold px-8 py-3.5 rounded-xl">
            <Mail className="w-5 h-5" /> Contact Us
          </a>
        </div>
      </div>
    </div>
  )
}
