import { useState } from "react";
import { useTranslation } from "react-i18next";


export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState(null);
      const { t, i18n } = useTranslation();
  const faqData = [
    { question: t("faq.question_1.ques"), answer: t("faq.question_1.ans"), },
    { question: t("faq.question_2.ques"), answer: t("faq.question_2.ans"),},
    { question: t("faq.question_3.ques"), answer: t("faq.question_3.ans"),},
    { question: t("faq.question_4.ques"), answer:t("faq.question_4.ans"), },
    { question: t("faq.question_5.ques"), answer:t("faq.question_5.ans"), },
    { question: t("faq.question_6.ques"),answer: t("faq.question_6.ans"),},
    { question: t("faq.question_7.ques"), answer:t("faq.question_7.ans"),},
    { question: t("faq.question_8.ques"), answer: t("faq.question_8.ans"),},
  ];
  return (
    <div className="bg-white m-4 p-4 rounded-md shadow">
      <h2 className="text-center text-pink-500 font-bold text-lg mb-4">সাধারণ জিজ্ঞাসা</h2>
      <div className="space-y-2">
        {faqData.map((item, index) => (
          <div key={index} className="border-b">
            <button
              className="w-full text-left p-3 flex justify-between items-center"
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              {item.question}
              <span>{openIndex === index ? "▲" : "▼"}</span>
            </button>
            {openIndex === index && (
              <p className="p-5 bg-gray-50 text-green-600">{item.answer}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
