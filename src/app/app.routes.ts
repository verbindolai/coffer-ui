import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./components/coin-list/coin-list.component').then(m => m.CoinListComponent)
  },
  {
    path: 'coins/new',
    loadComponent: () => import('./components/coin-form/coin-form.component').then(m => m.CoinFormComponent)
  },
  {
    path: 'coins/:id',
    loadComponent: () => import('./components/coin-details/coin-details.component').then(m => m.CoinDetailsComponent)
  },
  {
    path: 'coins/:id/edit',
    loadComponent: () => import('./components/coin-form/coin-form.component').then(m => m.CoinFormComponent)
  },
  {
    path: 'portfolio',
    loadComponent: () => import('./components/portfolio-overview/portfolio-overview.component').then(m => m.PortfolioOverviewComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
