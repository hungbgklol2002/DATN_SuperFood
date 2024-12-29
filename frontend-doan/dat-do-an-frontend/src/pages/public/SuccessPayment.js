import React from "react";
import { useNavigate } from "react-router-dom";

const SuccessPaymentPage = () => {
    const navigate = useNavigate();

    const handleGoHome = () => {
        navigate("/"); 
    };

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            backgroundColor: "#f0f8ff",
            padding: "20px",
        }}>
            <div style={{
                textAlign: "center",
                backgroundColor: "#ffffff",
                padding: "40px 20px",
                borderRadius: "10px",
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
                maxWidth: "500px",
                width: "100%",
            }}>
                <h1 style={{ color: "#28a745", marginBottom: "10px" }}>Thanh toán thành công!</h1>
                <p style={{ fontSize: "16px", color: "#555" }}>
                    Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi. Hóa đơn đã được tạo thành công và sẽ được xử lý sớm nhất.
                </p>
                <div style={{
                    marginTop: "20px",
                    display: "flex",
                    justifyContent: "center",
                }}>
                    <button
                        onClick={handleGoHome}
                        style={{
                            padding: "12px 24px",
                            fontSize: "16px",
                            color: "#fff",
                            backgroundColor: "#007bff",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                        }}
                    >
                        Quay về trang chủ
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SuccessPaymentPage;
