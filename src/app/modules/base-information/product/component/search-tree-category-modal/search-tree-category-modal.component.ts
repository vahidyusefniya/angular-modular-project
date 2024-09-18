import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { ResponseErrorDto } from "@app/core/dto/core.dto";
import { CoreService } from "@app/core/services";
import { CategoriesClient, Category } from "@app/proxy/proxy";
import { dictionary } from "@dictionary/dictionary";
import { TreeNode } from "primeng/api";
import {ModalController} from "@ionic/angular";

@Component({
  selector: "app-search-tree-category-modal",
  templateUrl: "./search-tree-category-modal.component.html",
  styleUrls: ["./search-tree-category-modal.component.scss"],
})
export class SearchTreeCategoryModalComponent implements OnInit {
  dictionary = dictionary;
  categoryId: number | undefined;
  treeData: TreeNode<Category>[] = [];
  selectedCategory!: any;
  loading = false;

  @Input() isOpen = false;

  @Output() chooseCategory = new EventEmitter<Category>();
  @Output() dismiss = new EventEmitter();

  constructor(
    private categoriesClient: CategoriesClient,
    public coreService: CoreService,
    private modalController: ModalController
  ) {}

  ngOnInit() {
    this.initCategories();
  }

  initCategories(): void {
    this.loading = true;
    this.categoriesClient.getRootCategory().subscribe({
      next: (res: Category) => {
        this.categoriesToTreeNodes(res.categories);
        setTimeout(() => {
          var input = document.querySelector('.p-tree-filter')
          // @ts-ignore
          input.focus();
        }, 1000)
      },
      error: (error: ResponseErrorDto) => {
        this.loading = false;
        new Error(error.message);
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  private categoriesToTreeNodes(categories: Category[]) {
    for (let category of categories) {
      this.treeData.push(this.categoryToTreeNode(category));
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

  selectCategory(data: any): void {
    this.chooseCategory.emit(data.node.data);
    this.cancel();
  }

  cancel(): void {
    this.modalController.dismiss()
    this.dismiss.emit();
  }
}
