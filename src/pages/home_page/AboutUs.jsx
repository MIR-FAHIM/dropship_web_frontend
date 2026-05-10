import React from "react";
import { Link } from "react-router-dom";
import {
  CheckCircle,
  TrendingUp,
  ShoppingBag,
  DollarSign,
  Package,
  Truck,
  Shield,
  Users,
  Star,
  ArrowRight,
  Zap,
  HeartHandshake,
  BarChart3,
} from "lucide-react";
import FooterHome from "./FooterHome";

const stats = [
  { value: "৫,০০০+", label: "সক্রিয় রিসেলার" },
  { value: "১০,০০০+", label: "প্রোডাক্ট লাইব্রেরি" },
  { value: "৯৮%", label: "ডেলিভারি সাফল্য" },
  { value: "৩ বছর+", label: "বিশ্বস্ত অভিজ্ঞতা" },
];

const benefits = [
  {
    icon: <DollarSign className="w-7 h-7 text-red-600" />,
    title: "শূন্য বিনিয়োগে শুরু করুন",
    desc: "কোনো স্টক কিনতে হবে না, কোনো গুদাম লাগবে না। শুধু অর্ডার নিন — আমরা ডেলিভারি দিই।",
  },
  {
    icon: <TrendingUp className="w-7 h-7 text-red-600" />,
    title: "নিজেই দাম ঠিক করুন",
    desc: "পণ্যের উপর আপনার মার্জিন আপনিই নির্ধারণ করুন। যত বেশি বেচবেন, তত বেশি আয়।",
  },
  {
    icon: <Package className="w-7 h-7 text-red-600" />,
    title: "তাৎক্ষণিক অর্ডার প্রসেসিং",
    desc: "অর্ডার দেওয়ার সাথে সাথে আমাদের ওয়্যারহাউস থেকে প্যাকেজিং ও শিপমেন্ট শুরু হয়।",
  },
  {
    icon: <Truck className="w-7 h-7 text-red-600" />,
    title: "ক্যাশ অন ডেলিভারি সাপোর্ট",
    desc: "বাংলাদেশের সব জেলায় COD সুবিধা — আপনার কাস্টমার নিশ্চিন্তে কিনতে পারবে।",
  },
  {
    icon: <Shield className="w-7 h-7 text-red-600" />,
    title: "যাচাইকৃত ও মানসম্পন্ন পণ্য",
    desc: "প্রতিটি পণ্য কঠোর মান নিয়ন্ত্রণের মধ্য দিয়ে যায়। ফেরত বা অভিযোগের ঝামেলা নেই।",
  },
  {
    icon: <BarChart3 className="w-7 h-7 text-red-600" />,
    title: "রিয়েল-টাইম বিক্রয় ড্যাশবোর্ড",
    desc: "আপনার সমস্ত অর্ডার, আয় ও কমিশন এক জায়গায় ট্র্যাক করুন — যেকোনো ডিভাইস থেকে।",
  },
];

const steps = [
  { step: "০১", title: "ফ্রি রেজিস্ট্রেশন করুন", desc: "মাত্র কয়েক মিনিটে অ্যাকাউন্ট খুলুন।" },
  { step: "০২", title: "পণ্য বেছে নিন", desc: "হাজারো পণ্য থেকে আপনার নিশ বেছে নিন।" },
  { step: "০৩", title: "সোশ্যাল মিডিয়ায় শেয়ার করুন", desc: "Facebook, WhatsApp বা নিজের পেজে প্রোমোট করুন।" },
  { step: "০৪", title: "অর্ডার নিন ও আয় করুন", desc: "অর্ডার আসলে আমরা ডেলিভারি করি, আপনি মুনাফা পান।" },
];

const testimonials = [
  {
    name: "রাহেলা বেগম",
    location: "ঢাকা",
    text: "আমি গৃহিণী ছিলাম, এখন মাসে ২০,০০০+ টাকা আয় করছি। ResellerBrain আমার জীবন বদলে দিয়েছে।",
    stars: 5,
  },
  {
    name: "মো. সাকিব হাসান",
    location: "চট্টগ্রাম",
    text: "পার্ট-টাইম করতাম, এখন ফুল-টাইম রিসেলার। স্টক ছাড়াই ব্যবসা করা সত্যিই অবিশ্বাস্য!",
    stars: 5,
  },
  {
    name: "নাফিসা আক্তার",
    location: "সিলেট",
    text: "প্যানেল অনেক সহজ, সাপোর্ট টিম সবসময় সাহায্য করে। বিশ্বাসযোগ্য প্ল্যাটফর্ম।",
    stars: 5,
  },
];

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-white font-sans">

      {/* Hero */}
      <section className="bg-gradient-to-br from-red-600 via-red-700 to-rose-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-4 tracking-wide uppercase">
            বাংলাদেশের #১ রিসেলার প্ল্যাটফর্ম
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight mb-5">
            ঘরে বসেই গড়ুন আপনার <br />
            <span className="text-yellow-300">স্বপ্নের ব্যবসা</span>
          </h1>
          <p className="text-lg md:text-xl text-red-100 mb-8 max-w-2xl mx-auto">
            ResellerBrain-এ যোগ দিন — কোনো মূলধন নেই, কোনো ঝুঁকি নেই।
            শুধু পণ্য বেচুন, আমরা বাকিটা সামলাব।
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-8 py-3 rounded-xl text-base transition flex items-center justify-center gap-2"
            >
              এখনই ফ্রি রেজিস্ট্রেশন করুন <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/contact-us"
              className="bg-white/10 hover:bg-white/20 border border-white/40 text-white font-semibold px-8 py-3 rounded-xl text-base transition"
            >
              আমাদের সাথে কথা বলুন
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-50 py-12 px-4 border-b border-gray-100">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {stats.map((s) => (
            <div key={s.label}>
              <div className="text-3xl font-extrabold text-red-600">{s.value}</div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">আমরা কারা?</h2>
          <p className="text-gray-600 text-base md:text-lg leading-relaxed mb-4">
            <strong>ResellerBrain</strong> হলো বাংলাদেশের একটি অত্যাধুনিক ড্রপশিপিং ও রিসেলার প্ল্যাটফর্ম।
            আমাদের লক্ষ্য — দেশের প্রতিটি উদ্যোক্তাকে স্বল্প বিনিয়োগে একটি টেকসই অনলাইন ব্যবসা গড়ে তুলতে সাহায্য করা।
          </p>
          <p className="text-gray-600 text-base md:text-lg leading-relaxed">
            আমরা সাপ্লায়ার ও রিসেলারদের মধ্যে সেতুবন্ধন তৈরি করি। আপনাকে শুধু বিক্রয়ের দিকে মনোযোগ দিতে হবে —
            পণ্য সংগ্রহ, প্যাকেজিং, ডেলিভারি সব আমাদের দায়িত্ব।
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">কেন ResellerBrain বেছে নেবেন?</h2>
            <p className="text-gray-500">আমাদের প্ল্যাটফর্মে যোগ দিলে আপনি পাচ্ছেন</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((b) => (
              <div key={b.title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition">
                <div className="mb-3">{b.icon}</div>
                <h3 className="font-bold text-gray-800 mb-1">{b.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">কীভাবে শুরু করবেন?</h2>
            <p className="text-gray-500">মাত্র ৪টি ধাপে আপনার ব্যবসা শুরু হয়</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {steps.map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 font-extrabold text-lg flex items-center justify-center mx-auto mb-3">
                  {s.step}
                </div>
                <h3 className="font-bold text-gray-800 mb-1">{s.title}</h3>
                <p className="text-sm text-gray-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-red-50 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">তারা সফল হয়েছেন</h2>
            <p className="text-gray-500">আমাদের রিসেলারদের সাফল্যের গল্প</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-6 shadow-sm border border-red-100">
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div>
                  <div className="font-bold text-gray-800 text-sm">{t.name}</div>
                  <div className="text-xs text-gray-400">{t.location}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-2">রিসেলার হিসেবে আপনি পাচ্ছেন</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              "নিজস্ব রিসেলার ড্যাশবোর্ড",
              "১০,০০০+ প্রোডাক্ট অ্যাক্সেস",
              "পণ্যের ছবি ও বিবরণ ডাউনলোড",
              "রিয়েল-টাইম অর্ডার ট্র্যাকিং",
              "দ্রুত পেমেন্ট উইথড্র",
              "ডেডিকেটেড সাপোর্ট টিম",
              "সারা বাংলাদেশে ডেলিভারি",
              "বিক্রয় ও মুনাফার বিশ্লেষণ",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                <CheckCircle className="w-5 h-5 text-red-600 shrink-0" />
                <span className="text-gray-700 text-sm font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-red-600 to-rose-700 py-16 px-4 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <HeartHandshake className="w-12 h-12 mx-auto mb-4 text-yellow-300" />
          <h2 className="text-3xl font-extrabold mb-3">আজই যোগ দিন, বিনামূল্যে!</h2>
          <p className="text-red-100 mb-8 text-base">
            হাজার হাজার রিসেলার ইতিমধ্যে ResellerBrain-এর মাধ্যমে সফলভাবে আয় করছেন।
            আপনার সুযোগ মিস করবেন না।
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-10 py-3 rounded-xl text-base transition"
          >
            <Zap className="w-5 h-5" /> ফ্রি রেজিস্ট্রেশন করুন
          </Link>
        </div>
      </section>

      <FooterHome />
    </div>
  );
};

export default AboutUs;
