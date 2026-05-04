import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SelectReportModalPage } from './select-report-modal.page';

const routes: Routes = [
  {
    path: '',
    component: SelectReportModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SelectReportModalPageRoutingModule {}
