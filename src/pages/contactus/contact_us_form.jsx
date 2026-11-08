import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, CheckCircle2, ChevronDown, Globe, Loader2, Mail, MessageCircle, Phone, Send, ShieldCheck } from "lucide-react";
import { useCreateContactUsMutation } from "../../redux/features/order";
import "./contact-us.css";

const EMAIL = "ridoyfahim92@gmail.com";
const PHONE = "+8801941606310";
const WEBSITE_WHATSAPP_URL = `https://wa.me/${PHONE.slice(1)}?text=${encodeURIComponent("আসসালামু আলাইকুম, আমি নিজের ব্র্যান্ডের ইকমার্স ওয়েবসাইট নিতে আগ্রহী। প্যাকেজের দাম ও শুরু করার প্রক্রিয়া জানতে চাই।")}`;
const TOPICS = ["Website & pricing", "Orders & delivery", "Products & stock", "Account & payments", "Something else"];
const INITIAL = { name: "", email: "", phone: "", subject: TOPICS[0], message: "" };
const FAQS = [
  ["How can I get my own ecommerce website?", "Explore our website demo, then choose Website & pricing in the form. Share your brand name and plans. Our team will help you confirm pricing and domain arrangements."],
  ["Do I need to keep products in stock?", "No. Your connected website offers ResellerBrain products at your reseller prices. Orders automatically reach our team, and we handle stock, packing and delivery."],
  ["What should I include for an order issue?", "Choose Orders & delivery and include your order number and a short description. Please keep passwords, OTPs and payment credentials private."],
  ["How can I follow up on a support issue?", "Use Support Ticket in your dashboard for issues that need ongoing follow-up. This form is also available for general questions and website inquiries."],
];

export default function ContactUsPage() {
  const [createContactUs, { isLoading }] = useCreateContactUsMutation();
  const [form, setForm] = useState(INITIAL);
  const [errors, setErrors] = useState({});
  const [feedback, setFeedback] = useState(null);
  const formRef = useRef(null);
  const onChange = ({ target: { name, value } }) => {
    setForm(current => ({ ...current, [name]: value }));
    setErrors(current => ({ ...current, [name]: undefined }));
    setFeedback(null);
  };
  const onSubmit = async event => {
    event.preventDefault();
    if (isLoading) return;
    const invalid = {};
    if (!form.name.trim()) invalid.name = "Please enter your name.";
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) invalid.email = "Please enter a valid email address.";
    if (!form.message.trim()) invalid.message = "Tell us a little about how we can help.";
    setErrors(invalid);
    setFeedback(null);
    if (Object.keys(invalid).length) {
      formRef.current?.elements.namedItem(Object.keys(invalid)[0])?.focus();
      return;
    }
    try {
      const res = await createContactUs({ person_name: form.name.trim(), email: form.email.trim(), mobile: form.phone.trim(), type: form.subject, status: "1", campaign_id: "0", website: window.location.origin, additional_field_one: "", additional_field_two: "", query: form.message.trim() }).unwrap();
      const ok = res?.status === 200 || res?.success === true || String(res?.status).toLowerCase() === "success" || res?.message?.toLowerCase?.().includes("success");
      if (!ok) throw new Error(res?.message || "We couldn’t send your message. Please try again.");
      setForm(INITIAL);
      setFeedback({ type: "success", message: "Message sent! Our team will follow up using your contact details." });
    } catch (error) {
      setFeedback({ type: "error", message: error?.data?.message || error?.message || "Couldn’t send your message. Please try again or contact us on WhatsApp." });
    }
  };
  return (
    <main className="rb-contact">
      <header className="rc-header"><span className="rc-eyebrow"><MessageCircle size={14} /> LET’S TALK</span><h1>A little help.<br /><span>A bigger next step.</span></h1><p>From your first order to your own branded website,<br /> the ResellerBrain team is here to help you move forward.</p></header>
      <section className="rc-whatsapp-inquiry" aria-labelledby="rc-website-inquiry-title" lang="bn">
        <span className="rc-inquiry-icon"><MessageCircle size={30} /></span>
        <div className="rc-inquiry-copy"><span className="rc-eyebrow">WEBSITE INQUIRY · ওয়েবসাইট সংক্রান্ত যোগাযোগ</span><h2 id="rc-website-inquiry-title">ওয়েবসাইট সম্পর্কে জানতে WhatsApp করুন</h2><p>নিজের ব্র্যান্ডের ওয়েবসাইট, প্যাকেজের দাম ও সেটআপ নিয়ে সরাসরি কথা বলুন।</p><a className="rc-inquiry-number" href={WEBSITE_WHATSAPP_URL} target="_blank" rel="noopener noreferrer" aria-label={`ওয়েবসাইট সম্পর্কে ${PHONE} নম্বরে WhatsApp করুন`}>{PHONE}</a></div>
        <a className="rc-inquiry-cta" href={WEBSITE_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">WhatsApp-এ কথা বলুন <ArrowRight size={18} /></a>
      </section>
      <div className="rc-layout">
        <aside className="rc-sidebar"><section className="rc-connect"><span className="rc-eyebrow">GOOD CONVERSATIONS START HERE</span><h2>Real people.<br />Ready to help.</h2><p>A quick question or a big idea? Choose the way you’d like to connect.</p>
          {[{ icon: MessageCircle, title: "Chat on WhatsApp", subtitle: "Our preferred way to connect", href: `https://wa.me/${PHONE.slice(1)}`, external: true }, { icon: Mail, title: "Send an email", subtitle: EMAIL, href: `mailto:${EMAIL}` }, { icon: Phone, title: "Give us a call", subtitle: PHONE, href: `tel:${PHONE}` }].map(({ icon: Icon, title, subtitle, href, external }) => <a className="rc-channel" href={href} key={title} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}><span className="rc-channel-icon"><Icon size={20} /></span><span><strong>{title}</strong><small>{subtitle}</small></span><ArrowRight size={17} /></a>)}
          <div className="rc-connect-foot"><ShieldCheck size={16} /> One team for your ResellerBrain journey.</div></section>
          <Link className="rc-website" to="/app/ecommerce-website"><Globe size={26} /><span className="rc-eyebrow">YOUR BRAND, ONLINE</span><h3>Thinking about your<br />own website?</h3><p>See the demo and discover what’s included in your branded store.</p><strong>Explore ecommerce websites <ArrowRight size={15} /></strong></Link>
        </aside>
        <section className="rc-form-card" aria-labelledby="rc-form-title"><div className="rc-form-heading"><span><Send size={21} /></span><div><h2 id="rc-form-title">Send us a message</h2><p>A few details will help us point you in the right direction.</p></div></div>
          <form ref={formRef} onSubmit={onSubmit} noValidate aria-busy={isLoading}><fieldset disabled={isLoading}><legend>What can we help you with?</legend><div className="rc-topics">{TOPICS.map(topic => <button type="button" key={topic} aria-pressed={topic === form.subject} onClick={() => { setForm(current => ({ ...current, subject: topic })); setFeedback(null); }}>{topic === form.subject && <Check size={13} />}{topic}</button>)}</div>
            <div className="rc-fields">{[{ name: "name", label: "Your name", placeholder: "Enter your full name", autoComplete: "name" }, { name: "email", label: "Email address", type: "email", placeholder: "you@example.com", autoComplete: "email" }, { name: "phone", label: "Phone number", type: "tel", placeholder: "Your contact or WhatsApp number", autoComplete: "tel", optional: true }].map(({ name, label, optional, ...props }) => <div className={`rc-field ${optional ? "rc-full" : ""}`} key={name}><label htmlFor={`rc-${name}`}>{label} {optional ? <small>Optional</small> : <span>*</span>}</label><input {...props} name={name} id={`rc-${name}`} value={form[name]} onChange={onChange} required={!optional} aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `rc-${name}-error` : undefined} />{errors[name] && <span className="rc-error" id={`rc-${name}-error`}>{errors[name]}</span>}</div>)}
              <div className="rc-field rc-full"><label htmlFor="rc-message">Your message <span>*</span></label><textarea id="rc-message" name="message" rows={6} value={form.message} onChange={onChange} required aria-invalid={!!errors.message} aria-describedby={errors.message ? "rc-message-error" : "rc-message-hint"} placeholder={form.subject === "Website & pricing" ? "Tell us about your brand, the website you have in mind, and any questions about pricing or setup…" : form.subject === "Orders & delivery" ? "Include your order number and let us know what happened…" : "What would you like to know? Share a few details so we can help…"} />{errors.message ? <span id="rc-message-error" className="rc-error">{errors.message}</span> : <small id="rc-message-hint" className="rc-hint">Please keep passwords, OTPs and payment credentials private.</small>}</div>
            </div></fieldset>
            {feedback && <div className={`rc-feedback rc-feedback-${feedback.type}`} role={feedback.type === "error" ? "alert" : "status"}>{feedback.type === "success" && <CheckCircle2 size={18} />}<span>{feedback.message}</span></div>}
            <div className="rc-form-bottom"><p><ShieldCheck size={16} /> Your details help us respond to your inquiry.</p><button className="rc-submit" type="submit" disabled={isLoading}>{isLoading ? <><Loader2 className="rc-spinner" size={16} /> Sending message…</> : <>Send message <ArrowRight size={16} /></>}</button></div>
          </form>
        </section>
      </div>
      <section className="rc-faq"><div><span className="rc-eyebrow">BEFORE YOU ASK</span><h2>A few helpful<br />answers.</h2><p>You might find your next step right here.</p><Link to="/app/users">Need ongoing support? Open a ticket <ArrowRight size={14} /></Link></div><div className="rc-faq-list">{FAQS.map(([question, answer]) => <details key={question}><summary>{question}<ChevronDown size={17} /></summary><p>{answer}</p></details>)}</div></section>
      <footer className="rc-footer"><img src="/resellerbrain-logo-icon.png" alt="" /> Your business moves forward. We’re here for the journey.</footer>
    </main>
  );
}
