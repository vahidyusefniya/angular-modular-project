export class ComboboxDto implements IComboboxDto {
  fontStyle?: string | undefined;
  fontName?: string | undefined;
  textField: string | undefined;
  valueField: any;

  init(data: IComboboxDto): void {
    this.fontStyle = data["fontStyle"];
    this.fontName = data["fontName"];
    this.textField = data["textField"];
    this.valueField = data["valueField"];
  }
}
interface IComboboxDto {
  fontStyle?: string | undefined;
  fontName?: string | undefined;
  textField: string | undefined;
  valueField: any;
}
