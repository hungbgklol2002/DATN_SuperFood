package com.web.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class InvoiceDetailRequest {
    private Long productId;
    private Integer quantity;
    private Double price;


}
