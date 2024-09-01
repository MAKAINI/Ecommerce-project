package com.librairie.ecommerce.service;


import com.librairie.ecommerce.dto.PaymentInfo;
import com.librairie.ecommerce.dto.Purchase;
import com.librairie.ecommerce.dto.PurchaseResponse;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;

public interface CheckoutService {

    PurchaseResponse placeOrder(Purchase purchase);

    PaymentIntent createPaymentIntent(PaymentInfo paymentInfo) throws StripeException;
}
