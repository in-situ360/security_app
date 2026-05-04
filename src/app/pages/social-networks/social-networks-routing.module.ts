import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SocialNetworksPage } from './social-networks.page';

const routes: Routes = [
  {
    path: '',
    component: SocialNetworksPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SocialNetworksPageRoutingModule {}
