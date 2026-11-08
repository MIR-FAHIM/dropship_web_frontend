import PropTypes from "prop-types";
import { ArrowLeft, ClipboardCheck, Clock3, PackageCheck, Truck, Wallet, Banknote } from "lucide-react";

const steps = [
	{ icon: ClipboardCheck, title: "অর্ডার যাচাই", description: "ResellerBrain-এর অ্যাডমিন আপনার অর্ডারের তথ্য যাচাই করবেন।" },
	{ icon: PackageCheck, title: "ভেন্ডরকে অর্ডার দেওয়া", description: "যাচাই শেষে অ্যাডমিন ভেন্ডরকে অর্ডার দেবেন। ভেন্ডর পণ্য প্রস্তুত করবেন।" },
	{ icon: Truck, title: "ডেলিভারি ও টাকা সংগ্রহ", description: "ডেলিভারি কোম্পানি আপনার কাস্টমারের কাছে পণ্য পৌঁছে দিয়ে COD-এর টাকা সংগ্রহ করবে।" },
	{ icon: Banknote, title: "ResellerBrain-এ টাকা জমা", description: "ডেলিভারি কোম্পানি সংগৃহীত টাকা ResellerBrain-এ পাঠাবে।" },
	{ icon: Wallet, title: "লাভ ব্যালেন্সে যোগ", description: "টাকা পাওয়ার পর ResellerBrain আপনার লাভ ব্যালেন্সে যোগ করবে। তখন আপনি তা উত্তোলন করতে পারবেন।" },
];

export default function CheckoutOrderGuide({ onBack, quick = false }) {
	return (
		<div className="mb-6 space-y-4" lang="bn">
			<header className="flex items-start gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-4 sm:px-6 sm:py-5">
				<button type="button" onClick={onBack} aria-label="আগের পেজে ফিরে যান" className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-emerald-200 bg-white text-emerald-900 transition hover:bg-emerald-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700">
					<ArrowLeft size={18} aria-hidden="true" />
				</button>
				<div>
					<p className="text-xs font-semibold text-emerald-800">{quick ? "দ্রুত অর্ডার · চূড়ান্ত ধাপ" : "কার্ট থেকে অর্ডার"}</p>
					<h1 className="mt-1 text-xl font-bold text-slate-900 sm:text-2xl">অর্ডার নিশ্চিত করুন</h1>
					<p className="mt-1 text-sm leading-relaxed text-slate-700">{quick ? "কাস্টমারের ঠিকানা, সংগ্রহের টাকা ও আনুমানিক লাভ দেখে অর্ডার জমা দিন।" : "কাস্টমারের ঠিকানা দিন, পণ্যের তালিকা ও মোট টাকা দেখে অর্ডার জমা দিন।"}</p>
				</div>
			</header>
			<section aria-label="অর্ডারের পর কী হবে" className="rounded-2xl border border-slate-200 bg-white px-4 py-4 sm:px-6 sm:py-5">
				<div className="mb-4 flex flex-wrap items-start justify-between gap-2">
					<div>
						<h2 className="text-base font-bold text-slate-900 sm:text-lg">অর্ডার দেওয়ার পর কী হবে?</h2>
						<p className="mt-1 text-sm text-slate-600">অর্ডার জমা থেকে লাভ উত্তোলন পর্যন্ত ধাপগুলো দেখুন।</p>
					</div>
					<span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-900">
						<Clock3 size={15} aria-hidden="true" /> কমপক্ষে ৩ দিন
					</span>
				</div>
				<ol className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
					{steps.map(({ icon: Icon, title, description }, index) => (
						<li key={title} className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 xl:flex-col">
							<span className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-emerald-100 px-2 py-1.5 text-xs font-bold text-emerald-900">
								<Icon size={16} aria-hidden="true" />{(index + 1).toLocaleString("bn-BD")}
							</span>
							<div>
								<p className="text-sm font-bold leading-relaxed text-slate-900">{title}</p>
								<p className="mt-0.5 text-xs leading-relaxed text-slate-700">{description}</p>
							</div>
						</li>
					))}
				</ol>
				<p className="mt-4 border-t border-slate-100 pt-3 text-xs leading-relaxed text-slate-700">
					অর্ডার জমা থেকে লাভ ব্যালেন্সে যোগ হতে <strong>কমপক্ষে ৩ দিন</strong> লাগে। ডেলিভারি ও কুরিয়ারের টাকা পাঠাতে দেরি হলে আরও সময় লাগতে পারে।
				</p>
			</section>
		</div>
	);
}

CheckoutOrderGuide.propTypes = {
	onBack: PropTypes.func.isRequired,
	quick: PropTypes.bool,
};
