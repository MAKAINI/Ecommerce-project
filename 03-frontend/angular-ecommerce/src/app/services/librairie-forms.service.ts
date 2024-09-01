import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { Country } from '../common/country';
import { State } from '../common/state';
import { environment } from '../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class LibrairieFormsService {

  private countriesUrl = environment.librairyApiUrl +'/countries';
  private statesUrl = environment.librairyApiUrl + '/states';

  constructor(private httpClient: HttpClient) { }

  getCountries():Observable<Country[]>{
    return this.httpClient.get<GetResponseCountries>(this.countriesUrl).pipe(
      map(response =>response._embedded.countries)
    );
  }

  getStates(theCountryCode:string):Observable<State[]>{
    //search url
    const searchStatesUrl = `${this.statesUrl}/search/findByCountryCode?code=${theCountryCode}`;
    return this.httpClient.get<GetResponseState>(searchStatesUrl).pipe(
      map(response =>response._embedded.states)
    );
  }

  getCreditCardMonth(startMonth: number):Observable<number[]>{

    let data: number[] = [];

    //on construit la liste des mois possibles
    // on demarre par le mois courant jusqu'a 12 mois 
    for(let theMonth = startMonth; theMonth <= 12; theMonth++){
      data.push(theMonth);
    }
    return of(data);

  }

  getCreditCardYear():Observable<number[]>{

    let data: number[] = [];

    //on construit la liste des annees possibles
    // on demarre par l'annee courante jusqu'a 10 annees suivant
    const startYear : number = new Date().getFullYear();
    const endYear : number = startYear + 10;
    for(let theYear  = startYear; theYear <= endYear; theYear++){
      data.push(theYear);
      
    }
    return of(data);

  }
}

interface GetResponseCountries{
  _embedded:{
    countries: Country[];
  }
}
interface GetResponseState{
  _embedded:{
    states: State[];
  }
}
