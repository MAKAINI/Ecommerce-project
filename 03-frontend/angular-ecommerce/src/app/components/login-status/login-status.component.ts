import { Component, Inject } from '@angular/core';
import { OKTA_AUTH, OktaAuthStateService } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';

@Component({
  selector: 'app-login-status',
  templateUrl: './login-status.component.html',
  styleUrl: './login-status.component.css'
})
export class LoginStatusComponent {

  isAuthenticated: boolean = false;
  userFullName: string = '';


  storage: Storage = sessionStorage;


  constructor(private oktaAuthService: OktaAuthStateService, 
             @Inject(OKTA_AUTH) private oktaAuth:OktaAuth) { }

  ngOnInit(): void {
    // On s'abonne  à stade de l'authentification de service okta
    this.oktaAuthService.authState$.subscribe(
      (result)=>{
        this.isAuthenticated = result.isAuthenticated!;
        this.getUserDetails();
      }
    );
    

  }
  getUserDetails() {
    if(this.isAuthenticated){
      // récupère les infos de l'utilisateur connecté en ce qui concerne son nom et prenom
      this.oktaAuth.getUser().then(
        (res)=>{
          this.userFullName = res.name as string;

          //récupérer la réponse d'authentification email de l'utilisateur
          const theEmail = res.email;

          //stockons maintenant l'e-mail dans le stockage du navigateur
          this.storage.setItem('userEmail', JSON.stringify(theEmail));
        }

      );

    }
  }
  logout(){
    // on deconnecte l'utilisateur avec okta et on supprime le token
    this.oktaAuth.signOut();
  }

}
