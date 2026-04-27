import i18next from "i18next";
import { initReactI18next } from "react-i18next";

// Language resources (translations)
const resources = {
  en: {
    translation: {
      welcome: "Welcome",
      Dashboard: "Dashboard",
      "All Products": "All Products",
      "Favourite Product": "Favourite Product",
      "Facebook Content": "Facebook Content",
      "Order List": "Order List",
      "Sales & Profit": "Sales & Profit",
      "Payments": "Payments",
      "Transactions": "Transactions",
      "Support Ticket": "Support Ticket",
      "Admin Activity": "Admin Activity",
      "Error Log": "Error Log",
      "Product Collection": "We have a collection of total products",
      "We Have Product Images": "We Have Product Images",
      "We have video": "We Have Product Videos",
      "And": "and",
      "All Products": "All Products",
      "Browse Categories": "Browse Categories",
      "Winning Products": "Winning Products",
      "Boosting Products": "Boosting Products",
      "Sales Guideline": "Sales Guideline",
      "Learning Video": "Learning Video",
      "Ecommerce Website": "Ecommerce Website",
      "Sales Dashboard": "Sales Dashboard",
      "Balance Statement": "Balance Statement",
      "Passive Income": "Passive Income",
      "Support Center": "Support Center",
      "General Questions": "General Questions",
      "Notice Board": "Notice Board",
      "Tips Board": "Tips Board",
      "Product Leaderboard": "Product Leaderboard",
      "Withdraw": "Withdraw",
      "Add Payment Account": "Add Payment Account",
      "Check Demo Dashboard": "Check Demo Dashboard",
      "Get Started": "Get Started",
      "see_product": "Find Products from categories.",
      "home_page_bullets": {
        "access_verified_products": "১০,০০০+ ভেরিফাইড প্রোডাক্ট সহজেই পাবেন বিভিন্ন ক্যাটেগরিতে",
        "download_images_videos": "ফ্রিতে ডাউনলোড করুন উচ্চমানের পণ্যের ছবি ও ভিডিও",
        "sell_own_platform": "নিজের প্ল্যাটফর্মে বিক্রি করুন (ফেসবুক, হোয়াটসঅ্যাপ, ওয়েবসাইট, বা মার্কেটপ্লেস)",
        "set_own_prices": "নিজের মূল্য নির্ধারণ করুন এবং তাৎক্ষণিক লাভ করুন",
        "instant_order_fulfillment": "অর্ডার প্লেস করলেই সঙ্গে সঙ্গে প্রসেসিং—শুধু ResellerBrain-এ আপনার নিজস্ব প্রাইসে অর্ডার করুন",
        "cash_on_delivery": "ক্যাশ অন ডেলিভারি, কল সেন্টার সাপোর্ট, ও রিয়েল-টাইম ট্র্যাকিং উপভোগ করুন",
        "no_stock_no_risk": "স্টক নেই, ডেলিভারি ব্যবস্থা নেই, ঝামেলা নেই—শুধু বিক্রি করুন আর আয় করুন! 🚀 আজই ResellerBrain-এর সাথে আপনার বিজনেস শুরু করুন!",
        "we_determined": "আমরা আপনার ব্যবসা বৃদ্ধিতে বদ্ধপরিকর",
        "sales_tips_strategies": "পণ্যের সঠিক কৌশল ও এক্সপার্ট টিপস সংগ্রহ করতে পারবেন যাতে সহজেই আপনার বিক্রি বাড়ে",
        "product_analysis_ai_search": "পণ্য বিশ্লেষণ টুলস ও এআই-ভিত্তিক পণ্য অনুসন্ধান করে সহজেই সেরা ও লাভজনক পণ্য খুঁজে পান",
        "only_8_steps_to_profit": "💰 মাত্র ৮ ধাপে আপনার লাভ বৃদ্ধি করুন!"
      },

      
        "faq": {
          "question_1": {
            "ques": "What is ResellerBrain?",
            "ans": "ResellerBrain is a complete automated online product reselling business platform.",
         
          },
         
     
         
          "question_2": {
            "ques": "What is the delivery charge?",
            "ans": "The delivery charge within Dhaka is 70 BDT, outside Dhaka it's 120 BDT. If the product quantity is higher or the weight is more, the delivery charge may increase by 10 to 30 BDT."
          },
          
          "question_3": {
            "ques": "Do I need to pay a return charge?",
            "ans": "No, we do not charge any return fee."
          },
         
          "question_4": {
            "ques": "Do I need to pay the delivery charge in advance?",
            "ans": "For new sellers, the delivery charge for the first 5 orders needs to be paid in advance. After 5 orders, advance payment is not required."
          },
          
          "question_5": {
            "ques": "Is there an exchange order option?",
            "ans": "Yes, you can check the product while the delivery man is at your door. If there is any defect, we will send a replacement at our cost. After the delivery man leaves, if you want to exchange, a new delivery charge will apply."
          },
          
          "question_6": {
            "ques": "How much time does it take for the order to be booked?",
            "ans":"If the order is confirmed by 3 PM, it will be booked by evening. Orders confirmed after 3 PM will be booked the next day.",

          },
         
          "question_7": {
            "ques": "How and when will I receive my profit?",
            "ans": "Once your product is delivered, the profit amount will be added to your account after midnight. You can withdraw the profit to your bKash or Nogod account instantly, and the request will be processed within 1 hour.",

          },
          
          "question_8": {
            "ques": "Can I send multiple products to the same address with a single delivery charge?",
            "ans": "Yes, you can combine any products from our app and send them to the same address with a single delivery charge.",

          },
          
        },
      
      
      'steps':{
        "register": {
          "title": "1. Register",
          
          "desc": "Create your free account and start your journey.",
         
        },
        "select_products": {
          "title": "2. Select Products",
          "desc": "Browse our product catalog and choose the items you want to sell."
        },
        "download_kit": {
          "title": "3. Download Marketing Kit",
          "desc": "Get high-quality images & videos to promote products on social media."
        },
        "upload_sell": {
          "title": "4. Upload & Sell",
          "desc": "Share products on Facebook, Instagram, or your online shop."
        },
        "get_orders": {
          "title": "5. Get Orders",
          "desc": "Customers place orders on your platform."
        },
        "order_bebsha360": {
          "title": "6. Order from ResellerBrain",
          "desc": "Place the same order with your price on ResellerBrain with customer details."
        },
        "delivery_bebsha360": {
          "title": "7. Delivery by ResellerBrain",
          "desc": "We handle packaging & delivery to your customer."
        },
        "earn_withdraw": {
          "title": "8. Earn & Withdraw",
          "desc": "Get your profit in your ResellerBrain balance and withdraw via bKash/Nagad."
        }

      },
      
      
      "ResellerBrain – Start Your E-Commerce Business with Zero Investment!": "ResellerBrain – Start Your E-Commerce Business with Zero Investment!",
      "Now, anyone—from students to homemakers, beginners to professionals—can launch their own e-commerce business without any inventory or upfront investment! ResellerBrain brings you a hassle-free dropshipping and reselling platform where you can:": "Now, anyone—from students to homemakers, beginners to professionals—can launch their own e-commerce business without any inventory or upfront investment! ResellerBrain brings you a hassle-free dropshipping and reselling platform where you can:",


      
    },
  },
  bd: {
    translation: {
      welcome: "স্বাগতম",
      Dashboard: "ড্যাশবোর্ড",
      "Product Collection": "আমাদের কালেকশনে মোট প্রোডাক্ট আছে",
      "We have video": "প্রোডাক্টের ভিডিও আছে",
      "And": "এবং",
      "We Have Product Images": " প্রোডাক্টের ছবি আছে",
      "All Products": "সকল পণ্য",
      "Browse Categories": "ব্রাউজ ক্যাটেগরিজ",
      "Favourite Product": "প্রিয় পণ্য",
      "Facebook Content": "ফেসবুক কনটেন্ট",
      "Order List": "অর্ডার তালিকা",
      "Sales & Profit": "বিক্রয় এবং লাভ",
      "Payments": "পেমেন্ট",
      "Check Demo Dashboard": "ডেমো ড্যাশবোর্ড দেখুন",
      "Transactions": "লেনদেন",
      "Support Ticket": "সাপোর্ট টিকেট",
      "Admin Activity": "এডমিন কার্যক্রম",
      "Error Log": "ত্রুটি লগ",
      "All Products": "সমস্ত পণ্য",
      "Winning Products": "জয়ী পণ্য",
      "Boosting Products": "বুস্টিং পণ্য",
      "Sales Guideline": "বিক্রয় গাইডলাইন",
      "Learning Video": "শিক্ষণ ভিডিও",
      "Ecommerce Website": "ইকমার্স ওয়েবসাইট",
      "Sales Dashboard": "বিক্রয় ড্যাশবোর্ড",
      "Balance Statement": "ব্যালেন্স স্টেটমেন্ট",
      "Passive Income": "প্যাসিভ ইনকাম",
      "Support Center": "সাপোর্ট সেন্টার",
      "General Questions": "সাধারণ প্রশ্ন",
      "Notice Board": "বিজ্ঞপ্তি বোর্ড",
    "Tips Board": "টিপস বোর্ড",
    "see_product": "আমাদের ক্যাটাগরি থেকে সকল প্রোডাক্ট দেখুন",
    "Product Leaderboard": "পণ্য লিডারবোর্ড",
    "Withdraw": "টাকা উত্তোলন",
    "Add Payment Account": "পেমেন্ট একাউন্ট যুক্ত করুন",
    "Get Started": "এখনই শুরু করুন ব্যবসা",
    "ResellerBrain – Start Your E-Commerce Business with Zero Investment!": "ResellerBrain – বিনিয়োগ ছাড়াই শুরু করুন নিজের ই-কমার্স ব্যবসা!",
    "Now, anyone—from students to homemakers, beginners to professionals—can launch their own e-commerce business without any inventory or upfront investment! ResellerBrain brings you a hassle-free dropshipping and reselling platform where you can:": "এখন যে কেউ—শিক্ষার্থী, গৃহিণী, চাকরিজীবী বা একেবারে নতুন উদ্যোক্তারা—এক টাকাও বিনিয়োগ না করে নিজের ই-কমার্স ব্যবসা শুরু করতে পারবেন! ResellerBrain আপনাকে দিচ্ছে ড্রপশিপিং ও রিসেলিং-এর সেরা সুযোগ, যেখানে আপনি—",
    "home_page_bullets": {
      "access_verified_products": "১০,০০০+ ভেরিফাইড প্রোডাক্ট সহজেই পাবেন বিভিন্ন ক্যাটেগরিতে",
      "download_images_videos": "ফ্রিতে ডাউনলোড করুন উচ্চমানের পণ্যের ছবি ও ভিডিও",
      "sell_own_platform": "নিজের প্ল্যাটফর্মে বিক্রি করুন (ফেসবুক, হোয়াটসঅ্যাপ, ওয়েবসাইট, বা মার্কেটপ্লেস)",
      "set_own_prices": "নিজের মূল্য নির্ধারণ করুন এবং তাৎক্ষণিক লাভ করুন",
      "instant_order_fulfillment": "অর্ডার প্লেস করলেই সঙ্গে সঙ্গে প্রসেসিং—শুধু ResellerBrain-এ আপনার নিজস্ব প্রাইসে অর্ডার করুন",
      "cash_on_delivery": "ক্যাশ অন ডেলিভারি, কল সেন্টার সাপোর্ট, ও রিয়েল-টাইম ট্র্যাকিং উপভোগ করুন",
      "no_stock_no_risk": "স্টক নেই, ডেলিভারি ব্যবস্থা নেই, ঝামেলা নেই—শুধু বিক্রি করুন আর আয় করুন! 🚀 আজই ResellerBrain-এর সাথে আপনার বিজনেস শুরু করুন!",
      "we_determined": "আমরা আপনার ব্যবসা বৃদ্ধিতে বদ্ধপরিকর",
      "sales_tips_strategies": "পণ্যের সঠিক কৌশল ও এক্সপার্ট টিপস সংগ্রহ করতে পারবেন যাতে সহজেই আপনার বিক্রি বাড়ে",
      "product_analysis_ai_search": "পণ্য বিশ্লেষণ টুলস ও এআই-ভিত্তিক পণ্য অনুসন্ধান করে সহজেই সেরা ও লাভজনক পণ্য খুঁজে পান",
      "only_8_steps_to_profit":"💰 মাত্র ৮ ধাপে আপনার লাভ বৃদ্ধি করুন!",

    },
"faq": {
          "question_1": {
            "ans":  "ResellerBrain একটি সম্পূর্ণ অটোমেটেড অনলাইন প্রোডাক্ট রিসেলিং বিজনেস এর সহযোগী প্লাটফর্ম।",
            "ques": "ResellerBrain কি?"
          },
          
          "question_2": {
            "ans":  "ডেলিভারি চার্জ ঢাকার মধ্যে ৭০ টাকা ঢাকার বাইরে ১২০ টাকা। প্রোডাক্টের সংখ্যা বেশি হলে অথবা ওজন বেশি হলে ডেলিভারি চার্জ অতিরিক্ত হিসেবে ১০ থেকে ৩০ টাকা পর্যন্ত বাড়তে পারে।",
            
            "ques": "ডেলিভারি চার্জ কত?"
          },
         
          "question_3": {
            "ans": "না, আমাদের কোন প্রকার রিটার্ন চার্জ নেওয়া হয় না।",
            "ques": "রিটার্ন চার্জ দিতে হয় কি?"
          },
         
          "question_4": {
            "ans": "নতুন সেলারের ক্ষেত্রে প্রথম ৫ টি অর্ডারের ডেলিভারি চার্জ অগ্রিম দিতে হবে। পাঁচটি অর্ডার ডেলিভ হলে তখন আর অগ্রিম দিতে হবে না।",
            "ques": "ডেলিভারি চার্জ কি অগ্রিম দিতে হয়?"
          },
          
          "question_5": {
            "ans":"জি, ডেলিভারি ম্যান দাঁড়িয়ে থাকা অবস্থায় প্রোডাক্টটি চেক করে নিতে হবে, প্রোডাক্ট এর কোন ত্রুটি বের হলে আমাদের খরচে আবার আমরা প্রোডাক্ট পাঠিয়ে দেব, ডেলিভারি ম্যান চলে আসার পর এক্সচেঞ্জ করে নিতে চাইলে সে ক্ষেত্রে ডেলিভারি চার্জ আবার দিতে হবে।",

            "ques": "এক্সচেঞ্জ অর্ডার এর সুবিধা আছে কি?"
          },
        
          "question_6": {
            "ans": "বিকেল তিনটার মধ্যে অর্ডার কনফার্ম করা হলে সন্ধ্যার মধ্যেই বুকিং দেওয়া হয়ে থাকে। তিনটার পরের অর্ডার পরের দিন বুকিং দেওয়া হয়।",
            "ques": "অর্ডার করার কত সময় পর বুকিং দেওয়া হয়?"
          },
         
          "question_7": {
            "ans":  "আপনার প্রোডাক্টটি ডেলিভারি হয়ে গেলে ঐদিন রাত বারোটার পর আপনার একাউন্টে প্রফিটের টাকা যোগ হয়ে যাবে। প্রফিটের টাকা যোগ হওয়ার সাথে সাথেই আপনি আপনার নগদ অথবা বিকাশে উত্তোলন করে নিতে পারবেন। অ্যাপস থেকে পেমেন্ট রিকোয়েস্ট দেওয়ার সর্বোচ্চ ১ ঘণ্টার মধ্যে আপনার একাউন্টে টাকা চলে যাবে।",
            
            "ques": "প্রফিট কিভাবে এবং কত দিনের মধ্যে দেওয়া হয়?"
          },
         
          "question_8": {
            "ans": "জি, আমাদের অ্যাপসে থাকা যেকোনো প্রোডাক্টের সাথে অন্য যেকোনো প্রোডাক্ট এড করে একই ঠিকানায় একটিমাত্র ডেলিভারি চার্জ দিয়েই পাঠাতে পারবেন।",
            "ques": "একটি ডেলিভারি চার্জে একই ঠিকানায় একাধিক প্রোডাক্ট পাঠানো যাবে?"
          },
         
        },
    'steps':{
        "register": {
          "title": "১. নিবন্ধন",
        
          "desc": "আপনার ফ্রি অ্যাকাউন্ট তৈরি করুন এবং যাত্রা শুরু করুন।",
         
        },
        "select_products": {
          "title": "২. পণ্য নির্বাচন",
          "desc": "আমাদের ক্যাটালগ থেকে পছন্দের পণ্যগুলো বেছে নিন।"
        },
        "download_kit": {
          "title": "৩. মার্কেটিং কিট ডাউনলোড",
          "desc": "পণ্য প্রচারের জন্য উচ্চমানের ছবি ও ভিডিও সংগ্রহ করুন।"
        },
        "upload_sell": {
          "title": "৪. আপলোড ও বিক্রি",
          "desc": "ফেসবুক, ইনস্টাগ্রাম বা আপনার অনলাইন শপে পণ্য শেয়ার করুন।"
        },
        "get_orders": {
          "title": "৫. অর্ডার গ্রহণ",
          "desc": "আপনার প্ল্যাটফর্মে ক্রেতারা অর্ডার প্রদান করবে।"
        },
        "order_bebsha360": {
          "title": "৬. ResellerBrain থেকে অর্ডার করুন",
          "desc": "একই অর্ডার আপনার নির্ধারিত মূল্যে ResellerBrain এ দিন।"
        },
        "delivery_bebsha360": {
          "title": "৭. ResellerBrain ডেলিভারি",
          "desc": "আমরা প্যাকেজিং ও ক্রেতার কাছে ডেলিভারি নিশ্চিত করবো।"
        },
        "earn_withdraw": {
          "title": "৮. আয় ও উত্তোলন",
          "desc": "ResellerBrain ব্যালেন্সে আপনার লাভ পান এবং bKash/Nagad এর মাধ্যমে উত্তোলন করুন।"
        }

      },
  },
  },
};

// Initialize i18next
i18next
  .use(initReactI18next) // Pass i18n instance to react-i18next
  .init({
    resources,
    lng: "en", // Default language
    keySeparator: ".", // We use 't' as our key, no need to separate by dot
    interpolation: {
      escapeValue: false, // Not needed for react
    },
  });

export default i18next;