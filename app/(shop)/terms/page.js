"use client";

import Link from "next/link";
import { ChevronRight, FileText, ShoppingBag, Truck, RefreshCcw } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#fcfcfc] text-gray-800">
      <div className="bg-gray-50 border-b py-4 md:py-6">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Link href="/" className="hover:text-black">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-gray-900 font-medium">Terms Of Services</span>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 lg:px-8 py-10 md:py-14">
        <div className="max-w-4xl mx-auto bg-white border border-gray-100 rounded-3xl shadow-sm p-6 md:p-10 lg:p-12">
          <div className="mb-8 md:mb-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#2A4736]/10 text-[#2A4736] px-3 py-1.5 text-xs font-bold uppercase tracking-wide mb-4">
              <FileText className="h-4 w-4" />
              Legal Terms
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#2A4537] tracking-tight mb-3">
              Terms Of Services
            </h1>
            <p className="text-sm text-gray-500">
              Last updated: April 1, 2026
            </p>
          </div>

          <div className="space-y-8 text-[15px] leading-relaxed text-gray-700">
            <section>
              <h2 className="text-xl font-bold text-[#2A4537] mb-3">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing or using the Cezore website, you agree to these
                Terms Of Services. If you do not agree, please discontinue use
                of this website.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#2A4537] mb-3">
                2. Products & Pricing
              </h2>
              <p className="flex items-start gap-2">
                <ShoppingBag className="h-4 w-4 mt-1 text-[#2A4736]" />
                <span>
                  Product images and descriptions are provided with care; however,
                  slight differences in color/appearance may occur due to screen
                  settings and handcrafted detail variations. Prices are subject
                  to change without prior notice.
                </span>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#2A4537] mb-3">
                3. Orders & Payment
              </h2>
              <p>
                Orders are confirmed only after successful payment authorization.
                We reserve the right to cancel orders due to stock unavailability,
                pricing errors, or suspected fraudulent activity.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#2A4537] mb-3">
                4. Shipping & Delivery
              </h2>
              <p className="flex items-start gap-2">
                <Truck className="h-4 w-4 mt-1 text-[#2A4736]" />
                <span>
                  Estimated delivery timelines are indicative and may vary based
                  on destination, logistics delays, or force majeure events.
                </span>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#2A4537] mb-3">
                5. Returns, Refunds & Exchanges
              </h2>
              <p className="flex items-start gap-2">
                <RefreshCcw className="h-4 w-4 mt-1 text-[#2A4736]" />
                <span>
                  Return and exchange requests are governed by our return policy.
                  Items must be unused and returned with original packaging,
                  certificates, and proof of purchase where applicable.
                </span>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#2A4537] mb-3">
                6. User Responsibilities
              </h2>
              <p>
                You agree to provide accurate account and order information, and
                not use the website for unlawful or abusive activity, including
                unauthorized access attempts or malicious behavior.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#2A4537] mb-3">
                7. Intellectual Property
              </h2>
              <p>
                All content on this website, including branding, text, images,
                and design assets, belongs to Cezore unless otherwise stated and
                may not be copied or reused without permission.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-[#2A4537] mb-3">
                8. Contact
              </h2>
              <p>
                For legal or policy questions, please contact us at{" "}
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
