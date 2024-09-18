import { Injectable } from "@angular/core";
import { HttpErrorResponse } from "@angular/common/http";
import { AlertController } from "@ionic/angular";

@Injectable({
  providedIn: "root",
})
export class ErrorService {
  constructor(private alert: AlertController) {}
  getClientErrorMessage(error: Error): string {
    return error.message ? error.message : error.toString();
  }

  getServerErrorMessage(error: HttpErrorResponse): string {
    return navigator.onLine ? error.message : "No Internet Connection";
  }

  ConvertBlobErrorToObject(blob: Blob): string {
    const url = URL.createObjectURL(blob);
    let xmlRequest = new XMLHttpRequest();
    xmlRequest.open("GET", url, false);
    xmlRequest.send();
    URL.revokeObjectURL(url);
    return JSON.parse(xmlRequest.responseText);
  }

  async showAlertErrorServer() {
    const alert = await this.alert.create({
      header: "Error",
      backdropDismiss: false,
      message: "Something went wrong. Click refresh try again",
      buttons: [
        {
          text: "reload",
          handler() {
            window.location.reload();
          },
        },
      ],
    });

    await alert.present();
  }
}
