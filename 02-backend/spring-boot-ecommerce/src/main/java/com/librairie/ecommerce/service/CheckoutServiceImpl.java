package com.librairie.ecommerce.service;

import com.librairie.ecommerce.dao.CustomerRepository;
import com.librairie.ecommerce.dto.PaymentInfo;
import com.librairie.ecommerce.dto.Purchase;
import com.librairie.ecommerce.dto.PurchaseResponse;
import com.librairie.ecommerce.entity.Customer;
import com.librairie.ecommerce.entity.Order;
import com.librairie.ecommerce.entity.OrderItem;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class CheckoutServiceImpl implements CheckoutService {
    private final CustomerRepository customerRepository;

    @Autowired
    public CheckoutServiceImpl(CustomerRepository customerRepository,
                               @Value("${stripe.key.secret}") String secretKey) {
        this.customerRepository = customerRepository;

        // initialize Stripe API with secret key
        Stripe.apiKey = secretKey;
    }

    @Override
    @Transactional
    public PurchaseResponse placeOrder(Purchase purchase) {
        // On récupère les informations de la commande à partir du DTO
        Order order = purchase.getOrder();

        // On génère le numéro de la commande
        String orderTrackingNumber = generateOrderTrackingNumber();
        order.setOrderTrackingNumber(orderTrackingNumber);

        // On récupère les items de la commande
        Set<OrderItem> orderItems = purchase.getOrderItems();
        if (orderItems != null) {
            orderItems.forEach(order::add);
        }

        // On récupère l'adresse de livraison et de facturation
        order.setBillingAddress(purchase.getBillingAddress());
        order.setShippingAddress(purchase.getShippingAddress());

        // On récupère le client avec sa commande
        Customer customer = purchase.getCustomer();
        // On vérifie s'il y a l'existence du client en question par son email
        String theEmail = customer.getEmail();
        Customer customerFromBD = customerRepository.findByEmail(theEmail);
        if (customerFromBD != null){
            // Si nous les trouvons alors  nous les attribuerons en conséquence
            customer = customerFromBD;
        }
        customer.add(order);

        // On sauvegarde le client dans la base de données
        customerRepository.save(customer);

        // On renvoie le résultat
        return new PurchaseResponse(orderTrackingNumber);
    }

    @Override
    public PaymentIntent createPaymentIntent(PaymentInfo paymentInfo) throws StripeException {
        List<String>paymentMethodTypes = new ArrayList<>();
        paymentMethodTypes.add("card");

        Map<String, Object>params = new HashMap<>();
        params.put("amount", paymentInfo.getAmount());
        params.put("currency", paymentInfo.getCurrency());
        params.put("payment_method_types",paymentMethodTypes);
        params.put("description", "library purchase");
        params.put("receipt_email", paymentInfo.getReceiptEmail());
        return PaymentIntent.create(params);
    }

    private String generateOrderTrackingNumber() {
        // Génère un numéro aléatoire unique à l'aide de UUID version 4
        return UUID.randomUUID().toString();
    }
}
