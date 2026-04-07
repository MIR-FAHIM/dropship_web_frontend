import React from "react";
import {
  TrendingUp,
  ShoppingBag,
  Users,
  BarChart3,
  Package,
  Truck,
  Shield,
  Globe,
  ArrowRight,
  CheckCircle,
  Star,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const stats = [
  { label: "মোট বিক্রয়", value: "৫০,০০০+", icon: <ShoppingBag className="w-7 h-7 text-blue-500" /> },
  { label: "সক্রিয় ভেন্ডর", value: "২,৫০০+", icon: <Users className="w-7 h-7 text-green-500" /> },
  { label: "মাসিক প্রবৃদ্ধি", value: "৩৫%", icon: <TrendingUp className="w-7 h-7 text-purple-500" /> },
  { label: "তালিকাভুক্ত পণ্য", value: "১০,০০০+", icon: <Package className="w-7 h-7 text-orange-500" /> },
];

const benefits = [
  {
    icon: <Globe className="w-8 h-8 text-blue-600" />,
    title: "সারাদেশে পৌঁছান",
    desc: "আমাদের ক্রমবর্ধমান মার্কেটপ্লেস ও রিসেলার নেটওয়ার্কের মাধ্যমে সারা বাংলাদেশের হাজারো ক্রেতার কাছে পৌঁছান।",
  },
  {
    icon: <BarChart3 className="w-8 h-8 text-green-600" />,
    title: "রিয়েল-টাইম অ্যানালিটিক্স",
    desc: "আমাদের শক্তিশালী ভেন্ডর ড্যাশবোর্ডে আপনার বিক্রয়, আয় ও পণ্যের পারফরম্যান্স ট্র্যাক করুন।",
  },
  {
    icon: <Truck className="w-8 h-8 text-orange-600" />,
    title: "ঝামেলামুক্ত লজিস্টিক্স",
    desc: "ডেলিভারি ও ক্যাশ অন ডেলিভারি আমরা সামলাই — আপনি শুধু পণ্যের দিকে মনোযোগ দিন।",
  },
  {
    icon: <Shield className="w-8 h-8 text-teal-600" />,
    title: "নিরাপদ পেমেন্ট",
    desc: "স্বচ্ছ বিলিং ও সুরক্ষিত পেমেন্ট গেটওয়ের মাধ্যমে সময়মতো পেমেন্ট পান।",
  },
];

const steps = [
  { step: "০১", title: "রেজিস্ট্রেশন", desc: "আপনার ব্যবসার প্রাথমিক তথ্য দিয়ে ভেন্ডর অ্যাকাউন্ট তৈরি করুন।" },
  { step: "০২", title: "পণ্য আপলোড", desc: "ছবি, মূল্য ও বিবরণসহ আপনার পণ্য আপলোড করুন।" },
  { step: "০৩", title: "বিক্রি শুরু", desc: "আমাদের রিসেলাররা আপনার পণ্য মার্কেটিং করবে এবং অর্ডার আসতে শুরু করবে।" },
  { step: "০৪", title: "পেমেন্ট গ্রহণ", desc: "সফল ডেলিভারির পর সরাসরি আপনার অ্যাকাউন্টে পেমেন্ট পান।" },
];

const testimonials = [
  {
    name: "রফিক হাসান",
    role: "ইলেকট্রনিক্স ভেন্ডর",
    text: "Bebsha360-এর মাধ্যমে মাত্র ৬ মাসে আমার ইলেকট্রনিক্স ব্যবসা ৩ গুণ বেড়েছে। রিসেলার নেটওয়ার্কটি অসাধারণ!",
    rating: 5,
  },
  {
    name: "ফাতেমা আক্তার",
    role: "ফ্যাশন ও পোশাক",
    text: "অনলাইনে বিক্রি করতে গিয়ে অনেক সমস্যায় পড়েছিলাম। Bebsha360-এর ভেন্ডর প্ল্যাটফর্মে এখন প্রতিদিন নিয়মিত অর্ডার পাচ্ছি, কোনো মার্কেটিং ঝামেলা ছাড়াই।",
    rating: 5,
  },
  {
    name: "কামাল উদ্দিন",
    role: "হোম ও কিচেন সাপ্লায়ার",
    text: "ড্যাশবোর্ড অ্যানালিটিক্স এবং লজিস্টিক্স সাপোর্ট এতটাই সহজ যে সবকিছু এক জায়গা থেকে ম্যানেজ করা যায়।",
    rating: 4,
  },
];

const VendorLanding = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white min-h-screen font-sans">
      {/* Navbar */}
      <nav className="flex justify-between items-center px-6 sm:px-10 py-4 bg-white shadow-md sticky top-0 z-50">
        <h1 className="text-2xl font-bold text-blue-600">Bebsha360</h1>
        <div className="flex items-center gap-4">
          <a href="#benefits" className="hidden sm:inline text-gray-600 hover:text-blue-600 text-sm font-medium">
            সুবিধাসমূহ
          </a>
          <a href="#how-it-works" className="hidden sm:inline text-gray-600 hover:text-blue-600 text-sm font-medium">
            কিভাবে কাজ করে
          </a>
          <button
            onClick={() => navigate("/vendor-register")}
            className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
          >
            ভেন্ডর হিসেবে রেজিস্টার করুন
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20 sm:py-28">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <span className="inline-block bg-white/20 text-white text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
            ভেন্ডর অনবোর্ডিং — দেশের দ্রুত বর্ধনশীল মার্কেটপ্লেসে যোগ দিন
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
            আপনার ব্যবসা বাড়ান <br className="hidden sm:block" />
            <span className="text-yellow-300">Bebsha360</span>-এর সাথে
          </h1>
          <p className="mt-5 text-base sm:text-lg text-blue-100 max-w-2xl mx-auto leading-relaxed">
            বাংলাদেশের দ্রুত বিস্তৃত ড্রপশিপিং প্ল্যাটফর্মে আপনার পণ্য তালিকাভুক্ত করুন। হাজারো সক্রিয়
            রিসেলার আপনার পণ্য বিক্রি করবে — মার্কেটিং, ডেলিভারি ও কাস্টমার সাপোর্ট আমাদের দায়িত্ব।
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate("/register")}
              className="bg-yellow-400 text-blue-900 px-8 py-3.5 rounded-lg font-bold text-lg hover:bg-yellow-500 transition flex items-center justify-center gap-2"
            >
              ভেন্ডর হোন <ArrowRight className="w-5 h-5" />
            </button>
            <a
              href="#how-it-works"
              className="border-2 border-white/40 text-white px-8 py-3.5 rounded-lg font-semibold text-lg hover:bg-white/10 transition text-center"
            >
              আরো জানুন
            </a>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-200 p-6 text-center shadow-sm hover:shadow-md transition"
              >
                <div className="flex justify-center mb-3">{stat.icon}</div>
                <p className="text-2xl sm:text-3xl font-extrabold text-gray-800">{stat.value}</p>
                <p className="mt-1 text-sm text-gray-500 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About / Introduction */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
              ভেন্ডররা কেন Bebsha360 বেছে নেন
            </h2>
            <p className="mt-3 text-gray-600 max-w-2xl mx-auto text-sm sm:text-base">
              Bebsha360 পণ্য সরবরাহকারীদের সরাসরি সারা বাংলাদেশের বিশাল রিসেলার নেটওয়ার্কের সাথে সংযুক্ত করে।
              আমরা সম্পূর্ণ অবকাঠামো তৈরি করেছি — আপনি শুধু ভালো পণ্য সরবরাহ করুন, বিক্রি এমনিতেই বাড়বে।
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-xl border border-gray-100 bg-gray-50 p-6 hover:bg-white hover:shadow-md transition"
              >
                <div className="mb-4">{benefit.icon}</div>
                <h3 className="text-base font-semibold text-gray-800">{benefit.title}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Growth Showcase */}
      <section className="py-16 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-10">
            <div className="flex-1">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                আমরা বাড়ছি — আপনিও পারবেন
              </h2>
              <p className="mt-4 text-gray-600 text-sm sm:text-base leading-relaxed">
                লঞ্চের পর থেকে Bebsha360 প্রতি মাসে দ্রুত প্রবৃদ্ধি অর্জন করছে। আমাদের রিসেলার নেটওয়ার্ক
                প্রতিদিন বাড়ছে, অর্থাৎ আপনার পণ্যে বেশি মানুষের নজর পড়বে এবং বেশি অর্ডার আসবে।
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "গড়ে ৩৫% মাসিক বিক্রয় প্রবৃদ্ধি",
                  "২,৫০০+ সক্রিয় রিসেলার প্রতিদিন পণ্য প্রচার করছে",
                  "বাংলাদেশের ৬৪ জেলায় সম্প্রসারণ চলছে",
                  "ভেন্ডর অনবোর্ডিংয়ের জন্য ডেডিকেটেড সাপোর্ট টিম",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm sm:text-base text-gray-700">
                    <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex-1 w-full">
              <div className="bg-white rounded-2xl shadow-lg p-8">
                <h3 className="text-lg font-bold text-gray-800 mb-6">বিক্রয় প্রবৃদ্ধি (গত ৬ মাস)</h3>
                <div className="flex items-end gap-3 h-48">
                  {[
                    { month: "অক্টো", height: "30%" },
                    { month: "নভে", height: "42%" },
                    { month: "ডিসে", height: "55%" },
                    { month: "জানু", height: "65%" },
                    { month: "ফেব্রু", height: "78%" },
                    { month: "মার্চ", height: "95%" },
                  ].map((bar, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
                      <div
                        className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-md transition-all duration-500"
                        style={{ height: bar.height }}
                      />
                      <span className="mt-2 text-xs text-gray-500 font-medium">{bar.month}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">কিভাবে কাজ করে</h2>
          <p className="mt-3 text-gray-600 text-sm sm:text-base">
            ভেন্ডর হিসেবে শুরু করা খুবই সহজ — শুধু এই চারটি ধাপ অনুসরণ করুন।
          </p>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s) => (
              <div key={s.step} className="relative rounded-xl border border-gray-200 bg-gray-50 p-6 text-left">
                <span className="text-4xl font-extrabold text-blue-100">{s.step}</span>
                <h3 className="mt-2 text-lg font-semibold text-gray-800">{s.title}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center">
            আমাদের ভেন্ডরদের অভিজ্ঞতা
          </h2>
          <p className="mt-3 text-gray-600 text-center text-sm sm:text-base">
            যারা ইতোমধ্যে Bebsha360-এর সাথে ব্যবসা বাড়াচ্ছেন, তাদের কথা শুনুন।
          </p>

          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed italic">&ldquo;{t.text}&rdquo;</p>
                <div className="mt-4 border-t pt-3">
                  <p className="font-semibold text-gray-800 text-sm">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="benefits" className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold">
            আপনার ব্যবসা বাড়াতে প্রস্তুত?
          </h2>
          <p className="mt-4 text-blue-100 text-base sm:text-lg">
            ২,৫০০+ ভেন্ডর ইতোমধ্যে Bebsha360-এ বিক্রি করছেন। রেজিস্ট্রেশন সম্পূর্ণ বিনামূল্যে এবং
            আমাদের টিম অনবোর্ডিংয়ের প্রতিটি ধাপে আপনাকে সাহায্য করবে।
          </p>
          <button
            onClick={() => navigate("/vendor-register")}
            className="mt-8 bg-yellow-400 text-blue-900 px-10 py-4 rounded-lg font-bold text-lg hover:bg-yellow-500 transition inline-flex items-center gap-2"
          >
            এখনই রেজিস্টার করুন <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm">&copy; {new Date().getFullYear()} Bebsha360। সর্বস্বত্ব সংরক্ষিত।</p>
          <div className="flex gap-6 text-sm">
            <a href="/contact-us-form" className="hover:text-white transition">যোগাযোগ করুন</a>
            <a href="#" className="hover:text-white transition">গোপনীয়তা নীতি</a>
            <a href="#" className="hover:text-white transition">সেবার শর্তাবলী</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default VendorLanding;
