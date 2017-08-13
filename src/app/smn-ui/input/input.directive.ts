import {
    AfterViewInit, ChangeDetectorRef, Directive, ElementRef, EventEmitter, HostListener, Input, OnChanges, Output,
    Renderer2
} from '@angular/core';

@Directive({
    selector: '[uiInput]'
})

export class UiInputDirective implements AfterViewInit, OnChanges {
    placeholder: string;
    @Input() ngModel: any;
    @Input() persistPlaceholder: boolean;
    @Output() ngModelChange: EventEmitter<any> = new EventEmitter();

    constructor(private element: ElementRef, private renderer: Renderer2, private changeDetectorRef: ChangeDetectorRef) {
        this.placeholder = element.nativeElement.placeholder;
    }

    ngAfterViewInit() {
        this.renderer.addClass(this.element.nativeElement, 'ui-control');
        this.setPlaceholder();
    }

    ngOnChanges() {
        this.isEmpty(this.ngModel);
    }

    @HostListener('blur')
    onBlur() {
        if (this.ngModel) {
            if (this.ngModel.trim) {
                this.ngModel = this.ngModel.trim();
            }
            this.ngModelChange.emit(this.ngModel);
            this.changeDetectorRef.detectChanges();
        }
        this.isEmpty(this.ngModel);
    }

    @HostListener('focus')
    onFocus() {
        this.isEmpty(this.ngModel);
        this.setPlaceholder(this.placeholder);
    }

    @HostListener('focusout')
    onFocusout() {
        this.setPlaceholder();
    }

    isEmpty(value: any): void {
        // TODO: Try model e view value
        if (this.ngModel && this.ngModel.trim && !this.ngModel.trim()) {
            this.ngModel = this.ngModel.trim();
            this.ngModelChange.emit(this.ngModel);
            this.changeDetectorRef.detectChanges();
        }
        const action = !value && !this.element.nativeElement.value ? 'addClass' : 'removeClass';
        this.renderer[action](this.element.nativeElement, 'ui-empty');
    }

    setPlaceholder(value?: string) {
        value = this.persistPlaceholder ? this.placeholder : value || '';
        this.renderer.setProperty(this.element.nativeElement, 'placeholder', value);
    }
}
