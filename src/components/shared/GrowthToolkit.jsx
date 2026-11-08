import React from "react";
import { Brain, CheckCircle, ChevronRight, Clock, FileText, ImageIcon, Sparkles, TrendingUp, Video, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const GrowthToolkit = () => {
  const navigate = useNavigate();

  return (
    <section id="growth-toolkit" className="py-20 bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-14">
          <span className="inline-flex items-center gap-2 bg-violet-500/20 border border-violet-500/40 text-violet-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-5">
            <Sparkles className="w-3.5 h-3.5" /> শীঘ্রই আসছে — Vendor Growth Toolkit
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            আগামীর{" "}
            <span className="bg-gradient-to-r from-red-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
              AI-Powered
            </span>{" "}
            ব্যবসা সরঞ্জাম
          </h2>
          <p className="mt-4 text-gray-300 max-w-2xl mx-auto text-sm sm:text-base">
            ResellerBrain শুধু একটি মার্কেটপ্লেস নয় — এটি আপনার সম্পূর্ণ ব্যবসার বুদ্ধিমান সহযোগী।
            আমাদের আসন্ন AI টুলসগুলো আপনার বিক্রয়কে নতুন উচ্চতায় নিয়ে যাবে।
          </p>
          <div className="mt-4 inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-medium px-4 py-2 rounded-full">
            <Clock className="w-3.5 h-3.5" />
            Early Access-এর জন্য এখনই রেজিস্টার করুন
          </div>
        </div>

        {/* Tool Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">

          {/* 1 — Trending Product List */}
          <div className="group relative rounded-2xl bg-gray-800 border border-gray-700 p-7 hover:border-violet-500/50 hover:bg-gray-800/80 transition-all duration-300">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-600/10 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-5 shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold text-white">Trending Product List</h3>
              <span className="text-xs bg-violet-500/20 text-violet-300 border border-violet-500/30 px-2 py-0.5 rounded-full font-medium">সাপ্তাহিক</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-5">
              প্রতি সপ্তাহে বাজারে সবচেয়ে বেশি চাহিদাসম্পন্ন Product Category Report। কোন পণ্য এখন হট, কোনটিতে মুনাফা বেশি — সব তথ্য এক জায়গায়।
            </p>
            <ul className="space-y-2">
              {["ক্যাটাগরি ভিত্তিক চাহিদা বিশ্লেষণ", "সাপ্তাহিক টপ ১০০ পণ্য", "প্রাইস ট্রেন্ড ট্র্যাকিং"].map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-gray-300">
                  <CheckCircle className="w-3.5 h-3.5 text-violet-400 shrink-0" />{f}
                </li>
              ))}
            </ul>
            <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-amber-400">
              <Zap className="w-3.5 h-3.5" /> শীঘ্রই আসছে
            </div>
          </div>

          {/* 2 — AI Product Research */}
          <div className="group relative rounded-2xl bg-gray-800 border border-gray-700 p-7 hover:border-blue-500/50 hover:bg-gray-800/80 transition-all duration-300">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-600/10 to-cyan-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-5 shadow-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold text-white">AI Product Research</h3>
              <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full font-medium">AI</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-5">
              কোন Product Market-এ Potential রাখে, Competition কেমন, Demand Trend কেমন — AI Analysis-এ সব প্রশ্নের উত্তর পান মুহূর্তেই।
            </p>
            <ul className="space-y-2">
              {["মার্কেট পটেনশিয়াল স্কোর", "কম্পিটিটর বিশ্লেষণ", "ডিমান্ড ট্রেন্ড ফোরকাস্ট"].map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-gray-300">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-400 shrink-0" />{f}
                </li>
              ))}
            </ul>
            <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-amber-400">
              <Zap className="w-3.5 h-3.5" /> শীঘ্রই আসছে
            </div>
          </div>

          {/* 3 — AI Video Creator */}
          <div className="group relative rounded-2xl bg-gray-800 border border-gray-700 p-7 hover:border-rose-500/50 hover:bg-gray-800/80 transition-all duration-300">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-rose-600/10 to-pink-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center mb-5 shadow-lg">
              <Video className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold text-white">AI Video Creator</h3>
              <span className="text-xs bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2 py-0.5 rounded-full font-medium">এক ক্লিকে</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-5">
              পণ্যের ছবি দিন — AI এক ক্লিকে প্রফেশনাল Video Ads Generate করে দেবে। Facebook, Instagram ও TikTok-এর জন্য অপটিমাইজড।
            </p>
            <ul className="space-y-2">
              {["Auto Product Showcase Video", "Facebook ও Reels ফরম্যাট", "বাংলা ভয়েসওভার সাপোর্ট"].map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-gray-300">
                  <CheckCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />{f}
                </li>
              ))}
            </ul>
            <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-amber-400">
              <Zap className="w-3.5 h-3.5" /> শীঘ্রই আসছে
            </div>
          </div>

          {/* 4 — AI Title & Description Generator */}
          <div className="group relative rounded-2xl bg-gray-800 border border-gray-700 p-7 hover:border-emerald-500/50 hover:bg-gray-800/80 transition-all duration-300">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-600/10 to-teal-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-5 shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center gap-2 mb-2">
              <h3 className="text-lg font-bold text-white">AI Title &amp; Description</h3>
              <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">Generator</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-5">
              Supplier পণ্য Upload করবে, AI Generate করবে সম্পূর্ণ কন্টেন্ট — সময় বাঁচান, বিক্রি বাড়ান।
            </p>
            <ul className="space-y-2">
              {["Facebook Caption", "Product Description ও Short Description", "SEO Description"].map((f, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-gray-300">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />{f}
                </li>
              ))}
            </ul>
            <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-amber-400">
              <Zap className="w-3.5 h-3.5" /> শীঘ্রই আসছে
            </div>
          </div>

          {/* 5 — AI Image Enhancer */}
          <div className="group relative rounded-2xl bg-gray-800 border border-gray-700 p-7 hover:border-amber-500/50 hover:bg-gray-800/80 transition-all duration-300 sm:col-span-2 lg:col-span-2">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-600/10 to-orange-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-1">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mb-5 shadow-lg">
                  <ImageIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-bold text-white">AI Product Image Enhancer</h3>
                  <span className="text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-medium">Image AI</span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-5">
                  Low Quality Product Photo Upload করলেই AI স্বয়ংক্রিয়ভাবে ছবি এনহান্স করবে। প্রফেশনাল প্রোডাক্ট ফটো এখন সবার নাগালে।
                </p>
                <ul className="grid grid-cols-2 gap-2">
                  {["Background Remove", "White Background", "Premium Background", "HD Enhancement"].map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-xs text-gray-300">
                      <CheckCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex items-center gap-1 text-xs font-semibold text-amber-400">
                  <Zap className="w-3.5 h-3.5" /> শীঘ্রই আসছে
                </div>
              </div>
              {/* Mini image mockup */}
              <div className="hidden sm:grid grid-cols-2 gap-3 w-48 shrink-0 self-center">
                <div className="aspect-square rounded-xl bg-gray-700 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-gray-500" />
                </div>
                <div className="aspect-square rounded-xl bg-gradient-to-br from-amber-500/30 to-orange-500/30 border border-amber-500/40 flex items-center justify-center">
                  <ImageIcon className="w-8 h-8 text-amber-400" />
                </div>
                <div className="col-span-2 text-center text-xs text-gray-500 mt-1">Before → After</div>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-400 text-sm mb-4">এই সকল টুলে Early Access পেতে এখনই Supplier হিসেবে রেজিস্টার করুন।</p>
          <button
            onClick={() => navigate("/vendor-register")}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-blue-600 text-white px-8 py-3.5 rounded-xl font-bold text-sm hover:opacity-90 transition shadow-lg shadow-violet-500/20"
          >
            Early Access পান <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default GrowthToolkit;
