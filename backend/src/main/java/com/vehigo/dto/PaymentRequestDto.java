package com.vehigo.dto;

public class PaymentRequestDto {
    private String paymentMethod; // e.g. "DEMO_CARD", "DEMO_UPI", "DEMO_NETBANKING"
    private String transactionId;

    public PaymentRequestDto() {}

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
}
