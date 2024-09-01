package com.librairie.ecommerce.dto;

import com.librairie.ecommerce.entity.Address;
import com.librairie.ecommerce.entity.Customer;
import com.librairie.ecommerce.entity.Order;
import com.librairie.ecommerce.entity.OrderItem;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.Set;

@Data
public class Purchase {
    private Customer customer;
    private Address shippingAddress;
    private Address billingAddress;
    private Order order;
    // Si vous voulez un setter
    // Getter pour orderItems
    @Setter
    @Getter
    private Set<OrderItem> orderItems;

}
