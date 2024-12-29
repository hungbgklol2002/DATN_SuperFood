package com.web.api;

import com.web.dto.ResponseObject;
import com.web.dto.request.VNPayRequest;
import com.web.entity.HistoryPay;
import com.web.entity.Invoice;
import com.web.entity.Voucher;
import com.web.enums.PayType;
import com.web.enums.StatusInvoice;
import com.web.exception.MessageException;
import com.web.repository.HistoryPayRepository;
import com.web.repository.InvoiceRepository;
import com.web.repository.VoucherRepository;
import com.web.service.PaymentService;
import com.web.utils.VNPayUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.sql.Date;
import java.sql.Timestamp;
import java.util.Map;
import java.util.Optional;

@RestController
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;
    private final VoucherRepository voucherRepository;
    private final HistoryPayRepository historyPayRepository;
    private final InvoiceRepository invoiceRepository;

    @GetMapping("/vn-pay")
    public ResponseObject<VNPayRequest.VNPayResponse> pay(HttpServletRequest request,
                                                          @RequestParam(required = false) String voucherCode) {
        try {
            // Kiểm tra và áp dụng mã voucher
            Double totalAmount = Double.parseDouble(request.getParameter("amount")); // Lấy tổng tiền từ request
            if (voucherCode != null && !voucherCode.isEmpty()) {
                Optional<Voucher> voucher = findVoucherByCode(voucherCode, totalAmount);
                if (voucher.isPresent()) {
                    totalAmount -= voucher.get().getDiscount(); // Giảm số tiền thanh toán
                }
            }

            // Thêm tổng tiền mới vào request
            request.setAttribute("amount", totalAmount);

            // Gọi service tạo thanh toán VNPay
            VNPayRequest.VNPayResponse response = paymentService.createVnPayPayment(request);
            return new ResponseObject<>(HttpStatus.OK, "Success", response);

        } catch (MessageException e) {
            return new ResponseObject<>(HttpStatus.BAD_REQUEST, e.getMessage(), null);
        } catch (Exception e) {
            return new ResponseObject<>(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error", null);
        }
    }

    @GetMapping("/vnpayReturn")
    public void vnpayReturn(@RequestParam Map<String, String> params, HttpServletResponse response) throws IOException {
        System.out.println("==== Callback VNPAY Received ====");
        String vnp_SecureHash = params.get("vnp_SecureHash");
        params.remove("vnp_SecureHash");

        // Hash lại dữ liệu để xác thực
        String calculatedHash = VNPayUtil.hashAllFields(params, "Q5FMM2RMU8DSZFR9G4OFM5SDT0R2TD1P");
        System.out.println("VNPay SecureHash: " + vnp_SecureHash);
        System.out.println("Calculated Hash: " + calculatedHash);

        if (!calculatedHash.equals(vnp_SecureHash)) {
            System.out.println("Thanh toán thành công!");
            response.sendRedirect("http://localhost:3000/success-payment");
            return;
        }
        String resultCode = params.get("vnp_ResponseCode");
        if (!"00".equals(resultCode)) {
            System.out.println("Thanh toán thất bại!");
            response.sendRedirect("http://localhost:3000/success-payment"); // Chuyển hướng khi thanh toán thất bại
            return;
        }

        try {
            Long orderId = Long.parseLong(params.get("vnp_TxnRef"));
            Double amount = Double.parseDouble(params.get("vnp_Amount")) / 100;
            String bankCode = params.get("vnp_BankCode");
            String payDate = params.get("vnp_PayDate");

            System.out.println("Order ID: " + orderId);
            System.out.println("Amount: " + amount);
            System.out.println("Bank Code: " + bankCode);
            System.out.println("Pay Date: " + payDate);

            Optional<HistoryPay> historyPayOptional = historyPayRepository.findByOrderId(orderId);

            if (historyPayOptional.isPresent()) {
                Invoice invoice = historyPayOptional.get().getInvoice();
                invoice.setStatusInvoice(StatusInvoice.DANG_CHO_XAC_NHAN);
                invoice.setPayType(PayType.VNPAY);
                invoice.setStatusUpdateDate(new Timestamp(System.currentTimeMillis()));
                invoiceRepository.save(invoice);

                response.sendRedirect("https://your-success-url.com"); // Redirect khi thanh toán thành công
            } else {
                Invoice newInvoice = new Invoice();
                newInvoice.setReceiverName("Khách hàng VNPay");
                newInvoice.setPhone("Chưa cung cấp");
                newInvoice.setAddress("Chưa cung cấp");
                newInvoice.setTotalAmount(amount);
                newInvoice.setPayType(PayType.VNPAY);
                newInvoice.setStatusInvoice(StatusInvoice.DANG_CHO_XAC_NHAN);
                newInvoice.setCreatedDate(new Date(System.currentTimeMillis()));
                newInvoice.setStatusUpdateDate(new Timestamp(System.currentTimeMillis()));

                Invoice savedInvoice = invoiceRepository.save(newInvoice);

                HistoryPay historyPay = new HistoryPay();
                historyPay.setInvoice(savedInvoice);
                historyPay.setCreatedDate(new Date(System.currentTimeMillis()));
                historyPay.setTotalAmount(amount);
                historyPayRepository.save(historyPay);

                response.sendRedirect("https://your-success-url.com"); // Redirect khi tạo hóa đơn mới thành công
            }
        } catch (Exception e) {
            e.printStackTrace();
            response.sendRedirect("https://your-error-url.com"); // Chuyển hướng khi có lỗi xử lý
        }
    }

    // Hàm kiểm tra mã voucher
    private Optional<Voucher> findVoucherByCode(String code, Double amount) {
        Optional<Voucher> ex = voucherRepository.findByCode(code);
        if (ex.isEmpty()) {
            throw new MessageException("Mã voucher không khả dụng");
        }
        if (ex.get().getBlock()) {
            throw new MessageException("Mã voucher đã bị khóa");
        }
        Date now = new Date(System.currentTimeMillis());
        if (!((ex.get().getStartDate().before(now) || ex.get().getStartDate().equals(now))
                && (ex.get().getEndDate().after(now) || ex.get().getEndDate().equals(now)))) {
            throw new MessageException("Mã voucher đã hết hạn");
        }
        if (ex.get().getMinAmount() > amount) {
            throw new MessageException("Số tiền đơn hàng chưa đủ, cần thêm " +
                    (ex.get().getMinAmount() - amount) + " để áp dụng voucher");
        }
        return ex;
    }
}
