import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {  Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product } from '../common/product';
import { ProductCategory } from '../common/product-category';
import { CartItem } from '../common/cart-item';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  
 
 private baseUrl = environment.librairyApiUrl + '/products';
 private categoryUrl = environment.librairyApiUrl + '/product-category';
  constructor(private httpClient: HttpClient) { }

  getProduct(theProductId: number): Observable<Product> {
    //nous avons de créer une URL basée sur l'identifiant du produit
    const productUrl = `${this.baseUrl}/${theProductId}`;
    return this.httpClient.get<Product>(productUrl);
    
  }
  getProductListPaginate(thePage: number, 
                         thePageSize: number,  
                         theCategoryId: number):Observable<GetResponseProducts>{
    // @TODO - nous avons besoin de construire l'url de requete avec l'id, la page et la taille"
    const searchUrl = `${this.baseUrl}/search/findByCategoryId?id=${theCategoryId}`
                     + `&page=${thePage}&size=${thePageSize}`;
    console.log(`getting product from - ${searchUrl}`);

    return this.httpClient.get<GetResponseProducts>(searchUrl)
    
  }
  getProductList(theCategoryId: number):Observable<Product[]>{
    // @TODO - nous avons besoin de construire l'url de requete avec l'id de la categorie"
    const searchUrl = `${this.baseUrl}/search/findByCategoryId?id=${theCategoryId}`;
    return this.getProducts(searchUrl)
    
  }
  searchProducts(theKeyword: string):Observable<Product[]> {
    // @TODO - nous avons besoin de construire l'url de requete avec un mot-clé
    const searchUrl = `${this.baseUrl}/search/findByNameContaining?name=${theKeyword}`;
    return this.getProducts(searchUrl)
   
  }

  searchProductsPaginate(thePage: number, 
                         thePageSize: number,
                         theKeyword : string  
                         ):Observable<GetResponseProducts>{
// @TODO - nous avons besoin de construire l'url de requete avec un mot-clé, la page et la taille"
    const searchUrl = `${this.baseUrl}/search/findByNameContaining?name=${theKeyword}`
                       + `&page=${thePage}&size=${thePageSize}`;
    return this.httpClient.get<GetResponseProducts>(searchUrl);

}



  private getProducts(searchUrl: string):Observable<Product[]> {
    return this.httpClient.get<GetResponseProducts>(searchUrl).pipe(
      map( response =>response._embedded.products))
  }
    
  
  getProductCategories():Observable<ProductCategory[]> {
    return this.httpClient.get<GetResponseProductCategory>(this.categoryUrl).pipe(
      map(response => response._embedded.productCategory) )
    
  }

  }

  interface GetResponseProducts {
    _embedded: {
      products: Product[];
    },
    page: {
      size: number,
      totalElements: number,
      totalPages: number,
      number: number
    }
  }

  interface GetResponseProductCategory{
      _embedded:{
        productCategory:ProductCategory[];
      }
  }
