import { Injectable } from "@angular/core";
import { Branch } from "@proxy/proxy";
import { Subject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class CustomerService {
  moveToWalletTab = new Subject();
  assignedPriceListId: number | undefined;
  assignedPriceListName: string | undefined;
  merchantBranchId: number | undefined;
  branch: Branch | undefined;

  onMoveToWalletTab(): void {
    this.moveToWalletTab.next(null);
  }

  setBranch(data: Branch): void {
    this.branch = data;
  }
}
