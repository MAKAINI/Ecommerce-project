import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { OKTA_AUTH } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';

import { from, lastValueFrom, Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class AuthInterceptorService implements HttpInterceptor {

  constructor(@Inject(OKTA_AUTH) private oktaAuth: OktaAuth) { }
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    
    return  from(this.handleAccess(request, next));
  }
  private async handleAccess(request:HttpRequest<any>, next:HttpHandler):Promise<HttpEvent<any>>{ {
    
    // ajouter un jeton d'accès uniquement pour les points de terminaison sécurisés
    const theEndPoint = environment.librairyApiUrl + '/orders';
    const securedEndpoint = [theEndPoint];
    if(securedEndpoint.some(url=> request.urlWithParams.includes(url))){

      // On recupère le jeton d'accès depuis le service d'authentification
      const accessToken = this.oktaAuth.getAccessToken();

      // clone la requête et ajoute un nouvel en-tête pour accéder au jeton d'accès
      request = request.clone({
        setHeaders:{
          Authorization:`Bearer: ${accessToken}`
        }
      });
    }
    return await lastValueFrom(next.handle(request));
  }
}
  

}
