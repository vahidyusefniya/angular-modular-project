// noinspection JSIgnoredPromiseFromCall

import { Component, OnDestroy, OnInit } from "@angular/core";
import { ResponseErrorDto } from "@app/core/dto/core.dto";
import { LoadingService, NotificationService } from "@app/core/services";
import { LayoutService } from "@app/layout";
import {
  CategoriesClient,
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { TreeNode } from "primeng/api";
import { Subscription } from "rxjs";
import { Title } from "@angular/platform-browser";

@Component({
  selector: "app-categories",
  templateUrl: "./categories.component.html",
  styleUrls: ["./categories.component.scss"],
})
export class CategoriesComponent implements OnInit, OnDestroy {
  dictionary = dictionary;
  loading = false;
  getCategories$ = new Subscription();
  initPage$ = new Subscription();
  treeData: TreeNode[] = [];
  categories!: Category[];
  showCategoryForm: boolean = false;
  showEditCategoryForm: boolean = false;
  categoryForm: any = null;
  categoryId: number = 0;
  localImageSRC = "../../../../../assets/img/placeholder.jpg";

  constructor(
    private categoriesClient: CategoriesClient,
    private notificationService: NotificationService,
    private loadingService: LoadingService,
    private layoutService: LayoutService,
    private titleService: Title
  ) {
    this.layoutService.setTabName(
      `${dictionary.System} / ${dictionary.Categories}`
    );
    this.layoutService.checkPagePermission("CategoryRead");
  }

  ngOnInit() {
    this.initCategories();
    this.initTitle();
  }

  onEditCategoryClick(node: TreeNode): void {
    this.showEditCategoryForm = true;
    this.categoryForm = {
      categoryName: node.data.categoryName,
      imageUrl: node.data.imageUrl,
    };
    this.categoryId = node.data.categoryId;
  }

  initTitle() {
    this.titleService.setTitle(
      `${dictionary.Categories} - ${dictionary.System} - ${this.layoutService.branchName}`
    );
  }
  onAddCategoryClick(node: TreeNode): void {
    this.showCategoryForm = true;
    this.categoryId = node.data.categoryId;
    this.categoryForm = {
      categoryName: "",
      imageUrl: "",
      parentCategoryId: node.data.categoryId,
    };
  }

  submitCreate(model: CreateCategoryRequest): void {
    this.getCategories$ = this.categoriesClient.create(model).subscribe({
      next: () => {
        this.notificationService.showSuccessNotification(
          this.dictionary.CreatedCategorySuccessFully
        );
        this.showCategoryForm = false;
      },
      error: (error: ResponseErrorDto) => {
        this.loading = false;
        throw Error(error.message);
      },
      complete: () => {
        this.initCategories();
      },
    });
  }

  submitEdit(model: UpdateCategoryRequest): void {
    this.loadingService.present();
    this.treeData = [];
    this.getCategories$ = this.categoriesClient
      .update(this.categoryId, model)
      .subscribe({
        next: () => {
          this.notificationService.showSuccessNotification(
            this.dictionary.UpdatedCategorySuccessFully
          );
          this.loadingService.dismiss();
        },
        error: (error: ResponseErrorDto) => {
          this.loading = false;
          this.loadingService.dismiss();
          throw Error(error.message);
        },
        complete: () => {
          this.showEditCategoryForm = false;
          this.initCategories();
        },
      });
  }

  initCategories(): void {
    this.loading = true;
    this.categories = [];
    this.treeData = [];
    this.getCategories$ = this.categoriesClient.getRootCategory().subscribe({
      next: (res: any) => {
        this.loading = false;
        this.categories = res.categories;
        this.treeData.push({
          label: res.categoryName,
          data: res,
          children: [],
          expanded: true,
        });

        this.categoriesToTreeNodes(res.categories);
      },
      error: (error: ResponseErrorDto) => {
        this.loading = false;
        throw Error(error.message);
      },
    });
  }

  checkCCategoryWritePermission(): boolean {
    const permissions: string[] = this.layoutService.getPermissions();
    const isPermission = permissions.find((p) => p === "CategoryWrite");
    if (isPermission) return true;
    else return false;
  }

  private categoriesToTreeNodes(categories: Category[]) {
    for (let category of categories) {
      this.treeData[0].children?.push(this.categoryToTreeNode(category));
    }
  }

  private categoryToTreeNode(category: Category): TreeNode {
    let categoriesTreeNodes: TreeNode[] = [];

    if (category.categories !== undefined) {
      for (let c of category.categories) {
        categoriesTreeNodes.push(this.categoryToTreeNode(c));
      }
    }
    return {
      label: category.categoryName,
      data: category,
      children: categoriesTreeNodes,
    };
  }

  ngOnDestroy(): void {
    this.getCategories$.unsubscribe();
  }
}
