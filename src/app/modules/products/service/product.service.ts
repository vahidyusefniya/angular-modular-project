import { Injectable } from "@angular/core";
import { Category } from "@app/proxy/proxy";

@Injectable({
  providedIn: "root",
})
export class ProductService {
  searchCategory(element: Category, id: number): Category | undefined {
    if (element.categoryId == id) {
      return element;
    } else if (element.categories != null) {
      let i;
      let result = undefined;
      for (i = 0; result == undefined && i < element.categories.length; i++) {
        result = this.searchCategory(element.categories[i], id);
      }
      return result;
    }
    return undefined;
  }
}
