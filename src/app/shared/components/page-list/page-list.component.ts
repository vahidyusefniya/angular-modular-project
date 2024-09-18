import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  TemplateRef,
} from "@angular/core";
import { IPageChange, ITag, LoadingService } from "@app/core/services";
import { LayoutService } from "@app/layout";
import { dictionary } from "@dictionary/dictionary";
import { ActionSheetController } from "@ionic/angular";
import {
  IButtonRow,
  ICol,
  IIconRow,
  ILinkRow,
  IToggleRow,
} from "./page-list.model";

@Component({
  selector: "app-page-list",
  templateUrl: "./page-list.component.html",
  styleUrls: ["./page-list.component.scss"],
})
export class PageListComponent implements OnInit, OnChanges {
  dictionary = dictionary;
  _selectedColumns: ICol[] = [];
  pageSizeItems = [
    {
      name: "10",
      id: 10,
    },
    {
      name: "25",
      id: 25,
    },
    {
      name: "50",
      id: 50,
    },
    {
      name: "100",
      id: 100,
    },
    {
      name: "All",
      id: 0,
    },
  ];
  pageSizeValue = 10;

  @Input() get selectedColumns(): ICol[] {
    return this._selectedColumns;
  }
  set selectedColumns(val: ICol[]) {
    this._selectedColumns = this.cols.filter((col) => val.includes(col));
  }
  localProductImageSRC = "../../../../assets/img/product.png";
  localData: any[] = [];
  @Input() lastPageNumber: number | undefined;

  @Input() initialTemplate!: TemplateRef<any>;
  currentTemplate!: TemplateRef<any>;

  @Input() initialHeaderTemplate!: TemplateRef<any>;
  headerTemplate!: TemplateRef<any>;

  @Input() id: string | number | undefined;
  @Input() loading = false;
  @Input() showPagination = true;
  @Input() showActionSheet = true;
  @Input() hasLocalPagination = false;
  @Input() data: any[] = [];
  @Input() tagList: ITag[] = [];
  @Input() LabelIcon: string = "";
  @Input() cols: ICol[] = [];
  @Input() label: string | undefined;
  @Input() subLabel: string | undefined;
  @Input() hasCustomTableContent = false;
  @Input() hasCustomTableHeader = false;
  @Input() page = 1;
  @Input() pageSize = 10;
  @Input() listPermission!: string;

  @Output() pageChanged = new EventEmitter<IPageChange>();
  @Output() linkRowClick = new EventEmitter<ILinkRow>();

  @Input() hasSearch = true;
  @Output() inputSearch = new EventEmitter<string>();

  @Input() hasAdvancedFilter = true;
  @Input() advancedFilterPermission!: string;
  @Output() advancedFilterClick = new EventEmitter();

  @Input() hasRefresh = true;
  @Output() refreshClick = new EventEmitter();

  @Input() hasExport = true;
  @Input() exportPermission!: string;
  @Output() exportClick = new EventEmitter();

  @Input() hasNewButton = true;
  @Input() newButtonPermission!: string;
  @Input() hasLoadingNewButton = false;
  @Input() newButtonLabel = dictionary.Add;
  @Output() newButtonClick = new EventEmitter();

  @Input() hasToggleButton = false;
  @Input() togglePermission!: string;
  @Input() newButtonId: string = "new-button";
  @Input() refreshButtonId: string = "refresh-button";
  @Output() toggleClick = new EventEmitter<IToggleRow>();

  @Output() buttonRowClick = new EventEmitter<{ event: string; data: any }>();
  @Output() iconRowClick = new EventEmitter<{ event: string; data: any }>();
  @Output() textButtonRowClick = new EventEmitter<any>();
  @Input() searchTerm: string | undefined;

  @Output() pageSizeChange = new EventEmitter<number>();
  @Input() showPageSizeSelect = false;

  constructor(
    private actionSheetCtrl: ActionSheetController,
    private layoutService: LayoutService
  ) {}

  ngOnInit(): void {
    this._selectedColumns = this.cols.filter((c) => !c.hidden);
    this.currentTemplate = this.initialTemplate;
    this.headerTemplate = this.initialHeaderTemplate;
  }
  ngOnChanges(): void {
    if (this.hasLocalPagination) {
      this.localData = this.data;
      this.lastPageNumber = Math.ceil(this.data.length / this.pageSize);
      this.data = this.getLocalList();
    }
  }

  onPageSizeChange(event: number): void {
    this.pageSizeChange.emit(event);
  }

  initSearchInput(event: any): void {
    this.inputSearch.emit(event.target.value.trim());
  }

  onRefreshClick(): void {
    this.refreshClick.emit();
  }
  onAdvancedFilterClick(): void {
    this.advancedFilterClick.emit();
  }
  onExportClick(): void {
    this.exportClick.emit();
  }
  onNewClick(): void {
    this.newButtonClick.emit();
  }

  onLinkRowClick(event: Event, data: any, col: ICol): void {
    if (!col.isRouteLink) {
      this.linkRowClick.emit({ data: data, colName: col.header });
      event.preventDefault();
    }
  }

  onButtonClick(data: IButtonRow, rowData: any): void {
    this.buttonRowClick.emit({
      event: data.eventName,
      data: rowData,
    });
  }

  onIconClick(data: IIconRow, rowData: any): void {
    this.iconRowClick.emit({
      event: data.eventName,
      data: rowData,
    });
  }

  onTextButtonClick(rowData: any): void {
    this.textButtonRowClick.emit(rowData);
  }

  onToggleClick(event: any, data: any, header: string): void {
    event.target.checked = !event.target.checked;
    this.toggleClick.emit({ data: data, colName: header, event: event });
  }

  async presentActionSheet() {
    const actionSheet = await this.actionSheetCtrl.create({
      buttons: this.initActionSheetItems(),
    });

    await actionSheet.present();
  }
  initActionSheetItems(): any[] {
    const permissions: string[] = this.layoutService.getPermissions();
    const hasAdvancedFilterPermission = permissions.find(
      (p) => p === this.advancedFilterPermission
    );
    const hasNewButtonPermission = permissions.find(
      (p) => p === this.newButtonPermission
    );

    const items = [
      {
        id: 1,
        text: dictionary.AdvancedFilter,
        role: "selected",
        handler: () => {
          this.advancedFilterClick.emit();
        },
        permission: this.advancedFilterPermission,
      },
      {
        id: 2,
        text: this.newButtonLabel,
        role: "selected",
        handler: () => {
          this.onNewClick();
        },
        permission: this.newButtonPermission,
      },
      {
        text: dictionary.Cancel,
        role: "cancel",
        data: {
          action: "cancel",
        },
      },
    ];

    if (!hasNewButtonPermission || !this.hasNewButton) {
      const newButtonIndex = items.findIndex((i) => i.id === 2);
      if (newButtonIndex > -1) items.splice(newButtonIndex, 1);
    }
    if (!hasAdvancedFilterPermission || !this.hasAdvancedFilter) {
      const advancedFilterIndex = items.findIndex((i) => i.id === 1);
      if (advancedFilterIndex > -1) items.splice(advancedFilterIndex, 1);
    }

    return items;
  }

  checkLinkRowPermission(permission: string): boolean {
    const permissions = this.layoutService.getPermissions();
    const hasPermission = permissions.find((p) => p === permission);
    return !!hasPermission;
  }

  onFocusEvent(event: any) {
    setTimeout(() => {
      // event.target?.scrollIntoView();
    }, 200);
  }

  onNextPageClick(): void {
    if (this.hasLocalPagination) this.onNextLocalPageChange();
    else this.onNextServerPageChange();
  }
  onPrevPageClick(): void {
    if (this.hasLocalPagination) this.onPrevLocalPageChange();
    else this.onPrevServerPageChange();
  }

  mapIsActiveStatus(status: boolean) {
    return status ? dictionary.Active : dictionary.Deactive;
  }

  onNextLocalPageChange(): void {
    this.page = this.page + 1;
    const body: IPageChange = {
      page: this.page,
      pageSize: this.pageSize,
    };
    this.pageChanged.emit(body);
    this.data = this.getLocalList();
  }
  onPrevLocalPageChange(): void {
    this.page = this.page - 1;
    const body: IPageChange = {
      page: this.page,
      pageSize: this.pageSize,
    };
    this.pageChanged.emit(body);
    this.data = this.getLocalList();
  }

  onNextServerPageChange(): void {
    this.page = this.page + 1;
    const body: IPageChange = {
      page: this.page,
      pageSize: this.pageSize,
    };
    this.pageChanged.emit(body);
    const table = document.getElementById("table");
    table!.scroll(0, 0);
  }
  onPrevServerPageChange(): void {
    this.page = this.page - 1;
    const body: IPageChange = {
      page: this.page,
      pageSize: this.pageSize,
    };
    this.pageChanged.emit(body);
    const table = document.getElementById("table");
    table!.scroll(0, 0);
  }

  getLocalList(): any[] {
    const temp = this.localData;
    this.data = temp.slice(
      (this.page - 1) * this.pageSize,
      this.page * this.pageSize
    );
    return this.data;
  }
}
