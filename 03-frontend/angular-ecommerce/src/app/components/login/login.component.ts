import { Component, Inject} from '@angular/core';
import myAppConfig from '../../config/my-app-config';

import OktaSignIn from '@okta/okta-signin-widget'
import { OKTA_AUTH } from '@okta/okta-angular';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  oktaSignin: any;

  constructor(@Inject(OKTA_AUTH) private oktaAuth: any) {

    this.oktaSignin = new OktaSignIn({
      logo: 'assets/images/logo.png',
      baseUrl: 'https://dev-41072101.okta.com',
      clientId: myAppConfig.oidc.clientId,
      redirectUri: myAppConfig.oidc.redirectUri,
      authParams: {
        pkce:true,
        issuer: myAppConfig.oidc.issuer,
        scopes: myAppConfig.oidc.scopes
      }
    });
   }
   ngOnInit(): void {
    this.oktaSignin.remove();

    this.oktaSignin.renderEl({
      el: '#okta-sign-in-widget'}, // this name should be same as div tag id in login.component.html
      (response: any) => {
        if (response.status === 'SUCCESS') {
          this.oktaAuth.signInWithRedirect();
        }
      },
      (error: any) => {
        console.log('Sign-In Error:', error)
      }
    );
  }

}

 




