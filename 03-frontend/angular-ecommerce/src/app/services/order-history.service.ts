import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { OrderHistory } from '../common/order-history';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class OrderHistoryService {

  private orderUrl = environment.librairyApiUrl +'/orders';

  constructor(private httpClient: HttpClient) { }

  getOrderHistory(theEmail: string):Observable<GetResponseOrderHistory>{

    // nous avons constuire la requete http qui commence par l'url de l'api et qui contient l'email de l'utilisateur
    const orderHistoryUrl = `${this.orderUrl}/search/findByCustomerEmailOrderByDateCreatedDesc?email=${theEmail}`;

    // nous avons utilise la methode get de l'api HttpClient pour recuperer les informations de l'utilisateur
    return this.httpClient.get<GetResponseOrderHistory>(orderHistoryUrl);
    
  }


}
interface GetResponseOrderHistory {
  // propriétés de la réponse
  _embedded: {
    orders: OrderHistory[];
  }
}
