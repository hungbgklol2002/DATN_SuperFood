package com.web.models;


import com.web.constants.Language;


public class QueryStatusTransactionRequest extends Request {
    private String signature;

    public QueryStatusTransactionRequest(String signature) {
        this.signature = signature;
    }

    public QueryStatusTransactionRequest(String partnerCode, String orderId, String requestId, Language lang, String signature) {
        super(partnerCode, orderId, requestId, lang);
        this.signature = signature;
    }

    public String getSignature() {
        return signature;
    }

    public void setSignature(String signature) {
        this.signature = signature;
    }
}
