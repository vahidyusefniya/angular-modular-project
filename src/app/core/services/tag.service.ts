import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

export interface ITag {
  key: string;
  value: string | undefined;
  clearable: boolean;
}

@Injectable({
  providedIn: "root",
})
export class TagService {
  tagList: ITag[] = [];
  changeTagList = new Subject<ITag[]>();
  removeTag$ = new Subject<string>();

  createTags(tags: ITag[]): void {
    tags.forEach((tag) => {
      if (!tag.value) this.removeTag(tag.key);
      else if (this.checkTagInTagList(tag)) this.updateTag(tag);
      else this.addTag(tag);
    });
  }
  checkTagInTagList(tag: ITag): boolean {
    const Tag = this.tagList.find((t) => t.key.includes(tag.key));
    return !!Tag;
  }
  addTag(tag: ITag): void {
    const Tag: ITag = {
      key: tag.key,
      value: tag.value,
      clearable: tag.clearable,
    };
    this.tagList.push(Tag);
    this.changeTagList.next(this.tagList);
  }
  updateTag(newTag: ITag): void {
    this.removeTagForUpdate(newTag.key);
    this.addTag(newTag);
    this.changeTagList.next(this.tagList);
  }
  removeTag(tagKey: string): void {
    const Tag = this.tagList.find((t) => t.key.includes(tagKey));
    if (!Tag) return;
    const index = this.tagList.indexOf(Tag, 0);
    if (index > -1) {
      this.tagList.splice(index, 1);
      this.changeTagList.next(this.tagList);
      this.removeTag$.next(tagKey);
    }
  }
  removeTagForUpdate(tagKey: string): void {
    const Tag = this.tagList.find((t) => t.key.includes(tagKey));
    if (!Tag) return;
    const index = this.tagList.indexOf(Tag, 0);
    if (index > -1) {
      this.tagList.splice(index, 1);
      this.changeTagList.next(this.tagList);
    }
  }
}
