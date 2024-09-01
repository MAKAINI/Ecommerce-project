import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Purchase } from '../common/purchase';
import { Observable, of } from 'rxjs';
import { PurchaseResponse } from '../common/purchase-response';
import { environment } from '../../environments/environment.development';
import { PaymentInfo } from '../common/payment-info';


@Injectable({
  providedIn: 'root'
})
export class CheckoutService {

  private purchaseUrl = environment.librairyApiUrl + '/checkout/purchase';

  private paymentIntentUrl = environment.librairyApiUrl + '/checkout/payment-intent';

  
  constructor(private httpClient: HttpClient) { }

  placeOrder(purchase: Purchase): Observable<PurchaseResponse> {

    return this.httpClient.post<PurchaseResponse>(this.purchaseUrl, purchase);
  }

  createPaymentIntent(paymentInfo: PaymentInfo):Observable<any>{
    return this.httpClient.post<PaymentInfo>(this.paymentIntentUrl, paymentInfo)


  }
  
}
