import { Injectable } from '@angular/core';
import { CartItem } from '../common/cart-item';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  
  cartItems: CartItem[] = [];

  totalPrice : Subject<number> = new BehaviorSubject<number>(0);
  totalQuantity : Subject<number> = new BehaviorSubject<number>(0);
  storage: Storage = sessionStorage;

  //storage: Storage = localStorage;


  constructor() {
    // la lecture  du frmat JSON des articles dans le local storage
    let data = JSON.parse(this.storage.getItem('cartItems')!);
    if(data != null){
      this.cartItems = data;
      // on calcule les totaux sur les données lues à partir du stockage
      this.computeCartTotals();
    }

    this.cartItems = JSON.parse(localStorage.getItem('cartItems')!)? 
    JSON.parse(localStorage.getItem('cartItems')!) : [];
   }
  addToCart(theCartItem: CartItem){

    // on vérifie si un article est deja dans le panier
    let alreadyExistInCart: boolean = false;
    let existingCartItem: CartItem | undefined = undefined;
    if(this.cartItems.length > 0){
      //on trouve un article dans le panier par l'intermédiaire de son id
      existingCartItem = this.cartItems.find(tempCartItem => tempCartItem.id === theCartItem.id);
      //on vérifie si l'article existe dans le panier
    alreadyExistInCart = (existingCartItem != undefined);
    } 
        if(alreadyExistInCart && existingCartItem?.quantity) {
          //on augmente la quantité de l'article dans le panier
          existingCartItem.quantity++;   
        }else{
          //on ajoute l'article dans le panier
          this.cartItems.push(theCartItem);
        }
        //on met à jour le total du panier
        this.computeCartTotals();
      }
  computeCartTotals() {

    let totalPriceValue: number = 0;
    let totalQuantityValue: number = 0;
    for(let currentCartItem of this.cartItems){
      totalPriceValue += currentCartItem.quantity * currentCartItem.unitPrice
      totalQuantityValue += currentCartItem.quantity;
    }
    this.totalPrice.next(totalPriceValue);
    this.totalQuantity.next(totalQuantityValue);

    //la journalisation du panier est faite pour debugger le panier
    this.logCartData(totalPriceValue, totalQuantityValue);
    //on sauvegarde le panier dans le local storage
    this.persistCartItems()
  }
  persistCartItems() {
    this.storage.setItem('cartItems', JSON.stringify(this.cartItems));
  }
  logCartData(totalPriceValue: number, totalQuantityValue: number) {
   console.log('le contenu du panier');
   for(let tempCartItem of this.cartItems){
    const subTotalPrice = tempCartItem.quantity * tempCartItem.unitPrice;
    console.log(`name:${tempCartItem.name}, quantity:${tempCartItem.quantity}, 
                 unitPrice:${tempCartItem.unitPrice}, subTotalPrice: ${subTotalPrice}`)
   }
   console.log(`totalPrice: ${totalPriceValue.toFixed(2)}, totalQuantity: ${totalQuantityValue}`);
   console.log('----');
   
  }
  decrementQuantity(theCartItem: CartItem) {
    theCartItem.quantity--;

    if(theCartItem.quantity===0){
      this.remove(theCartItem);
    }else{
      this.computeCartTotals();
    }
  }
  remove(theCartItem: CartItem) {
    // on recherche l'index de l'article dans le tableau
    const itemIndex = this.cartItems.findIndex(tempCartItem => tempCartItem.id === theCartItem.id);
    //si on retrouvel'index de l'article, on supprime l'article 
    //  l'indexe du tableau et on met à jour le sous-total
    if(itemIndex > -1){
      this.cartItems.splice(itemIndex, 1);
      this.computeCartTotals();
    }
  }
     
    
}
