import { Injectable } from "@angular/core";
import { dictionary } from "@dictionary/dictionary";
import { AlertController, ToastController } from "@ionic/angular";

@Injectable({
  providedIn: "root",
})
export class NotificationService {
  private successNotifications: any[] = [];
  private successToast: any;

  constructor(
    private toastController: ToastController,
    private alert: AlertController
  ) {}

  async showErrorNotification(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 15000,
      position: "top",
      color: "danger",
      buttons: [
        {
          text: "Dismiss",
          role: "cancel",
        },
      ],
    });

    await toast.present();
  }

  async showErrorAlertNotification(message: string, header?: string) {
    const alert = await this.alert.create({
      header: header ? header : dictionary.Error,
      message: message,
      cssClass: "error-global-alert",
      buttons: [
        {
          text: dictionary.Close,
          role: "cancel",
        },
      ],
    });

    await alert.present();
  }

  async showSuccessNotification(message: string, header?: string) {
    const me = this;
    this.successToast = await this.toastController.create({
      header: header,
      message: message,
      duration: 15000,
      position: "top",
      color: "success",
      buttons: [
        {
          text: "Dismiss",
          role: "cancel",
          handler() {
            me.successNotifications.forEach((toast) => {
              toast.dismiss();
            });
          },
        },
      ],
    });

    this.successNotifications.push(this.successToast);
    await this.successToast.present();
  }

  async notificationDismiss() {
    const toast = document.querySelector("ion-toast");
    if (!!toast) {
      await this.toastController.dismiss();
    }
  }
}
