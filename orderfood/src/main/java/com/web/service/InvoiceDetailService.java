package com.web.service;

import com.web.dto.request.InvoiceDetailRequest;
import com.web.entity.Invoice;
import com.web.entity.InvoiceDetail;
import com.web.entity.Product;
import com.web.repository.InvoiceDetailRepository;
import com.web.repository.InvoiceRepository;
import com.web.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class InvoiceDetailService {

    @Autowired
    private InvoiceDetailRepository invoiceDetailRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;


    public void addInvoiceDetails(Long invoiceId, List<InvoiceDetailRequest> invoiceDetailRequests) {

        Invoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        // Lặp qua các chi tiết hóa đơn và lưu vào DB
        for (InvoiceDetailRequest request : invoiceDetailRequests) {
            Product product = productRepository.findById(request.getProductId())
                    .orElseThrow(() -> new RuntimeException("Product not found"));

            InvoiceDetail invoiceDetail = new InvoiceDetail();
            invoiceDetail.setInvoice(invoice);
            invoiceDetail.setProduct(product);
            invoiceDetail.setQuantity(request.getQuantity());
            invoiceDetail.setPrice(request.getPrice());

            // Lưu chi tiết hóa đơn vào DB
            invoiceDetailRepository.save(invoiceDetail);
        }
    }
}
