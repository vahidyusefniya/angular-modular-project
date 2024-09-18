import { Component, Input } from "@angular/core";
import { ITag, TagService } from "@app/core/services";

@Component({
  selector: "app-table-filter-tag",
  templateUrl: "./table-filter-tag.component.html",
  styleUrls: ["./table-filter-tag.component.scss"],
})
export class TableFilterTagComponent {
  @Input() tagList: ITag[] = [];

  constructor(private tagService: TagService) {}

  clearTag(tag: ITag): void {
    this.tagService.removeTag(tag.key);
  }
}
