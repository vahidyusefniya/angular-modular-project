import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { LayoutService } from "@app/layout";
import { Branch } from "@app/proxy/proxy";
import { Capacitor } from "@capacitor/core";
import { Directory, Filesystem } from "@capacitor/filesystem";
import { dictionary } from "@dictionary/dictionary";
import { AlertController } from "@ionic/angular";
import * as FileSaver from "file-saver";
import * as moment from "moment-timezone";
import { Observable } from "rxjs";
import * as XLSX from "xlsx";
import { NotificationService } from "./notification.service";
@Injectable({
  providedIn: "root",
})
export class CoreService {
  branchId: number | undefined;

  constructor(
    private router: Router,
    private layoutService: LayoutService,
    private activatedRoute: ActivatedRoute,
    private notificationService: NotificationService,
    private alert: AlertController,
    private http: HttpClient
  ) {
    this.activatedRoute.params.subscribe((params) => {
      this.branchId = params["branchId"];
    });
  }

  async exportExcel(data: any[], fileName: string) {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = {
      Sheets: { data: worksheet },
      SheetNames: ["data"],
    };
    const excelBuffer: any = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    this.saveAsExcelFile(excelBuffer, fileName);
  }

  private async saveAsExcelFile(buffer: any, fileName: string): Promise<void> {
    const EXCEL_TYPE =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8";
    const EXCEL_EXTENSION = ".xlsx";

    const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
    const fileFullName =
      fileName + "_export_" + new Date().getTime() + EXCEL_EXTENSION;

    if (Capacitor.isNativePlatform()) {
      // Native
      try {
        const base64Data = await this.convertBlobToBase64(data);
        const result = await Filesystem.writeFile({
          path: fileFullName,
          data: base64Data,
          directory: Directory.Documents,
        });
        this.saveAlert(result.uri);
      } catch (error) {
        this.notificationService.showErrorAlertNotification(
          `Error saving file on device: \n ${error}`
        );
      }
    } else {
      // Web platform
      FileSaver.saveAs(data, fileFullName);
    }
  }

  async saveAlert(address: string) {
    const me = this;
    const alert = await this.alert.create({
      header: "File saved",
      backdropDismiss: false,
      message: `The file was saved at the following address: <br> ${address}`,
      buttons: [
        {
          text: dictionary.Close,
          role: "cancel",
          cssClass: "primary-alert-btn",
        },
      ],
    });

    await alert.present();
  }

  private convertBlobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(",")[1];
        resolve(base64String);
      };
      reader.readAsDataURL(blob);
    });
  }

  changeFormatDate(dateTime$: string): string | undefined {
    if (!dateTime$) return undefined;
    const timezone = moment.tz.guess();
    let dateTime: string;
    dateTime = moment(dateTime$).utc(true).tz(timezone).format("YYYY-MM-DD");

    return dateTime;
  }
  preventNegativeNumber(event: any): void {
    let theEvent = event || window.event;
    let key;
    if (theEvent.type === "paste") {
      key = event.clipboardData.getData("text/plain");
    } else {
      key = theEvent.keyCode || theEvent.which;
      key = String.fromCharCode(key);
    }
    const regex = /[0-9]|\./;
    if (!regex.test(key)) {
      theEvent.returnValue = false;
      if (theEvent.preventDefault) theEvent.preventDefault();
    }
  }
  getGMT(): string | undefined {
    const dateArray: string[] = new Date().toString().split(" ");
    const GMT = dateArray
      .find((d) => d.includes("GMT"))
      ?.split("GMT")
      .pop();

    const GMTArray: string[] = [GMT!.substring(0, 3), GMT!.substring(3, 5)];
    return `(GMT ${GMTArray.join(":")})`;
  }

  getSkeletonNumbers(num: number): number[] {
    const numbers: number[] = [];
    for (let index = 0; index < num; index++) {
      numbers.push(index);
    }
    return numbers;
  }

  static getUtcDateTimeForFilterDatePicker(date: string | undefined) {
    if (!date) return dictionary.Empty;
    let midNight = new Date(date).setHours(0, 0, 1, 0);
    return new Date(new Date(midNight).getTime()).toISOString();
  }

  getBranchId(): number | undefined {
    return Number(this.router.url.split("/")[2]);
  }

  getSubBranchId(): number | undefined {
    const branchId = Number(this.router.url.split("/")[4]);
    return Number(branchId);
  }

  getMerchantId(branchId: number): number | undefined {
    const branches: Branch[] = this.layoutService.branches;
    const branch = branches.find((b) => b.branchId == branchId);
    if (!branch) return this.layoutService.branch?.merchant?.merchantId;
    else return branch.merchant?.merchantId!;
  }
  getSubMerchantId(): number | undefined {
    const customerId = Number(this.router.url.split("/")[3]);
    if (customerId) return customerId;
    if (isNaN(customerId)) return undefined;
    else return undefined;
  }

  numberWithCommas(data: number): string {
    const numberFormatter = new Intl.NumberFormat("en-US", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 10,
    });
    return numberFormatter.format(data);
  }
  isUnlimitedNumber(number: number): boolean {
    if (number === 79228162514264337593543950335 || number === -1) {
      return true;
    } else {
      return false;
    }
  }
  convertMaskitoNegativeNumber(num: string): number {
    return Number(`-${num.split(num.substring(0, 1)).pop()}`);
  }

  checkNumberInput(event: any): void {
    let theEvent = event || window.event;

    if (theEvent.type === "paste") {
      key = event.clipboardData.getData("text/plain");
    } else {
      var key = theEvent.keyCode || theEvent.which;
      key = String.fromCharCode(key);
    }
    var regex = /[0-9]|\./;
    if (!regex.test(key)) {
      theEvent.returnValue = false;
      if (theEvent.preventDefault) theEvent.preventDefault();
    }
  }

  changeArrayItemIndex(arr: any[], oldIndex: number, newIndex: number): any[] {
    arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0]);
    return arr;
  }

  getBase64Image(base64Image: string): Observable<string> {
    return this.http.get<string>(base64Image);
  }
}

export interface IPageChange {
  page: number;
  pageSize: number;
}
