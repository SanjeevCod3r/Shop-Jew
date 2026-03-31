"use client";

import Link from "next/link";
import { ChevronRight, ShieldCheck, Lock, Eye, Mail } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#fcfcfc] text-gray-800">
      <div className="bg-gray-50 border-b py-4 md:py-6">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Link href="/" className="hover:text-black">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-gray-900 font-medium">Privacy Policy</span>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 lg:px-8 py-10 md:py-14">
        <div className="max-w-4xl mx-auto bg-white border border-gray-100 rounded-3xl shadow-sm p-6 md:p-10 lg:p-12">
          <div className="mb-8 md:mb-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#2A4736]/10 text-[#2A4736] px-3 py-1.5 text-xs font-bold uppercase tracking-wide mb-4">
              <ShieldCheck className="h-4 w-4" />
              Privacy & Trust
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#2A4537] tracking-tight mb-3">
              Privacy Policy
            </h1>
            <p className="text-sm text-gray-500">
              Last updated: April 1, 2026
            </p>
          </div>

          <div className="space-y-8 text-[15px] leading-relaxed text-gray-700">
            <section>
              <h2 className="text-xl font-bold text-[#2A4537] mb-3">
                1. Information We Collect
              </h2>
              <p>
                When you use Cezore, we may collect personal details such as your
                name, email address, phone number, shipping and billing address,
                order details, and communication history with our support team.
                We also collect technical data like device/browser information and
                site usage analytics to improve the shopping experience.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#2A4537] mb-3">
                2. How We Use Your Information
              </h2>
              <p>
                Your information is used to process orders, provide customer
                support, share important order/service updates, prevent fraud,
                and enhance website performance. If you opt in, we may send
                marketing messages about new collections and offers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#2A4537] mb-3">
                3. Payment & Security
              </h2>
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4 md:p-5">
                <p className="flex items-start gap-2">
                  <Lock className="h-4 w-4 mt-1 text-[#2A4736]" />
                  <span>
                    We use secure payment partners to process transactions. Cezore
                    does not store complete card details on its servers.
                  </span>
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#2A4537] mb-3">
                4. Cookies & Tracking
              </h2>
              <p>
                We use cookies and similar technologies to remember user
                preferences, keep carts functional, and understand site traffic.
                You can manage cookie preferences through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#2A4537] mb-3">
                5. Data Sharing
              </h2>
              <p>
                We share only necessary data with trusted service providers such
                as payment gateways, shipping partners, and technical tools that
                help us run the store. We do not sell your personal data.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#2A4537] mb-3">
                6. Your Rights
              </h2>
              <p className="flex items-start gap-2">
                <Eye className="h-4 w-4 mt-1 text-[#2A4736]" />
                <span>
                  You may request access, correction, or deletion of your personal
                  data, subject to legal and operational requirements.
                </span>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#2A4537] mb-3">
                7. Contact Us
              </h2>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-[#2A4736]" />
                For privacy-related queries, contact us at{" "}
                <a
                  className="text-[#2A4736] font-semibold hover:underline"
                  href="mailto:concierge@cezore.com"
                >
                  concierge@cezore.com
                </a>
                .
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
