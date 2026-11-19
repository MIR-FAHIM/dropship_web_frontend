import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { ArrowDown, ArrowRight, Check, CheckCircle2, ChevronRight, Clock3, ExternalLink, Globe, HeartHandshake, Layers3, MessageCircleQuestion, Monitor, Package, Palette, Rocket, SearchCheck, Send, ShieldCheck, ShoppingBag, Smartphone, Sparkles, ThumbsUp, Truck, Users, Wallet, Zap } from "lucide-react";
import { useCreateEcommerceLeadMutation } from "../../../redux/features/ecommerceLead";
import ecommercePromo from "../../../assets/ecommerce-promo.png";
import "./EcommerceWebsitePage.css";

const DEMO_URL = "https://jashorebro.resellerbrain.com";
const WEBSITE_WHATSAPP_NUMBER = "8801941606310";
const WEBSITE_WHATSAPP_MESSAGE = "হাই ResellerBrain, আপনাদের অটোমেটেড ই-কমার্স ওয়েবসাইট নিয়ে কিছু প্রশ্ন ছিল। প্যাকেজের দাম ও শুরু করার প্রক্রিয়া জানতে চাই।";
const WEBSITE_WHATSAPP_URL = `https://wa.me/${WEBSITE_WHATSAPP_NUMBER}?text=${encodeURIComponent(WEBSITE_WHATSAPP_MESSAGE)}`;
const included = ["নিজের ব্র্যান্ড, লোগো ও ডোমেইনে ওয়েবসাইট", "ResellerBrain-এর সম্পূর্ণ ক্যাটালগ, স্টক অ্যালার্ট সহ", "আপনার রিসেলার দামে পণ্যের সুবিধা", "অর্ডার ও স্টক ম্যানেজমেন্ট সম্পূর্ণ স্বয়ংক্রিয়", "প্যাকিং ও ডেলিভারি ResellerBrain-এর দায়িত্বে", "নিয়মিত টেকনিক্যাল সাপোর্ট, বাগ ফিক্স ও UI আপডেট"];
const benefits = [
  { icon: Package, title: "স্টকে বিনিয়োগ নেই", text: "আগে থেকে পণ্য কিনে রাখতে হবে না। গুদাম বা ইনভেন্টরির দায়িত্বও আপনার নয়।" },
  { icon: Layers3, title: "ক্যাটালগ ও স্টক অ্যালার্ট, রেডিমেড", text: "ResellerBrain-এর পুরো ক্যাটালগ সরাসরি আপনার সাইটে—স্টক আপডেট হলে তা-ও স্বয়ংক্রিয়ভাবে দেখাবে।" },
  { icon: Zap, title: "অর্ডার ম্যানেজমেন্ট অটোমেটিক", text: "কাস্টমারের অর্ডার সরাসরি ResellerBrain API-তে চলে যায়। আলাদা এন্ট্রির ঝামেলা নেই।" },
  { icon: Truck, title: "আপনার কাজ শুধু দাম ও মার্কেটিং", text: "প্যাকিং-ডেলিভারি আমরা সামলাই। আপনি নিজের দাম বসান, মার্কেটিং করে অর্ডার আনায় মন দিন।" },
];
const audience = [
  { icon: ShoppingBag, title: "ফেসবুক পেজ আছে, ওয়েবসাইট নেই", text: "সোশ্যাল মিডিয়ায় বিক্রি করছেন, কিন্তু এখনও কোনো ইকমার্স সাইটের সাথে যুক্ত হননি।" },
  { icon: Clock3, title: "আগের ওয়েবসাইটে ব্যবসা দাঁড়ায়নি", text: "পুরনো কোনো ইকমার্স সাইট ব্যবহার করছেন, কিন্তু কখনোই সেখান থেকে ব্যবসা করতে পারেননি।" },
  { icon: Globe, title: "ResellerBrain-এ ড্রপশিপিং করছেন", text: "এখন ResellerBrain-এর সাথে কাজ করছেন, ব্যবসাকে আরও স্মুথ ও স্মার্টভাবে বড় করতে চান।" },
  { icon: HeartHandshake, title: "ResellerBrain-এর সাপোর্টে আস্থা রাখেন", text: "মনে করেন ResellerBrain সবসময় পাশে থেকে কমিটমেন্ট পূরণ করে, তাই এগিয়ে যেতে চান এক সাথে।" },
];
const steps = [
  { icon: ShoppingBag, title: "কাস্টমার আপনার সাইটে অর্ডার করেন", text: "আপনার ব্র্যান্ড ও ডোমেইন থেকেই কেনাকাটা করেন।" },
  { icon: Zap, title: "অর্ডার সরাসরি আমাদের কাছে আসে", text: "আপনাকে হাতে অর্ডার এন্ট্রি করতে হয় না।" },
  { icon: Truck, title: "আমরা প্যাকিং ও ডেলিভারি সামলাই", text: "স্টক থেকে কুরিয়ার—পুরো প্রক্রিয়া ResellerBrain-এর।" },
  { icon: Wallet, title: "সফল অর্ডারে আপনার লাভ হয়", text: "নিজে প্যাকিং বা ডেলিভারি না করেই আপনার মার্জিন পান।" },
];
const faqs = [
  { q: "কালই কি ব্যবসা শুরু করতে পারব?", a: "হ্যাঁ। ডেমো দেখে ব্র্যান্ডের নাম ও ডোমেইন জানালে সেটআপের পর আপনার সাইট প্রস্তুত—রেডিমেড ক্যাটালগ নিয়েই পরদিন থেকে মার্কেটিং ও অর্ডার কালেকশন শুরু করা যায়।" },
  { q: "প্রোডাক্ট সাজানো বা স্টক কি আমাকে দেখতে হবে?", a: "না। ResellerBrain-এর পুরো ক্যাটালগ স্টক অ্যালার্ট সহ আপনার সাইটে স্বয়ংক্রিয়ভাবে আসে। আপনার কাজ শুধু নিজের বিক্রয়মূল্য ঠিক করা।" },
  { q: "অর্ডার এলে আমাকে কী করতে হবে?", a: "কিছুই না—অর্ডার সরাসরি ResellerBrain API-তে চলে যায়, প্যাকিং-ডেলিভারি আমরা করি। আপনি লিংক শেয়ার করে মার্কেটিং করুন, ড্যাশবোর্ডে লাভ দেখুন।" },
  { q: "ওয়েবসাইটে সমস্যা হলে বা ডিজাইন বদলাতে চাইলে?", a: "ResellerBrain-এর ডেভেলপার টিম সবসময় টেকনিক্যাল সাপোর্ট দেয়, বাগ ফিক্স করে এবং নিয়মিত UI আরও সুন্দর করে। এটা নিয়ে আপনাকে কিছু ভাবতেই হবে না।" },
  { q: "দাম কত? কীভাবে নেব?", a: "দাম ও প্যাকেজ জানতে নিচের বাটনে ক্লিক করে ব্র্যান্ডের নাম ও ফোন নম্বর দিন। টিমের সঙ্গে কথা বলে সেটআপ ও পেমেন্ট নিশ্চিত করুন।" },
];

export default function EcommerceWebsitePage() {
  const [device, setDevice] = useState("desktop");
  const [questionOpen, setQuestionOpen] = useState(false);
  const [questionText, setQuestionText] = useState("");
  const [createLead, { isLoading: isSubmittingLead }] = useCreateEcommerceLeadMutation();

  const handleInterestedLater = async () => {
    try {
      await createLead({ lead_type: "interested_later" }).unwrap();
      toast.success("ধন্যবাদ! আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।");
    } catch {
      toast.error("দুঃখিত, কিছু একটা সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    }
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    if (!questionText.trim()) return;
    try {
      await createLead({ lead_type: "question", message: questionText.trim() }).unwrap();
      toast.success("আপনার প্রশ্ন পাঠানো হয়েছে। আমরা শীঘ্রই উত্তর দেব।");
      setQuestionText("");
      setQuestionOpen(false);
    } catch {
      toast.error("দুঃখিত, প্রশ্ন পাঠাতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    }
  };

  return (
    <main className="website-shop ws-bangla" lang="bn">
      <div className="ws-topline"><span><Globe size={16} /> ResellerBrain ওয়েবসাইট</span><Link to="/app/my-website">আগেই ওয়েবসাইট আছে? <ArrowRight size={15} /></Link></div>
      <section className="ws-hero">
        <div className="ws-hero-copy"><span className="ws-eyebrow"><span /> ছোট উদ্যোগ থেকেই বড় ব্যবসার শুরু</span><h1>ব্র্যান্ড আপনার।<br />ওয়েবসাইট আপনার।<br /><em>বাকি দায়িত্ব আমাদের।</em></h1><p>পণ্য কেনা, স্টক রাখা বা প্যাকিং-ডেলিভারির চিন্তা ছাড়াই আজই শুরু করুন। আপনার ওয়েবসাইটে থাকবে ResellerBrain-এর পুরো ক্যাটালগ, স্টক অ্যালার্ট সহ, আপনার রিসেলার দামে।</p><div className="ws-start-note"><Sparkles size={19} /><span><strong>বর্তমানে ResellerBrain থেকে ই-কমার্স ওয়েবসাইট নেওয়াই হতে পারে আপনার জন্য সবচেয়ে স্মার্ট সিদ্ধান্ত।</strong><br />শুধু একটি ই-কমার্স সাইট থাকাই যথেষ্ট নয়—সাইট বিভিন্ন জায়গা থেকেই তৈরি করানো যায়। কিন্তু ResellerBrain আপনাকে একটি ব্যবসা-প্রস্তুত ও স্বয়ংক্রিয় ই-কমার্স সাইট দিয়ে সহযোগিতা করতে চায়, যাতে উভয় পক্ষ একসঙ্গে একটি সুন্দর ও হালাল ব্যবসা গড়ে তুলতে পারে।</span></div><div className="ws-actions"><a className="ws-button ws-button-dark" href="#website-package">নিজের ওয়েবসাইট নিতে চাই <ArrowRight size={17} /></a><a className="ws-text-link ws-demo-link" href={DEMO_URL} target="_blank" rel="noopener noreferrer">আগে ডেমো দেখি <ExternalLink size={15} /></a><a className="ws-whatsapp-link" href={WEBSITE_WHATSAPP_URL} target="_blank" rel="noopener noreferrer"><MessageCircleQuestion size={16} /> WhatsApp-এ কথা বলুন</a></div><div className="ws-hero-points"><span><CheckCircle2 size={15} /> স্টকে বিনিয়োগ নেই</span><span><CheckCircle2 size={15} /> প্যাকিং ও ডেলিভারির ঝামেলা নেই</span></div></div>
        <div className="ws-hero-art ws-promo-art">
          <img
            className="ws-promo-image"
            src={ecommercePromo}
            alt="ResellerBrain অটোমেটেড ই-কমার্স: পণ্য অটো-সিঙ্ক, স্টক অ্যালার্ট, ডেলিভারি অটোমেশন, ফ্রড চেকার ও SMS সুবিধা"
          />
        </div>
      </section>
      <section className="ws-section ws-leads ws-leads-top" id="quick-response"><div className="ws-section-head"><div><span className="ws-kicker">এখনই একটা পদক্ষেপ নিন</span><h2>আপনার সুবিধাজনক সময়ে আমাদের টিম যোগাযোগ করবে</h2><p>আপনি শুধু নিচের বাটনে ক্লিক করে রাখুন—আমাদের টিম আপনার অবসর সময়ে যোগাযোগ করে নেবে।</p></div></div><div className="ws-lead-actions"><button type="button" className="ws-lead-btn" onClick={handleInterestedLater} disabled={isSubmittingLead}><ThumbsUp size={18} /> আগ্রহী — পরে কথা বলব</button><button type="button" className={`ws-lead-btn ${questionOpen ? "ws-lead-btn-active" : ""}`} onClick={() => setQuestionOpen((v) => !v)}><MessageCircleQuestion size={18} /> আমার প্রশ্ন আছে</button><a className="ws-lead-btn ws-lead-whatsapp" href={WEBSITE_WHATSAPP_URL} target="_blank" rel="noopener noreferrer"><MessageCircleQuestion size={18} /> WhatsApp-এ সরাসরি প্রশ্ন করুন</a></div>{questionOpen && <form className="ws-question-box" onSubmit={handleQuestionSubmit}><textarea value={questionText} onChange={(e) => setQuestionText(e.target.value)} placeholder="আপনার প্রশ্নটি এখানে লিখুন…" rows={3} required /><button type="submit" className="ws-button ws-button-dark" disabled={isSubmittingLead || !questionText.trim()}><Send size={15} /> প্রশ্ন পাঠান</button></form>}</section>
      <section className="ws-whatsapp-panel" aria-labelledby="website-whatsapp-title"><div className="ws-whatsapp-copy"><span className="ws-whatsapp-eyebrow"><MessageCircleQuestion size={15} /> WEBSITE INQUIRY · ওয়েবসাইট সংক্রান্ত যোগাযোগ</span><h2 id="website-whatsapp-title">ওয়েবসাইট সম্পর্কে জানতে WhatsApp করুন</h2><p>নিজের ব্র্যান্ডের ওয়েবসাইট, প্যাকেজের দাম ও সেটআপ নিয়ে সরাসরি কথা বলুন। ক্লিক করলেই আপনার প্রশ্নসহ WhatsApp খুলবে।</p></div><a className="ws-whatsapp-number" href={WEBSITE_WHATSAPP_URL} target="_blank" rel="noopener noreferrer"><span className="ws-whatsapp-icon"><MessageCircleQuestion size={21} /></span><span><small>WhatsApp Business</small><strong>+8801941606310</strong></span><ArrowRight size={20} /></a></section>
      <div className="ws-promise-strip"><strong>আপনার নিজস্ব ই-কমার্স সাইট দিয়ে নিজের ব্র্যান্ড গড়ুন।</strong><span>পেছনে ResellerBrain-এর হাজারো উইনিং প্রোডাক্টের সহায়তা পাবেন।</span><span><Package size={17} /> অর্ডার থেকে ডেলিভারি—সব আমরা সামলাই, আপনাকে ভাবতে হবে না।</span></div>

      <section className="ws-online-intro" aria-labelledby="online-business-title">
        <div className="ws-online-intro-copy">
          <span className="ws-kicker">আপনার ব্যবসা, আপনার নিজস্ব ঠিকানা</span>
          <h2 id="online-business-title">আপনার অনলাইন ব্যবসাকে দিন একটি নিজস্ব পরিচয়</h2>
          <p>শুধু ফেসবুক পেজ বা মার্কেটপ্লেসের ওপর নির্ভর না করে নিজের একটি ই-কমার্স ওয়েবসাইট তৈরি করুন। এখানে পণ্য ক্যাটাগরি অনুযায়ী সাজানো থাকবে, আর কাস্টমাররা সহজেই পছন্দের পণ্য খুঁজে অর্ডার করতে পারবেন।</p>
          <p>ResellerBrain-এর মাধ্যমে সহজে, তুলনামূলক কম খরচে এবং প্রয়োজনীয় সব ফিচারসহ নিজের ই-কমার্স ওয়েবসাইট তৈরি করুন।</p>
        </div>
        <div className="ws-online-intro-card"><span className="ws-online-intro-icon"><Globe size={24} /></span><strong>নিজের ব্র্যান্ডে অনলাইন স্টোর</strong><span>পণ্য সাজানো, অর্ডার নেওয়া—সব এক জায়গায়</span><a className="ws-online-mini-store" href={DEMO_URL} target="_blank" rel="noopener noreferrer"><ShoppingBag size={18} /><span>আপনার নিজস্ব দোকান</span><ArrowRight size={16} /></a></div>
      </section>

      <section className="ws-section ws-reasons" aria-labelledby="website-reasons-title">
        <div className="ws-section-head"><div><span className="ws-kicker">নিজের অনলাইন সেলস চ্যানেল</span><h2 id="website-reasons-title">কেন আপনার ব্যবসার জন্য একটি ই-কমার্স ওয়েবসাইট প্রয়োজন?</h2><p>কাস্টমারের কেনাকাটা সহজ করুন, নিজের ব্র্যান্ড গড়ুন এবং ব্যবসার গুরুত্বপূর্ণ তথ্য এক জায়গায় রাখুন।</p></div></div>
        <div className="ws-reasons-grid">
          <article><span className="ws-reason-number">০১</span><span className="ws-benefit-icon"><Layers3 size={22} /></span><h3>সব পণ্য এক জায়গায় সুন্দরভাবে উপস্থাপন করুন</h3><p>ফেসবুক পেজের পাশাপাশি ওয়েবসাইটে পণ্য ক্যাটাগরি অনুযায়ী সাজিয়ে রাখুন। কাস্টমাররা সহজে ব্রাউজ, তুলনা এবং একসঙ্গে একাধিক পণ্য অর্ডার করতে পারবেন।</p></article>
          <article><span className="ws-reason-number">০২</span><span className="ws-benefit-icon"><ShoppingBag size={22} /></span><h3>সোশ্যাল মিডিয়া থেকেই সরাসরি অর্ডার পান</h3><p>ফেসবুক পেজ, গ্রুপ বা মার্কেটপ্লেসের পোস্টে ওয়েবসাইটের লিংক শেয়ার করুন। আগ্রহী কাস্টমাররা সরাসরি সাইটে গিয়ে অর্ডার করতে পারবেন।</p></article>
          <article><span className="ws-reason-number">০৩</span><span className="ws-benefit-icon"><Users size={22} /></span><h3>তৈরি করুন নিজের নিয়মিত কাস্টমার বেস</h3><p>অর্ডারের মাধ্যমে কাস্টমারের তথ্য ও অর্ডার হিস্ট্রি সংরক্ষণ করুন। পরে নতুন পণ্য, অফার বা ক্যাম্পেইন নিয়ে পুরোনো কাস্টমারদের SMS পাঠাতে পারবেন।</p></article>
          <article><span className="ws-reason-number">০৪</span><span className="ws-benefit-icon"><ShieldCheck size={22} /></span><h3>কাস্টমারের বিশ্বাসযোগ্যতা বাড়ান</h3><p>নিজস্ব ওয়েবসাইট আপনার ব্যবসায় পেশাদার পরিচয় তৈরি করে। সেখানে ব্যবসার তথ্য, যোগাযোগের ঠিকানা এবং বিকাশ/নগদ পেমেন্টের তথ্য রাখতে পারবেন।</p></article>
          <article><span className="ws-reason-number">০৫</span><span className="ws-benefit-icon"><Zap size={22} /></span><h3>ফেসবুক বিজ্ঞাপন থেকে অর্ডারের সুযোগ বাড়ান</h3><p>ওয়েবসাইটে সরাসরি অর্ডার নিন, Facebook Pixel দিয়ে Purchase ও অন্যান্য ইভেন্ট ট্র্যাক করুন। বিজ্ঞাপনের ফলাফল বিশ্লেষণ ও রিটার্গেটিং আরও কার্যকরভাবে করুন।</p></article>
        </div>
      </section>

      <section className="ws-catalog-new" aria-labelledby="catalog-title-new">
        <div className="ws-catalog-new-copy"><span className="ws-kicker">শুরুতেই পাবেন রেডিমেড পণ্য ক্যাটালগ</span><h2 id="catalog-title-new">একটি ওয়েবসাইট।<br />ResellerBrain-এর সব পণ্য।</h2><p className="ws-catalog-new-lead">আপনার ওয়েবসাইটে শুরু থেকেই থাকবে ResellerBrain-এর সম্পূর্ণ পণ্য ক্যাটালগ।</p><p>শত শত পণ্য খোঁজা, ছবি আপলোড করা কিংবা প্রতিটি পণ্যের তথ্য আলাদাভাবে যোগ করার ঝামেলা নেই। আমাদের ক্যাটালগ সরাসরি আপনার ওয়েবসাইটে যুক্ত থাকবে।</p><div className="ws-catalog-new-points"><span><CheckCircle2 size={17} /> নতুন পণ্য যোগ হলে স্বয়ংক্রিয় আপডেট</span><span><CheckCircle2 size={17} /> স্টক শেষ হলে সাইটেও স্টক আপডেট</span><span><CheckCircle2 size={17} /> স্টক অ্যালার্টে থাকুন আপডেট</span></div><p><strong>আপনার কাজ হবে ব্যবসা পরিচালনা করা, পণ্য আপডেট করার পেছনে সময় নষ্ট করা নয়।</strong></p><Link className="ws-button ws-button-dark ws-catalog-new-button" to="/app/all-product-category">ক্যাটালগের পণ্যগুলো দেখুন <ArrowRight size={17} /></Link></div>
        <div className="ws-catalog-new-card"><span className="ws-market-icon"><SearchCheck size={28} /></span><span className="ws-kicker">ডেটা ও বাজারের চাহিদা</span><h3>মার্কেট রিসার্চ করে পণ্য বাছাই করে আমাদের টিম</h3><p>কোন পণ্যের চাহিদা বেশি, বাজারে কোন পণ্য জনপ্রিয় এবং ক্রেতারা কী খুঁজছেন—এসব নিয়মিত বিশ্লেষণ করে ResellerBrain-এর টিম সম্ভাবনাময় ও ডিমান্ডিং পণ্য স্টক করে।</p><small>এই পণ্যগুলো স্বয়ংক্রিয়ভাবে আপনার ওয়েবসাইটের ক্যাটালগেও যুক্ত হবে। নতুন পণ্য এলে আপনার দোকানেও দেখা যাবে—আলাদাভাবে আপলোড করতে হবে না।</small></div>
      </section>

      <aside className="ws-important-note"><span><ShieldCheck size={22} /></span><div><strong>একটি গুরুত্বপূর্ণ বিষয়</strong><p>শুধু ওয়েবসাইট তৈরি করলেই অর্ডার আসতে শুরু করবে, এমন নয়। বিক্রির জন্য সঠিক মার্কেটিং, নিয়মিত পণ্য প্রচার, কাস্টমার ম্যানেজমেন্ট এবং অর্ডার প্রসেস সম্পর্কে ধারণা থাকা জরুরি।</p><p>আপনি যদি ওয়েবসাইটের মাধ্যমে ব্যবসা পরিচালনা করতে প্রস্তুত থাকেন এবং সোশ্যাল মিডিয়ার পাশাপাশি নিজের অনলাইন সেলস চ্যানেল তৈরি করতে চান, ResellerBrain-এর মাধ্যমে নিজের ই-কমার্স ওয়েবসাইট তৈরি করতে পারেন।</p></div></aside>



      <section className="ws-section"><div className="ws-section-head"><div><span className="ws-kicker">ব্যবসা আপনার, মাথাব্যথা কম</span><h2>যে কাজগুলো নিয়ে ভাবতে হবে না</h2><p>আপনি এই ই-কমার্স সাইটটি নিয়ে শুধু মার্কেটিংয়ের কথা ভাবুন, আর অর্ডার বাড়াতে কাজ করুন। পেছনের কঠিন কাজগুলো আমরা করে দেব।</p></div></div><div className="ws-benefits">{benefits.map(({ icon: Icon, title, text }) => <article key={title}><span className="ws-benefit-icon"><Icon size={22} /></span><h3>{title}</h3><p>{text}</p></article>)}</div></section>

      <section className="ws-start-note" style={{ marginTop: 45 }}><ShieldCheck size={22} /><span><strong>ওয়েবসাইট কিনে আপনাকে আর কিছু ভাবতে হবে না।</strong><br />ResellerBrain-এর ডেভেলপার টিম সবসময় পাশে থাকে—টেকনিক্যাল সাপোর্ট, বাগ ফিক্স এবং নিয়মিত UI আপডেট, সবকিছুর দায়িত্ব আমাদের। আপনি মন দিন শুধু ব্যবসা বাড়ানোয়।</span></section>

      <section className="ws-section" id="templates"><div className="ws-section-head"><div><span className="ws-kicker">কেনার আগে দেখে নিন</span><h2>আপনার দোকান কেমন হতে পারে?</h2><p>চালু ওয়েবসাইটটি ঘুরে দেখুন। এবার কল্পনা করুন, এখানে নামটি আপনার ব্র্যান্ডের।</p></div><span className="ws-small-pill"><span /> ১টি লাইভ ডেমো</span></div><div className="ws-template-grid"><article className="ws-template-card"><div className="ws-template-toolbar"><span><span className="ws-live-dot" /> লাইভ ডেমো</span><div className="ws-device-toggle" aria-label="প্রিভিউয়ের আকার"><button type="button" aria-label="কম্পিউটার প্রিভিউ" aria-pressed={device === "desktop"} onClick={() => setDevice("desktop")}><Monitor size={16} /></button><button type="button" aria-label="মোবাইল প্রিভিউ" aria-pressed={device === "mobile"} onClick={() => setDevice("mobile")}><Smartphone size={16} /></button></div></div><a href={DEMO_URL} target="_blank" rel="noopener noreferrer" className={`ws-demo-visual ${device === "mobile" ? "ws-demo-mobile" : ""}`} aria-label="যশোরব্রোর লাইভ ডেমো দেখুন"><div className="ws-demo-store"><div className="ws-demo-store-nav"><strong>JASHORE<span>BRO</span></strong><ShoppingBag size={17} /></div><div className="ws-demo-store-content"><span>আপনার প্রতিদিনের কেনাকাটায়</span><h3>পছন্দের পণ্য।<br />সহজ কেনাকাটা।</h3><span className="ws-demo-shop">দোকান ঘুরে দেখুন <ArrowRight size={13} /></span><img src="/website-promo-collection.svg" alt="পণ্যের প্রচারণামূলক ইলাস্ট্রেশন" /></div><div className="ws-demo-store-footer">জীবনযাপন / ঘরের পণ্য / ইলেকট্রনিকস</div></div><span className="ws-preview-overlay">চালু ওয়েবসাইট দেখুন <ExternalLink size={16} /></span></a><div className="ws-template-info"><div><span className="ws-kicker">নমুনা ওয়েবসাইট</span><h3>যশোরব্রো</h3><p>jashorebro.resellerbrain.com</p></div><a className="ws-circle-link" href={DEMO_URL} target="_blank" rel="noopener noreferrer" aria-label="যশোরব্রো ওয়েবসাইটে যান"><ArrowRight size={21} /></a></div><div className="ws-template-tags"><span>বিভিন্ন ধরনের পণ্য</span><span>নিজের ব্র্যান্ড</span><span>মোবাইল উপযোগী</span></div></article><aside className="ws-brand-card"><span className="ws-kicker">আজই নিজের পরিচয় তৈরি করুন</span><h3>শুধু পণ্য বিক্রি নয়।<br />গড়ে তুলুন<br />নিজের ব্র্যান্ড।</h3><p>ফেসবুক পোস্ট বা পরিচিতদের কাছে শেয়ার করুন আপনার নিজের দোকানের লিংক। কাস্টমার কেনাকাটা করবেন আপনার ব্র্যান্ডের ওয়েবসাইট থেকে।</p><div className="ws-domain-art"><Globe size={25} /><span>www.<strong>yourbrand</strong>.com</span><CheckCircle2 size={20} /></div><div className="ws-brand-chips"><span><Palette size={14} /> নিজের পরিচয়</span><span><ShoppingBag size={14} /> নিজের দোকান</span><span><Wallet size={14} /> নিজের লাভ</span></div><a href="#website-package">আমার ব্র্যান্ডের শুরু হোক <ArrowRight size={17} /></a></aside></div></section>

      <section className="ws-section" aria-labelledby="audience-title"><div className="ws-section-head"><div><span className="ws-kicker">এই ওয়েবসাইট কাদের জন্য</span><h2 id="audience-title">আপনি কি এদের মধ্যে একজন?</h2></div></div><div className="ws-benefits">{audience.map(({ icon: Icon, title, text }) => <article key={title}><span className="ws-benefit-icon"><Icon size={22} /></span><h3>{title}</h3><p>{text}</p></article>)}</div></section>

      <section className="ws-flow-section"><div><span className="ws-kicker">অর্ডার থেকে লাভ—সহজ প্রক্রিয়া</span><h2>আপনার সাইটে অর্ডার।<br />আমাদের হাতে বাকি কাজ।</h2></div><ol className="ws-flow">{steps.map(({ icon: Icon, title, text }, i) => <li key={title}><span className="ws-flow-number">{(i + 1).toLocaleString("bn-BD")}</span><Icon size={19} /><div><h3>{title}</h3><p>{text}</p></div>{i < steps.length - 1 && <ArrowDown className="ws-flow-arrow" size={14} />}</li>)}</ol></section>

      <section className="ws-section ws-buy" id="how-to-buy"><span className="ws-kicker">কীভাবে ওয়েবসাইট নেবেন?</span><h2>মাত্র ৩ ধাপে শুরু করার অনুরোধ</h2><ol className="ws-buy-steps">{[{ title: "ডেমো দেখে পছন্দ করুন", text: "যশোরব্রোর লাইভ ওয়েবসাইট ঘুরে দেখুন। নিজের দোকানের নাম ও পছন্দের ডোমেইন ভেবে রাখুন।" }, { title: "দাম ও প্যাকেজ নিশ্চিত করুন", text: "যোগাযোগ বাটনে ক্লিক করে ব্র্যান্ডের নাম ও ফোন নম্বর দিন। টিমের সঙ্গে মূল্য ও সেটআপের সময় নিশ্চিত করুন।" }, { title: "সেটআপ শেষে লিংক শেয়ার করুন", text: "ওয়েবসাইট প্রস্তুত হলে দোকানের লিংক শেয়ার করে মার্কেটিং শুরু করুন।" }].map(({ title, text }, i) => <li key={title}><span>{(i + 1).toLocaleString("bn-BD")}</span><h3>{title}</h3><p>{text}</p></li>)}</ol><p className="ws-time-note"><Clock3 size={17} /><span>অনুরোধ জানাতে মাত্র ১০ মিনিট। এরপর আপনার ব্র্যান্ডে ব্যবসা শুরু।</span></p></section>

      <section className="ws-package" id="website-package"><div className="ws-package-copy"><span className="ws-kicker">আপনার পরের ব্যবসায়িক পদক্ষেপ</span><h2>ভাবনাটা অনেক দিনের?<br />শুরুর পদক্ষেপ হোক আজ।</h2><p>শূন্য থেকে পণ্য জোগাড় বা সব কাজ একা সামলানোর দরকার নেই। তৈরি ক্যাটালগ ও ResellerBrain-এর পরিচালনা সহায়তা নিয়ে নিজের ব্র্যান্ডে ব্যবসা গড়ার সুযোগ নিন।</p><div className="ws-package-note"><ShieldCheck size={20} /><span>নিজের ডোমেইন। নিজের পরিচয়।<br /><strong>স্টক, ডেলিভারি ও টেকনিক্যাল সাপোর্ট—সবই ResellerBrain-এর দায়িত্বে।</strong></span></div></div><div className="ws-price-card"><span className="ws-price-label"><Rocket size={16} /> আপনার নিজের ব্র্যান্ডের ওয়েবসাইট</span><h3>দাম জানতে যোগাযোগ করুন</h3><p className="ws-price-sub">প্যাকেজ ও আপনার প্রয়োজন নিয়ে কথা বলুন আমাদের টিমের সঙ্গে।</p><div className="ws-included-label">একসঙ্গে যা যা পাবেন</div><ul>{included.map(item => <li key={item}><Check size={16} /><span>{item}</span></li>)}</ul><a className="ws-button ws-button-dark" href={WEBSITE_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">WhatsApp-এ প্যাকেজের দাম জানুন <ArrowRight size={17} /></a><p className="ws-price-foot">আপনার ব্র্যান্ডের নাম ও প্রয়োজন WhatsApp-এ জানালে টিম দাম ও সেটআপ নিয়ে কথা বলবে।</p></div></section>
      <section className="ws-faq"><span className="ws-kicker">শুরুর আগে জেনে নিন</span><h2>আপনার প্রশ্ন, সহজ উত্তর</h2>{faqs.map(({ q, a }) => <details key={q}><summary>{q}<ChevronRight size={18} /></summary><p>{a}</p></details>)}</section><footer className="ws-footer"><span><img src="/resellerbrain-logo-icon.png" alt="" /> ব্র্যান্ড আপনার। পাশে ResellerBrain।</span><a href={DEMO_URL} target="_blank" rel="noopener noreferrer">আরেকবার ডেমো দেখি <ExternalLink size={14} /></a></footer>
    </main>
  );
}
