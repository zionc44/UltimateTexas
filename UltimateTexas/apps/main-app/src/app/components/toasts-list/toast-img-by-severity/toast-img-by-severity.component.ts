import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastType } from '../../../interfaces/toast.interface';

@Component({
    standalone: true,
    imports: [CommonModule],
    selector: 'tep-client-toast-img-by-severity',
    templateUrl: './toast-img-by-severity.component.html',
    styleUrls: ['./toast-img-by-severity.component.scss'],
})
export class ToastImgBySeverityComponent {
    @Input() toastType: ToastType  = ToastType.Error;

    public ToastType = ToastType;
}
