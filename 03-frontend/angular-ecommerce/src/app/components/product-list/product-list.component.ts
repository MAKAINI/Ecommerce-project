import { Component } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { Product } from '../../common/product';
import { ActivatedRoute } from '@angular/router';
import { CartItem } from '../../common/cart-item';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list-grid.component.html',
  styleUrl: './product-list.component.css'
})
export class ProductListComponent {
  products: Product[] = [];
  currentCategoryId: number = 1;
  previousCategoryId: number= 1;
  searchMode: boolean = false;

  //nouvelles propriétés pour la pagination
  thePageNumber: number = 1;
  thePageSize: number = 12;
  theTotalElements: number = 0;

  previousKeyword: string = "";
  

  constructor(private productService: ProductService, 
              private cartService: CartService,
              private route:ActivatedRoute) {
  }
  ngOnInit() {
    this.route.paramMap.subscribe(()=>{
      this.listProducts();
    })
    
  }
  listProducts() {
    this.searchMode = this.route.snapshot.paramMap.has('keyword');
    if (this.searchMode) {
      this.handleSearchProducts()
    }else{
    this.handleListProducts()
    }
    
  }
  handleSearchProducts() {
   const theKeyword: string = this.route.snapshot.paramMap.get('keyword')?.trim()!;

   
   //Si nous avons un mot-clé différent du précédent,
   // alors remettez le thePageNumber à 1
   if(this.previousKeyword != theKeyword){
     this.thePageNumber = 1;
   }
   
   this.previousKeyword = theKeyword;
   console.log(`keyword=${theKeyword}, thePageNumber=${this.thePageNumber}`);
   // appel du service pour recuperer la liste des produits

   this.productService.searchProductsPaginate(this.thePageNumber -1, this.thePageSize, theKeyword).subscribe(this.processResult())
    }
  handleListProducts() {

    // vérification de paramètre id est disponible dans l'url
    const hasCategoryId: boolean = this.route.snapshot.paramMap.has('id');
    if (hasCategoryId) {
      // recupere la valeur de l'id dans l'url et la convertie en number
      this.currentCategoryId = +this.route.snapshot.paramMap.get('id')!;

    }else{
      //id de la categorie n'est pas disponible donc par defaut l'id est 1 
      this.currentCategoryId = 1;
    }
   

 // Vérifiez si nous avons une catégorie différente de la précédente.
//Nota : Réutilisation angular d'un composant s'il est en cours de visualisation
//si nous avons un identifiant de catégorie différent  du précédent,
//alors remettez le PageNumber à 1
if(this.previousCategoryId != this.currentCategoryId){
  this.thePageNumber = 1;
}
this.previousCategoryId = this.currentCategoryId;
console.log(`currentCategoryId=${this.currentCategoryId}, currentPage=${this.thePageNumber}`);

 // appel du service pour recuperer la liste des produits
    this.productService.getProductListPaginate(this.thePageNumber-1, 
                                               this.thePageSize, 
                                               this.currentCategoryId)
                                               .subscribe(this.processResult()) ;

    }
    updatePageSize(pageSize: string) {
         this.thePageSize = +pageSize;
         this.thePageNumber = 1;
         this.listProducts();
      }

      processResult(){
        return(data:any)=>{
          this.products = data._embedded.products;
          this.thePageNumber = data.page.number + 1;
          this.thePageSize = data.page.size;
          this.theTotalElements = data.page.totalElements;
        }
      }
      addToCart(theProduct: Product) {
          console.log(`Adding to cart: ${theProduct.name}, ${theProduct.unitPrice}`);

          const theCartItem = new CartItem(theProduct);
          this.cartService.addToCart(theCartItem)
        }
    
        
    }
  
  



