import { FormControl, ValidationErrors } from "@angular/forms";

export class LibrairieValidation {
    //contrôle  d'espace blanc pour la validation des champs de formulaire
    static notOnlyWhiteSpace(control:FormControl):ValidationErrors | null {

        // on verifie que le champ ne contient que des espaces blancs
        if((control.value != null) && (control.value.trim().lengtn ===0)){
            // on retourne un objet qui contient le nom de l'attribut et la valeur du message d'erreur
            return {'notOnlyWhiteSpace':true};
        }else{
             // sinon on retourne null pour indiquer que le champ est valide 
            return null;
        }

    }
}
