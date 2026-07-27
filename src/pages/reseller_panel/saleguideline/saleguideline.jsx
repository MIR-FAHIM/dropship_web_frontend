import React from 'react';
import { Link } from 'react-router-dom';

const SalesGuidelines = () => {
  const sendPrompt = (text) => {
    alert(`প্রশ্ন: ${text}`);
  };

  return (
    <div style={{ fontFamily: "'Hind Siliguri', sans-serif", minHeight: '100vh', background: '#f8fafc' }}>
      <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap" rel="stylesheet" />

      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, #085041 0%, #1D9E75 60%, #5DCAA5 100%)',
        padding: '3rem 2rem 2.5rem',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)' }} />
        <div style={{ position: 'absolute', bottom: '-20px', left: '-20px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,0.08)' }} />
        <div style={{ fontSize: '40px', marginBottom: '8px' }}>🛍️</div>
        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#fff', marginBottom: '10px', lineHeight: 1.4 }}>
          রিসেলার সেলস গাইডলাইন
        </h1>
        <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.88)', maxWidth: '480px', margin: '0 auto', lineHeight: 1.7 }}>
          আমাদের সাথে ব্যবসা শুরু করুন এবং সফল রিসেলার হয়ে উঠুন। নিচের ধাপগুলো অনুসরণ করুন।
        </p>
      </div>

      <div style={{ padding: '0 1.5rem 3rem' }}>

        {/* Step 1-4 Section */}
        <div style={{ marginTop: '2rem', marginBottom: '1rem' }}>
          <span style={{
            display: 'inline-block', background: '#E1F5EE', color: '#085041',
            fontSize: '12px', fontWeight: 600, padding: '4px 12px', borderRadius: '20px', letterSpacing: '.5px'
          }}>ধাপ ১ থেকে ৪</span>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a1a', marginTop: '8px' }}>
            কিভাবে শুরু করবেন?
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '2rem' }}>
          {[
            { num: '১', color: '#1D9E75', bg: '#E1F5EE', textColor: '#085041', borderColor: '#1D9E75', title: 'পণ্য বাছাই করুন', desc: 'ভেরিফাইড এবং রেটিং দেখা পণ্যগুলো বেছে নিন। ৪-৫ স্টার পণ্য সবচেয়ে নিরাপদ।' },
            { num: '২', color: '#BA7517', bg: '#FAEEDA', textColor: '#633806', borderColor: '#BA7517', title: 'অর্ডার কনফার্ম করুন', desc: 'অ্যাপে অর্ডার দেওয়ার আগে ফোনে কাস্টমারের সাথে কথা বলে নিশ্চিত করুন।' },
            { num: '৩', color: '#185FA5', bg: '#E6F1FB', textColor: '#0C447C', borderColor: '#185FA5', title: 'অগ্রিম চার্জ নিন (Optional)', desc: 'ডেলিভারি চার্জ আগেই নিন। এতে ফেক অর্ডার এবং লোকসান কমবে।' },
            { num: '৪', color: '#534AB7', bg: '#EEEDFE', textColor: '#3C3489', borderColor: '#534AB7', title: 'ডেলিভারি ও ফলোআপ', desc: 'পণ্য পৌঁছে দিন, ফিডব্যাক নিন এবং সমস্যা হলে রিটার্ন প্রক্রিয়া করুন।' },
          ].map((step) => (
            <div key={step.num} style={{
              background: '#fff', border: '0.5px solid #e5e7eb',
              borderRadius: '12px', padding: '1.25rem', borderTop: `3px solid ${step.borderColor}`
            }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%', background: step.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px', fontWeight: 700, color: step.textColor, marginBottom: '12px'
              }}>{step.num}</div>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1a1a1a', marginBottom: '6px' }}>{step.title}</h3>
              <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.7 }}>{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Product Rating Guide */}
        <div style={{ marginBottom: '1rem' }}>
          <span style={{
            display: 'inline-block', background: '#FAEEDA', color: '#633806',
            fontSize: '12px', fontWeight: 600, padding: '4px 12px', borderRadius: '20px', letterSpacing: '.5px'
          }}>পণ্যের মান</span>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a1a', marginTop: '8px' }}>পণ্য রেটিং গাইড</h2>
        </div>

        <div style={{ background: '#fff', border: '0.5px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden', marginBottom: '2rem' }}>
          {[
            { stars: '⭐⭐⭐⭐⭐', title: '৫ স্টার পণ্য', desc: 'সর্বোচ্চ মানের — নিশ্চিন্তে বিক্রি করুন', badge: 'সেরা পছন্দ', badgeBg: '#E1F5EE', badgeColor: '#085041' },
            { stars: '⭐⭐⭐⭐', title: '৪ স্টার পণ্য', desc: 'ভালো মান — কাস্টমার সন্তুষ্ট থাকবেন', badge: 'নিরাপদ', badgeBg: '#E6F1FB', badgeColor: '#0C447C' },
            { stars: '⭐⭐⭐', title: '৩ স্টার পণ্য', desc: 'মধ্যম মান — দাম বুঝিয়ে বিক্রি করুন', badge: 'সতর্কতার সাথে', badgeBg: '#FAEEDA', badgeColor: '#633806' },
            { stars: '⭐⭐', title: '২ স্টার পণ্য', desc: 'কম বাজেটের পণ্য — কম দামে বিক্রির জন্য', badge: 'ঝুঁকি আছে', badgeBg: '#FAECE7', badgeColor: '#712B13' },
            { stars: '⭐', title: 'লো বাজেট / কপি পণ্য', desc: 'আমরা এই পণ্য বেশি বিক্রির পরামর্শ দিই না', badge: 'এড়িয়ে চলুন', badgeBg: '#FCEBEB', badgeColor: '#791F1F' },
          ].map((item, i, arr) => (
            <div key={i} style={{
              padding: '1rem 1.25rem',
              borderBottom: i < arr.length - 1 ? '0.5px solid #e5e7eb' : 'none',
              display: 'flex', alignItems: 'center', gap: '12px'
            }}>
              <span style={{ fontSize: '16px', minWidth: '80px' }}>{item.stars}</span>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a', marginBottom: '2px' }}>{item.title}</p>
                <p style={{ fontSize: '12px', color: '#6b7280' }}>{item.desc}</p>
              </div>
              <span style={{
                background: item.badgeBg, color: item.badgeColor,
                fontSize: '11px', fontWeight: 600, padding: '3px 10px',
                borderRadius: '20px', whiteSpace: 'nowrap'
              }}>{item.badge}</span>
            </div>
          ))}
        </div>

        {/* Order & Security */}
        <div style={{ marginBottom: '1rem' }}>
          <span style={{
            display: 'inline-block', background: '#E6F1FB', color: '#0C447C',
            fontSize: '12px', fontWeight: 600, padding: '4px 12px', borderRadius: '20px', letterSpacing: '.5px'
          }}>গুরুত্বপূর্ণ নিয়ম</span>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a1a', marginTop: '8px' }}>অর্ডার ও নিরাপত্তা</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '2rem' }}>
          {[
            { icon: '📞', title: 'অর্ডার কনফার্মেশন', desc: 'সবসময় ফোনে কাস্টমারের সাথে কথা বলে অর্ডার নিশ্চিত করুন। অ্যাপে দেওয়ার আগে অবশ্যই কনফার্ম করুন।' },
            { icon: '💰', title: 'অগ্রিম ডেলিভারি চার্জ (Optional)', desc: 'ডেলিভারি চার্জ আগেই সংগ্রহ করুন। যারা চার্জ দেয়নি, তাদের অর্ডার ডেলিভারির আগে যাচাই করুন।' },
            { icon: '🔒', title: 'অ্যাকাউন্ট সুরক্ষা', desc: 'পাসওয়ার্ড কাউকে শেয়ার করবেন না। বিকাশ নম্বর লিংক রাখুন যাতে অননুমোদিত উত্তোলন না হয়।' },
            { icon: '🛡️', title: 'সাপোর্ট যোগাযোগ', desc: 'যেকোনো সমস্যায় দ্রুত সাপোর্ট টিমকে জানান। দেরি করলে সমস্যা বড় হতে পারে।' },
          ].map((item, i) => (
            <div key={i} style={{ background: '#fff', border: '0.5px solid #e5e7eb', borderRadius: '12px', padding: '1.25rem' }}>
              <div style={{ fontSize: '22px', marginBottom: '10px' }}>{item.icon}</div>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a', marginBottom: '6px' }}>{item.title}</h3>
              <p style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.7 }}>{item.desc}</p>
            </div>
          ))}
        </div>

        {/* New Store Link Guide */}
        <div style={{ marginBottom: '1rem' }}>
          <span style={{
            display: 'inline-block', background: '#E1F5EE', color: '#085041',
            fontSize: '12px', fontWeight: 600, padding: '4px 12px', borderRadius: '20px', letterSpacing: '.5px'
          }}>নতুন গাইড</span>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1a1a1a', marginTop: '8px' }}>
            আপনার নিজস্ব স্টোর ও লিঙ্ক শেয়ার
          </h2>
        </div>

        <div style={{ background: '#fff', border: '0.5px solid #e5e7eb', borderRadius: '12px', padding: '1.25rem', marginBottom: '2rem' }}>
          <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.8, marginBottom: '1rem' }}>
            প্রোডাক্ট ডিটেইলে গিয়ে আপনি আপনার নিজের স্টোর তৈরি করে পণ্যের URL লিঙ্ক তৈরি করতে পারেন। এতে আপনি নিজের পছন্দমতো দামে পণ্য শেয়ার করতে পারবেন।
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {[
              { title: 'স্টোর তৈরি করুন', desc: 'প্রোডাক্ট ডিটেইলে গিয়ে আপনার নিজস্ব স্টোর সেটআপ করুন।' },
              { title: 'কাস্টম লিঙ্ক তৈরি করুন', desc: 'পণ্যের URL লিঙ্ক তৈরি করে নিজের দাম সেট করুন।' },
              { title: 'অর্ডার দেখুন', desc: 'এই প্যানেল থেকে আপনার স্টোরে আসা অর্ডার দেখুন।' },
              { title: 'ভেরিফিকেশন শেষে ফরওয়ার্ড করুন', desc: 'অর্ডার যাচাই করে resellerbrain-এ পাঠিয়ে দিন।' },
            ].map((item, i) => (
              <div key={i} style={{ background: '#f8fafc', border: '0.5px solid #e5e7eb', borderRadius: '10px', padding: '0.9rem' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1a1a1a', marginBottom: '4px' }}>{item.title}</h3>
                <p style={{ fontSize: '12px', color: '#6b7280', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Success Tips Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #085041, #1D9E75)',
          borderRadius: '12px', padding: '1.75rem', textAlign: 'center', marginBottom: '1.5rem'
        }}>
          <div style={{ fontSize: '28px', marginBottom: '10px' }}>🏆</div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
            সফল রিসেলার হওয়ার টিপস
          </h2>
          <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.88)', lineHeight: 1.7, maxWidth: '400px', margin: '0 auto 1.25rem' }}>
            সবসময় কাস্টমারকে সৎভাবে পণ্যের মান জানান। বিশ্বাসযোগ্যতাই দীর্ঘমেয়াদী ব্যবসার ভিত্তি।
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
            {['✓ সৎ থাকুন', '✓ দ্রুত রেসপন্ড করুন', '✓ রিভিউ সংগ্রহ করুন', '✓ নিয়মিত শিখুন'].map((tip) => (
              <span key={tip} style={{
                background: 'rgba(255,255,255,0.18)', color: '#fff',
                fontSize: '12px', padding: '5px 14px', borderRadius: '20px'
              }}>{tip}</span>
            ))}
          </div>
        </div>

        {/* Interactive Help Section */}
        <div style={{ background: '#f3f4f6', borderRadius: '12px', padding: '1.25rem', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#1a1a1a', marginBottom: '10px' }}>❓ আরও জানতে চান?</h3>
          <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>নিচের বিষয়গুলো সম্পর্কে বিস্তারিত জানুন:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {[
              'রিসেলার হিসেবে কিভাবে বেশি সেল করা যায়?',
              'ফেক অর্ডার থেকে কিভাবে বাঁচব?',
              'কাস্টমার হ্যান্ডলিং টিপস কি কি?'
            ].map((q) => (
              <button
                key={q}
                onClick={() => sendPrompt(q)}
                style={{
                  fontSize: '12px', padding: '6px 14px', cursor: 'pointer',
                  background: '#fff', border: '0.5px solid #d1d5db',
                  borderRadius: '20px', color: '#374151', fontFamily: "'Hind Siliguri', sans-serif"
                }}
              >
                {q.replace('?', '')} ↗
              </button>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center' }}>
          <Link
            to="/"
            style={{
              display: 'inline-block', padding: '12px 32px',
              background: 'linear-gradient(135deg, #085041, #1D9E75)',
              color: '#fff', borderRadius: '30px', fontSize: '15px',
              fontWeight: 600, textDecoration: 'none', fontFamily: "'Hind Siliguri', sans-serif"
            }}
          >
            এখনই বিক্রি শুরু করুন 🚀
          </Link>
        </div>

      </div>
    </div>
  );
};

export default SalesGuidelines;