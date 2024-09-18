// noinspection PointlessBooleanExpressionJS

import { Injectable } from "@angular/core";
import { CategoryProduct, ProductBuyPrice } from "@app/proxy/shop-proxy";

// import { Sunmi } from "@bistroo/capacitor-plugin-sunmi";
// import * as QRCode from "qrcode";
import { LayoutService } from "@app/layout";
import { Subject } from "rxjs";
import { RegionDto } from "../dto/e-gift.dto";

@Injectable({
  providedIn: "root",
})
export class EGiftService {
  baseUrl: string | undefined;
  baseImageUrl = "../../../../assets/img/country";
  resultFilterProducts: ProductBuyPrice[] = [];
  printSuccess$ = new Subject<void>();
  printError$ = new Subject<any>();

  constructor(private layoutService: LayoutService) {}

  getRegions(): RegionDto[] {
    return [
      {
        id: 0,
        name: "All",
        code: "all",
        phone_prefix: "+all",
        image: `${this.baseImageUrl}/all.png`,
      },
      {
        id: 3,
        name: "Algeria",
        code: "DZ",
        phone_prefix: "+213",
        image: `${this.baseImageUrl}/Algeria.png`,
      },
      {
        id: 14,
        name: "Austria",
        code: "AT",
        phone_prefix: "+43",
        image: `${this.baseImageUrl}/Austria.png`,
      },
      {
        id: 17,
        name: "Bahrain",
        code: "BH",
        phone_prefix: "+973",
        image: `${this.baseImageUrl}/Bahrain.png`,
      },
      {
        id: 21,
        name: "Belgium",
        code: "BE",
        phone_prefix: "+32",
        image: `${this.baseImageUrl}/Belgium.png`,
      },
      {
        id: 38,
        name: "Canada",
        code: "CA",
        phone_prefix: "+1",
        image: `${this.baseImageUrl}/Canada.png`,
      },
      {
        id: 64,
        name: "Egypt",
        code: "EG",
        phone_prefix: "+20",
        image: `${this.baseImageUrl}/Egypt.png`,
      },
      {
        id: 247,
        name: "Europe",
        code: "Eur",
        phone_prefix: "",
        image: `${this.baseImageUrl}/Europe.png`,
      },
      {
        id: 74,
        name: "Finland",
        code: "FI",
        phone_prefix: "+358",
        image: `${this.baseImageUrl}/Finland.png`,
      },
      {
        id: 75,
        name: "France",
        code: "FR",
        phone_prefix: "+33",
        image: `${this.baseImageUrl}/France.png`,
      },
      {
        id: 82,
        name: "Germany",
        code: "DE",
        phone_prefix: "+49",
        image: `${this.baseImageUrl}/Germany.png`,
      },
      {
        id: 85,
        name: "Greece",
        code: "GR",
        phone_prefix: "+30",
        image: `${this.baseImageUrl}/Grec.png`,
      },
      {
        id: 104,
        name: "Iraq",
        code: "IQ",
        phone_prefix: "+964",
        image: `${this.baseImageUrl}/Iraq.png`,
      },
      {
        id: 105,
        name: "Ireland",
        code: "IE",
        phone_prefix: "+353",
        image: `${this.baseImageUrl}/Ireland.png`,
      },
      {
        id: 107,
        name: "Italy",
        code: "IT",
        phone_prefix: "+39",
        image: `${this.baseImageUrl}/Italy.png`,
      },
      {
        id: 111,
        name: "Jordan",
        code: "JO",
        phone_prefix: "+962",
        image: `${this.baseImageUrl}/jordan.png`,
      },
      {
        id: 117,
        name: "Kuwait",
        code: "KW",
        phone_prefix: "+965",
        image: `${this.baseImageUrl}/Kuwait.png`,
      },
      {
        id: 248,
        name: "Latam countries",
        code: "lc",
        phone_prefix: "",
        image: `${this.baseImageUrl}/Latam-countries.png`,
      },
      {
        id: 121,
        name: "Lebanon",
        code: "LB",
        phone_prefix: "+961",
        image: `${this.baseImageUrl}/Lebanon.png`,
      },
      {
        id: 127,
        name: "Luxembourg",
        code: "LU",
        phone_prefix: "+352",
        image: `${this.baseImageUrl}/Lux.png`,
      },
      {
        id: 155,
        name: "Netherlands",
        code: "NL",
        phone_prefix: "+31",
        image: `${this.baseImageUrl}/Netherlands.png`,
      },
      {
        id: 165,
        name: "Oman",
        code: "OM",
        phone_prefix: "+968",
        image: `${this.baseImageUrl}/Oman.png`,
      },
      {
        id: 176,
        name: "Portugal",
        code: "PT",
        phone_prefix: "+351",
        image: `${this.baseImageUrl}/Portugal.png`,
      },
      {
        id: 178,
        name: "Qatar",
        code: "QA",
        phone_prefix: "+974",
        image: `${this.baseImageUrl}/Qatar.png`,
      },
      {
        id: 191,
        name: "Saudi Arabia",
        code: "SA",
        phone_prefix: "+966",
        image: `${this.baseImageUrl}/Saudi-Arabia.png`,
      },
      {
        id: 197,
        name: "Slovakia",
        code: "SK",
        phone_prefix: "+421",
        image: `${this.baseImageUrl}/Slovakia.png`,
      },
      {
        id: 202,
        name: "South Africa",
        code: "ZA",
        phone_prefix: "+27",
        image: `${this.baseImageUrl}/South_Africa.png`,
      },
      {
        id: 205,
        name: "Spain",
        code: "ES",
        phone_prefix: "+34",
        image: `${this.baseImageUrl}/Spain.png`,
      },
      {
        id: 223,
        name: "Turkey",
        code: "TR",
        phone_prefix: "+90",
        image: `${this.baseImageUrl}/Turkey.png`,
      },
      {
        id: 229,
        name: "United Arab Emirates",
        code: "AE",
        phone_prefix: "+971",
        image: `${this.baseImageUrl}/United-Arab-Emirates.png`,
      },
      {
        id: 230,
        name: "United Kingdom",
        code: "GB",
        phone_prefix: "+44",
        image: `${this.baseImageUrl}/United-Kingdom.png`,
      },
      {
        id: 231,
        name: "United States",
        code: "US",
        phone_prefix: "+1",
        image: `${this.baseImageUrl}/United-States.png`,
      },
    ];
  }

  filterProduct(data: CategoryProduct, value: string): ProductBuyPrice[] {
    if (data.productBuyPrices && data.productBuyPrices.length > 0) {
      const filterProducts = this.findProducts(data.productBuyPrices, value);
      filterProducts.forEach((item) => {
        this.resultFilterProducts.push(item);
      });
    }
    if (data.categories && data.categories.length > 0) {
      data.categories.forEach((category) => {
        this.filterProduct(category, value);
      });
    }

    return this.resultFilterProducts;
  }
  findProducts(products: ProductBuyPrice[], value: string): ProductBuyPrice[] {
    let findProduct: ProductBuyPrice[];
    findProduct = products.filter(
      (p) =>
        p.productName
          .toLowerCase()
          .trim()
          .includes(value.toLowerCase().trim()) || p.productId == Number(value)
    );
    return findProduct;
  }

  getAllProducts(): ProductBuyPrice[] {
    let products: ProductBuyPrice[] = [];
    let rootCategory = this.layoutService.rootCategory;
    if (rootCategory && rootCategory.categories) {
      for (let index = 0; index < rootCategory.categories.length; index++) {
        const category = rootCategory.categories[index];
        if (category.productBuyPrices.length > 0) {
          category.productBuyPrices.forEach((prduct) => {
            products.push(prduct);
          });
        }
      }
    }

    return products;
  }

  findCategory(
    data: CategoryProduct,
    categoryId: number
  ): CategoryProduct | undefined {
    if (data.categoryId == categoryId) {
      return data;
    } else if (data && data.categories) {
      let i;
      let result = undefined;
      for (i = 0; result == undefined && i < data.categories.length; i++) {
        result = this.findCategory(data.categories[i], categoryId);
      }
      return result;
    }
    return undefined;
  }

  clearSearchBarValue(id: string): void {
    const searchbar: any = document.getElementById(id);
    searchbar.value = "";
  }

  getLogoImageData(): string {
    return "'iVBORw0KGgoAAAANSUhEUgAAASwAAADOCAIAAAAL5KgfAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyZpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTQ1IDc5LjE2MzQ5OSwgMjAxOC8wOC8xMy0xNjo0MDoyMiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTkgKFdpbmRvd3MpIiB4bXBNTTpJbnN0YW5jZUlEPSJ4bXAuaWlkOkYwMzcxQTE5M0RENTExRUY5ODIzREU5QkMxRTYwNzA2IiB4bXBNTTpEb2N1bWVudElEPSJ4bXAuZGlkOkYwMzcxQTFBM0RENTExRUY5ODIzREU5QkMxRTYwNzA2Ij4gPHhtcE1NOkRlcml2ZWRGcm9tIHN0UmVmOmluc3RhbmNlSUQ9InhtcC5paWQ6RjAzNzFBMTczREQ1MTFFRjk4MjNERTlCQzFFNjA3MDYiIHN0UmVmOmRvY3VtZW50SUQ9InhtcC5kaWQ6RjAzNzFBMTgzREQ1MTFFRjk4MjNERTlCQzFFNjA3MDYiLz4gPC9yZGY6RGVzY3JpcHRpb24+IDwvcmRmOlJERj4gPC94OnhtcG1ldGE+IDw/eHBhY2tldCBlbmQ9InIiPz7sznITAAAhu0lEQVR42uydCVhN+RvH64pS0UqJpJJ2RZuiQjQpYx/ExAzGOsjyp+x7YQz+hplhHv0tQ2XfFWVpkwptWqREWkiitMf/nZrnzG/OrdtyT/ee230/z+N5zu8459zT+57v7/e+5/wWyS9fvkg0m7CwsPDw8MePH2dmZhYUFJSWltbW1kogLURGRkZZWblXr15GRka2trYODg49e/YUyp3k5eXdv38/Kirq6dOnr169KioqKi8vRwe1lA4dOsjLy3fv3l1bW3vAgAFDhgyxt7fncDjNPf9LM0hJSVm1ahX8AJq7LZCSknJzcwsMDPwiQM6dOzdmzJhOnTqh/dsCLS2t5cuXJyUlNccXTYgwPT195syZaFPBYGxsfOzYsbaW36lTp8zMzNDagmH69OkQZbRehNu3b5eUlEQ7CpihQ4c26bbW8ezZs5EjR6KFBc/GjRt5+EWywZywpKRkwoQJt2/f5v6vPn362NnZ9e/fHxpcJSUlCKXQxC0CDP7p06f8/Py0tLSYmBjIsbmPgbrv5MmT06ZNY/B3If50d3evrq7m/i9wqJWVlYGBQY8ePeTk5LDmbSk1NTXFxcXZ2dmJiYmRkZGZmZncx0Dmf/78eRUVlWblhPBw9O7dmzv1nDdvXmho6BeEUbKysg4cOGBubt7S6rNF+Pj4cF/fxMRk3759GRkZ6AVmuXv37qJFi7jzbajjEhISmg5HQcTy8vK0kyEthP1o3Dbl6NGj6urqNMuvXr2a/yuDmGmXVVVVPXz4MNq8TYGGcc6cOTTLgzJTU1N5ibC8vBzESp4Dgrx48SIaVDB8+PBh0qRJNLcdPHiQT23TLjhmzJh3796htQXD9evXIWsj7Q8RKTi6UREOHjyYPBqSBFAz2lHAbNmyhSabiIiI1l0qLi6Odqm1a9eihQVMbm5u//79SS9YWFg0LEJa2qCrq/vp0ye0oFDYvXs36QuoSiH1b8V1aPHt1q1b0bZCoaqqysjIiPTF+vXr6SIsKCigRa55eXloOyEyf/580iNLly5t6RXWrFlDXmHGjBloVSECKYCcnBzpkVevXv1LhFOmTCH/OygoCK0mdIyNjUmnQFTT/HMLCwtpcQ3aU+jcv3+fdMro0aP/ESEokvy/b775Bu3FBtLS0ki/zJs3r/nnLl++nDw3Pj4e7ckGaP3P6r8PSdAcxuFwioqK0FgswcPDg+xiWlpa2pyzKisrZWVlqRMnTpyIlmQJ4EHy+yEkHX+LUFVVFTMHdvLy5Uuy4vTz82vOWQEBAeRZ6enpaEl2ZvtdunSpqanhPHjwgMwfFixYgL2Q2IOmpqa1tTVVvHjxYnPOunDhArXdv39/PT09tCR7IEVYUlJy7949DtlBVENDY9CgQWgmVkH2IA0PD//8+XOTp5AvANzd3dGGrMLMzIwcFRgSEsJ59OgRVXZyckIbsQ0HBwdq+927dykpKbyPz8zMzM3NpYqOjo5oQ7ZBjmUBAXLIHt84zIyFGBoakr15nz17xvt4yADJ7720b8QISxpDahvSfs6bN2+ocp8+fdBAbENGRob0y9u3b3kfTzoUUkoFBQW0IdsgHVpUVCT16dMnqsysw6qrqwsLCysrKyXqBsiJg3Fra2vhL1VUVKT12eUTuCC1TfqrQcrKyqhtZm8D+FAH5KVi4tAvdaNtIaBQVVVlcCqQrl27kv6SIhP9FkxN0zgPHz68cuVKeHh4amoqiLCmpkbc6jk5OTmo6iwsLCD0nzhxYufOnfm8IPnEf2lqYi7SoYxIpaqq6ty5c8HBwbGxsdnZ2fXfKsXKoVJSUioqKvr6+kOGDPn666/5f3lJ+uUvf3Xp0oUq3759m58PIBEREV999RUGGyTq6uq+vr58flkC31MX3Lt3L++DDx06RB1saWnJ50/v2bNHWDPBsRYnJ6d79+7xY9WwsDDqaiBADlN3tnHjxsGDBwcFBaGTSPLz8728vEAM5PsSkSArK8vW1nbFihWvX79GP5KEhIQ4Ojp6e3szdUFmRDhhwgTuUXAIRVxcnKmpaWhoqKjcMAQ1cMMPHjxA3zUGBDhubm7MhLv8X2LcuHGXLl2ivUiYMmXK8OHDdXV1yU6M7T6J79ChA4T4eXl5kD6BTSIjI8nMCsKYpKQk2tgIFpKRkUEGwPXY2NiAo62srNTU1ODPFCu9lZeXZ2Zm3rlzJyAg4N27d9T+69evu7i43Lx5k98f4DMnpA0/lagb+YZdwOu5fPky7asPPMG1tbUszwlp03xBTnj+/Hn05pe6+UdWrlxJe+A3b97MZ07IlwghbaDd0IULF9BVJFCJjhgxgjTR3Llz2SxCT09P8m7t7e0/fvyIfiSBBpD22KelpQntxQzNYRcvXoSIBbMFEhkZmVu3bhkYGFB7Dh8+nJ2dzdrXSPv27aOKOjo69+/fJ6tpBBg1atSNGzfIPT/++KNwXszk5uaSqeC0adPGjh2LHmoQiEvJIrRm7LzP/fv3k0Vaqo9QQCo4a9Ysqgj1LHdUKAgR+vv7/3MVDufgwYPom8bQ09P79ttvqeK5c+fYeZ+kTydOnGhiYoK+a4xffvmlY8eOVPHUqVNCEGFUVBS17erqSnatQrhZuHAhtZ2Tk9PgTOnCBYLkFy9eUMVFixah13jQuXPn8ePHU0V+Pue0XoTPnz+ntp2dndErvLG2tia75iYmJrLtDlNTU6ltWVlZHFnaJORjT8pBcCIkx+NDBo8u4U2HDh369u1LFWlzTLIB2nga/ru8tnvI70/8dJNupQi/fPlCrtFLBsdIY5Dd8Fm4wjH5DElLS6O/moR87GvrEKgIJSUlyTfXZCWKNAbZCZOFw/zIrB77i7Y0dgA5tLrman042qtXL2o7NjYWXcKbnJwccuo0MjRlYXAFj1eTQ/gRcqkPTU1NIeSE5BoXZ86cQZfwhjQRpFu0FULYgKGhIdnRF33aJOQXHVNTUyGIcMKECdR2bm6un58feoUHvr6+1PbQoUNlZGTYdodwS+RwUO5ewQhJQEAA+UWH/FwhOBEOGTKE7Om7ZMmS8vJy9E2DLFu2jMwfWPsJbvHixdR2cXHxvHnz0HcNUl1dPXfuXKrYvXt3cgI1wYkQ+Pnnn6nt0tJSBweHqqoq9BCNI0eOkB0y9fX1mRqHxjjDhg0jJwI7fPjwgQMH0IM0Pn/+DIb6+PEjtWfPnj38XJAvEU6cONHe3p4qxsbGggu5F6YUZ3x8fMgqsz6MEZU8pz7AWbFiBfqRIiEhwdzcPCIigtpjaWlJ9kkUtAgl6romk+lNamoq3NPChQujo6NF0cTMTmG0c+dO2iKB27dvZ/nkrgYGBmSAUx/vwM7ffvtNzL9bxMTELF26FNxH9nbq0KHDtWvX+LwyvyPrFRUVoVawtbUlA9Ff69DS0tLW1haVkfV5eXmjRo3asmULU8PGoQ2kKXD+/Pm0PazNYF++fEmG0GlpaQsWLICM0cTERE1NTUpKSqwmXCsvL8/KyiJfw/zdgnE4YWFhkBDy+wOMzLaWnJzMwg9fLQK0x+Aiftu2baNd39vbW7RmW6Mtn47QgDbm8ePHLJptzcjICHQoui/TjI2NIc9m6tvd7t27161bR+6BBnDHjh2iZRMvL6/Q0FBcGaFBZs+e/fTpU0gOmbkcg/OOAklJSRDMiNZ0+mBKiDfarg0EQYruvKNAYGCgq6srCz9sCp7evXsvWbLkyZMnfJqU1hJKMXuX0KT8XEdsbCxUFZBoVVRUSLBjGnwNDY07d+7QBl9CG/7gwQOm+itDc0drA9evXy/qk0F+U0dBQQE8fBkZGe/fv/9rXUsORxxUV5/6QgWkrq4Oj4qFhUVb/OFSbXT3lnWwzab/+9//yGL91JpMKRCi0LVr19LywHYzHauamtpXdWB7KDIiZBvQLA8cOLB+dZp6INuJjo5mSoHbt29vf20gIhjEIqhISUmxtrYmFchsFOrr64sKRFCEjRIfH29lZUWuKGZubh4TE8PUmwYfHx/asgQQlKICEQxH/4lCoQ0kOxJAHvjw4UOmpgLAKBTBlrBlCjQ2NoYolCkF7ty5k6ZAKKICERThP1GopaUlGYUOGDAgNjaWqW500AZ6eXnRFLh161Z8pBAMR/8iJSXFxsaGfBMDbWB0dDRGoQi2hIIgKSnJysqKVCCzeeCuXbtoCsQ3MQiK8B8SEhK4o9CYmBgGo9DVq1fT2kDurmoIIqbhKEShgwYNwigUQREKrQ20s7Mj57kxMzOLjIxkSoHcX+TFJwp99OhRSEhIXFxcZmbmhw8fPn/+LFYikZaW7t69u5GRka2traurq5KSEsM/wOwoCmGRmJhIzm8tUfdFvqqqqu3GRkAbKLC/ToijKK5duzZs2DBsrCgUFBQ8PT0LCgoYHEXRHnLC+iiU/B5Y3yuNqTawXY6NaJLa2tqZM2e6ubnduXMHtUcBgcC+ffv69evHz1po7e3FTGO90pjqF+rj40MbGyEOUWhOTo6pqenx48dRdY1Jcfr06f/5z38wJ5TIysqi9YmBPBB7pfFJSUkJxLG0daOUlZVHjRoF9Z2amhpT0/CICmVlZRkZGffu3SPDSOCnn36qqalhYN1l0c0JIV4i18OQqHsXyuAYee4JKQSZBwoxJ7S1taX94ZASFxcXfxF7oH53cXGhGef06dPimxN6eHhA1EQV63ulMTU2AtpA2sxoYvI1AkROrsGsqamZmJgIETgLl5ESPBAI3LhxAxpAcqe7u3tRUZE45oRPnjwhM2Ntbe3o6GgGFSie3wMhtSan+oVKGuo1XLmeBpiIFoLymRyKqgg3btxIFiGQbrvvgeLzRf7XX38lJxQ9c+YMA5Nqtkc8PT2HDx9OFY8ePfru3TvxEmFJScmVK1eo4sqVK5larxvaQNoIXbHqE0MureXo6IgzyvCA9uoYMkPxEmFoaChZYdOGFGEU2jry8/OfPn1KFZcvX45K40HPnj2dnJyo4v3798VLhDExMdT2oEGDVFRU+L8m9xd5iHjFql9ocnIytd2pUydoCVFpvBk7diy1nZaWJl4ifPXqFbU9cOBARtpA2hd5aAM3bdokVo8UuYKilpYWvg5tkn79+pHWq62tFSMRlpWVUduKioqMt4HiOTaC7PMgKsv4CBfSSpWVldXV1WIkQrJLWmlpKbNt4IYNG8RzdBI5t3SrK3Wxori4mBRkq3tKiqQIISemtpOSkvhRIHcbuHnzZny8kOZALlSooaHR6rUeRFKE5FJBERER5BhCfqJQsW0DkdZx5swZatvIyKj1MYgo/vEjR44kY/FWrKveYBSKbSDSfKKiop48eUIVR40aJV4i7NatG9mnedOmTeRQJoxCEQEwc+ZMaltGRmb8+PHiJcJ64VHbEI42vx7C74EI/3z//ffPnj2jivBE0SZ2EAsROjk5DR06lCqGhYW5uLg0+abU29sbvwci/AA1/tSpU8k19tTU1GgPlbiIEDh79qyU1D+DkoOCggwNDU+ePNngwaBSR0dHX19fmgKxDUSaSUlJyR9//KGvrx8QEEDuv379Op9XFuGR9SoqKqGhoQ4ODtSenJwcDw8PaNmgkQRBKikpQb0FYUNkZCTZ042KQrENZJbi4uJt27aR3XpFHUlJSfhzKioqXrx48eDBA+5xg9Ak8t9nS7Snt7C3t4cGcPTo0WRnhed1NJkZ0kZLIPwDz+iePXvE5+89ffo0hKb8X0fkJ3pydnZOTEzknpGhMXr06HHx4kVUYFvQsWPHVn+wFi0GDRoUHx/PiAIl2sc0+BCmQ8Dp5+fHOzDo1avX5s2b09PTyc7vCNIihg0b5u/vHxUV1b9/f6au2X5m4P6ujvDw8JCQkMePH0N+WFZWBnWzurq6iYmJo6Ojq6sr+SIHaWtGjBihoKDQDlJEaWlpCKCMjY3t7OwMDAwYv357eyiH1IECYAOBgYHMzxjfHuGgCZA2Ij8/H42AIkSECY6HQhEiCIoQQRAUIYKgCBEEQREiCIoQQRAUISIExG0ZQxQhwjp69OiBRmgObdJtLTk5OTo6OjU1NS8vr7KyUrxqNQ5HUVFRR0fHzMzM0dGRqdXaRJEpU6a0j2m8paWl1dXV9fX1bWxsTE1N2S7C06dP//bbb/wsjtGeAM9Nnz7d09OTtqKwmBAcHNz+/qjBgwfPnz//22+/ZWM4Cu2eg4PDtGnTUIEU+fn5e/bs0dPT27dvH1qjfRAREeHh4QFSJNfPYYUIAwMDTUxMyJW4EYqKioply5ZNmjSp3f+l1dXV7WluCx5ERkbCA3/ixAm2hKMQgkIDSNvZtWtXW1tbaATk5OTESnK1tbXQAD569Ihc6w84d+6cvb19+66nVFRUvLy82p8Oy8rKMjIyoqKiyMUngBkzZtTU1Hz//fdCFiE0yjQF9uzZc82aNe7u7mI+lgzilv3795MzpYeHh8+cOfPYsWPt9U9WUFDw8fFpr3/dhw8fAgICduzYkZ2dTe2cNWtW//79LSwshBmO0lZUnjx5cnp6+sKFC3E0J6QNgXWQO48fP37+/HkM0UW0ipk7d25aWhrtrYyLiwufjT9fIty7d+/r16+pIjSJUFXg0nYk33zzDTSJ5J7Zs2ejWUQXaWlpSAXJELSwsBCaR+GIEJIfcv0GbW3tP//8E53EjZ2d3aFDh6gi5BVHjx5Fs4g04EFymd7t27eTS6wKToRXrlyBKJkq+vn5oW8aY8GCBcbGxlTx8OHDaBNRh5zrvby8/Ny5c0IQ4c2bN6ltAwMDR0dHdAwPVq9eTW3HxMR8/PgRbSLSWFlZmZubU8WgoCAhiJB8BQ+ZD3qFN25ublSH5s+fPz969Aht0g4S/gblIDgRkq9k2qJDXTtDWVlZV1eXKpKvuRERhZz/Nzc3t9XvSFspQvg9cpFqRUVFdEmTqKioUNstWtVUMED7TG3jKKTmQHZPLysra/VYhVaKUFJSUlpams2PFAshl09k4eiKjh07km8a0F9NQj72IAfSgAIKR7t3705tp6eno0t4A491RkYGVdTQ0GDbHZIOhWi5yRVXEXKxXjU1tVaHD60XIfmd5PLly+gS3ty7d49sXszMzNh2h4aGhtQ2RFbYHb9JLl261KAcBCfC4cOHU9sRERFpaWnoFR7s2rWL2jYyMmLhqPOePXuSq538/PPP6DUevHz5MiQkhCqSi7cLToS0sTlz5sxBxzRGaGjonTt3qKK7uzs773P69OnU9u3bt2kd7hCSWbNmkUV+1ipsvQi7dOmyePFiqhgeHt6Oe9Dzw5s3byZOnEjuIe3GKhYtWkQWx48fj50KGgTCBLIZnD17trKyshBECPj6+pJvhNasWUP2JkWApKSkgQMHkuPQfvrpJ9bOvKKkpET2RX779q2FhUVmZib6kfbYr1ixgtzD5yLhfIlQVlaWNlRn06ZNzs7ODx8+RFeVlJSAt0xNTcleDZaWljT/sQ1vb2+y60VGRoaxsfGhQ4fIr4hiS1xcnJubG22t9VOnTvFZq/I7qHfcuHFr167dvn07tedWHUOGDLGzs9PV1RXPkfXx8fHBwcGFhYXkf/Xo0YOMYdicwfbr1+/9+/f1xYqKCghTd+/eDdUrtOrwV4AgxerLcFlZ2fPnz6OiorjnT4IqlYEMH1I7Mhf/0irWr1+P1SRv9PX163s2tQJy7eG9e/fyPpgcNgUNb+t+EZ45TU1N9BpvVq1a1Trzkp9/QIDMTPS0ZcsWf39/VVVVdEyDeHh4JCQkiNBkuDo6OomJiRDmoO8aS55PnDixc+dORq7G2JSHU6ZMgfxhzZo1ZMcL5KuvvoLg/Pjx4506dRKtO4c858KFC+fPn7e1tUU/UkBLAw3gs2fPGJx6VIrs+s3hcPh0GySHkCJevXoVoufk5OSCgoKqqioxmQaPsiHYQVtb29ra2sXFhZHxJaRfmjQmgw6VqPtKAURERNy4cSMmJubFixfFxcVwWVlZWUlJSTHxLFSgampqRkZGDg4Obm5uZAbHiEOlAKrMzxB9CnDP5Dqw1mSK6upqarvJDoqkQ8kT+WFwHfXblZWV8Ay1urMyQvML+ItDvl2lvc1DWMKbN2+o7a5du/I+mDwAIhHGb4af4QIIt9Dk5eU56urqVJns5o+whPfv35MjgJt8u0MekFcH2pBtPH/+nEwyOWSf3ejoaDQQ23j8+HFNTQ1VJCeMahBIXSBbo/INnEeDhZBC09PT41hbW1Plu3fvMpIWIgxy69YtaltHR6fJBZ66desGOmzwdIQNQM1I9tmwsbHhkFNol5eX48hAtnHq1Clqe9iwYc05hTwsICAAbcgqbty4Qc4V+pcAQZcmJibUrsGDB39BWAPEJqT/oAZtzlmRkZE0r6Ml2YOTkxPlmr59+/71mQf+HTx4kPRZXFwcWoolWFpaUn5RU1Nr/olaWlrUiaampmhJlkBb1XD37t1/i7CiooKctQlSfzQWG6BFkvv372/+uUeOHCHP9fPzQ3uygYEDB1JO4XA4JSUlf4sQoPWCW7t2LdpLuBQWFpKf4xQUFFp6hW7dulGnS0pKvn79Gq0qXMjBRsCGDRvq90tQR9AWM7t69SpaTYjQZoI6fvx4S69ALo0oUTeMA60qRG7fvk26Q1ZWtqamhi7C0NBQ2mucZr4GQBjHzc2NdISjo2PrruPi4kJeZ8SIEWhboRAeHk59vOVu5CTIQ728vGg6bEUFjPBDUVEROXqwvhtaaWlp665WWVlJG19mZWVVUFCAdhYk/v7+NFktXbqUPECCdsKYMWO4T6ioqEBTCoAbN25w90p7/PgxP9fkXqgEcsXLly+jtQUABJwrV66k2d/Z2Zl2mAT3mbQVsAFNTc1ff/21trYWzdpGxMbG0qaQrCc4OJj/i9+7d4/7ymPHjo2OjkbLtx1HjhzR0dGhmX3o0KHcR0o0eD45/yRFnz59vL29IyMjq6ur0cSM8PLlSz8/P1dXV25rd+nSJSwsjKkfevjwYYNz8kGt/Mcff7x48QJ9wVTT9+DBg3Xr1pErcFFAPdvgWY2Oy9yxY8fatWsb/C8NDQ1DQ0MtLS0lJSVy9BrSTD59+pSXl5eRkZGYmNjgLGa2tranT58mP7jzD/zi1KlTuacqoj7o6+npQTAsJydHe4WANAlor7i4GKrUlJSUnJycBo/ZuHHjpk2bGu1O2hhxcXG4/q6AkZGR2bVrV9tV1Xv37pWXl0c7CxI7OztoHnk4RaJJt508edLCwgJN2dbIysr++OOPr169auuQCZpET09P/udoQJrEzMysOX2VJJrpuaCgoB9++KFv375oWWaBdmnkyJH79u3Lz88XZPby9u3bAwcOuLi4oBoZR0dHZ/bs2devX2+mL1o8V09CQkJ8fDzkM1ChlpSU1NbWotFbSufOnVVUVCDlMzIyGjhwILmCr+B5//79o0ePkpOTs7OzCwsLcXnQVsDhcKAug4waWimzOlp0urhMmIUg7NUwmgBBUIQIgiJEEARFiCAoQgRBUIQIgiJEEARFiCAoQgRBUIQIgiJEEARFiCAoQgRBUIQIgiJEEARFiCAoQgRBUIQIgiJEEARFiCAoQgRB2gahTWKfkZGxbNmyZh58+PBh7uWK2oKwsLADBw606JSZM2fSlhNsOw4dOnT37t3G/rdz5849e/Y0Nzd3cnISyjSK165dO3bsGFWcPHlyg6vctBHz5s3Lzc2lirt27TI0NORxvJeXF7mC/C+//MLsugMtQFhLZ8Dj3vybBGMJ5q4OHjzYUgOuX79eYEZzdnZuzi3Jy8vDE1lcXCxgn4IpyNtYvHixIH+dw/lXWKetrc37+N69e5PHx8TECEsLQgtHZWRkmn8wuXp7m6KgoNDSU2jLjLcpGhoazTmstLT0999/NzY2fv78uSB9Slv4qVu3boL8ddpCSFlZWY0uwFIHrd2TlpbGnJAXApvnG1qPlp7y8eNHdhrt9evXtra2FRUVYptrbd68+dmzZ5gTNhczM7Nt27Y19r+ampqCuY1hw4b5+vo29r+KiooXLlwICgoidza4uqBgWLVqlaWlZf3258+fQXWQlYWGhlIHvH371tvbe+/evWKrw6+//jo1NZXtdymsOBhCcPI2xowZIxKrQJqampK3vW7dOkH++nfffUf+elxcHPcxnp6etCirvLxcMLdHU/uWLVsEaRw9Pb3G2sMGj7e3tycPS0hIELuckManT5/YX606OzsnJiZSRfD61q1bhXg/r1694t4JSiBfjVZWVj558kRCjNm4caOAc+P2mROygbNnz966dYvcA6EpO291wIABtORQzH03fvx4FKHIAxGdh4cHuQdyLWNjY3beLbR+ZLFDhw7i5i8DA4PBgwdTRYhfdu/ejSJsApav4Tx58mTyNWO/fv127NjBWgXGxsaSe8Rwadfq6uqLFy+SHyFWrVrF2qCULW9HIW/x8vJq4P6kpKDNkZOTE24gevXqVXLPpUuX2GA0bW1t2p6qqqpJkyaRC32qqamZmJiImwizsrJUVVUDAwNtbGyonRMmTIiPj0cRNkp2dvbOnTsb/K9FixYJUYTwWM+YMYPcA3UqRDtsMJqPj4++vn79dv0niuDg4JycHPKYDRs2iGH6AHX3hw8frK2tx4wZc/ny5fqdCQkJ//3vf5csWYIibBkdO3YEgwrxBtzd3cmGRVdXt7HKQvD4+/vzPmDIkCELFy4UQxFKSkqWlZUpKCgEBAQoKytTHly6dCm0h7169cKcsGXBvcC6y3ADUej58+dZGIg2h1GjRvHo7d3uqX8dJSMjc/r0aXL/uHHj6jfYs1A8W1pCCPAaHFQBplRUVBTKLUH1OXXqVHLPunXrWPtGlATCsDlz5vzwww8SiITE2LFjXV1dr1+/Xl+Mi4v7/fff582bBwE8ivBfQG4zd+5cVjkPUkGyC4G2trZwP803eIdGRkZUUVZWtkePHqamplSiiNQDQamKigqk9/XF+fPnf/fdd2C6yMhIFOE/lJaWssptt27dOnv2LLmHhZ/mly9fbmZmhhprEnl5+RMnTkyZMoWsv9gTjuLH+oYTUdpoVC8vLxY+7i9evEBnNZPJkyePHj2aKgYGBp45cwZFyF6gmiQHKOnq6vr4+KBZRB1/f3/awF8U4b8Q4pBKGiEhIeSrfyUlpZSUFHyC2wFycnJ+fn4svDG25ITv37/PyMho7H+1tLQEM7j+7du3ELeQe2xsbJKTk9+9e9fYKXp6erSJEhA2xzh//vlncHAwirABoqKiGhsPBqSnp/P4Xwa5du1aUVERuQccdvPmTR6nbN26dd26dfh8iwqQCiorKwvx47Oo5oQCe5ElKSlJ29Pk1yRZWVl8skWIrl27klPCibUIa2pqWCjCVlSQtHFDbQrtQw714YslkP37gLKyMgFnNKRTeNSe06dPHzp0KP+uF/lwVFpaukuXLs08WGCzrcnLyzf/ruppxQRtrUZVVZW8PbY1wmAK8vYE3NWpV69eVIUITxfvUZRnz541Nzf/8OGD4J+xBuIv9nyyRBDxBL8TIgiKEEFQhAiCoAgRBEWIIAiKEEFQhAiCoAgRBEWIIAiKEEFQhAiCoAgRBEWIIIiA+L8AAwA7qI37mM9ysgAAAABJRU5ErkJggg=='";
  }

  // async generateQRCode(text: string): Promise<string> {
  //   try {
  //     const option: QRCode.QRCodeToDataURLOptions = {
  //       width: 336,
  //       margin: 5,
  //     };
  //     const qrCodeDataUrl = await QRCode.toDataURL(text, option);
  //     return qrCodeDataUrl;
  //   } catch (err) {
  //     console.error(err);
  //     return "";
  //   }
  // }

  // async print(data: ProductItemCode, orderId: number) {
  //   try {
  //     const logo = this.getLogoImageData();
  //     const time = this.coreService.changeFormatDate(new Date().toISOString());

  //     Sunmi.start();

  //     Sunmi.align({
  //       direction: "CENTER",
  //     });
  //     Sunmi.line({
  //       wrap: true,
  //     });
  //     Sunmi.line({
  //       wrap: true,
  //     });
  //     Sunmi.line({
  //       wrap: true,
  //     });
  //     Sunmi.image({
  //       image: logo,
  //     });
  //     Sunmi.line({
  //       wrap: true,
  //     });
  //     Sunmi.line({
  //       wrap: true,
  //     });
  //     Sunmi.line({
  //       text: time,
  //       wrap: true,
  //     });
  //     Sunmi.line({
  //       text: `Order Number: ${orderId}`,
  //       wrap: true,
  //     });
  //     for (let index = 0; index < data.codes.length; index++) {
  //       const code = data.codes[index];
  //       const qrCodeDataUrl = await this.generateQRCode(
  //         JSON.stringify({ card_number: code.cardNumber, pin: code.pin })
  //       );
  //       const base64Data = qrCodeDataUrl.replace("data:image/png;base64,", "");
  //       Sunmi.line({
  //         text: `*****************************`,
  //         wrap: true,
  //       });
  //       Sunmi.line({
  //         text: data.productName,
  //         wrap: true,
  //       });
  //       Sunmi.line({
  //         wrap: true,
  //       });
  //       Sunmi.line({
  //         text: "Card Number",
  //         wrap: true,
  //       });
  //       Sunmi.line({
  //         text: code.cardNumber,
  //         wrap: true,
  //       });
  //       Sunmi.line({
  //         wrap: true,
  //       });
  //       Sunmi.line({
  //         wrap: true,
  //       });
  //       Sunmi.line({
  //         text: "PIN",
  //         wrap: true,
  //       });
  //       Sunmi.line({
  //         text: `${code.pin}`,
  //         wrap: true,
  //       });
  //       Sunmi.line({
  //         wrap: true,
  //       });
  //       Sunmi.image({
  //         image: base64Data,
  //       });
  //       Sunmi.line({
  //         wrap: true,
  //       });
  //       Sunmi.line({
  //         text: `*****************************`,
  //         wrap: true,
  //       });
  //     }
  //     Sunmi.line({
  //       wrap: true,
  //     });
  //     Sunmi.line({
  //       text: "Thank you for your order",
  //       wrap: true,
  //     });
  //     Sunmi.line({
  //       text: "Powered by EZ PIN",
  //       wrap: true,
  //     });
  //     Sunmi.line({
  //       text: "www.ezpin.com",
  //       wrap: true,
  //     });
  //     Sunmi.line({
  //       wrap: true,
  //     });
  //     Sunmi.line({
  //       wrap: true,
  //     });
  //     Sunmi.line({
  //       wrap: true,
  //     });
  //     Sunmi.line({
  //       wrap: true,
  //     });
  //     Sunmi.align({
  //       direction: "LEFT",
  //     });
  //     Sunmi.line({
  //       text: "*eGift voucher is",
  //       wrap: true,
  //     });
  //     Sunmi.line({
  //       text: "non-refundable/exchange and",
  //       wrap: true,
  //     });
  //     Sunmi.line({
  //       text: "cannot be exchanged for cash",
  //       wrap: true,
  //     });
  //     Sunmi.line({
  //       text: "in part or full and is valid",
  //       wrap: true,
  //     });
  //     Sunmi.line({
  //       text: "for a single transaction",
  //       wrap: true,
  //     });
  //     Sunmi.line({
  //       text: "only.",
  //       wrap: true,
  //     });
  //     Sunmi.line({
  //       text: "*eGift vouchers cannot be",
  //       wrap: true,
  //     });
  //     Sunmi.line({
  //       text: "replaced if lost, stolen",
  //       wrap: true,
  //     });
  //     Sunmi.line({
  //       text: "or damaged.",
  //       wrap: true,
  //     });
  //     Sunmi.line({
  //       text: "*eGift vouchers are valid",
  //       wrap: true,
  //     });
  //     Sunmi.line({
  //       text: "till the claim-by-date.",
  //       wrap: true,
  //     });
  //     Sunmi.line({
  //       text: "*eGift vouchers only to",
  //       wrap: true,
  //     });
  //     Sunmi.line({
  //       text: "be used",
  //       wrap: true,
  //     });
  //     Sunmi.line({
  //       text: "in their specific region.",
  //       wrap: true,
  //     });
  //     Sunmi.line({
  //       text: "*eGift vouchers only to be",
  //       wrap: true,
  //     });
  //     Sunmi.line({
  //       text: "used in their specific",
  //       wrap: true,
  //     });
  //     Sunmi.line({
  //       text: "region.",
  //       wrap: true,
  //     });
  //     Sunmi.line({
  //       text: "*eGift will be under the",
  //       wrap: true,
  //     });
  //     Sunmi.line({
  //       text: "terms and conditions of their brands.",
  //       wrap: true,
  //     });
  //     Sunmi.line({
  //       text: "For any discrepancy or",
  //       wrap: true,
  //     });
  //     Sunmi.line({
  //       text: "complaints, kindly send your",
  //       wrap: true,
  //     });
  //     Sunmi.line({
  //       text: "request to:",
  //       wrap: true,
  //     });
  //     Sunmi.line({
  //       text: "*egift@ezpin.com",
  //       wrap: true,
  //     });
  //     Sunmi.line({
  //       wrap: true,
  //     });
  //     Sunmi.line({
  //       wrap: true,
  //     });
  //     Sunmi.line({
  //       wrap: true,
  //     });
  //     Sunmi.line({
  //       wrap: true,
  //     });

  //     await Sunmi.print();
  //     this.printSuccess$.next();
  //   } catch (error) {
  //     this.printError$.next(error);
  //   }
  // }
}
