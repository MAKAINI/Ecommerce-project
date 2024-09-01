import { Component } from '@angular/core';
import { Product } from '../../common/product';
import { ProductService } from '../../services/product.service';
import { ActivatedRoute } from '@angular/router';
import { CartItem } from '../../common/cart-item';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrl: './product-details.component.css'
})
export class ProductDetailsComponent {

  product: Product  = new Product('id', 'sku', 'name', 'description',0,'imageUrl' ,false, 0, new Date(), new Date(), );

  constructor(private productService: ProductService,
              private cartService: CartService,
              private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.paramMap.subscribe(()=>{
      this.handleProductDetails()
    })
  }
  handleProductDetails() {
    // récupérer la chaîne de caractères "id" et convertir la chaîne en nombre à l'aide du symbole "+"
    const theProductId : number = +this.route.snapshot.paramMap.get('id')!;
    this.productService.getProduct(theProductId).subscribe(
      data =>{
        this.product = data
      }
    )
  }
  addToCart(){
    console.log(`ajouter au panier: ${this.product.name}, ${this.product.unitPrice}`);
    const theCartItem = new CartItem(this.product);
    this.cartService.addToCart(theCartItem);

  }
  

}
