import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "truncateDecimalsPipe",
})
export class TruncateDecimalsPipe implements PipeTransform {
  transform(value: number | undefined, decimals: number = 2): string {
    if (String(value) === "0") return "0";

    if (!value) return "";

    if (isNaN(value)) return "";

    const parts = value.toLocaleString().split(".");

    parts[1] = parts[1]?.slice(0, decimals) || "".padEnd(decimals, "0");

    if (Number(parts[1]) == 0) return parts[0];
    else return parts.join(".");
  }
}
