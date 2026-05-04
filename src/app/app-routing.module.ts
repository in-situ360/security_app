import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    //loadChildren: () => import('./pages/cover-page/cover-page.module').then( m => m.CoverPagePageModule)
    loadChildren: () => import('./pages/splash/splash.module').then( m => m.SplashPageModule)

  },
  {
    path: 'tabs',
    loadChildren: () => import('./pages/tabs/tabs.module').then( m => m.TabsPageModule)
  },
  {
    path: 'cover-page',
    loadChildren: () => import('./pages/cover-page/cover-page.module').then( m => m.CoverPagePageModule)
  },
  {
    path: 'chats',
    loadChildren: () => import('./pages/chats/chats.module').then( m => m.ChatsPageModule)
  },
  {
    path: 'details',
    loadChildren: () => import('./pages/details/details.module').then( m => m.DetailsPageModule)
  },
  {
    path: 'forgot-password',
    loadChildren: () => import('./pages/forgot-password/forgot-password.module').then( m => m.ForgotPasswordPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'idiomas',
    loadChildren: () => import('./pages/idiomas/idiomas.module').then( m => m.IdiomasPageModule)
  },
  {
    path: 'interior-chat',
    loadChildren: () => import('./pages/interior-chat/interior-chat.module').then( m => m.InteriorChatPageModule)
  },
  { 
    path: 'interior-chat/:id_chat/:nombre_chat/:ultimo_mensaje', 
    //canActivate: [AuthGuard], 
    loadChildren: () => import('./pages/interior-chat/interior-chat.module').then(m => m.InteriorChatPageModule) },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./pages/profile/profile.module').then( m => m.ProfilePageModule)
  },
  {
    path: 'register',
    loadChildren: () => import('./pages/register/register.module').then( m => m.RegisterPageModule)
  },
  {
    path: 'finish-profile',
    loadChildren: () => import('./pages/finish-profile/finish-profile.module').then( m => m.FinishProfilePageModule)
  },
  {
    path: 'rgpd',
    loadChildren: () => import('./pages/rgpd/rgpd.module').then( m => m.RGPDPageModule)
  },
  {
    path: 'tyc',
    loadChildren: () => import('./pages/tyc/tyc.module').then( m => m.TYCPageModule)
  },
  {
    path: 'edit-profile',
    loadChildren: () => import('./pages/edit-profile/edit-profile.module').then( m => m.EditProfilePageModule)
  },
  {
    path: 'notifications',
    loadChildren: () => import('./pages/notifications/notifications.module').then( m => m.NotificationsPageModule)
  },
  {
    path: 'notifications-settings',
    loadChildren: () => import('./pages/notifications-settings/notifications-settings.module').then( m => m.NotificationsSettingsPageModule)
  },
  {
    path: 'suscription',
    loadChildren: () => import('./pages/suscription/suscription.module').then( m => m.SuscriptionPageModule)
  },
  {
    path: 'suscription-detail',
    loadChildren: () => import('./pages/suscription-detail/suscription-detail.module').then( m => m.SuscriptionDetailPageModule)
  },
  {
    path: 'project-checkout',
    loadChildren: () => import('./pages/project-checkout/project-checkout.module').then( m => m.ProjectCheckoutPageModule)
  },
  {
    path: 'suscription-checkout',
    loadChildren: () => import('./pages/suscription-checkout/suscription-checkout.module').then( m => m.SuscriptionCheckoutPageModule)
  },
  {
    path: 'faq',
    loadChildren: () => import('./pages/faq/faq.module').then( m => m.FAQPageModule)
  },
  {
    path: 'locations',
    loadChildren: () => import('./pages/locations/locations.module').then( m => m.LocationsPageModule)
  },
  {
    path: 'languages',
    loadChildren: () => import('./pages/languages/languages.module').then( m => m.LanguagesPageModule)
  },
  {
    path: 'social-networks',
    loadChildren: () => import('./pages/social-networks/social-networks.module').then( m => m.SocialNetworksPageModule)
  },
  {
    path: 'profile-settings',
    loadChildren: () => import('./pages/profile-settings/profile-settings.module').then( m => m.ProfileSettingsPageModule)
  },
  {
    path: 'account-settings',
    loadChildren: () => import('./pages/account-settings/account-settings.module').then( m => m.AccountSettingsPageModule)
  },
  {
    path: 'settings',
    loadChildren: () => import('./pages/settings/settings.module').then( m => m.SettingsPageModule)
  },
  {
    path: 'my-suscription',
    loadChildren: () => import('./pages/my-suscription/my-suscription.module').then( m => m.MySuscriptionPageModule)
  },
  {
    path: 'my-ads',
    loadChildren: () => import('./pages/my-ads/my-ads.module').then( m => m.MyAdsPageModule)
  },
  {
    path: 'highlight-profile',
    loadChildren: () => import('./pages/highlight-profile/highlight-profile.module').then( m => m.HighlightProfilePageModule)
  },
  {
    path: 'stats',
    loadChildren: () => import('./pages/stats/stats.module').then( m => m.StatsPageModule)
  },
  {
    path: 'ban-users',
    loadChildren: () => import('./pages/ban-users/ban-users.module').then( m => m.BanUsersPageModule)
  },
  {
    path: 'virtual-assistant',
    loadChildren: () => import('./pages/virtual-assistant/virtual-assistant.module').then( m => m.VirtualAssistantPageModule)
  },
  {
    path: 'detail-chat',
    loadChildren: () => import('./pages/detail-chat/detail-chat.module').then( m => m.DetailChatPageModule)
  },
  {
    path: 'group-chat-detail',
    loadChildren: () => import('./pages/group-chat-detail/group-chat-detail.module').then( m => m.GroupChatDetailPageModule)
  },
  {
    path: 'individual-chat-detail',
    loadChildren: () => import('./pages/individual-chat-detail/individual-chat-detail.module').then( m => m.IndividualChatDetailPageModule)
  },
  {
    path: 'contact-us',
    loadChildren: () => import('./pages/contact-us/contact-us.module').then( m => m.ContactUsPageModule)
  },
  {
    path: 'user-search',
    loadChildren: () => import('./pages/user-search/user-search.module').then( m => m.UserSearchPageModule)
  },
  {
    path: 'other-user',
    loadChildren: () => import('./pages/other-user/other-user.module').then( m => m.OtherUserPageModule)
  },
  {
    path: 'modal-tags',
    loadChildren: () => import('./pages/modal-tags/modal-tags.module').then( m => m.ModalTagsPageModule)
  },
  {
    path: 'conectar',
    loadChildren: () => import('./pages/conectar/conectar.module').then( m => m.ConectarPageModule)
  },
  {
    path: 'user-ratings',
    loadChildren: () => import('./pages/user-ratings/user-ratings.module').then( m => m.UserRatingsPageModule)
  },
  {
    path: 'detail-proyect',
    loadChildren: () => import('./pages/detail-proyect/detail-proyect.module').then( m => m.DetailProyectPageModule)
  },
  {
    path: 'add-proyect',
    loadChildren: () => import('./pages/add-proyect/add-proyect.module').then( m => m.AddProyectPageModule)
  },
  {
    path: 'modal-keycode',
    loadChildren: () => import('./pages/modal-keycode/modal-keycode.module').then( m => m.ModalKeycodePageModule)
  },
  {
    path: 'workspace',
    loadChildren: () => import('./pages/workspace/workspace.module').then( m => m.WorkspacePageModule)
  },
  {
    path: 'new-project',
    loadChildren: () => import('./pages/new-project/new-project.module').then( m => m.NewProjectPageModule)
  },
  {
    path: 'add-participants',
    loadChildren: () => import('./pages/add-participants/add-participants.module').then( m => m.AddParticipantsPageModule)
  },
  {
    path: 'grant-permissions',
    loadChildren: () => import('./pages/grant-permissions/grant-permissions.module').then( m => m.GrantPermissionsPageModule)
  },
  {
    path: 'folders',
    loadChildren: () => import('./pages/folders/folders.module').then( m => m.FoldersPageModule)
  },
  {
    path: 'new-folder',
    loadChildren: () => import('./pages/new-folder/new-folder.module').then( m => m.NewFolderPageModule)
  },
  {
    path: 'my-profile',
    loadChildren: () => import('./pages/my-profile/my-profile.module').then( m => m.MyProfilePageModule)
  },
  {
    path: 'my-jobs',
    loadChildren: () => import('./pages/my-jobs/my-jobs.module').then( m => m.MyJobsPageModule)
  },
  {
    path: 'upload-advertisement',
    loadChildren: () => import('./pages/upload-advertisement/upload-advertisement.module').then( m => m.UploadAdvertisementPageModule)
  },
  {
    path: 'buscador',
    loadChildren: () => import('./pages/buscador/buscador.module').then( m => m.BuscadorPageModule)
  },
  {
    path: 'buscador2',
    loadChildren: () => import('./pages/buscador2/buscador2.module').then( m => m.Buscador2PageModule)
  },
  {
    path: 'splash',
    loadChildren: () => import('./pages/splash/splash.module').then( m => m.SplashPageModule)
  },
  {
    path: 'invitado-modal',
    loadChildren: () => import('./pages/invitado-modal/invitado-modal.module').then( m => m.InvitadoModalPageModule)
  },
  {
    path: 'info-modal',
    loadChildren: () => import('./pages/info-modal/info-modal.module').then( m => m.InfoModalPageModule)
  },
  {
    path: 'select-modal',
    loadChildren: () => import('./pages/select-modal/select-modal.module').then( m => m.SelectModalPageModule)
  },
  {
    path: 'range-price-modal',
    loadChildren: () => import('./pages/range-price-modal/range-price-modal.module').then( m => m.RangePriceModalPageModule)
  },
  {
    path: 'folder-content',
    loadChildren: () => import('./pages/folder-content/folder-content.module').then( m => m.FolderContentPageModule)
  },
  {
    path: 'modal-multimedia',
    loadChildren: () => import('./pages/modal-multimedia/modal-multimedia.module').then( m => m.ModalMultimediaPageModule)
  },
  {
    path: 'image-cropper',
    loadChildren: () => import('./pages/image-cropper/image-cropper.module').then( m => m.ImageCropperPageModule)
  },
  {
    path: 'modal-message',
    loadChildren: () => import('./pages/modal-message/modal-message.module').then( m => m.ModalMessagePageModule)
  },
  {
    path: 'interior-pnchat',
    loadChildren: () => import('./pages/interior-pnchat/interior-pnchat.module').then( m => m.InteriorPnchatPageModule)
  },
  {
    path: 'pnchats',
    loadChildren: () => import('./pages/pnchats/pnchats.module').then( m => m.PnchatsPageModule)
  },
  {
    path: 'interior-pgchat',
    loadChildren: () => import('./pages/interior-pgchat/interior-pgchat.module').then( m => m.InteriorPgchatPageModule)
  },
  {
    path: 'add-participants-to-group',
    loadChildren: () => import('./pages/add-participants-to-group/add-participants-to-group.module').then( m => m.AddParticipantsToGroupPageModule)
  },
  {
    path: 'modal-filt-text',
    loadChildren: () => import('./pages/modal-filt-text/modal-filt-text.module').then( m => m.ModalFiltTextPageModule)
  },
  {
    path: 'all-image-cropper',
    loadChildren: () => import('./pages/all-image-cropper/all-image-cropper.module').then( m => m.AllImageCropperPageModule)
  },
  {
    path: 'edit-project',
    loadChildren: () => import('./pages/edit-project/edit-project.module').then( m => m.EditProjectPageModule)
  },
  {
    path: 'edit-participants',
    loadChildren: () => import('./pages/edit-participants/edit-participants.module').then( m => m.EditParticipantsPageModule)
  },
  {
    path: 'languaje-select',
    loadChildren: () => import('./pages/languaje-select/languaje-select.module').then( m => m.LanguajeSelectPageModule)
  },
  {
    path: 'select-useroptions-modal',
    loadChildren: () => import('./pages/select-useroptions-modal/select-useroptions-modal.module').then( m => m.SelectUseroptionsModalPageModule)
  },
  {
    path: 'select-report-modal',
    loadChildren: () => import('./pages/select-report-modal/select-report-modal.module').then( m => m.SelectReportModalPageModule)
  },
  {
    path: 'add-rating',
    loadChildren: () => import('./pages/add-rating/add-rating.module').then( m => m.AddRatingPageModule)
  },
  {
    path: 'payment',
    loadChildren: () => import('./pages/payment/payment.module').then( m => m.PaymentPageModule)
  },
  {
    path: 'usersetags',
    loadChildren: () => import('./pages/usersetags/usersetags.module').then( m => m.UsersetagsPageModule)
  },
  {
    path: 'users-follow',
    loadChildren: () => import('./pages/users-follow/users-follow.module').then( m => m.UsersFollowPageModule)
  },
  {
    path: 'rating-modal',
    loadChildren: () => import('./pages/rating-modal/rating-modal.module').then( m => m.RatingModalPageModule)
  },
  {
    path: 'select-chatoptions-modal',
    loadChildren: () => import('./pages/select-chatoptions-modal/select-chatoptions-modal.module').then( m => m.SelectChatoptionsModalPageModule)
  },
  {
    path: 'add-remove-users-modal',
    loadChildren: () => import('./pages/add-remove-users-modal/add-remove-users-modal.module').then( m => m.AddRemoveUsersModalPageModule)
  },
  {
    path: 'detail-project',
    loadChildren: () => import('./pages/detail-project/detail-project.module').then( m => m.DetailProjectPageModule)
  },
  {
    path: 'participants-list',
    loadChildren: () => import('./pages/participants-list/participants-list.module').then( m => m.ParticipantsListPageModule)
  },
  {
    path: 'users-follow-modal',
    loadChildren: () => import('./pages/users-follow-modal/users-follow-modal.module').then( m => m.UsersFollowModalPageModule)
  },
  {
    path: 'select-advertisementoptions-modal',
    loadChildren: () => import('./pages/select-advertisementoptions-modal/select-advertisementoptions-modal.module').then( m => m.SelectAdvertisementoptionsModalPageModule)
  },
  {
    path: 'participats-permissions-list',
    loadChildren: () => import('./pages/participats-permissions-list/participats-permissions-list.module').then( m => m.ParticipatsPermissionsListPageModule)
  },
  {
    path: 'create-pnchat-modal',
    loadChildren: () => import('./pages/create-pnchat-modal/create-pnchat-modal.module').then( m => m.CreatePnchatModalPageModule)
  },
  {
    path: 'splash-modal',
    loadChildren: () => import('./pages/splash-modal/splash-modal.module').then( m => m.SplashModalPageModule)
  },
  {
    path: 'modal-request-permissions',
    loadChildren: () => import('./pages/modal-request-permissions/modal-request-permissions.module').then( m => m.ModalRequestPermissionsPageModule)
  },
  {
    path: 'job-image-cropper',
    loadChildren: () => import('./pages/job-image-cropper/job-image-cropper.module').then( m => m.JobImageCropperPageModule)
  },
  {
    path: 'modal-edit-folder',
    loadChildren: () => import('./pages/modal-edit-folder/modal-edit-folder.module').then( m => m.ModalEditFolderPageModule)
  },
  {
    path: 'new-folder-content',
    loadChildren: () => import('./pages/new-folder-content/new-folder-content.module').then( m => m.NewFolderContentPageModule)
  },
  {
    path: 'modal-menu-folder',
    loadChildren: () => import('./pages/modal-menu-folder/modal-menu-folder.module').then( m => m.ModalMenuFolderPageModule)
  },
  {
    path: 'modal-add-folder',
    loadChildren: () => import('./pages/modal-add-folder/modal-add-folder.module').then( m => m.ModalAddFolderPageModule)
  },
  {
    path: 'select-folderoptions-modal',
    loadChildren: () => import('./pages/select-folderoptions-modal/select-folderoptions-modal.module').then( m => m.SelectFolderoptionsModalPageModule)
  },
  {
    path: 'select-menu-edit-media',
    loadChildren: () => import('./pages/select-menu-edit-media/select-menu-edit-media.module').then( m => m.SelectMenuEditMediaPageModule)
  },
  {
    path: 'select-menu-chat',
    loadChildren: () => import('./pages/select-menu-chat/select-menu-chat.module').then( m => m.SelectMenuChatPageModule)
  },
  {
    path: 'billing-data',
    loadChildren: () => import('./pages/billing-data/billing-data.module').then( m => m.BillingDataPageModule)
  },
  {
    path: 'finish-register',
    loadChildren: () => import('./pages/finish-register/finish-register.module').then( m => m.FinishRegisterPageModule)
  },
  {
    path: 'my-billings',
    loadChildren: () => import('./pages/my-billings/my-billings.module').then( m => m.MyBillingsPageModule)
  },
  {
    path: 'modal-billing-pdf',
    loadChildren: () => import('./pages/modal-billing-pdf/modal-billing-pdf.module').then( m => m.ModalBillingPdfPageModule)
  },
  {
    path: 'modal-link-folder',
    loadChildren: () => import('./pages/modal-link-folder/modal-link-folder.module').then( m => m.ModalLinkFolderPageModule)
  },
  {
    path: 'modal-menu-project',
    loadChildren: () => import('./pages/modal-menu-project/modal-menu-project.module').then( m => m.ModalMenuProjectPageModule)
  },
  {
    path: 'modal-billing-data',
    loadChildren: () => import('./pages/modal-billing-data/modal-billing-data.module').then( m => m.ModalBillingDataPageModule)
  }

];
@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
