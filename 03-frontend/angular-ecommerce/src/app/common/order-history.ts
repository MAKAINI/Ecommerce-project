export class OrderHistory {

    constructor(public id: number, 
               public ordertrackingNumber:string,
               public totalPrice: number,
               public totalQuantity: number,
               public dateCreated: Date) { 

    }
}
