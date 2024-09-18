import { Pipe, PipeTransform } from "@angular/core";
import { dictionary } from "@dictionary/dictionary";

@Pipe({
  name: "amount",
})
export class AmountPipe implements PipeTransform {
  transform(data: string, type: "currency" | "amount"): string | number {
    let amount = data.split(" ")[0];
    let currency = data.split(" ")[1];
    if (type === "amount") return amount;
    if (type === "currency") return currency;
    else return dictionary.Empty;
  }
}
