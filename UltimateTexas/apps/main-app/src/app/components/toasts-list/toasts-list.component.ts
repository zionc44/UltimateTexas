import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit } from '@angular/core';
import { DialogToastComponent } from './dialog-toast/dialog-toast.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ToastComponent } from './toast/toast.component';
import { Toast, ToastType } from '../../interfaces/toast.interface';
import { ToastService } from '../../services/toast.service';

@Component({
    standalone: true,
    imports: [CommonModule, DialogToastComponent, ToastComponent],
    selector: 'tep-client-toasts-list',
    templateUrl: './toasts-list.component.html',
    styleUrls: ['./toasts-list.component.scss']
})
export class ToastsListComponent implements OnInit {
    public toastsList: Toast[] = [];
    public dialogtToastsList: Toast[] = [];
    constructor(
        private destroyRef: DestroyRef,
        private toastService: ToastService) { }

    ngOnInit(): void {
        this.toastService.getToasterObservable().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(toast => {
            if (toast.toastType === ToastType.Dialog) {
                this.dialogtToastsList.push(toast) 
                
            } else {
                this.toastsList.push(toast)
            }
        });

        this.toastService.getDismistToast().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(toastId => {
            let index = this.toastsList.findIndex(toast => toast.toastId == toastId)
            if (index >= 0) {
                this.dismist(true, index);
            }
        })
    }

    closeAll() {
        this.toastsList = [];
    }

    dismist(dismist: boolean, index: number) {
        if (dismist) {
            this.toastsList.splice(index, 1);
        } 
    }

    closeDialog(){
        this.dialogtToastsList.pop()
    }

}
