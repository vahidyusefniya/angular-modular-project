import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";

@Injectable({
  providedIn: "root",
})
export class BranchService {
  baseUrl: string | undefined;

  constructor() {
    this.baseUrl = environment.baseUrl;
  }
}
