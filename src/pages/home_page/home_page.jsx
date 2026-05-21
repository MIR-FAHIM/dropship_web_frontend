import React from "react";
import { CheckCircle, TrendingUp, ShoppingBag, Image, DollarSign, Package, Truck, Shield, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { imgBaseUrl } from '../../../config';
import { useListCategoriesQuery } from "../../redux/features/category";
import { useButtonClickMutation } from "../../redux/features/user";
import { Link } from "react-router-dom";
import ProductsListHomePage from "./product_list_home";
import FooterHome from "./FooterHome";
const HomePage = () => {

    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const [trackButtonClick, { isButtonLoading: createLoading, error: createError }] = useButtonClickMutation();
    const { data, error, isLoading } = useListCategoriesQuery();
    const handleChangeLanguage = (lng) => {
        i18n.changeLanguage(lng); // Change language dynamically
        localStorage.setItem("language", lng); // Optionally persist language selection
    };
    const handleButtonClick = (buttonName) => {

        trackButtonClick(buttonName)  // Call the mutation and pass the button name
            .unwrap() // Unwrap the response or error
            .then((response) => {
                console.log("Button click tracked:", response);
            })
            .catch((error) => {
                console.error("Error tracking button click:", error);
            });
    };
    const handleProductCat = (id) => {
        navigate(`/products-home/${id}`);
        handleButtonClick("product category home");
    };
    const handleDashboard = () => {
        navigate(`/login`);
        handleButtonClick("check dashboard");
    };
    const defaultImageUrl = 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80';
    const features = [
        { icon: <Shield className="w-6 h-6 text-green-500" />, text: t("home_page_bullets.access_verified_products") },
        { icon: <Search className="w-6 h-6 text-blue-500" />, text: t("home_page_bullets.product_analysis_ai_search") },
        { icon: <TrendingUp className="w-6 h-6 text-purple-500" />, text: t("home_page_bullets.sales_tips_strategies") },
        { icon: <Image className="w-6 h-6 text-indigo-500" />, text: t("home_page_bullets.download_images_videos") },
        { icon: <ShoppingBag className="w-6 h-6 text-orange-500" />, text: t("home_page_bullets.sell_own_platform") },
        { icon: <DollarSign className="w-6 h-6 text-green-600" />, text: t("home_page_bullets.set_own_prices") },
        { icon: <Package className="w-6 h-6 text-blue-600" />, text: t("home_page_bullets.instant_order_fulfillment") },
        { icon: <Truck className="w-6 h-6 text-red-500" />, text: t("home_page_bullets.cash_on_delivery") },
        { icon: <CheckCircle className="w-6 h-6 text-teal-500" />, text: t("home_page_bullets.no_stock_no_risk") }
    ];
    const workSteps = [
        {
            title: t("ধাপ ১ - মার্কেটিং:"),
            desc: t("ফেসবুক, ইনস্টাগ্রাম, ইউটিউব বা টিকটকে আমাদের পণ্যের ছবি/ভিডিও শেয়ার করুন।")
        },
        {
            title: t("ধাপ ২ - অর্ডার সাবমিট:"),
            desc: t("কাস্টমার যখন অর্ডার করবে, আপনি শুধু আমাদের প্যানেলে অর্ডারটি সাবমিট করবেন।")
        },
        {
            title: t("ধাপ ৩ - ডেলিভারি:"),
            desc: t("আমাদের মার্চেন্ট বা হাব থেকে পণ্য কাস্টমারের ঠিকানায় পৌঁছে যাবে।")
        },
        {
            title: t("ধাপ ৪ - কমিশন গ্রহণ:"),
            desc: t("ডেলিভারি সফল হলে আপনার ড্যাশবোর্ডে কমিশন জমা হয়ে যাবে।")
        }
    ];
    const resources = [
        {
            title: t("মার্কেটিং নিউজ"),
            desc: t("ডিজিটাল মার্কেটিংয়ের নতুন আপডেট সম্পর্কে জানুন।"),
            cta: t("নিউজ পড়ুন")
        },
        {
            title: t("বুস্টিং সার্ভিস"),
            desc: t("আপনার পোস্টকে হাজার হাজার মানুষের কাছে পৌঁছে দিতে বুস্টিং সহায়তা নিন।"),
            cta: t("সার্ভিস দেখুন")
        },
        {
            title: t("এক্সপার্ট হওয়ার কোর্স"),
            desc: t("শেখার জন্য গাইডলাইন ও কোর্সগুলো থেকে নিজেকে স্কিলড করুন।"),
            cta: t("কোর্স ও রিসোর্স")
        },
        {
            title: t("রেডিমেট ওয়েবসাইট"),
            desc: t("ওয়েবসাইট বানানোর ঝামেলা ছাড়াই রেডিমেট সাইট দিয়ে ব্যবসা চালু করুন।"),
            cta: t("ওয়েবসাইটগুলো দেখুন")
        }
    ];
    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error fetching categories.</div>;

    const handleImageError = (event) => {
        event.target.src = defaultImageUrl;
    };
    return (
        <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen font-sans">
            {/* Navbar */}
            <nav className="flex justify-between items-center px-6 sm:px-10 py-4 bg-white shadow-md sticky top-0 z-50">
                <h1 className="text-2xl font-bold text-blue-600">ResellerBrain</h1>
                <div className="hidden md:flex items-center space-x-6 text-gray-700 text-sm font-medium">
                    <a href="#about" className="hover:text-blue-600">{t("আমাদের সম্পর্কে")}</a>
                    <a href="#profits" className="hover:text-blue-600">{t("লাভ হিসাব")}</a>
                    <a href="#reviews" className="hover:text-blue-600">{t("রিভিউ")}</a>
                    <a href="#success" className="hover:text-blue-600">{t("সফলতার গল্প")}</a>
                    <button
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        onClick={() => navigate('/vendor-login')}
                    >{t("ভেন্ডর লগইন")}</button>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleChangeLanguage('en')}
                        className="bg-blue-500 text-white p-2 rounded-md text-sm"
                    >
                        English
                    </button>
                    <button
                        onClick={() => handleChangeLanguage('bd')}
                        className="bg-green-500 text-white p-2 rounded-md text-sm"
                    >
                        বাংলা
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="text-center py-16 bg-blue-600 text-white">
                <div className="max-w-3xl mx-auto px-6">
                    <h2 className="text-4xl sm:text-5xl font-extrabold leading-tight">🚀 {t("পুঁজি বা স্টক ছাড়াই আজই অনলাইন ব্যবসা শুরু করুন")}</h2>
                    <p className="mt-3 text-base sm:text-lg text-gray-200">
                        {t("ঝুঁকিহীনভাবে, ঘরে বসেই আপনার ই-কমার্স স্বপ্ন বাস্তব করুন")}
                    </p>

                    <div className="mt-6 mx-auto max-w-2xl rounded-xl border border-white/30 bg-white/10 px-5 py-4 text-left shadow-sm">
                        <p className="text-sm sm:text-base text-white/90 leading-relaxed">
                            {t("স্বাগতম ফিউচার অন্টপ্রেনিয়র! আপনি কি নিজের একটি অনলাইন ব্র্যান্ড তৈরি করার স্বপ্ন দেখছেন? কিন্তু পণ্যের স্টক করা, ডেলিভারি মেইনটেইন করা বা বড় ইনভেস্টমেন্টের অভাবে শুরু করতে পারছেন না? ResellerBrain এসেছে আপনার সেই সব সমস্যার সমাধান নিয়ে। আমরা বিশ্বাস করি, ব্যবসার জন্য বড় পুঁজির চেয়ে বড় ইচ্ছাশক্তি বেশি প্রয়োজন।")}
                        </p>
                    </div>

                    <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                        {/* <Link
                        to="/register">
                         <button className="bg-yellow-400 px-8 py-3 rounded-lg text-blue-900 font-bold text-lg transition duration-300 hover:bg-yellow-500">
                            {t("Get Started")}
                        </button></Link> */}


                        <button className="bg-white px-6 py-2.5 rounded-lg text-blue-900 font-bold text-base sm:text-lg transition duration-300 hover:bg-gray-200"
                            onClick={() => handleDashboard()}
                        >
                            {t("Dropshipper & Reseller Login")}
                        </button>

                    </div>
                </div>
            </section>

            {/* Why ResellerBrain Section */}
            <section className="py-14 bg-white">
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center">
                        {t("কেন ResellerBrain আপনার ব্যবসার সেরা পার্টনার?")}
                    </h2>

                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <details className="group rounded-2xl border border-blue-200 bg-white p-6 shadow-sm open:shadow-md">
                            <summary className="cursor-pointer list-none text-lg font-semibold text-blue-700 flex items-center justify-between">
                                {t("১. জিরো ইনভেস্টমেন্ট, ১০০% প্রফিট")}
                                <span className="ml-4 text-blue-400 transition-transform duration-300 group-open:rotate-180">▾</span>
                            </summary>
                            <p className="mt-4 text-sm sm:text-base text-gray-600 leading-relaxed">
                                {t("আমরা লাভজনক কোনো প্ল্যাটফর্ম নই; আমরা আপনার সফলতার অংশীদার। আমাদের মডেলটি ড্রপশিপিং ভিত্তিক, তাই নিজের স্টক ছাড়াই পণ্য বেছে নিয়ে মার্কেটিং করতে পারবেন। হাজারো ট্রেন্ডিং পণ্য থেকে পছন্দ করুন এবং অর্ডার কনফার্ম করুন—কোনো গুদাম বা ইনভেন্টরি মেইনটেন করার ঝামেলা নেই।")}
                            </p>
                            <div className="mt-4">
                                <button className="inline-flex items-center rounded-full border border-blue-400 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50">
                                    {t("বিস্তারিত পড়ুন")}
                                </button>
                            </div>
                        </details>

                        <details className="group rounded-2xl border border-blue-200 bg-white p-6 shadow-sm open:shadow-md">
                            <summary className="cursor-pointer list-none text-lg font-semibold text-blue-700 flex items-center justify-between">
                                {t("২. সঠিক পণ্য নির্বাচনের গাইডলাইন")}
                                <span className="ml-4 text-blue-400 transition-transform duration-300 group-open:rotate-180">▾</span>
                            </summary>
                            <p className="mt-4 text-sm sm:text-base text-gray-600 leading-relaxed">
                                {t("অনলাইনে কোন পণ্য ট্রেন্ডিং এবং কোনটি বিক্রি করলে বেশি লাভ হবে—এই তথ্য অনেক সময় পাওয়া কঠিন। ResellerBrain আপনাকে রিসার্চ ও গাইডলাইন দিয়ে সাহায্য করে, যাতে আপনি ডেটা-ড্রিভেন সিদ্ধান্ত নিতে পারেন।")}
                            </p>
                            <div className="mt-4">
                                <button className="inline-flex items-center rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700">
                                    {t("মার্কেট রিসার্চ টুল ব্যবহার করুন")}
                                </button>
                            </div>
                        </details>
                    </div>
                </div>
            </section>

            {/* Work Flow + Resources */}
            <section className="py-12 bg-gray-50">
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                        {t("আপনার কাজ কী? এবং আমরা কী করব?")}
                    </h2>
                    <div className="mt-3 h-px bg-gray-200" />
                    <p className="mt-4 text-sm sm:text-base text-gray-600">
                        {t("ব্যবসার জন্য আপনার মূল কাজ 'সেলস ও মার্কেটিং'; আর বাকি সব 'অপারেশনাল' কাজ আমাদের।")}
                    </p>

                    <div className="mt-6 space-y-4">
                        {workSteps.map((step, index) => (
                            <div key={index} className="rounded-lg bg-white shadow-sm border border-gray-100 p-4">
                                <div className="border-l-4 border-blue-500 pl-4">
                                    <p className="text-sm sm:text-base text-gray-700">
                                        <span className="font-semibold text-blue-700">{step.title}</span> {step.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="max-w-6xl mx-auto px-6 mt-12">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
                        {t("রিসোর্স যা আপনাকে এগিয়ে রাখবে অন্যদের চেয়ে")}
                    </h2>
                    <div className="mt-3 h-px bg-gray-200" />
                    <p className="mt-4 text-sm sm:text-base text-gray-600">
                        {t("আমরা শুধু পণ্য দিয়ে থামি না; আমরা আপনাকে একজন দক্ষ ব্যবসায়ী হিসেবে গড়ে তুলতে চাই।")}
                    </p>

                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {resources.map((resource, index) => (
                            <div key={index} className="rounded-xl bg-white border border-gray-200 p-5 shadow-sm">
                                <h3 className="text-base font-semibold text-blue-700">{resource.title}</h3>
                                <p className="mt-2 text-sm text-gray-600">{resource.desc}</p>
                                <button className="mt-4 w-full rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700">
                                    {resource.cta}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Key Benefits */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-4xl mx-auto px-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center">
                        {t("আমাদের কিছু প্রধান সুবিধা")}
                    </h2>
                    <p className="mt-2 text-center text-sm sm:text-base text-gray-600">
                        {t("বাংলা ভাষায় সহজ ব্যাখ্যা, যাতে আপনি দ্রুত সিদ্ধান্ত নিতে পারেন।")}
                    </p>

                    <div className="mt-8 space-y-4 text-base sm:text-lg text-gray-700">
                        {features.map((feature, index) => (
                            <div key={index} className="flex items-start gap-3 rounded-lg bg-white p-4 shadow-sm">
                                <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                                    {index + 1}
                                </span>
                                <div className="flex items-start gap-3">
                                    {feature.icon}
                                    <p>{feature.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>


            <ProductsListHomePage />

            {/* Categories section */}
            {/* <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-8xl mx-auto">
                    <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">{t("see_product")}</h1>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-4">
                        {data?.data?.data?.map((category) => (
                            <div
                                key={category.id}
                                onClick={() => handleProductCat(category.id)}
                                className="group cursor-pointer rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-transform transform hover:scale-105"
                            >
                                <div className="aspect-square bg-gray-200 border-2 border-gray-300 rounded-lg relative">
                                    <img
                                        src={category?.banner?.file_name ? `${imgBaseUrl}/${category.banner.file_name}` : defaultImageUrl}
                                        alt={category.name}
                                        className="w-full h-full object-cover rounded-lg"
                                        onError={handleImageError}
                                    />
                                    <div className="absolute bottom-0 left-0 right-0 bg-gray-800 text-white p-2 text-center">
                                        <h3 className="text-sm font-semibold">{category.name}</h3>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div> */}

            <FooterHome />
        </div>
    );
};

export default HomePage;
const ArrowIcon = () => (
    <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"></path>
    </svg>
);