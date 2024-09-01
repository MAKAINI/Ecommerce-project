import { Component } from '@angular/core';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart-status',
  templateUrl: './cart-status.component.html',
  styleUrl: './cart-status.component.css'
})
export class CartStatusComponent {

  totalPrice: number = 0.00;
  totalQuantity: number = 0;

  
  constructor(private cartService: CartService) { }

  ngOnInit() {
    this.updateCartStatus()
  }
  updateCartStatus() {
    // s'abonner au l'observable du panier pour le total de prix
    this.cartService.totalPrice.subscribe(
      data => this.totalPrice = data
    );

     // s'abonner au l'observable du panier pour le total de quantité

    this.cartService.totalQuantity.subscribe(
      data => this.totalQuantity = data
    );
  }

}
