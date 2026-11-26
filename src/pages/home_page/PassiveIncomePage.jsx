import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ArrowRight, BadgeCheck, HandCoins, Network, ShieldCheck, Users } from "lucide-react";
import FooterHome from "./FooterHome";

const commissionRows = [
  ["৳২,৫০১ – ৳১০,০০০", "৳১০", "৳৬", "৳৪", "৳৪"],
  ["৳১,৫০১ – ৳২,৫০০", "৳৯", "৳৫", "৳৪", "৳৩"],
  ["৳১,০০১ – ৳১,৫০০", "৳৮", "৳৪", "৳৩", "৳২"],
  ["৳৮০১ – ৳১,০০০", "৳৭", "৳৪", "৳৩", "৳২"],
  ["৳৫০১ – ৳৮০০", "৳৬", "৳৩", "৳২", "৳২"],
  ["৳৩০১ – ৳৫০০", "৳৪", "৳২", "৳২", "৳২"],
  ["৳২০১ – ৳৩০০", "৳৩", "৳২", "৳২", "৳১"],
  ["৳১০১ – ৳২০০", "৳২", "৳২", "৳১", "৳১"],
  ["৳০ – ৳১০০", "৳১", "৳১", "৳১", "৳১"],
];

const steps = [
  { number: "০১", title: "সেলারদের খুঁজে নিন", text: "যারা রিসেলিং করতে আগ্রহী, তাদের আপনার সেলার কোড দিয়ে অ্যাপে রেজিস্ট্রেশন করতে সহায়তা করুন।" },
  { number: "০২", title: "শুরুর দিকের সহায়তা দিন", text: "আপনার টিমের নতুন সেলারদের অর্ডার ও বিক্রয় সম্পর্কে প্রাথমিক দিকনির্দেশনা দিন।" },
  { number: "০৩", title: "টিমের বিক্রয় থেকে কমিশন", text: "আপনার টিমের যোগ্য অর্ডার হলে প্রোডাক্টের অ্যাডমিন প্রাইসের নির্ধারিত কমিশন তৈরি হবে।" },
];

// Same page in two places: the public landing page (/passive-income) and inside the dropshipper
// panel (/app/passive-income). Inside the panel there is no site header/footer and no sign-up buttons.
const PassiveIncomePage = () => {
  const embedded = useLocation().pathname.startsWith("/app");

  return (
  <div className={`${embedded ? "" : "min-h-screen"} bg-slate-50 font-sans text-slate-800`}>
    {!embedded && (
    <header className="border-b border-slate-100 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2 font-black tracking-tight text-slate-900" aria-label="হোম পেজ">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-700 text-sm font-bold text-white">RB</span>
          <span>ResellerBrain</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/" className="hidden text-sm font-semibold text-slate-600 hover:text-blue-700 sm:inline">হোম</Link>
          <Link to="/register" className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800">ফ্রি রেজিস্ট্রেশন</Link>
        </div>
      </div>
    </header>
    )}

    <main>
      <section className="border-b border-slate-200 bg-blue-50 text-slate-900">
       <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white px-3 py-1.5 text-sm font-semibold text-blue-800">
              <HandCoins className="h-4 w-4" /> সেলার টিম গড়ে কমিশন অর্জন
            </span>
            <h1 className="mt-6 text-4xl font-bold leading-tight sm:text-5xl">প্যাসিভ <span className="text-blue-700">ইনকাম</span></h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
              কোনো পুঁজি বা ইনভেস্টমেন্ট ছাড়াই সেলস টিম গড়ে ResellerBrain থেকে প্রফিট অর্জনের সুযোগ নিন।
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {!embedded && <Link to="/register" className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800">শুরু করুন <ArrowRight className="h-4 w-4" /></Link>}
              <a href="#commission" className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:bg-slate-100">কমিশন রেট দেখুন</a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <Users className="h-7 w-7 text-blue-700" />
              <p className="mt-5 text-3xl font-black">৪ লেভেল</p>
              <p className="mt-1 text-sm text-slate-600">টিমের বিক্রয়ে কমিশন</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <ShieldCheck className="h-7 w-7 text-blue-700" />
              <p className="mt-5 text-3xl font-black">৳০</p>
              <p className="mt-1 text-sm text-slate-600">সেলার রেজিস্ট্রেশন ফি</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <Network className="h-7 w-7 text-blue-700" />
              <p className="mt-5 text-3xl font-black">টিম ভিত্তিক</p>
              <p className="mt-1 text-sm text-slate-600">সেলস কমিশনের কাঠামো</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <BadgeCheck className="h-7 w-7 text-blue-700" />
              <p className="mt-5 text-3xl font-black">১০ অর্ডার</p>
              <p className="mt-1 text-sm text-slate-600">কোড পেতে সম্পূর্ণ ডেলিভারি</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-20">
        <article className="rounded-xl border border-slate-200 bg-white p-7 sm:p-8">
          <p className="text-sm font-bold uppercase tracking-wider text-blue-600">ধারণাটি জানুন</p>
          <h2 className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl">প্যাসিভ ইনকাম কী?</h2>
          <p className="mt-4 leading-8 text-slate-600">আপনার তত্ত্বাবধানে একটি সেলস টিম নিজেদের প্রফিটের জন্য বিক্রি করবে। তাদের যোগ্য বিক্রয়ের ওপর আপনি সেলস কমিশন পেতে পারেন—আপনি প্রতিটি অর্ডারে সরাসরি কাজ না করলেও।</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-white p-7 sm:p-8">
          <p className="text-sm font-bold uppercase tracking-wider text-blue-600">কেন এই মডেল</p>
          <h2 className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl">নিজের সেলের পাশাপাশি টিম</h2>
          <p className="mt-4 leading-8 text-slate-600">রিসেলিং ব্যবসায় আগ্রহী সেলারদের একসঙ্গে কাজ করতে সাহায্য করুন। তাদের শুরুর পর্যায়ে সাপোর্ট দিন, আর টিমের বিক্রয় থেকে কমিশন অর্জনের সুযোগ তৈরি করুন।</p>
        </article>
      </section>

      <section className="bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-wider text-blue-600">শুরু করার ধাপ</p>
            <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">কীভাবে প্যাসিভ ইনকাম করবেন?</h2>
            <p className="mt-4 leading-7 text-slate-600">সেলার টিম তৈরি করুন, তাদের প্রাথমিক সহায়তা দিন, তারপর যোগ্য বিক্রয় থেকে কমিশন পান।</p>
          </div>
          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {steps.map((step) => (
              <article key={step.number} className="rounded-xl border border-slate-200 bg-white p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-sm font-black text-white">{step.number}</span>
                <h3 className="mt-5 text-lg font-extrabold text-slate-900">{step.title}</h3>
                <p className="mt-2 leading-7 text-slate-600">{step.text}</p>
              </article>
            ))}
          </div>
          <div className="mt-5 flex gap-4 rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-950">
            <BadgeCheck className="mt-0.5 h-6 w-6 shrink-0 text-amber-600" />
            <p className="leading-7"><strong>সেলার কোড কীভাবে পাবেন?</strong> আপনার অ্যাকাউন্ট থেকে ১০টি অর্ডার সম্পূর্ণভাবে ডেলিভারি হলে আপনি ভেরিফাইড সেলার হবেন এবং একটি সেলার কোড পাবেন।</p>
          </div>
        </div>
      </section>

      <section id="commission" className="mx-auto max-w-7xl scroll-mt-8 px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-wider text-blue-600">কমিশন কাঠামো</p>
          <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">সেলস কমিশন রেট</h2>
          <p className="mt-4 leading-7 text-slate-600">কমিশন প্রোডাক্টের অ্যাডমিন প্রাইসের ওপর গণনা হয়। আপনার টিমের চতুর্থ লেভেল পর্যন্ত যোগ্য বিক্রয়ের জন্য নিচের রেট প্রযোজ্য।</p>
        </div>
        <div className="mt-9 overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] border-collapse text-left text-sm">
              <thead>
                <tr className="bg-slate-100 text-slate-800">
                  <th className="px-5 py-4 font-bold">অ্যাডমিন প্রাইস রেঞ্জ</th>
                  {["১ম লেভেল", "২য় লেভেল", "৩য় লেভেল", "৪র্থ লেভেল"].map((level) => <th key={level} className="px-5 py-4 text-center font-bold">{level}</th>)}
                </tr>
              </thead>
              <tbody>
                {commissionRows.map((row, index) => (
                  <tr key={row[0]} className={index % 2 ? "bg-slate-50" : "bg-white"}>
                    <th scope="row" className="whitespace-nowrap px-5 py-3.5 font-bold text-slate-800">{row[0]}</th>
                    {row.slice(1).map((amount, amountIndex) => <td key={`${row[0]}-${amountIndex}`} className="px-5 py-3.5 text-center font-semibold text-blue-700">{amount}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className="mt-3 text-xs leading-6 text-slate-500">কমিশন অর্ডারের যোগ্যতা ও প্রযোজ্য নীতিমালার ওপর নির্ভরশীল।</p>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 py-14 text-slate-900 sm:py-16">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-slate-600">দীর্ঘমেয়াদি সম্ভাবনা</p>
            <h2 className="mt-3 text-3xl font-black sm:text-4xl">একটি টিম, অনেক সেলারের অগ্রযাত্রা</h2>
            <p className="mt-4 max-w-3xl leading-8 text-slate-600">সেলারদের নিয়মিত সহায়তা করলে আপনার টিমের সদস্যরাও নতুন সেলার গড়ে তুলতে পারে। এতে একাধিক লেভেলে টিম বাড়তে পারে। ৫০ জন সক্রিয় সেলার বা দৈনিক ৫০০টি অর্ডারের উদাহরণগুলো সম্ভাব্য হিসাব—আয় নিশ্চিত বা নির্দিষ্ট নয়; ফলাফল টিমের কার্যক্রম, যোগ্য অর্ডার ও কমিশন নীতির ওপর নির্ভর করবে।</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-white p-4"><p className="text-2xl font-black">৩–৬ মাস</p><p className="mt-1 text-sm text-slate-600">টিম গঠনের একটি উদাহরণ সময়সীমা</p></div>
              <div className="rounded-lg border border-slate-200 bg-white p-4"><p className="text-2xl font-black">৫০ জন</p><p className="mt-1 text-sm text-slate-600">সক্রিয় সেলারের উদাহরণ</p><p className="mt-1 text-xs text-slate-500">উৎসের হিসাব: দৈনিক প্রায় ৳২০০–৳২৫০ কমিশন হতে পারে</p></div>
              <div className="rounded-lg border border-slate-200 bg-white p-4"><p className="text-2xl font-black">৫০০ অর্ডার</p><p className="mt-1 text-sm text-slate-600">প্রতিদিনের উদাহরণ</p><p className="mt-1 text-xs text-slate-500">উৎসের হিসাব: অর্ডারপ্রতি ৳২–৳৩ কমিশন</p></div>
            </div>
            <p className="mt-4 text-xs leading-6 text-slate-500">এই পরিমাণগুলো প্রচারমূলক উদাহরণ, আয়ের নিশ্চয়তা নয়। প্রকৃত কমিশন টিমের কার্যক্রম, যোগ্য অর্ডার এবং প্রযোজ্য কমিশন নীতির ওপর নির্ভর করে। ৪ লেভেলে টিমের সদস্যসংখ্যাও নিশ্চিত নয়।</p>
          </div>
          {!embedded && <Link to="/register" className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-blue-800 transition hover:bg-blue-50">ফ্রি রেজিস্ট্রেশন <ArrowRight className="h-4 w-4" /></Link>}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="max-w-2xl">
          <p className="text-sm font-bold uppercase tracking-wider text-blue-600">স্বচ্ছভাবে কাজ করুন</p>
          <h2 className="mt-3 text-3xl font-black text-slate-900 sm:text-4xl">ResellerBrain-এর নীতি ও শর্তাবলী</h2>
        </div>
        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {[
            "ResellerBrain সেলারদের কাছ থেকে কোনো ফি বা ইনভেস্টমেন্ট নেয় না।",
            "কাস্টমার পণ্য হাতে পেয়ে মান যাচাই করে পণ্যের মূল্য পরিশোধ করবেন; কাস্টমারের কাছ থেকে অগ্রিম টাকা নেওয়া হয় না।",
            "কাস্টমারের সন্তুষ্টির জন্য পণ্যের প্রফিট যুক্তিসঙ্গত রাখুন। ভালো অভিজ্ঞতা হলে কাস্টমার আবার অর্ডার করতে পারেন।",
          ].map((text, index) => (
            <article key={index} className="rounded-xl border border-slate-200 bg-white p-6">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-sm font-black text-emerald-700">{index + 1}</span>
              <p className="mt-4 leading-7 text-slate-700">{text}</p>
            </article>
          ))}
        </div>
        <p className="mt-5 text-xs leading-6 text-slate-500">সেলার কোড, কমিশন, অর্ডার যোগ্যতা এবং পেআউটের বিস্তারিত শর্ত প্রযোজ্য প্ল্যাটফর্ম নীতিমালা অনুযায়ী পরিচালিত হবে।</p>
      </section>
    </main>

    {!embedded && <FooterHome />}
  </div>
  );
};

export default PassiveIncomePage;
