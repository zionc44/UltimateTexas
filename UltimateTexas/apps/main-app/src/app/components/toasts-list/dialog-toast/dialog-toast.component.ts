import { ChangeDetectorRef, Component, ComponentRef, DestroyRef, EventEmitter, Input, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Toast, ToastBtn } from '../../../interfaces/toast.interface';

@Component({
    standalone: true,
    selector: 'tep-client-dialog-toast',
    imports: [CommonModule],
    templateUrl: './dialog-toast.component.html',
    styleUrls: ['./dialog-toast.component.scss'],
})
export class DialogToastComponent {
    @Input() toast: Toast | null = null;
    @Output() closeDialog: EventEmitter<boolean> = new EventEmitter<boolean>();

    @ViewChild('componentContainer', { read: ViewContainerRef }) componentContainer!: ViewContainerRef;

    constructor(private destroyRef: DestroyRef, private cdr: ChangeDetectorRef) { }

    ngAfterViewInit(): void {
        if (this.toast?.component) {
            this.componentContainer.clear();
            const componentRef: ComponentRef<any> = this.componentContainer.createComponent(this.toast.component);

            componentRef.instance.onCloseDialog.pipe(takeUntilDestroyed(this.destroyRef))
                .subscribe((event: boolean) => this.closeDialog.emit(event))

            if (this.toast?.getComponentInstance)
                this.toast?.getComponentInstance(componentRef)

            this.cdr.detectChanges();

        }
    }

    onBtnClick(btn: ToastBtn) {
        if (this.toast?.onDialogBtnClick) {
            this.toast.onDialogBtnClick(btn.btnClickOutput);
        }

        if (btn.closeDialogOnClick) {
            this.closeDialog.emit(true);
        }
    }
} 
