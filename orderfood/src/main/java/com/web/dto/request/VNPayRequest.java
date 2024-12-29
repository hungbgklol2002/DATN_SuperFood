package com.web.dto.request;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.AllArgsConstructor;

public class VNPayRequest {

    @Getter
    @Setter
    @Builder
    @AllArgsConstructor
    public static class VNPayResponse {
        private String code;
        private String message;
        private String paymentUrl;
    }
}
