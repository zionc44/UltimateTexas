import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChange, SimpleChanges } from '@angular/core';
import { Card } from '../../interfaces/card.interfcae';
import { ColumnType, SortOption, TableColumn } from '../../interfaces/table-column.interface';
import { ArrowDownComponent } from './arrow-down/arrow-down.component';

@Component({
    selector: 'app-list-of-lines',
    standalone: true,
    templateUrl: './list-of-lines.component.html',
    styleUrl: './list-of-lines.component.scss',
    imports: [CommonModule, ArrowDownComponent],
})

export class ListOfLinesComponent implements OnInit, OnChanges {
    @Input() tableColumnsList: TableColumn[] = [];
    @Input() tableData: any[] | null = null;
    @Input() tableWidth: number = 0;
    @Input() tableHeight: number = 0;
    @Input() headerHeight: number = 64;
    @Input() lineHeight: number = 90
    @Output() onClickLine: EventEmitter<number> = new EventEmitter<number>();
    @Output() onSortingChange: EventEmitter<number> = new EventEmitter<number>();

    public ColumnType = ColumnType;
    public SortOption = SortOption;
    public isDataReady: boolean = false;
    public valuesGrid: any[][] = []
    public numOfLines: number = 0;
    public numOfColumns: number = 0;
    public linesIndexArray: number[] = []
    public colsIndexArray: number[] = []
    public totalWidth: number = 0;
    public actoalFieldWidth: number[] = [];
    public lineState: 'summary'[] | 'full'[] = []
    public activeSort: number = 0;

    ngOnInit(): void {
        this.tableColumnsList.sort((c1, c2) => c1.columnOrder - c2.columnOrder);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['tableWidth']) {
            this.calcFieldSize(changes['tableWidth'])
        }

        if (changes['tableData']) {
            this.isDataReady = false;

            this.activeSort = this.tableColumnsList.findIndex(column => column.sortOption == SortOption.Asending || column.sortOption == SortOption.Desending)
            if (this.tableColumnsList[this.activeSort].sortOption == SortOption.Asending) {
                this.sortAsending();
            } else {
                this.sortDesending();
            }

            this.populateFieldGrid();
        }
    }

    populateFieldGrid() {
        if (this.tableData) {

            this.valuesGrid = [];
            this.tableData.forEach((record, index) => {
                this.lineState[index] = 'summary';
                let lineFieldsArray: any[] = []
                this.tableColumnsList.forEach(column => {
                    lineFieldsArray.push(record[column.columnName]);
                })
                this.valuesGrid.push(lineFieldsArray)
            })

            this.numOfLines = this.tableData.length;
            this.numOfColumns = this.tableColumnsList.length
            this.linesIndexArray = Array(this.numOfLines).fill(0).map((x, i) => i)
            this.colsIndexArray = Array(this.numOfColumns).fill(0).map((x, i) => i)
            this.isDataReady = true;
        }
    }

    calcFieldSize(tableWidthChange: SimpleChange) {
        this.totalWidth = 0;

        if (tableWidthChange.firstChange) {
            this.tableColumnsList.forEach(column => {
                this.actoalFieldWidth.push(column.columnWidth);
                this.totalWidth += column.columnWidth;
            })
        } else {
            for (let i = 0; i < this.actoalFieldWidth.length; i++) {
                this.actoalFieldWidth[i] = this.tableColumnsList[i].columnWidth;
                this.totalWidth += this.tableColumnsList[i].columnWidth;
            }
        }
    };

    clickLine(index: number) {
        this.onClickLine.next(index);
    }

    getFieldValue(lineIndex: number, colIndex: number) {
        switch (this.tableColumnsList[colIndex].coulmeType) {
            case ColumnType.Regular:
                return this.valuesGrid[lineIndex][colIndex];
            case ColumnType.CodeDecode:
                return this.getCodeDecodeValue(lineIndex, colIndex);
        }
    }

    getCodeDecodeValue(lineIndex: number, colIndex: number) {
        let codeDecode = this.tableColumnsList[colIndex].codeDecodeList?.find(
            value => value.code == this.valuesGrid[lineIndex][colIndex]);
        return codeDecode?.decode;
    }

    getImgName(card: Card) {
        let value: string = card.cardValue < 10 ? "0" + card.cardValue : "" + card.cardValue
        return "cards/" + card.cardSign + "-" + value + ".svg";
    }

    sortingChange(index: number) {
        if (this.tableColumnsList[index].sortOption != SortOption.NA) {
            if (index == this.activeSort) {
                this.tableColumnsList[this.activeSort].sortOption =
                    this.tableColumnsList[this.activeSort].sortOption == SortOption.Asending ? SortOption.Desending : SortOption.Asending
                if (this.tableColumnsList[this.activeSort].sortOption == SortOption.Asending) {
                    this.sortAsending();
                } else {
                    this.sortDesending();
                }

            } else {
                this.tableColumnsList[this.activeSort].sortOption = SortOption.NotSort;
                this.tableColumnsList[index].sortOption = SortOption.Asending;
                this.activeSort = index;

                this.sortAsending();
            }

            this.populateFieldGrid();
        }
    }

    sortAsending() {
        this.tableData?.sort((a, b) => a[this.tableColumnsList[this.activeSort].columnName] - b[this.tableColumnsList[this.activeSort].columnName])
    }
    sortDesending() {
        this.tableData?.sort((a, b) => b[this.tableColumnsList[this.activeSort].columnName] - a[this.tableColumnsList[this.activeSort].columnName])
    }
}
