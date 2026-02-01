import React, { useState } from "react";
import {
  useCreatePicnicMutation,
  useGetAllPicnicsQuery,
} from "../../redux/features/picnic";
import PicnicNav from "./components/picnic_nav";
export default function PicnicRegistration() {

  // ফর্ম স্টেট
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");

  const [age1to7, setAge1to7] = useState(0);
  const [age7to10, setAge7to10] = useState(0);
  const [age10plus, setAge10plus] = useState(0);

  // ফি
  const fee1 = 500;
  const fee2 = 1000;
  const fee3 = 1500;

  const total1 = age1to7 * fee1;
  const total2 = age7to10 * fee2;
  const total3 = age10plus * fee3;

  const grandTotal = total1 + total2 + total3;

  // API
  const { data: allRegistrations, isLoading } = useGetAllPicnicsQuery();
  const [createPicnic, { isLoading: isSubmitting }] = useCreatePicnicMutation();

  // সাবমিট
  const handleSubmit = async () => {
    if (!name || !mobile) {
      alert("নাম ও মোবাইল নম্বর দিন");
      return;
    }

    const payload = {
      name,
      mobile,
      members_1_7: age1to7,
      members_7_10: age7to10,
      members_10_plus: age10plus,
      total_amount: grandTotal,
    };

    const res = await createPicnic(payload);

    if (res?.data?.status === true) {
      alert("সফলভাবে রেজিস্ট্রেশন সম্পন্ন হয়েছে!");
      setName("");
      setMobile("");
      setAge1to7(0);
      setAge7to10(0);
      setAge10plus(0);
    } else {
      alert("রেজিস্ট্রেশন ব্যর্থ হয়েছে, আবার চেষ্টা করুন");
    }
  };

  return (

        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>

      {/* ✅ Navigation */}
      <PicnicNav />

      <h1 style={{ textAlign: "center", color: "#6A1B9A" }}>
        Hidia Picnic 2025
      </h1>

      {/* Rest of your page remains exactly same */}
       <div style={{ maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
      
      {/* শিরোনাম */}
     
      {/* নিয়মাবলী */}
      <section style={{ marginBottom: "30px" }}>
        <h2>📌 পিকনিক বিস্তারিত ও নিয়মাবলী</h2>

        <p><strong>তারিখ:</strong> 25-26 December 2025</p>
        <p><strong>স্থান:</strong> Hidia</p>
        <p><strong>রিপোর্টিং টাইম:</strong> সকাল 10টা</p>

        <h3>নিয়মাবলী</h3>
        <ul>
          <li>প্রতিটি অংশগ্রহণকারীকে রেজিস্ট্রেশন করতে হবে।</li>
          <li>বয়স অনুযায়ী ফি প্রযোজ্য হবে।</li>
            <li>পেমেন্ট নিশ্চিতকরণের পর রেজিস্ট্রেশন সম্পন্ন হবে।</li>
        
        </ul>

        <h3 style={{ marginTop: "20px", color: "red" }}>
          💳 পেমেন্ট নির্দেশনা
        </h3>
        <p style={{ fontSize: "16px", lineHeight: "26px" }}>
          👉 আপনার <strong>মোট টাকা</strong> বিকাশে জমা দিন। <br/>
          <strong>Bkash: 01717469218 (Firoz)</strong>
        </p>
      </section>

      {/* ফর্ম */}
      <section style={box}>
        <h2>📝 রেজিস্ট্রেশন ফর্ম</h2>

        <label>পূর্ণ নাম</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="আপনার নাম লিখুন"
          style={input}
        />

        <label>মোবাইল নম্বর</label>
        <input
          type="text"
          value={mobile}
          onChange={e => setMobile(e.target.value)}
          placeholder="মোবাইল নম্বর লিখুন"
          style={input}
        />

        <h3 style={{ marginTop: "20px" }}>👥 সদস্য সংখ্যা</h3>

        <table style={table}>
          <thead>
            <tr>
              <th>বয়স</th>
              <th>সংখ্যা</th>
              <th>ফি</th>
              <th>মোট</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>১–৭ বছর</td>
              <td>
                <input
                  type="number"
                  value={age1to7}
                  min="0"
                  onChange={(e) => setAge1to7(Number(e.target.value))}
                  style={numInput}
                />
              </td>
              <td>{fee1} টাকা</td>
              <td>{total1} টাকা</td>
            </tr>

            <tr>
              <td>৭–১০ বছর</td>
              <td>
                <input
                  type="number"
                  value={age7to10}
                  min="0"
                  onChange={(e) => setAge7to10(Number(e.target.value))}
                  style={numInput}
                />
              </td>
              <td>{fee2} টাকা</td>
              <td>{total2} টাকা</td>
            </tr>

            <tr>
              <td>১০+ বছর</td>
              <td>
                <input
                  type="number"
                  value={age10plus}
                  min="0"
                  onChange={(e) => setAge10plus(Number(e.target.value))}
                  style={numInput}
                />
              </td>
              <td>{fee3} টাকা</td>
              <td>{total3} টাকা</td>
            </tr>
          </tbody>
        </table>

        <button
          disabled={isSubmitting}
          onClick={handleSubmit}
          style={button}
        >
          {isSubmitting ? "পাঠানো হচ্ছে..." : "রেজিস্টার করুন"}
        </button>
      </section>

      {/* সারসংক্ষেপ */}
      <section style={listBox}>
        <h2>📋 রেজিস্ট্রেশন তালিকা</h2>

        {isLoading ? (
          <p>লোড হচ্ছে...</p>
        ) : (
          <table style={table}>
            <thead>
              <tr>
                <th>নাম</th>
                <th>মোবাইল</th>
                <th>১–৭</th>
                <th>৭–১০</th>
                <th>১০+</th>
                <th>মোট (টাকা)</th>
              </tr>
            </thead>

            <tbody>
              {allRegistrations?.data?.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.mobile}</td>
                  <td>{item.members_1_7}</td>
                  <td>{item.members_7_10}</td>
                  <td>{item.members_10_plus}</td>
                  <td><strong>{item.total_amount}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
    </div>
 
  );
}


// STYLES
const input = {
  width: "100%",
  padding: "10px",
  margin: "10px 0",
  fontSize: "16px",
  borderRadius: "6px",
  border: "1px solid #ccc",
};

const numInput = {
  width: "60px",
  padding: "6px",
  fontSize: "16px",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "10px",
};

const button = {
  width: "100%",
  padding: "15px",
  background: "#6A1B9A",
  color: "white",
  fontSize: "18px",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  marginTop: "20px",
};

const box = {
  padding: "20px",
  background: "#f8f8f8",
  borderRadius: "10px",
  marginBottom: "30px",
};

const listBox = {
  padding: "20px",
  background: "#eef7ff",
  borderRadius: "10px",
  marginTop: "30px",
};
