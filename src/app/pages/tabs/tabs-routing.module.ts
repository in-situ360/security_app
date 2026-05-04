import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'home',
        loadChildren: () => import('../home/home.module').then(m => m.HomePageModule)
      },
      {
        path: 'user-search',
        loadChildren: () => import('../user-search/user-search.module').then(m => m.UserSearchPageModule)
      },
      {
        path: 'workspace',
        loadChildren: () => import('../workspace/workspace.module').then( m => m.WorkspacePageModule)

      },
      {
        path: 'chats',
        loadChildren: () => import('../chats/chats.module').then(m => m.ChatsPageModule)
      },
      {
        path: 'my-profile',
        loadChildren: () => import('../my-profile/my-profile.module').then( m => m.MyProfilePageModule)

      },
      {
        path: '',
        redirectTo: '/tabs/home',
        pathMatch: 'full'
      }
    ]
  },
  {
    path: '',
    redirectTo: '/tabs/home',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class TabsPageRoutingModule {}

