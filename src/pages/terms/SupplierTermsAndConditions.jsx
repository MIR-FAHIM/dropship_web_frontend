import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, AlertTriangle, Info, CheckCircle2 } from "lucide-react";

const SupplierTermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 font-supplier-portal">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Back Link */}
        <div className="flex items-center justify-between">
          <Link
            to="/vendor-register"
            className="inline-flex items-center gap-2 text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Supplier Registration
          </Link>
        </div>

        {/* Header Banner */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-blue-500/30 space-y-3">
          <div className="inline-flex items-center gap-2 bg-blue-500/30 text-blue-100 text-xs font-bold px-3 py-1 rounded-full border border-blue-300/30">
            📜 TERMS &amp; CONDITIONS
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Supplier Terms &amp; Conditions
          </h1>
          <p className="text-blue-200 font-semibold text-sm">Platform: Reseller Brain</p>
          <div className="bg-blue-800/60 p-3.5 rounded-xl border border-blue-500/40 text-xs sm:text-sm text-blue-100 leading-relaxed backdrop-blur-sm">
            <strong>Note:</strong> Supplier Page — applies to Suppliers only. A separate page applies to Dropshippers. Dropshipper-specific commercial terms are not shared here, and vice versa.
          </div>
        </div>

        {/* Content Card Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 divide-y divide-slate-100 text-slate-700">

          {/* 1. Introduction */}
          <div className="p-6 space-y-2">
            <h2 className="text-lg font-bold text-slate-900">1. Introduction</h2>
            <p className="text-sm leading-relaxed text-slate-600">
              Welcome to <strong>Reseller Brain</strong>, a digital marketplace platform that connects suppliers (product suppliers) and Dropshippers (independent sellers).
            </p>
            <p className="text-sm leading-relaxed text-slate-600">
              By accessing or using our platform as a Supplier, you agree to comply with and be bound by these Terms &amp; Conditions. If you do not agree, you must not use our services.
            </p>
          </div>

          {/* 2. Marketplace Nature */}
          <div className="p-6 space-y-3">
            <h2 className="text-lg font-bold text-slate-900">
              2. Marketplace Nature <span className="text-xs font-semibold text-slate-500">(Important Declaration)</span>
            </h2>
            <p className="text-sm text-slate-600">Reseller Brain operates strictly as an intermediary marketplace platform.</p>
            <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
              <li>We do not own, manufacture, or stock products</li>
              <li>We do not act as a direct seller</li>
              <li>We facilitate transactions between suppliers and Dropshippers</li>
            </ul>
            <div className="space-y-2 pt-1">
              <div className="bg-emerald-50 border-l-4 border-emerald-500 p-3 rounded-r-lg text-xs font-semibold text-emerald-900">
                👉 Product ownership, quality, and authenticity remain the sole responsibility of the supplier
              </div>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-lg text-xs font-semibold text-blue-900">
                👉 Customer relationship and sales responsibility remain with the Dropshipper
              </div>
            </div>
          </div>

          {/* 3. Eligibility & Account Registration */}
          <div className="p-6 space-y-3">
            <h2 className="text-lg font-bold text-slate-900">3. Eligibility &amp; Account Registration</h2>
            <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1.5">
              <li>Users must be at least 18 years old</li>
              <li>All information provided (name, business name, business address, product category) must be accurate and complete</li>
              <li>Submission of NID is mandatory during registration</li>
              <li>Submission of Trade License is optional</li>
              <li>Submission of IRC (Import Registration Certificate) is optional</li>
              <li>Users are responsible for maintaining account confidentiality</li>
              <li>Sharing account access is strictly prohibited</li>
            </ul>
            <p className="text-sm text-slate-600">
              Reseller Brain reserves the right to suspend or terminate accounts if false or misleading information is detected.
            </p>
            <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200 flex items-start gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-xs text-emerald-900 font-semibold leading-relaxed">
                Uploading a Trade License and/or IRC image qualifies the Supplier for &quot;Verified Seller&quot; status. Dropshippers will be able to see a Verified badge on the Supplier&apos;s profile.
              </p>
            </div>
          </div>

          {/* 4. Platform Roles & Responsibilities */}
          <div className="p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">4. Platform Roles &amp; Responsibilities</h2>
            
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-800">4.1 Supplier Responsibilities</h3>
              <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                <li>Upload accurate product details (title, description, images, videos)</li>
                <li>Maintain stock availability</li>
                <li>Ensure product quality and authenticity</li>
                <li>Fulfill orders within expected timelines</li>
                <li>No phone number or branding in product content</li>
                <li>No direct contact attempts with Dropshippers or end customers</li>
                <li>Must not upload misleading or fake products</li>
              </ul>
              <p className="text-xs font-semibold text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100">
                Violation may result in: product removal, account warning or suspension.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-800">4.2 Platform (Admin) Responsibilities</h3>
              <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                <li>Monitor platform activity</li>
                <li>Process orders and payments</li>
                <li>Facilitate communication between parties</li>
                <li>Resolve disputes when necessary</li>
              </ul>
            </div>
          </div>

          {/* 5. Courier Account Connectivity */}
          <div className="p-6 space-y-3">
            <h2 className="text-lg font-bold text-slate-900">5. Courier Account Connectivity</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              As part of onboarding, the Supplier will connect a courier logistics account under Settings. Per policy, this account must be opened with Reseller Brain&apos;s designated courier partner (Carrybee).
            </p>
            <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1.5">
              <li>
                If the Supplier already holds an account with the designated courier, a new business must be added under the same account — named using the company name followed by a series suffix (e.g. &quot;1&quot;, &quot;2&quot; or &quot;A&quot;, &quot;B&quot;) to avoid duplicate/invalid business name errors
              </li>
              <li>A guideline video will be provided for this setup step</li>
              <li>One or more stores may be created under the courier account; creating a single store is recommended initially</li>
              <li>The store&apos;s support/contact number must be set to Reseller Brain&apos;s company number</li>
            </ul>
            <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r-lg text-xs font-bold text-amber-900">
              🚫 Do NOT enable the &quot;Default Pickup Store&quot; or &quot;Default Return Store&quot; options when creating a store
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              The Supplier will grant Reseller Brain operator/moderator access to the courier account, enabling API connectivity for automatic order creation and tracking — visible both from the Supplier&apos;s own panel and from the Reseller Brain admin panel.
            </p>
          </div>

          {/* 6. Pricing & Admin Markup */}
          <div className="p-6 space-y-3">
            <h2 className="text-lg font-bold text-slate-900">6. Pricing &amp; Admin Markup</h2>
            <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
              <li>No monthly subscription fee is charged to Suppliers</li>
              <li>
                Instead, an Admin Markup is applied to the Supplier&apos;s declared wholesale price on each product order — সাধারণত (typically) 5%, though for certain product categories this may be up to 10%
              </li>
            </ul>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs text-slate-700">
              <div className="font-semibold text-slate-800">Pricing Markup Examples:</div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                👉 <strong>Example (standard, 5%):</strong> Wholesale price 500 BDT → Admin Markup 25 BDT (500 × 5%) → Total deducted: <strong>525 BDT</strong>
              </div>
              <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                👉 <strong>Example (select categories, up to 10%):</strong> Wholesale price 500 BDT → Admin Markup 50 BDT (500 × 10%) → Total deducted: <strong>550 BDT</strong>
              </div>
            </div>
          </div>

          {/* 7. Orders, Processing Timeline & Courier Assignment */}
          <div className="p-6 space-y-3">
            <h2 className="text-lg font-bold text-slate-900">7. Orders, Processing Timeline &amp; Courier Assignment</h2>
            <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1.5">
              <li>Orders received before <strong>4:00 PM</strong> are forwarded to the Supplier&apos;s panel the same day</li>
              <li>Orders received after <strong>4:00 PM</strong> are forwarded the next day</li>
              <li>The Supplier assigns each order to the connected courier with a single click for pickup</li>
              <li>Courier delivery and COD charges apply per the courier partner&apos;s standard rates, based on product weight and destination</li>
              <li>The Supplier receives their declared wholesale price after courier charges and the Admin Markup (Clause 6) is deducted</li>
            </ul>
          </div>

          {/* 8. Returns & Subsidy Responsibility */}
          <div className="p-6 space-y-3">
            <h2 className="text-lg font-bold text-slate-900">8. Returns &amp; Subsidy Responsibility</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Returned products are sent back to the Supplier via the courier partner. Return timeframe: <strong>সাধারণত ৩–১২ দিন (typically 3–12 days)</strong>, depending on courier operations.
            </p>
            <p className="text-sm font-semibold text-slate-800">
              Where a product return results in a delivery/courier charge, responsibility follows the source of the fault:
            </p>
            <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1.5">
              <li>
                <strong className="text-slate-800">Supplier-side fault</strong> (incorrect product information, quality issue, stock unavailability, etc.) → cost borne fully by the Supplier
              </li>
              <li>
                <strong className="text-slate-800">Admin/Dropshipper-side fault, or fraudulent customer activity</strong> → Supplier is NOT liable
              </li>
            </ul>
          </div>

          {/* 9. Courier Loss or Damage Policy */}
          <div className="p-6 space-y-3">
            <h2 className="text-lg font-bold text-slate-900">9. Courier Loss or Damage Policy</h2>
            <p className="text-sm text-slate-600">If a parcel is lost, damaged, or not recoverable while in the courier partner&apos;s custody:</p>
            <div className="space-y-2">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-lg text-xs font-semibold text-blue-900">
                👉 Resolution depends on the courier company&apos;s policy. Reseller Brain will assist, but final compensation depends on the courier&apos;s terms.
              </div>
              <div className="bg-amber-50 border-l-4 border-amber-500 p-3 rounded-r-lg text-xs font-semibold text-amber-900">
                👉 Reseller Brain is not directly liable for courier-related operational losses
              </div>
            </div>
          </div>

          {/* 10. Payment Collection, Deadline & Security Reserve */}
          <div className="p-6 space-y-4">
            <h2 className="text-lg font-bold text-slate-900">10. Payment Collection, Deadline &amp; Security Reserve</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              The courier partner&apos;s invoice generation is batch-based: all orders before 12:30 PM are consolidated into a single invoice, generated shortly after 12:30 PM — <strong>সাধারণত সর্বোচ্চ ১০ মিনিটের মধ্যে (typically within 10 minutes), তবে কখনো কখনো এটি বিলম্বিত হয়ে (though this may occasionally be delayed to) 3:00 PM</strong>.
            </p>
            <div className="bg-emerald-50 border-l-4 border-emerald-600 p-3.5 rounded-r-xl text-xs sm:text-sm font-bold text-emerald-950">
              👉 Since the Supplier typically receives automatic settlement from the courier partner by approximately 2:30 PM, the Supplier must remit Reseller Brain&apos;s receivable share by 6:00 PM the same day — this is the final daily payment deadline
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-800">10.1 Escalation on Missed Payment</h3>
              <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
                <li>
                  <strong>1st missed deadline</strong> → formal warning issued; outstanding amount adjusted against the Supplier&apos;s reserve fund; normal operations resume once the reserve is replenished
                </li>
                <li>
                  <strong>2nd consecutive missed deadline</strong> → final resolution required: either the Supplier replenishes the security reserve in full, or the agreement is terminated with all outstanding transactions settled
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-800">10.2 Reserve Fund Calculation</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Calculated as the rolling sum of Reseller Brain&apos;s receivable share across the Supplier&apos;s delivered orders over the preceding three days — recalculated daily, rising and falling with order volume.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-800">10.3 Volume-Based Contract Strengthening</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Where a Supplier&apos;s transaction volume increases significantly, Reseller Brain may strengthen the agreement — either by bringing the Supplier under a Reseller Brain-controlled courier account, or by entering into a written MOU or a blank cheque-backed agreement.
              </p>
            </div>
          </div>

          {/* 11. Strict Prohibition: Direct Deal */}
          <div className="p-6 bg-red-50/70 space-y-3">
            <h2 className="text-lg font-bold text-red-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              11. Strict Prohibition: Direct Deal <span className="text-xs font-extrabold uppercase bg-red-200 text-red-800 px-2 py-0.5 rounded">(CRITICAL)</span>
            </h2>
            <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
              <li>Suppliers must not share contact information with Dropshippers</li>
              <li>External communication or transactions bypassing the platform are strictly prohibited</li>
            </ul>
            <div className="bg-red-100/80 p-3.5 rounded-xl border border-red-200 space-y-1">
              <div className="text-xs font-bold text-red-900">👉 Any attempt to bypass the platform:</div>
              <ul className="list-disc pl-5 text-xs font-semibold text-red-800 space-y-0.5">
                <li>Immediate account suspension</li>
                <li>Permanent ban (if repeated)</li>
              </ul>
            </div>
          </div>

          {/* 12. Dispute Resolution */}
          <div className="p-6 space-y-3">
            <h2 className="text-lg font-bold text-slate-900">12. Dispute Resolution</h2>
            <p className="text-sm text-slate-600">The Reseller Brain Admin handles all disputes. Users must provide evidence:</p>
            <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
              <li>Chat records</li>
              <li>Call proof</li>
              <li>Video proof (if required)</li>
            </ul>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-lg text-xs font-bold text-blue-900">
              👉 Admin decision is final and binding
            </div>
          </div>

          {/* 13. Account Suspension & Termination */}
          <div className="p-6 space-y-3">
            <h2 className="text-lg font-bold text-slate-900">13. Account Suspension &amp; Termination</h2>
            <p className="text-sm text-slate-600">Accounts may be suspended for:</p>
            <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
              <li>Fraud or misleading activity</li>
              <li>Policy violation</li>
              <li>Direct deal attempts</li>
              <li>Repeated payment default (Clause 10)</li>
            </ul>
            <p className="text-sm text-slate-600">Platform may terminate account without prior notice.</p>
          </div>

          {/* 14. Intellectual Property */}
          <div className="p-6 space-y-3">
            <h2 className="text-lg font-bold text-slate-900">14. Intellectual Property</h2>
            <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
              <li>All platform content (logo, system, branding) belongs to Reseller Brain</li>
              <li>Unauthorized use is prohibited</li>
            </ul>
          </div>

          {/* 15. Limitation of Liability */}
          <div className="p-6 space-y-3">
            <h2 className="text-lg font-bold text-slate-900">15. Limitation of Liability</h2>
            <p className="text-sm text-slate-600">
              Product quality → <strong>Supplier responsibility</strong>
            </p>
            <p className="text-sm font-semibold text-slate-800">Reseller Brain is not liable for:</p>
            <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
              <li>Business loss</li>
              <li>Customer disputes</li>
              <li>Delivery delays (external causes)</li>
            </ul>
          </div>

          {/* 16. Force Majeure */}
          <div className="p-6 space-y-3">
            <h2 className="text-lg font-bold text-slate-900">16. Force Majeure</h2>
            <p className="text-sm text-slate-600">Reseller Brain is not responsible for delays or failures caused by:</p>
            <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
              <li>Natural disasters</li>
              <li>Political unrest</li>
              <li>Courier disruptions</li>
              <li>System outages</li>
              <li>Internet outage</li>
              <li>Government restrictions</li>
            </ul>
          </div>

          {/* 17. Platform Downtime */}
          <div className="p-6 space-y-3">
            <h2 className="text-lg font-bold text-slate-900">17. Platform Downtime</h2>
            <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
              <li>No guarantee of 100% uptime</li>
              <li>Affected orders may be reviewed and compensated at the platform&apos;s discretion</li>
            </ul>
          </div>

          {/* 18. Policy Updates */}
          <div className="p-6 space-y-3">
            <h2 className="text-lg font-bold text-slate-900">18. Policy Updates</h2>
            <ul className="list-disc pl-5 text-sm text-slate-600 space-y-1">
              <li>Reseller Brain reserves the right to update these Terms at any time.</li>
              <li>Suppliers are responsible for staying updated.</li>
            </ul>
          </div>

          {/* 19. Contact Information */}
          <div className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-b-2xl space-y-3">
            <h2 className="text-lg font-bold text-white">19. Contact Information</h2>
            <p className="text-sm text-blue-100 leading-relaxed">
              For questions regarding these Terms &amp; Conditions, contact Reseller Brain support through the channels listed on our{" "}
              <Link to="/privacy-policy" className="text-blue-200 font-bold underline hover:text-white">
                Privacy Policy page
              </Link>.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SupplierTermsAndConditions;
