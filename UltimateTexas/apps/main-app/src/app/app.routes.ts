import { Route } from '@angular/router';
import { BatchCalculationComponent } from './components/batch-calculation/batch-calculation.component';
import { MainComponent } from './components/main/main.component';
import { NovoPokerComponent } from './components/novo-poker/novo-poker.component';

export const appRoutes: Route[] = [

    { path: '', redirectTo: 'main', pathMatch: 'full' },
    { path: 'main', component: MainComponent },
    { path: 'batch', component: BatchCalculationComponent },
    { path: 'novo', component: NovoPokerComponent }
];
