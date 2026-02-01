import React, { useState } from "react";
import {
  useGetAllPicnicsQuery,
  useUpdatePicnicMutation
} from "../../redux/features/picnic";
import PicnicNav from "./components/picnic_nav";
export default function RegisteredMembersTable() {
  const { data, isLoading } = useGetAllPicnicsQuery();
  const [updatePicnic] = useUpdatePicnicMutation();

  const [selectedId, setSelectedId] = useState(null);
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState("");
  const [paidAmount, setPaidAmount] = useState("");

  if (isLoading)
    return (
      <div style={loadingStyle}>
        <div className="spinner"></div>
        Loading registrations...
      </div>
    );

  const registrations = data?.data || [];

  const handleStatusClick = (id, currentPaidAmount) => {
    setSelectedId(id);
    setPaidAmount(currentPaidAmount || ""); // load if already exists
    setShowPinModal(true);
  };

  const verifyPin = async () => {
    if (pin !== "8090") {
      alert("❌ Invalid PIN");
      return;
    }

    await updatePicnic({
      id: selectedId,
      updateData: {
        payment_status: "paid",
        paid_amount: paidAmount
      }
    });

    setShowPinModal(false);
    setPin("");
    setPaidAmount("");
  };

  return (
        <div style={{ padding: "20px" }}>

      {/* ✅ Navigation */}
      <PicnicNav />

      <h2 style={titleStyle}>🎉 Picnic Registration Dashboard</h2>

      {/* Rest of your table page as it is */}
      <div style={{ padding: "20px" }}>
     

      <div style={cardStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th>#</th>
              <th>Member Info</th>
              <th>Members</th>
              <th>Total Fee</th>
              <th>Paid Amount</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {registrations.map((item, index) => (
              <tr key={item.id} style={rowStyle}>
                <td>{index + 1}</td>

                {/* Name + Mobile */}
                <td style={{ padding: "8px" }}>
                  <div style={{ fontWeight: "700", color: "#4A148C" }}>
                    {item.name}
                  </div>
                  <div style={{ fontSize: "13px", color: "#444" }}>
                    📞 {item.mobile}
                  </div>
                </td>

                {/* Members */}
                <td>
                  <span style={chipStyle}>1–7: {item.members_1_7}</span>
                  <span style={chipStyle}>7–10: {item.members_7_10}</span>
                  <span style={chipStyle}>10+: {item.members_10_plus}</span>
                </td>

                {/* Total Fee */}
                <td style={{ fontWeight: "600", color: "#00897b" }}>
                  {item.total_amount} TK
                </td>

                {/* Paid Amount */}
                <td style={{ fontWeight: "600", color: "#0288d1" }}>
                  {item.paid_amount ? `${item.paid_amount} TK` : "0 TK"}
                </td>

                {/* Payment Status */}
                <td>
                  <button
                    onClick={() =>
                      handleStatusClick(item.id, item.paid_amount)
                    }
                    style={{
                      ...badgeStyle,
                      background:
                        item.payment_status === "paid"
                          ? "#43a047"
                          : "#d32f2f"
                    }}
                  >
                    {item.payment_status}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PIN MODAL */}
      {showPinModal && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h3>Enter PIN</h3>

            {/* PIN */}
            <input
              type="password"
              placeholder="Enter admin PIN"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              style={inputStyle}
            />

            {/* Paid Amount */}
            <input
              type="number"
              placeholder="Enter Paid Amount"
              value={paidAmount}
              onChange={(e) => setPaidAmount(e.target.value)}
              style={{ ...inputStyle, marginTop: "10px" }}
            />

            <button style={confirmBtn} onClick={verifyPin}>
              Confirm
            </button>

            <button style={cancelBtn} onClick={() => setShowPinModal(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
    </div>
  
  );
}

/* ---------------- STYLES ---------------- */

const titleStyle = {
  fontSize: "24px",
  fontWeight: "700",
  marginBottom: "15px",
  color: "#4A148C"
};

const loadingStyle = {
  textAlign: "center",
  padding: "30px",
  fontSize: "18px"
};

const cardStyle = {
  background: "white",
  padding: "15px",
  borderRadius: "10px",
  boxShadow: "0 3px 10px rgba(0,0,0,0.1)"
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: "14px"
};

const rowStyle = {
  borderBottom: "1px solid #eee"
};

const chipStyle = {
  display: "inline-block",
  background: "#ede7f6",
  color: "#5e35b1",
  padding: "3px 6px",
  borderRadius: "8px",
  margin: "2px",
  fontSize: "11px"
};

const badgeStyle = {
  padding: "6px 12px",
  borderRadius: "16px",
  color: "white",
  cursor: "pointer",
  border: "none",
  fontSize: "12px"
};

/* MODAL */
const modalOverlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
};

const modalBox = {
  background: "white",
  padding: "20px",
  width: "280px",
  borderRadius: "12px",
  textAlign: "center"
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  borderRadius: "6px",
  border: "1px solid #ccc",
  fontSize: "14px"
};

const confirmBtn = {
  width: "100%",
  padding: "10px",
  background: "#4A148C",
  color: "white",
  border: "none",
  borderRadius: "6px",
  marginTop: "12px"
};

const cancelBtn = {
  width: "100%",
  padding: "10px",
  background: "grey",
  color: "white",
  border: "none",
  borderRadius: "6px",
  marginTop: "8px"
};
