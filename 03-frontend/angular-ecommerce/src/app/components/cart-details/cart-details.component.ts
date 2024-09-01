import { Component } from '@angular/core';
import { CartItem } from '../../common/cart-item';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-cart-details',
  templateUrl: './cart-details.component.html',
  styleUrl: './cart-details.component.css'
})
export class CartDetailsComponent {


  CartItems: CartItem[] = [];
  totalPrice: number = 0;
  totalQuantity: number = 0;
  constructor(private cartService: CartService) { }

  ngOnInit(): void {
    this.listCartDetails()
  }
  listCartDetails() { 
   // obtenir le contenu du panier
   this.CartItems = this.cartService.cartItems;

   // déclancher l'opération pour le prix total du panier 
   this.cartService.totalPrice.subscribe(
     data => this.totalPrice = data
   )

   // déclancher l'opération de la quantité d'articles dans le panier
   this.cartService.totalQuantity.subscribe(
     data => this.totalQuantity = data
   )


   // déclancher l'opération pour le prix total du panier et de la quantité d'articles dans le panier
   this.cartService.computeCartTotals();
  }

  incrementQuantity(theCartItem: CartItem) {
    this.cartService.addToCart(theCartItem);
    
    }

    decrementQuantity(theCartItem: CartItem) {
      this.cartService.decrementQuantity(theCartItem);
      }
      remove(theCartItem: CartItem) {
        this.cartService.remove(theCartItem);
        }
      

}
