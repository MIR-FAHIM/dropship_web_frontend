import React from 'react';

const PrivacyPolicyPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 mb-4">
            <span className="text-2xl">&#128274;</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-base text-blue-600 font-semibold">Platform: Reseller Brain</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 divide-y divide-gray-100">

          {/* Section 1 */}
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">1. Introduction</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Welcome to <strong>Reseller Brain</strong>. Your privacy is important to us, and we are committed to protecting your personal information.
              This Privacy Policy explains how we collect, use, store, and share your data when you use our platform.
              By accessing or using our services, you agree to the terms of this Privacy Policy.
            </p>
          </div>

          {/* Section 2 */}
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">2. Information We Collect</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">2.1 Personal Information</h3>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                  <li>Full Name</li>
                  <li>Phone Number</li>
                  <li>Delivery Address</li>
                  <li>Email Address (if provided)</li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">2.2 Account Information</h3>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                  <li>Login credentials</li>
                  <li>Account activity</li>
                  <li>Transaction history</li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">2.3 Payment Information</h3>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                  <li>Mobile banking details (bKash, Nagad)</li>
                  <li>Bank account details (if provided)</li>
                </ul>
                <p className="text-xs text-blue-600 mt-2 bg-blue-50 rounded-lg px-3 py-2">
                  Note: We do not directly store sensitive financial information (like card details) when a third-party payment gateway is used.
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">2.4 Order &amp; Delivery Information</h3>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                  <li>Customer name and phone number</li>
                  <li>Delivery address</li>
                  <li>Order details</li>
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">2.5 Technical Data</h3>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                  <li>IP address</li>
                  <li>Device type</li>
                  <li>Browser type</li>
                  <li>Usage behavior</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Section 3 */}
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
              <li>To process and manage orders</li>
              <li>To coordinate delivery via courier partners</li>
              <li>To handle payments and payouts</li>
              <li>To provide customer support</li>
              <li>To monitor and improve platform performance</li>
              <li>To prevent fraud and misuse</li>
              <li>To resolve disputes between the Vendor &amp; Reseller</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">4. Data Sharing &amp; Third Parties</h2>
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">4.1 Courier Partners</h3>
                <p className="text-sm text-gray-600">To deliver orders (e.g., Carrybee, Pathao, Steadfast, RedX)</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">4.2 Payment Gateways</h3>
                <p className="text-sm text-gray-600">To process transactions (bKash, Nagad, Bank systems)</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">4.3 Legal Authorities</h3>
                <p className="text-sm text-gray-600">If required by law or investigation</p>
              </div>
              <p className="text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2">
                We do not sell or rent your personal data.
              </p>
            </div>
          </div>

          {/* Section 5 */}
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">5. Data Storage &amp; Security</h2>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
              <li>All data is stored on secured servers</li>
              <li>Regular backups are maintained</li>
              <li>Access to data is restricted to authorized personnel only</li>
              <li>We implement reasonable security measures to protect your data, but no system is 100% secure</li>
            </ul>
          </div>

          {/* Section 6 */}
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">6. Cookies &amp; Tracking Technologies</h2>
            <p className="text-sm text-gray-600 mb-2">Reseller Brain uses cookies to:</p>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1 mb-3">
              <li>Maintain login sessions</li>
              <li>Store user preferences</li>
              <li>Track cart and activity</li>
              <li>Improve security</li>
            </ul>
            <p className="text-sm text-gray-600 mb-2">We may also use analytics tools (e.g., Google Analytics) to:</p>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1 mb-3">
              <li>Understand user behavior</li>
              <li>Improve platform performance</li>
            </ul>
            <p className="text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2">
              This data is collected in aggregate form and is not personally identifiable.
            </p>
          </div>

          {/* Section 7 */}
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">7. User Responsibilities</h2>
            <p className="text-sm text-gray-600 mb-2">Users must ensure:</p>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
              <li>Providing accurate and truthful information</li>
              <li>Not using others&apos; data without their consent</li>
              <li>Maintaining account security</li>
            </ul>
          </div>

          {/* Section 8 */}
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">8. Data Retention</h2>
            <p className="text-sm text-gray-600 mb-1">We retain user data:</p>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
              <li>As long as the account is active</li>
              <li>Or as necessary for legal, operational, or dispute resolution purposes</li>
            </ul>
          </div>

          {/* Section 9 */}
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">9. Your Rights</h2>
            <p className="text-sm text-gray-600 mb-2">You have the right to:</p>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1 mb-3">
              <li>Access your data</li>
              <li>Request correction</li>
              <li>Request account deletion</li>
            </ul>
            <p className="text-xs text-blue-600 bg-blue-50 rounded-lg px-3 py-2">
              Requests can be made via our support team.
            </p>
          </div>

          {/* Section 10 */}
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">10. Children&apos;s Privacy</h2>
            <p className="text-sm text-gray-600">
              Our platform is not intended for individuals under 18 years old. We do not knowingly collect data from minors.
            </p>
          </div>

          {/* Section 11 */}
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">11. Data Breach Policy</h2>
            <p className="text-sm text-gray-600 mb-2">In case of any data breach:</p>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
              <li>We will promptly investigate the incident</li>
              <li>Affected users will be notified if necessary</li>
              <li>Necessary corrective actions will be taken</li>
            </ul>
          </div>

          {/* Section 12 */}
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">12. Changes to This Policy</h2>
            <p className="text-sm text-gray-600">
              Reseller Brain reserves the right to update this Privacy Policy at any time.
              Users are encouraged to review this page periodically.
            </p>
          </div>

          {/* Section 13 */}
          <div className="p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">13. Contact Information</h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p>&#128231; Email: <a href="mailto:Support@resellerbrain.com" className="text-blue-600 hover:underline">Support@resellerbrain.com</a></p>
              <p>&#128222; Phone: <a href="tel:+8801941606310" className="text-blue-600 hover:underline">+8801941606310</a></p>
              <p>&#128205; Address: House 1, Road 13, Sector 13, Garib E Nawaz Avenue, Uttara, Dhaka-1230, Bangladesh</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
