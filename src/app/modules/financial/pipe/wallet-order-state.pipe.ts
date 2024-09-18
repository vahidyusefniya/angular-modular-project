import { Pipe, PipeTransform } from "@angular/core";
import { FinancialOrderState } from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";

@Pipe({
  name: "walletOrderState",
})
export class WalletOrderStatePipe implements PipeTransform {
  transform(value: FinancialOrderState): string | undefined {
    if (value == FinancialOrderState.Completed) return dictionary.Approved;
    else if (value == FinancialOrderState.Failed) return dictionary.Rejected;
    else if (value == FinancialOrderState.Unverified) return dictionary.Pending;
    else return undefined;
  }
}
