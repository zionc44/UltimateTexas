
export enum ColumnType {
    Regular = 1,
    Cards = 2,
    CodeDecode = 4,
}

export interface TableColumn {
    columnOrder: number,
    columnName: string,
    columnWidth: number,
    columnTitle: string,
    coulmeType: ColumnType,
    codeDecodeList: CodeDecode[];
}


// אני משאיר את זה כאן רק לדוגמא להגדרה של כפתור
// export const stopPorcessButton: Button = { img: "assets/imgs/stopProcess.svg", buttonType: ButtonType.StopProcess, displayName: "הפסקת תהליך", dependencyAttribute: "trialProcessStatus", dependencyValue: [TrialProcessStatus.InProcess,TrialProcessStatus.NotStarted] };
// export const resumeProcessButton: Button = { img: "assets/imgs/resumeProcess.svg", buttonType: ButtonType.ResumeProcess, displayName: "חידוש תהליך", dependencyAttribute: "trialProcessStatus", dependencyValue: [TrialProcessStatus.Cancelled] };
// export const printButton: Button = { img: "assets/imgs/print.svg", buttonType: ButtonType.Print, displayName: "הדפסה", dependencyAttribute: "", dependencyValue: [] };

export interface CodeDecode {
    code: number | string,
    decode: string,
}
