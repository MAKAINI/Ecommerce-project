import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators,  ReactiveFormsModule } from '@angular/forms';
import { LibrairieFormsService } from '../../services/librairie-forms.service';
import { Country } from '../../common/country';
import { State } from '../../common/state';
import { LibrairieValidation } from '../../validators/librairie-validation';
import { CartService } from '../../services/cart.service';
import { CheckoutService } from '../../services/checkout.service';
import { Router } from '@angular/router';
import { Order } from '../../common/order';
import { OrderItem } from '../../common/order-item';
import { Purchase } from '../../common/purchase';
import { environment } from '../../../environments/environment.development';
import { PaymentInfo } from '../../common/payment-info';
import { loadStripe, Stripe } from '@stripe/stripe-js';




@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent {

  countries: Country[] = [];
  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];
  checkoutFormGroup!: FormGroup;
  totalPrice: number = 0.00;
  totalQuantity: number = 0;
  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];
  storage: Storage = sessionStorage;
  paymentInfo: PaymentInfo = new PaymentInfo();
  cardElement: any;
  displayError: string = "";
  stripe: Stripe | null = null;
shippingAddressZipCode: any;
street: any;
isdisabled: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private librairieFormsService: LibrairieFormsService,
    private cartService: CartService,
    private checkoutService: CheckoutService,
    private router: Router
  ) { }

  async ngOnInit(): Promise<void> {
    try {
      // Initialiser Stripe
      this.stripe = await loadStripe(environment.stripePublishableKey);
      if (!this.stripe) {
        console.error('Stripe.js n\'a pas pu être chargé.');
        return;
      }

      // Créer le formulaire de paiement Stripe
      this.setupStripePaymentForm();

      // Réviser les détails du panier
      this.reviewCartDetails();

      // Lire l'adresse email de l'utilisateur
      const theEmail = JSON.parse(this.storage.getItem('userEmail')!);

      // Initialiser le formulaire de commande avec son email
      this.initCheckoutForm(theEmail);

      // Récupérer les pays
      this.librairieFormsService.getCountries().subscribe(
        data => {
          this.countries = data;
        }
      );
    } catch (error) {
      console.error('Erreur dans ngOnInit:', error);
    }
  }

  private initCheckoutForm(theEmail: string): void {
    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('', [Validators.required, Validators.minLength(2), LibrairieValidation.notOnlyWhiteSpace]),
        lastName: new FormControl('', [Validators.required, Validators.minLength(2), LibrairieValidation.notOnlyWhiteSpace]),
        email: new FormControl(theEmail, [Validators.required, Validators.email])
      }),
      shippingAddress: this.createAddressGroup(),
      billingAddress: this.createAddressGroup(),
      creditCard: this.formBuilder.group({
        cardType: new FormControl('', [Validators.required]),
        nameOnCard: new FormControl('', [Validators.required, Validators.minLength(2), LibrairieValidation.notOnlyWhiteSpace]),
        cardNumber: new FormControl('', [Validators.required, Validators.pattern('[0-9]{16}')]),
        securityCode: new FormControl('', [Validators.required, Validators.pattern('[0-9]{3}')]),
        expirationMonth: [''],
        expirationYear: ['']
      })
    });

    // Charger les mois et années de carte de crédit
    this.loadCreditCardDetails();
  }

  private createAddressGroup(): FormGroup {
    return this.formBuilder.group({
      street: new FormControl('', [Validators.required, Validators.minLength(2), LibrairieValidation.notOnlyWhiteSpace]),
      city: new FormControl('', [Validators.required, Validators.minLength(2), LibrairieValidation.notOnlyWhiteSpace]),
      state: new FormControl('', [Validators.required]),
      country: new FormControl('', [Validators.required]),
      zipCode: new FormControl('', [Validators.required, Validators.minLength(2), LibrairieValidation.notOnlyWhiteSpace])
    });
  }

  private async setupStripePaymentForm(): Promise<void> {
    if (!this.stripe) {
      console.error('Stripe n\'est pas initialisé.');
      return;
    }

    const elements = this.stripe.elements();
    this.cardElement = elements.create("card", { hidePostalCode: true });
    this.cardElement.mount('#card-element');

    // Gestion des erreurs de carte
    this.cardElement.on("change", (event: any) => {
      this.displayError = event.error ? event.error.message : "";
    });
  }

  private loadCreditCardDetails(): void {
    const currentYear: number = new Date().getFullYear();
    const startMonth: number = currentYear === this.checkoutFormGroup.get('creditCard')?.value.expirationYear
      ? new Date().getMonth() + 1
      : 1;

    this.librairieFormsService.getCreditCardMonth(startMonth).subscribe(
      data => this.creditCardMonths = data
    );

    this.librairieFormsService.getCreditCardYear().subscribe(
      data => this.creditCardYears = data
    );
  }

  reviewCartDetails(): void {
    this.cartService.totalQuantity.subscribe(
      totalQuantity => this.totalQuantity = totalQuantity
    );

    this.cartService.totalPrice.subscribe(
      totalPrice => this.totalPrice = totalPrice
    );
  }

  get firstName() { return this.checkoutFormGroup.get('customer.firstName'); }
  get lastName() { return this.checkoutFormGroup.get('customer.lastName'); }
  get email() { return this.checkoutFormGroup.get('customer.email'); }
  get shippingAddress() { return this.checkoutFormGroup.get('shippingAddress'); }
  get billingAddress() { return this.checkoutFormGroup.get('billingAddress'); }
  get creditCard() { return this.checkoutFormGroup.get('creditCard'); }

  copyShippingAddressToBillingAddress(event: Event): void {
    if ((event.target as HTMLInputElement).checked) {
      this.checkoutFormGroup.controls['billingAddress'].setValue(this.checkoutFormGroup.controls['shippingAddress'].value);
      this.billingAddressStates = this.shippingAddressStates;
    } else {
      this.checkoutFormGroup.controls['billingAddress'].reset();
      this.billingAddressStates = [];
    }
  }

  onSubmit(): void {
    // Vérifiez si le formulaire est invalide ou s'il y a une erreur Stripe
    if (this.checkoutFormGroup.invalid || this.displayError) {
      // Affichez les erreurs pour tous les champs touchés
      this.checkoutFormGroup.markAllAsTouched();
      return;
    }
// Créez l'objet Order ou encore commande
    const order = new Order();
    order.totalPrice = this.totalPrice;
    order.totalQuantity = this.totalQuantity;

  // Créez une liste d'OrderItem à partir des articles du panier
    const cartItems = this.cartService.cartItems;
    const orderItems: OrderItem[] = cartItems.map(item => new OrderItem(item));

    // Créez l'objet Purchase ou poursuivre l'acchat
    const purchase = new Purchase();
    purchase.customer = this.checkoutFormGroup.controls['customer'].value;
    purchase.shippingAddress = this.mapAddress(this.checkoutFormGroup.controls['shippingAddress'].value);
    purchase.billingAddress = this.mapAddress(this.checkoutFormGroup.controls['billingAddress'].value);
    purchase.order = order;
    purchase.orderItems = orderItems;

    // Définissez les informations de paiement
    this.paymentInfo.amount = Math.round(this.totalPrice * 100); // Stripe demande le montant en centimes
    this.paymentInfo.currency = "USD";
    this.paymentInfo.receiptEmail = purchase.customer.email;
    console.log(`this.paymentInfo.amount: ${this.paymentInfo.amount}`);
 
    // Créez un PaymentIntent et confirmez le paiement
    this.checkoutService.createPaymentIntent(this.paymentInfo).subscribe({
      next: (paymentIntentResponse) => {
        this.isdisabled = true;
    
        this.stripe?.confirmCardPayment(paymentIntentResponse.client_secret, {
          payment_method: {
            card: this.cardElement,
            billing_details: {
              email: purchase.customer.email,
              name: `${purchase.customer.firstName} ${purchase.customer.lastName}`,
              address: {
                line1: purchase.billingAddress.street,
                city: purchase.billingAddress.city,
                postal_code: purchase.billingAddress.zipCode,
                country: purchase.billingAddress.country,
              },
            },
          },
        }, { handleActions: false })
        .then((result: any) => {
          if (result.error) {
            alert(`There was an error: ${result.error.message}`);
            this.isdisabled = false;
          } else {
            this.checkoutService.placeOrder(purchase).subscribe({
              next: (response: any) => {
                alert(`Your Order has been received.\nOrder tracking number: ${response.orderTrackingNumber}`);
                this.resetCart();
                this.isdisabled = false;
              },
              error: (err: any) => {
                alert(`There was an error: ${err.message}`);
                this.isdisabled = false;
              }
            });
          }
        }).catch((error: any) => {
          alert(`Payment confirmation failed: ${error.message}`);
          this.isdisabled = false;
        });
      },
      error: (err: any) => {
        alert(`There was an error in creating the PaymentIntent: ${err.message}`);
        this.isdisabled = false;
      }
    });
  }
    
   /* this.checkoutService.createPaymentIntent(this.paymentInfo).subscribe(
      (value)=>{
        this.isdisabled = true;

      },
      (paymentIntentResponse) => {
        this.stripe?.confirmCardPayment(paymentIntentResponse.client_secret, {
          payment_method: { card: this.cardElement,
            billing_details:{
              email: purchase.customer.email,
              name:`${purchase.customer.firstName} ${purchase.customer.lastName}`,
              address:{
                line1: purchase.billingAddress.street,
                city: purchase.billingAddress.city,
                postal_code: purchase.billingAddress.zipCode,
                country: purchase.billingAddress.country,
               

              }
            }
            

          }
        }, { handleActions: false })
        .then((result: any) => {
          if (result.error) {
            alert(`There was an error ${result.error.message}`);
            this.isdisabled = false;
          } else {
            this.checkoutService.placeOrder(purchase).subscribe({
              next: (response: any) => {
                alert(`Your Order has been received.\nOrder tracking number: ${response.orderTrackingNumber}`);
                this.resetCart();
                this.isdisabled = false;
              },
              error: (err: any) => {
                alert(`There was an error: ${err.message}`);
                this.isdisabled = false;
              }
            });
          }
        });
      }
    );
  }*/

  private mapAddress(address: any): any {
    return {
      ...address,
      state: (address.state as State).name,
      country: (address.country as Country).name
    };
  }


  resetCart(): void {
    // créez un tableau vide pour le panier
    this.cartService.cartItems = [];
    // Remettre le prix total à 0.00
    this.cartService.totalPrice.next(0.00);
    // Remettre le nombre de quantité à 0
    this.cartService.totalQuantity.next(0);
    // Sauvegarder le panier
    this.cartService.persistCartItems();
    // Vider le panier
    this.checkoutFormGroup.reset();
    // Rediriger vers la page des produits
    this.router.navigateByUrl('/products');
  }

  getStates(formGroupName: string): void {
    const formGroup = this.checkoutFormGroup.get(formGroupName);
    const countryCode = formGroup?.value.country.code;

    this.librairieFormsService.getStates(countryCode).subscribe(
      data => {
        if (formGroupName === 'shippingAddress') {
          this.shippingAddressStates = data;
        } else {
          this.billingAddressStates = data;
        }
        formGroup?.get('state')?.setValue(data[0]);
      }
    );
  }
      
    

}
