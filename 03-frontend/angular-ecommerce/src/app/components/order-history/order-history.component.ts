import { Component } from '@angular/core';
import { OrderHistory } from '../../common/order-history';
import { OrderHistoryService } from '../../services/order-history.service';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrl: './order-history.component.css'
})
export class OrderHistoryComponent {

  orderHistoryList: OrderHistory[] = [];
  storage: Storage = sessionStorage;

  constructor(private orderHistoryService: OrderHistoryService) { }

  ngOnInit():void{
    this.handleOrderHistory();
  }
  handleOrderHistory() {

   // on lira les informations concernant l'email de l'utilisateur connecté dans le storage du navigateur
   const theEmail = JSON.parse(this.storage.getItem('userEmail')!);

   // on appelle le service pour recuperer les informations de l'utilisateur
   this.orderHistoryService.getOrderHistory(theEmail).subscribe(
     data => {
       this.orderHistoryList = data._embedded.orders;
     }
   )
   

  }
}
