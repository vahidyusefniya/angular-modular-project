import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ResponseErrorDto } from '@app/core/dto/core.dto';
import { CoreService } from '@app/core/services';
import { CategoriesClient, Category } from '@app/proxy/proxy';
import { dictionary } from '@dictionary/dictionary';
import { ModalController } from '@ionic/angular';
import { TreeNode } from 'primeng/api';

@Component({
  selector: 'app-category-modal',
  templateUrl: './search-tree-category-modal.component.html',
  styleUrls: ['./search-tree-category-modal.component.scss'],
})
export class SearchTreeCategoryModalComponent implements OnInit {
  dictionary = dictionary;
  treeData: TreeNode<Category>[] = [];
  selectedCategory!: any;
  categoryName: string | undefined;
  loading = false;
  removeState: boolean | undefined;
  showRemoveBtn: boolean | undefined;

  @Input() isOpen = false;
  @Input() label: string | undefined;
  @Input() id: string | undefined;
  @Input() required = false;
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() autofocus = false;
  @Input() categoryId: number | undefined;

  @Output() chooseCategory = new EventEmitter<Category>();
  @Output() dismiss = new EventEmitter();
  @Output() removeCat = new EventEmitter();

  constructor(
    private categoriesClient: CategoriesClient,
    public coreService: CoreService,
    private modalController: ModalController
  ) { }

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
          input != null && input.focus();
        }, 1000)
        if (this.categoryId) {
          this.showRemoveBtn = true;
          let selectCat = this.treeData.filter(item => item.data.categoryId === this.categoryId)[0]
          this.categoryName = selectCat.data['categoryName']
          this.selectedCategory = selectCat;
        }
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

  removeCategory() {
    this.selectedCategory = undefined;
    this.categoryName = undefined;
    this.showRemoveBtn = false;
    this.removeState = true;
    this.removeCat.emit()
  }

  openCategoryModal(event: Event) {
    if (this.removeState) {
      event.preventDefault();
      event.stopPropagation();
      this.removeState = false;
    } else {
      this.isOpen = true;
    }
  }

  selectCategory(data: any): void {
    this.showRemoveBtn = true;
    this.removeState = false;
    this.categoryName = data.data.categoryName;
    this.selectedCategory = data;
    this.chooseCategory.emit(this.selectedCategory.data);
    this.cancel();
  }

  cancel(): void {
    this.selectedCategory && this.chooseCategory.emit(this.selectedCategory.data);
    this.isOpen = false;
    this.modalController.dismiss()
    this.dismiss.emit();
  }
}
