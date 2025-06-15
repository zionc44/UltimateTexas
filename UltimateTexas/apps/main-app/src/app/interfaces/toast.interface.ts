export enum ToastType {
    Success = 1,
    Info = 2,
    Warning = 3,
    Error = 4,
    Dialog = 5
}

export interface Toast {
    toastId?: number,
    toastType: ToastType,
    toastTitle?: string | null,
    toastTexts?: string[],
    displayCloseButton?: boolean,
    autoDismiss?: boolean,
    dismissTimer?: number,
    width?: number,
    height?: number
    onDialogBtnClick?: Function;
    btnDialogList?: ToastBtn[]
    component?: any;
    getComponentInstance?: Function
}

export interface ToastBtn {
    btnName: string,
    btnClickOutput: string,
    closeDialogOnClick: boolean,
    btnWidth: number,
    isNegativeStyle: boolean
}