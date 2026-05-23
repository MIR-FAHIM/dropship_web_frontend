import React from "react";

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 mb-4">
            <span className="text-2xl">📜</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms &amp; Conditions</h1>
          <p className="text-base text-blue-600 font-semibold">Platform: Reseller Brain</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 divide-y divide-gray-100">

          {/* Section 1 */}
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">1. Introduction</h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              Welcome to <strong>Reseller Brain</strong>, a digital marketplace platform that connects Vendors (product suppliers) and Resellers (independent sellers).
              By accessing or using our platform, you agree to comply with and be bound by these Terms &amp; Conditions. If you do not agree, you must not use our services.
            </p>
          </div>

          {/* Section 2 */}
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">2. Marketplace Nature <span className="text-sm font-normal text-gray-500">(Important Declaration)</span></h2>
            <p className="text-sm text-gray-600 mb-3">Reseller Brain operates strictly as an intermediary marketplace platform.</p>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1 mb-3">
              <li>We do not own, manufacture, or stock products</li>
              <li>We do not act as a direct seller</li>
              <li>We facilitate transactions between Vendors and Resellers</li>
            </ul>
            <div className="space-y-1">
              <p className="text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2">👉 Product ownership, quality, and authenticity remain the sole responsibility of the Vendor.</p>
              <p className="text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2">👉 Customer relationship and sales responsibility remain with the Reseller.</p>
            </div>
          </div>

          {/* Section 3 */}
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">3. Eligibility &amp; Account Registration</h2>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1 mb-3">
              <li>Users must be at least 18 years old</li>
              <li>All information provided must be accurate and complete</li>
              <li>Users are responsible for maintaining account confidentiality</li>
              <li>Sharing account access is strictly prohibited</li>
            </ul>
            <p className="text-sm text-gray-600">Reseller Brain reserves the right to suspend or terminate accounts if false or misleading information is detected.</p>
          </div>

          {/* Section 4 */}
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">4. Platform Roles &amp; Responsibilities</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">4.1 Vendor Responsibilities</h3>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                  <li>Upload accurate product details (title, description, images, videos)</li>
                  <li>Maintain stock availability</li>
                  <li>Ensure product quality and authenticity</li>
                  <li>Fulfill orders within expected timelines</li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">4.2 Reseller Responsibilities</h3>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                  <li>Set their own selling price above vendor price</li>
                  <li>Manage customer communication and sales</li>
                  <li>Ensure ethical marketing practices</li>
                  <li>Handle customer expectations and satisfaction</li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">4.3 Platform (Admin) Responsibilities</h3>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                  <li>Monitor platform activity</li>
                  <li>Process orders and payments</li>
                  <li>Facilitate communication between parties</li>
                  <li>Resolve disputes when necessary</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 5 */}
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">5. Orders &amp; Processing Timeline</h2>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1 mb-3">
              <li>Orders received before <strong>4:00 PM</strong> are processed the same day</li>
              <li>Orders received after <strong>4:00 PM</strong> are processed the next day</li>
            </ul>
            <p className="text-sm font-semibold text-gray-700 mb-2">Delivery Timeline:</p>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1 mb-3">
              <li>Inside District / Dhaka City: সাধারণত 24–48 hours (80% within 24 hours)</li>
              <li>Outside District: 2–5 days (80% within 3 days)</li>
            </ul>
            <p className="text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2">👉 Delays may occur due to operational or external factors.</p>
          </div>

          {/* Section 6 */}
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">6. Pricing, Commission &amp; Payments</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">6.1 Pricing Structure</h3>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1 mb-2">
                  <li>Vendors set a base product price (Vendor Price)</li>
                  <li>Vendors receive their full price without deduction</li>
                  <li>Resellers set their own selling price above admin price</li>
                </ul>
                <div className="bg-gray-50 rounded-lg px-4 py-3 text-xs text-gray-600 space-y-0.5">
                  <p className="font-semibold text-gray-700 mb-1">👉 Example:</p>
                  <p>Vendor Price = <strong>500 BDT</strong></p>
                  <p>Admin Price (5% markup) = <strong>525 BDT</strong></p>
                  <p>Reseller Selling Price = <strong>800 BDT</strong></p>
                  <p>Reseller Profit = <strong className="text-green-600">275 BDT</strong></p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">6.2 Platform Commission <span className="text-xs font-normal text-gray-500">(Critical Clarification)</span></h3>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1 mb-2">
                  <li>Reseller Brain charges commission <strong>ONLY from Vendors</strong></li>
                  <li>Resellers are <strong>NOT</strong> charged any commission or deduction</li>
                </ul>
                <p className="text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2">👉 Reseller Profit remains fully intact.</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">6.3 Payment Flow</h3>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                  <li>Customer Payment → Reseller Brain System → Distribution</li>
                  <li>Vendor receives: Vendor Price (after adjustment rules)</li>
                  <li>Platform retains: Admin markup (system-controlled)</li>
                  <li>Reseller receives: Full profit margin</li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">6.4 Payout System</h3>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                  <li>Daily payouts processed</li>
                  <li>Time window: <strong>4:00 PM – 10:00 PM</strong></li>
                  <li>Methods: bKash, Nagad, Bank Transfer</li>
                  <li>No minimum or maximum withdrawal limit</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 7 */}
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">7. Delivery, Logistics &amp; Returns</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">7.1 Delivery Charges</h3>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                  <li>Inside District: <strong>70 BDT</strong></li>
                  <li>Outside District: <strong>130 BDT</strong></li>
                  <li>Dhaka City ↔ Suburban / Suburban ↔ Dhaka City: <strong>100 BDT</strong></li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">7.2 Delivery Timeline</h3>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                  <li>Orders before 4:00 PM → same day processing</li>
                  <li>Orders after 4:00 PM → next day processing</li>
                  <li>Inside District / Dhaka City: 1–2 days (80% within 1 day)</li>
                  <li>Outside District: 2–5 days (80% within 3 days)</li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">7.3 Failed Deliveries &amp; Returns</h3>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                  <li>If the customer refuses delivery, the delivery charge applies</li>
                  <li>Delivery charge is non-refundable unless product fault is proven</li>
                  <li>Failed delivery cost is added as a negative balance in the Reseller wallet</li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">7.4 Vendor Dispatch &amp; Return Handling</h3>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1 mb-2">
                  <li>Orders are forwarded to Vendors after the daily cut-off (4:00 PM)</li>
                  <li>Vendors dispatch products via courier pickup</li>
                  <li>Returned products are sent back to the vendors</li>
                </ul>
                <p className="text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2">👉 Return timeframe: 3–12 days, depending on courier operations.</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">7.5 Courier Loss or Damage Policy</h3>
                <p className="text-sm text-gray-600 mb-2">If a parcel is lost, damaged, or not recoverable:</p>
                <div className="space-y-1">
                  <p className="text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2">👉 Resolution depends on the courier company's policy. Reseller Brain will assist, but final compensation depends on courier terms.</p>
                  <p className="text-xs text-orange-600 bg-orange-50 rounded-lg px-3 py-2">👉 Reseller Brain is not directly liable for courier-related operational losses.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 8 */}
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">8. Return, Refund &amp; Cancellation</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">8.1 Instant Return Rule</h3>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                  <li>Customer must check product in front of delivery agent</li>
                  <li>If issue found → immediate return</li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">8.2 Customer Refusal</h3>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                  <li>If customer refuses without valid reason: delivery charge must be paid</li>
                  <li>Any extra collected amount → Reseller must refund</li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">8.3 Fault Responsibility</h3>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                  <li>Vendor fault → delivery cost deducted from Vendor</li>
                  <li>Reseller mistake → delivery cost deducted from Reseller</li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">8.4 Refund Control</h3>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                  <li>All refunds are processed through Admin Panel</li>
                  <li>Admin holds authority over refund approval</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 9 */}
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">9. Vendor Rules</h2>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1 mb-3">
              <li>No phone number or branding in product content</li>
              <li>No direct contact attempts</li>
              <li>Must not upload misleading or fake products</li>
            </ul>
            <p className="text-sm text-gray-600 mb-1">Violation may result in:</p>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
              <li>Product removal</li>
              <li>Account warning or suspension</li>
            </ul>
          </div>

          {/* Section 10 */}
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">10. Reseller Rules</h2>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1 mb-3">
              <li>Cannot change price after dispatch</li>
              <li>Must avoid misleading or fake marketing</li>
              <li>Must not deceive customers</li>
            </ul>
            <p className="text-xs text-orange-600 bg-orange-50 rounded-lg px-3 py-2">👉 Any fraud or illegal activity → Reseller fully liable.</p>
          </div>

          {/* Section 11 */}
          <div className="p-6 bg-red-50 rounded-b-none">
            <h2 className="text-lg font-bold text-red-700 mb-3">11. Strict Prohibition: Direct Deal <span className="text-sm font-normal">(CRITICAL)</span></h2>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1 mb-3">
              <li>Vendors and Resellers must not share contact information</li>
              <li>External communication or transactions are strictly prohibited</li>
            </ul>
            <p className="text-sm text-gray-700 mb-2">Any attempt to bypass the platform:</p>
            <ul className="list-disc pl-5 text-sm text-red-600 space-y-1">
              <li>Immediate account suspension</li>
              <li>Permanent ban (if repeated)</li>
            </ul>
          </div>

          {/* Section 12 */}
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">12. Dispute Resolution</h2>
            <p className="text-sm text-gray-600 mb-2">All disputes are handled by the Reseller Brain Admin. Users must provide evidence:</p>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1 mb-3">
              <li>Chat records</li>
              <li>Call proof</li>
              <li>Video proof (if required)</li>
            </ul>
            <p className="text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2">👉 Admin decision is final and binding.</p>
          </div>

          {/* Section 13 */}
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">13. Customer Relationship Clause</h2>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
              <li>Customers are the sole responsibility of the Reseller</li>
              <li>Reseller Brain does not directly handle customer complaints</li>
            </ul>
          </div>

          {/* Section 14 */}
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">14. Account Suspension &amp; Termination</h2>
            <p className="text-sm text-gray-600 mb-2">Accounts may be suspended for:</p>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1 mb-2">
              <li>Fraud or misleading activity</li>
              <li>Policy violation</li>
              <li>Direct deal attempts</li>
              <li>High return rate abuse</li>
            </ul>
            <p className="text-sm text-gray-600">Platform may terminate account without prior notice.</p>
          </div>

          {/* Section 15 */}
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">15. Intellectual Property</h2>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1 mb-2">
              <li>All platform content (logo, system, branding) belongs to Reseller Brain</li>
              <li>Unauthorized use is prohibited</li>
            </ul>
            <p className="text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2">👉 Resellers may use product content for marketing only.</p>
          </div>

          {/* Section 16 */}
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">16. Limitation of Liability</h2>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1 mb-2">
              <li>Product quality → Vendor responsibility</li>
              <li>Customer interaction → Reseller responsibility</li>
            </ul>
            <p className="text-sm text-gray-600 mb-1">Reseller Brain is not liable for:</p>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
              <li>Business loss</li>
              <li>Customer disputes</li>
              <li>Delivery delays (external causes)</li>
            </ul>
          </div>

          {/* Section 17 */}
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">17. Force Majeure</h2>
            <p className="text-sm text-gray-600 mb-2">Reseller Brain is not responsible for delays or failures caused by:</p>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
              <li>Natural disasters</li>
              <li>Political unrest</li>
              <li>Courier disruptions</li>
              <li>System outages</li>
              <li>Internet outage</li>
              <li>Government restrictions</li>
            </ul>
          </div>

          {/* Section 18 */}
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">18. Platform Downtime</h2>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
              <li>No guarantee of 100% uptime</li>
              <li>Affected orders may be reviewed and compensated at the platform's discretion</li>
            </ul>
          </div>

          {/* Section 19 */}
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">19. Policy Updates</h2>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
              <li>Reseller Brain reserves the right to update Terms at any time</li>
              <li>Users are responsible for staying updated</li>
            </ul>
          </div>

          {/* Final Note */}
          <div className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-b-2xl">
            <h2 className="text-lg font-bold text-gray-800 mb-3">🔥 Final Note <span className="text-sm font-normal text-gray-500">(Business Reality)</span></h2>
            <p className="text-sm text-gray-600 mb-3">By using this platform, you agree that:</p>
            <div className="space-y-2">
              <p className="text-sm text-blue-700 bg-blue-100 rounded-lg px-4 py-2 font-medium">👉 You are operating your own independent business.</p>
              <p className="text-sm text-blue-700 bg-blue-100 rounded-lg px-4 py-2 font-medium">👉 Reseller Brain is only your technology &amp; logistics partner.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
