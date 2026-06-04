import React, { useState } from "react";
import {
    CheckCircle, TrendingUp, ShoppingBag, Image, DollarSign,
    Package, Truck, Shield, Search, ArrowRight, Star, Zap,
    Users, BarChart3, Menu, X, MessageCircle, HeartHandshake,
    BadgeCheck, Sparkles
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router-dom";
import { useListCategoriesQuery } from "../../redux/features/category";
import { useButtonClickMutation } from "../../redux/features/user";
import ProductsListHomePage from "./product_list_home";
import FooterHome from "./FooterHome";

const globalStyles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50% { transform: translateY(-10px); }
  }
  @keyframes slide-up {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .animate-float { animation: float 4s ease-in-out infinite; }
  .animate-slide-up { animation: slide-up 0.6s ease both; }
`;

const HomePage = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [trackButtonClick] = useButtonClickMutation();
    const { error, isLoading } = useListCategoriesQuery();

    const handleChangeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        localStorage.setItem("language", lng);
    };
    const handleButtonClick = (buttonName) => {
        trackButtonClick(buttonName).unwrap()
            .then((r) => console.log("tracked:", r))
            .catch((e) => console.error("track error:", e));
    };
    const handleDashboard = () => {
        navigate("/login");
        handleButtonClick("check dashboard");
    };

    const stats = [
        { value: "5,000+",  label: "Active Resellers",  icon: <Users className="w-5 h-5" /> },
        { value: "10,000+", label: "Product Library",   icon: <Package className="w-5 h-5" /> },
        { value: "98%",     label: "Delivery Success",  icon: <Truck className="w-5 h-5" /> },
        { value: "50L+ BDT", label: "Monthly Payouts",  icon: <DollarSign className="w-5 h-5" /> },
    ];

    const features = [
        { icon: <Shield className="w-7 h-7" />,      title: "যাচাইকৃত পণ্য",            text: t("home_page_bullets.access_verified_products"),      grad: "from-green-400 to-green-600",  bg: "bg-green-50",  border: "border-green-200" },
        { icon: <Search className="w-7 h-7" />,       title: "AI পণ্য বিশ্লেষণ",         text: t("home_page_bullets.product_analysis_ai_search"),    grad: "from-blue-400 to-blue-600",      bg: "bg-blue-50",     border: "border-blue-200" },
        { icon: <TrendingUp className="w-7 h-7" />,   title: "বিক্রয় কৌশল",             text: t("home_page_bullets.sales_tips_strategies"),         grad: "from-purple-400 to-purple-600",  bg: "bg-violet-50",   border: "border-violet-200" },
        { icon: <Image className="w-7 h-7" />,        title: "মিডিয়া ডাউনলোড",          text: t("home_page_bullets.download_images_videos"),        grad: "from-indigo-400 to-indigo-600",  bg: "bg-indigo-50",   border: "border-indigo-200" },
        { icon: <ShoppingBag className="w-7 h-7" />,  title: "নিজের প্ল্যাটফর্মে বিক্রি", text: t("home_page_bullets.sell_own_platform"),           grad: "from-orange-400 to-amber-600",   bg: "bg-orange-50",   border: "border-orange-200" },
        { icon: <DollarSign className="w-7 h-7" />,   title: "নিজেই দাম ঠিক করুন",      text: t("home_page_bullets.set_own_prices"),                grad: "from-yellow-400 to-amber-500",   bg: "bg-yellow-50",   border: "border-yellow-200" },
        { icon: <Package className="w-7 h-7" />,      title: "তাৎক্ষণিক অর্ডার",        text: t("home_page_bullets.instant_order_fulfillment"),     grad: "from-teal-400 to-teal-600",      bg: "bg-teal-50",     border: "border-teal-200" },
        { icon: <Truck className="w-7 h-7" />,        title: "ক্যাশ অন ডেলিভারি",       text: t("home_page_bullets.cash_on_delivery"),              grad: "from-red-400 to-red-600",       bg: "bg-red-50",     border: "border-red-200" },
        { icon: <CheckCircle className="w-7 h-7" />,  title: "শূন্য ঝুঁকি",              text: t("home_page_bullets.no_stock_no_risk"),              grad: "from-cyan-400 to-cyan-600",      bg: "bg-cyan-50",     border: "border-cyan-200" },
    ];

    const workSteps = [
        { step: "১", emoji: "📱", color: "bg-blue-600",   light: "bg-blue-50 border-blue-200",     title: "মার্কেটিং করুন",       desc: "ফেসবুক, ইনস্টাগ্রাম বা টিকটকে পণ্যের ছবি/ভিডিও শেয়ার করুন আপনার নিজস্ব প্রাইস দিয়ে।" },
        { step: "২", emoji: "🛒", color: "bg-violet-600", light: "bg-violet-50 border-violet-200", title: "অর্ডার সাবমিট করুন",  desc: "কাস্টমার অর্ডার করলে আমাদের প্যানেলে অর্ডারটি আপনার প্রাইস সহ সাবমিট করুন।" },
        { step: "৩", emoji: "🚚", color: "bg-orange-500", light: "bg-orange-50 border-orange-200", title: "ডেলিভারি আমাদের",     desc: "আমাদের হাব থেকে পণ্য কাস্টমারের ঠিকানায় পৌঁছে যাবে — আপনার কোনো চিন্তা নেই।" },
        { step: "৪", emoji: "💰", color: "bg-green-600",  light: "bg-green-50 border-green-200",   title: "প্রফিট উইথড্র করুন", desc: "ডেলিভারি সফল হলে ড্যাশবোর্ডে প্রফিট জমা হবে। যখন খুশি উইথড্র করুন।" },
    ];

    const testimonials = [
        { name: "রাহেলা বেগম",     location: "ঢাকা",      income: "মাসে ২৫,০০০+", text: "আমি গৃহিণী ছিলাম, এখন মাসে ২৫,০০০+ টাকা আয় করছি। ResellerBrain আমার জীবন বদলে দিয়েছে।",        avatar: "রা", avatarBg: "bg-red-100 text-red-700",     stars: 5 },
        { name: "মো. সাকিব হাসান", location: "চট্টগ্রাম", income: "মাসে ৪০,০০০+", text: "পার্ট-টাইম করতাম, এখন ফুল-টাইম রিসেলার। স্টক ছাড়াই ব্যবসা করা সত্যিই অবিশ্বাস্য!",          avatar: "স",  avatarBg: "bg-blue-100 text-blue-700",   stars: 5 },
        { name: "নাফিসা আক্তার",   location: "সিলেট",     income: "মাসে ১৮,০০০+", text: "প্যানেল অনেক সহজ, সাপোর্ট টিম সবসময় সাহায্য করে। বিশ্বাসযোগ্য প্ল্যাটফর্ম।",               avatar: "ন",  avatarBg: "bg-green-100 text-green-700", stars: 5 },
    ];

    const resources = [
        { emoji: "📰", title: "মার্কেটিং নিউজ",    desc: "ডিজিটাল মার্কেটিংয়ের নতুন আপডেট সম্পর্কে জানুন।",                         cta: "নিউজ পড়ুন",     grad: "from-blue-500 to-blue-700" },
        { emoji: "🚀", title: "বুস্টিং সার্ভিস",    desc: "আপনার পোস্টকে হাজার হাজার মানুষের কাছে পৌঁছে দিতে বুস্টিং সহায়তা নিন।", cta: "সার্ভিস দেখুন", grad: "from-purple-500 to-purple-700" },
        { emoji: "🎓", title: "এক্সপার্ট কোর্স",   desc: "গাইডলাইন ও কোর্সগুলো থেকে নিজেকে স্কিলড করুন।",                          cta: "কোর্স দেখুন",   grad: "from-orange-500 to-orange-700" },
        { emoji: "💻", title: "রেডিমেট ওয়েবসাইট", desc: "ওয়েবসাইট বানানোর ঝামেলা ছাড়াই রেডিমেট সাইট দিয়ে ব্যবসা চালু করুন।",   cta: "দেখুন",         grad: "from-teal-500 to-teal-700" },
    ];

    const perks = [
        "নিজস্ব রিসেলার ড্যাশবোর্ড", "১০,০০০+ প্রোডাক্ট অ্যাক্সেস",
        "পণ্যের ছবি ও বিবরণ ডাউনলোড", "রিয়েল-টাইম অর্ডার ট্র্যাকিং",
        "দ্রুত পেমেন্ট উইথড্র",       "ডেডিকেটেড সাপোর্ট টিম",
        "সারা বাংলাদেশে ডেলিভারি",     "বিক্রয় ও মুনাফার বিশ্লেষণ",
    ];

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
            <div className="text-center">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white text-lg">লোড হচ্ছে...</p>
            </div>
        </div>
    );
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">Error fetching data.</div>;

    return (
        <>
            <style>{globalStyles}</style>
            <div className="bg-white min-h-screen font-sans">

                {/* NAVBAR */}
                <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center gap-2.5">
                                <div className="w-9 h-9 rounded-xl overflow-hidden shadow-sm flex items-center justify-center">
                                    <img src="/resellerbrain-logo-icon.png" alt="ResellerBrain" className="w-full h-full object-contain" />
                                </div>
                                <span className="text-xl font-black text-gray-900 tracking-tight">
                                    Reseller<span className="text-blue-600">Brain</span>
                                </span>
                            </div>

                            <div className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-600">
                                <a href="#how-it-works" className="hover:text-blue-600 transition-colors">কিভাবে কাজ করে</a>
                                <a href="#features"     className="hover:text-blue-600 transition-colors">সুবিধাসমূহ</a>
                                <a href="#testimonials" className="hover:text-blue-600 transition-colors">সফলতার গল্প</a>
                                <Link to="/about-us"    className="hover:text-blue-600 transition-colors">আমাদের সম্পর্কে</Link>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className="hidden sm:flex gap-1 bg-gray-100 rounded-lg p-1 text-xs font-semibold">
                                    <button onClick={() => handleChangeLanguage("en")} className="px-2.5 py-1 rounded-md hover:bg-white hover:shadow-sm transition-all">EN</button>
                                    <button onClick={() => handleChangeLanguage("bd")} className="px-2.5 py-1 rounded-md hover:bg-white hover:shadow-sm transition-all">বাং</button>
                                </div>
                                <button onClick={() => navigate("/vendor")} className="hidden sm:block text-sm font-medium text-gray-600 hover:text-blue-600 px-3 py-2 transition-colors">ভেন্ডর</button>
                                <button
                                    onClick={handleDashboard}
                                    className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                                >লগইন</button>
                                <Link to="/register" className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors shadow-sm">
                                    <Zap className="w-3.5 h-3.5" /> ফ্রি শুরু করুন
                                </Link>
                                <button className="md:hidden p-2 text-gray-700" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                                    {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    </div>
                    {mobileMenuOpen && (
                        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3 animate-slide-up">
                            <a href="#how-it-works" className="block text-gray-700 py-2 font-medium" onClick={() => setMobileMenuOpen(false)}>কিভাবে কাজ করে</a>
                            <a href="#features"     className="block text-gray-700 py-2 font-medium" onClick={() => setMobileMenuOpen(false)}>সুবিধাসমূহ</a>
                            <a href="#testimonials" className="block text-gray-700 py-2 font-medium" onClick={() => setMobileMenuOpen(false)}>সফলতার গল্প</a>
                            <div className="flex gap-2 pt-1">
                                <button onClick={() => { handleChangeLanguage("en"); setMobileMenuOpen(false); }} className="flex-1 bg-gray-100 py-2 rounded-lg text-sm font-semibold">EN</button>
                                <button onClick={() => { handleChangeLanguage("bd"); setMobileMenuOpen(false); }} className="flex-1 bg-gray-100 py-2 rounded-lg text-sm font-semibold">বাংলা</button>
                            </div>
                            <Link to="/register" className="block w-full text-center bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold transition-colors">
                                বিনামূল্যে রেজিস্ট্রেশন করুন
                            </Link>
                        </div>
                    )}
                </nav>

                {/* HERO */}
                <section className="relative overflow-hidden text-white pt-20 pb-28" style={{ background: "linear-gradient(135deg, #0f172a 0%, #0d1b4b 50%, #0f172a 100%)" }}>
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <div className="absolute -top-1/3 -right-1/4 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-1/3 -left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/5 rounded-full blur-2xl"></div>
                    </div>

                    <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
                        <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-4 py-1.5 text-sm font-semibold text-blue-300 mb-8 animate-slide-up">
                            <Zap className="w-3.5 h-3.5 fill-blue-400 text-blue-400" />
                            বাংলাদেশের সবচেয়ে স্মার্ট এবং AI-চালিত রিসেলার প্ল্যাটফর্ম
                        </div>

                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight mb-6 animate-slide-up">
                            <span className="block text-white">পুঁজি ছাড়াই গড়ুন</span>
                            <span className="block bg-gradient-to-r from-yellow-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
                                আপনার স্বপ্নের ব্যবসা 🚀
                            </span>
                        </h1>

                        <p className="text-lg sm:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto mb-10 animate-slide-up">
                            স্টক নেই, গুদাম নেই, ঝুঁকি নেই। শুধু পণ্য বেচুন —{" "}
                            <strong className="text-white">প্যাকেজিং থেকে ডেলিভারি সব আমাদের দায়িত্ব।</strong>
                            {" "}আমাদের শক্তিশালী Product Analysis System আপনাকে সবসময় winning product নিয়ে কাজ করার suggestion দিবে এবং সফলতা পেতে সাহায্য করবে।
                        </p>

                        {/* AI INSIGHT HIGHLIGHT */}
                        <div className="max-w-2xl mx-auto mb-10 animate-slide-up">
                            <div className="relative rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, rgba(234,179,8,0.12) 0%, rgba(99,102,241,0.12) 100%)", border: "1px solid rgba(234,179,8,0.35)" }}>
                                <div className="absolute top-0 left-0 w-full h-0.5" style={{ background: "linear-gradient(90deg, #eab308, #6366f1, #eab308)" }}></div>
                                <div className="flex items-start gap-3 px-5 py-4 text-left">
                                    <div className="flex-shrink-0 mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center text-base" style={{ background: "linear-gradient(135deg, #eab308, #f59e0b)" }}>
                                        🔍
                                    </div>
                                    <p className="text-sm sm:text-base text-yellow-100 leading-relaxed">
                                        <span className="font-bold text-yellow-300">আমাদের AI Product Analysis Tool</span> সেই সকল পণ্য খুঁজে বের করে যেগুলো বর্তমানে কাস্টমারদের কাছে সবচেয়ে বেশি চাহিদাসম্পন্ন — এই পণ্যগুলো নিয়ে কাজ করলে আপনি অত্যন্ত সহজেই বিক্রয় বৃদ্ধি করতে পারবেন।
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-slide-up">
                            <Link
                                to="/register"
                                onClick={() => handleButtonClick("hero register")}
                                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-gray-900 font-black text-lg px-8 py-4 rounded-xl transition-all shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 hover:-translate-y-0.5 active:translate-y-0"
                            >
                                <Zap className="w-5 h-5" /> বিনামূল্যে শুরু করুন
                            </Link>
                            <button
                                onClick={handleDashboard}
                                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-base px-8 py-4 rounded-xl transition-all backdrop-blur-sm"
                            >
                                ড্যাশবোর্ড দেখুন <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex flex-wrap justify-center gap-2.5 mb-12 animate-slide-up">
                            {["✅ কোনো বিনিয়োগ নেই", "✅ ফ্রি রেজিস্ট্রেশন", "✅ COD সাপোর্ট", "✅ ২৪/৭ সাপোর্ট"].map(item => (
                                <span key={item} className="bg-white/10 border border-white/15 text-white/90 text-sm px-3.5 py-1.5 rounded-full backdrop-blur-sm">
                                    {item}
                                </span>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto animate-slide-up">
                            {stats.map((s, i) => (
                                <div key={i} className="bg-white/10 border border-white/15 rounded-2xl px-4 py-5 text-center backdrop-blur-sm hover:bg-white/15 transition-colors">
                                    <div className="flex justify-center text-blue-300 mb-2">{s.icon}</div>
                                    <div className="text-2xl sm:text-3xl font-black text-white mb-1">{s.value}</div>
                                    <div className="text-xs text-slate-400">{s.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0">
                        <svg viewBox="0 0 1440 52" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full block">
                            <path d="M0 52L1440 52L1440 26C1200 0 960 0 720 26C480 52 240 52 0 26L0 52Z" fill="white" />
                        </svg>
                    </div>
                </section>

                {/* HOW IT WORKS */}
                <section id="how-it-works" className="py-20 bg-white">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6">
                        <div className="text-center mb-14">
                            <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">সহজ প্রক্রিয়া</span>
                            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-2 mb-3">মাত্র ৪টি ধাপে শুরু করুন</h2>
                            <p className="text-gray-500 max-w-lg mx-auto">আপনার কাজ শুধু বিক্রি করা — বাকি সব অপারেশন আমাদের।</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {workSteps.map((step, i) => (
                                <div key={i} className="relative">
                                    {i < workSteps.length - 1 && (
                                        <div className="hidden lg:block absolute top-7 left-full w-full h-0.5 bg-gradient-to-r from-gray-300 to-transparent z-0 -ml-3 mr-3"></div>
                                    )}
                                    <div className={"relative z-10 rounded-2xl border-2 " + step.light + " p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 group"}>
                                        <div className={"text-4xl mb-4 animate-float"} style={{ animationDelay: i * 0.3 + "s" }}>{step.emoji}</div>
                                        <div className={"inline-flex items-center justify-center w-8 h-8 " + step.color + " text-white text-sm font-black rounded-lg mb-3 shadow-sm"}>
                                            {step.step}
                                        </div>
                                        <h3 className="text-base font-bold text-gray-900 mb-2">{step.title}</h3>
                                        <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12 text-center">
                            <Link
                                to="/register"
                                onClick={() => handleButtonClick("how-it-works cta")}
                                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-md shadow-blue-500/25 hover:shadow-blue-500/40 hover:-translate-y-0.5"
                            >
                                এখনই শুরু করুন <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* FEATURES */}
                <section id="features" className="py-20 bg-gray-50">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6">
                        <div className="text-center mb-14">
                            <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">প্ল্যাটফর্ম সুবিধা</span>
                            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-2 mb-3">আমাদের প্রধান সুবিধাসমূহ</h2>
                            <p className="text-gray-500 max-w-lg mx-auto">ResellerBrain-এ যোগ দিলে আপনি যা যা পাবেন</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {features.map((f, i) => (
                                <div key={i} className={f.bg + " border " + f.border + " rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group cursor-default"}>
                                    <div className={"inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br " + f.grad + " text-white mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300"}>
                                        {f.icon}
                                    </div>
                                    <h3 className="text-base font-bold text-gray-900 mb-1.5">{f.title}</h3>
                                    <p className="text-sm text-gray-600 leading-relaxed">{f.text}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* RESPONSIBILITY BANNER */}
                <section className="py-16 text-white relative overflow-hidden" style={{ background: "linear-gradient(90deg, #2563eb 0%, #1d4ed8 50%, #4f46e5 100%)" }}>
                    <div className="pointer-events-none absolute inset-0">
                        <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/5 rounded-full"></div>
                        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/5 rounded-full"></div>
                    </div>
                    <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
                        <h2 className="text-3xl sm:text-4xl font-black mb-3">
                            আপনার কাজ শুধু <span className="text-yellow-300">বিক্রি করা</span>
                        </h2>
                        <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
                            পণ্য সংগ্রহ, প্যাকেজিং, ডেলিভারি, ক্যাশ কালেকশন — সব কিছু আমরা সামলাই।
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-2xl mx-auto text-sm">
                            {["✓ পণ্য স্টক আমাদের", "✓ ডেলিভারি আমাদের", "✓ প্যাকেজিং আমাদের",
                              "✓ কাস্টমার সাপোর্ট", "✓ রিটার্ন হ্যান্ডলিং", "✓ পেমেন্ট কালেকশন"].map(item => (
                                <div key={item} className="bg-white/15 border border-white/20 rounded-xl py-2.5 px-4 font-semibold text-white/95">{item}</div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* PRODUCTS SHOWCASE */}
                <section className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6">
                        <div className="text-center mb-10">
                            <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">পণ্য সংগ্রহ</span>
                            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-2 mb-3">হাজারো পণ্য আপনার জন্য প্রস্তুত</h2>
                            <p className="text-gray-500">লগইন করুন এবং যেকোনো পণ্য বেছে বিক্রি শুরু করুন</p>
                        </div>
                        <ProductsListHomePage />
                        <div className="mt-10 text-center">
                            <Link
                                to="/register"
                                onClick={() => handleButtonClick("products cta register")}
                                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold px-8 py-3.5 rounded-xl transition-all shadow-md shadow-blue-500/25 hover:-translate-y-0.5"
                            >
                                সব পণ্য দেখতে রেজিস্ট্রেশন করুন <ArrowRight className="w-4 h-4" />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* TESTIMONIALS */}
                <section id="testimonials" className="py-20 bg-gray-50">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6">
                        <div className="text-center mb-14">
                            <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">সফলতার গল্প</span>
                            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-2 mb-3">তারা সফল হয়েছেন</h2>
                            <p className="text-gray-500">আমাদের রিসেলারদের বাস্তব অভিজ্ঞতা</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {testimonials.map((t, i) => (
                                <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between">
                                    <div>
                                        <div className="flex gap-0.5 mb-4">
                                            {Array.from({ length: t.stars }).map((_, j) => (
                                                <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                            ))}
                                        </div>
                                        <p className="text-gray-700 text-sm leading-relaxed mb-5 italic">"{t.text}"</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className={"w-10 h-10 rounded-full flex items-center justify-center font-bold text-base shrink-0 " + t.avatarBg}>
                                            {t.avatar}
                                        </div>
                                        <div>
                                            <div className="font-bold text-gray-900 text-sm">{t.name}</div>
                                            <div className="text-xs text-gray-400">{t.location}</div>
                                        </div>
                                        <div className="ml-auto bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
                                            {t.income}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* PERKS CHECKLIST */}
                <section className="py-16 bg-white">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6">
                        <div className="text-center mb-10">
                            <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">সদস্যপদ সুবিধা</span>
                            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-2 mb-3">রিসেলার হিসেবে আপনি পাচ্ছেন</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {perks.map(item => (
                                <div key={item} className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 hover:bg-blue-50 hover:border-blue-100 transition-colors">
                                    <BadgeCheck className="w-5 h-5 text-blue-600 shrink-0" />
                                    <span className="text-gray-700 text-sm font-medium">{item}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* RESOURCES */}
                <section className="py-20 bg-gray-50">
                    <div className="max-w-6xl mx-auto px-4 sm:px-6">
                        <div className="text-center mb-14">
                            <span className="text-blue-600 font-semibold text-sm uppercase tracking-widest">রিসোর্স সেন্টার</span>
                            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mt-2 mb-3">এগিয়ে থাকুন প্রতিযোগীদের চেয়ে</h2>
                            <p className="text-gray-500 max-w-lg mx-auto">আমরা শুধু পণ্য দিয়ে থামি না — আপনাকে সফল ব্যবসায়ী হিসেবে গড়তে চাই</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                            {resources.map((r, i) => (
                                <div key={i} className="group rounded-2xl overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5">
                                    <div className={"bg-gradient-to-br " + r.grad + " p-6 text-white"}>
                                        <div className="text-4xl mb-3">{r.emoji}</div>
                                        <h3 className="text-lg font-bold">{r.title}</h3>
                                    </div>
                                    <div className="p-5 bg-white">
                                        <p className="text-sm text-gray-600 leading-relaxed mb-4">{r.desc}</p>
                                        <button className="w-full bg-gray-900 hover:bg-gray-700 text-white text-sm font-bold py-2.5 rounded-xl transition-colors">
                                            {r.cta}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FINAL CTA */}
                <section className="py-24 text-white relative overflow-hidden" style={{ background: "linear-gradient(135deg, #0f172a 0%, #0d1b4b 50%, #0f172a 100%)" }}>
                    <div className="pointer-events-none absolute inset-0 overflow-hidden">
                        <div className="absolute top-0 left-1/4 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl"></div>
                    </div>
                    <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
                        <HeartHandshake className="w-14 h-14 mx-auto mb-6 text-yellow-400" />
                        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4">
                            আজই শুরু করুন, <span className="text-yellow-400">বিনামূল্যে!</span>
                        </h2>
                        <p className="text-slate-300 text-lg mb-10 max-w-xl mx-auto">
                            হাজার হাজার রিসেলার ইতিমধ্যে ResellerBrain-এর মাধ্যমে সফলভাবে আয় করছেন। আপনার সুযোগ মিস করবেন না।
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/register"
                                onClick={() => handleButtonClick("final cta register")}
                                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-gray-900 font-black text-lg px-10 py-4 rounded-xl transition-all shadow-lg shadow-yellow-500/30 hover:shadow-yellow-500/50 hover:-translate-y-0.5"
                            >
                                <Zap className="w-5 h-5" /> ফ্রি রেজিস্ট্রেশন করুন
                            </Link>
                            <Link
                                to="/"
                                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold text-base px-8 py-4 rounded-xl transition-all"
                            >
                                <MessageCircle className="w-4 h-4" /> আমাদের সাথে কথা বলুন
                            </Link>
                        </div>
                        <p className="mt-6 text-slate-500 text-sm">
                            ক্রেডিট কার্ড লাগবে না &nbsp;•&nbsp; কোনো ফি নেই &nbsp;•&nbsp; যেকোনো সময় বাতিল করুন
                        </p>
                    </div>
                </section>

                <FooterHome />
            </div>
        </>
    );
};

export default HomePage;
