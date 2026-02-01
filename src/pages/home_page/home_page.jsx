import React from "react";
import { CheckCircle, TrendingUp, ShoppingBag, Image, DollarSign, Package, Truck, Shield, Search } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {imgBaseUrl} from '../../../config';
import { useListCategoriesQuery } from "../../redux/features/category";
import { useButtonClickMutation } from "../../redux/features/user";
import { Link } from "react-router-dom";
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
        navigate(`/dashboard`);
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
    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error fetching categories.</div>;

    const handleImageError = (event) => {
        event.target.src = defaultImageUrl;
    };
    return (
        <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen font-sans">
            {/* Navbar */}
            <nav className="flex justify-between items-center px-10 py-4 bg-white shadow-md sticky top-0 z-50">
                <h1 className="text-2xl font-bold text-blue-600">Bebsha360</h1>
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
                <div className="space-x-6 text-gray-700">
                    <a href="#products" className="hover:text-blue-600">Products</a>
                    <a href="#profits" className="hover:text-blue-600">ridoyfahim92@gmail.com</a>
                    <a href="#marketing" className="hover:text-blue-600">01782084390(whatsapp)</a>
                   

                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                     onClick={() => navigate('/contact-us-form')}
                    >Contact To Developer</button>
                  
                </div>
            </nav>

            {/* Hero Section */}
            <section className="text-center py-20 bg-blue-600 text-white">
                <div className="max-w-3xl mx-auto px-6">
                    <h2 className="text-5xl font-extrabold leading-tight">🚀 {t("Bebsha360 – Start Your E-Commerce Business with Zero Investment!")}</h2>
                    <p className="mt-4 text-lg text-gray-200">
                        {t("Now, anyone—from students to homemakers, beginners to professionals—can launch their own e-commerce business without any inventory or upfront investment! Bebsha360 brings you a hassle-free dropshipping and reselling platform where you can:")}
                    </p>

                    <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
                        {/* <Link
                        to="/register">
                         <button className="bg-yellow-400 px-8 py-3 rounded-lg text-blue-900 font-bold text-lg transition duration-300 hover:bg-yellow-500">
                            {t("Get Started")}
                        </button></Link> */}
                       
                        
                            <button className="bg-white px-8 py-3 rounded-lg text-blue-900 font-bold text-lg transition duration-300 hover:bg-gray-200"
                            onClick={() => handleDashboard()}
                            >
                                {t("Check Demo Dashboard")}
                            </button>
                       
                    </div>
                </div>
            </section>

            {/* Key Benefits */}
            <section className="py-16 text-center bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800">{t("home_page_bullets.we_determined")}</h2>

        <div className="mt-6 space-y-4 text-lg text-gray-700">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-3 justify-center">
              {feature.icon}
              <p>{feature.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <h2 className="text-center text-4xl font-bold text-gray-800">{t("home_page_bullets.only_8_steps_to_profit")}</h2>


            <div className="mt-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 relative">
                {[
                    { title: t("steps.register.title"), desc:t("steps.register.desc") },
                    { title: t("steps.select_products.title"), desc: t("steps.select_products.desc") },
                    { title: t("steps.download_kit.title"), desc: t("steps.download_kit.desc") },
                    { title: t("steps.upload_sell.title"), desc: t("steps.upload_sell.desc") },
                    { title: t("steps.get_orders.title"), desc: t("steps.get_orders.desc") },
                    { title: t("steps.order_bebsha360.title"), desc: t("steps.order_bebsha360.desc") },
                    { title: t("steps.delivery_bebsha360.title"), desc: t("steps.delivery_bebsha360.desc") },
                    { title: t("steps.earn_withdraw.title"), desc: t("steps.earn_withdraw.desc") },
                ].map((step, index) => (
                    <div key={index} className="flex flex-col items-center">
                        <div className="p-6 bg-white shadow-lg rounded-lg w-full h-[200px] flex flex-col justify-center text-center">
                            <h3 className="text-md font-bold text-blue-600">{step.title}</h3>
                            
                        </div>
                    </div>
                ))}
            </div>


            {/* Categories section */}
            <div className="min-h-screen bg-gray-50 p-6">
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
            </div>

            <p className="text-gray-600 mt-2">Created By Mir Fahim Rahman</p>
        </div>
    );
};

export default HomePage;
const ArrowIcon = () => (
    <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"></path>
    </svg>
);