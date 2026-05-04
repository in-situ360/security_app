import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { TranslateService } from '@ngx-translate/core'; // MULTI LENGUAJE
import { UtilitiesService } from 'src/app/services/utilities.service';
import { ApiService } from 'src/app/services/api.service';


@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {
  // Variables para almacenar las traducciones
  public home: string;
  public buscador: string;
  public workspace: string;
  public chat: string;
  public perfil: string;

  public hayNuevosMensajes: boolean = false;
  public hayNuevasSolicitudes: boolean = false;

  // Traducciones disponibles
  /*private translations = {
    es: {
      home: 'Inicio',
      buscador: 'Buscador',
      workspace: 'Workspace',
      chat: 'Chat',
      perfil: 'Perfil',
    },
    en: {
      home: 'Home',
      buscador: 'Search',
      workspace: 'Workspace',
      chat: 'Chat',
      perfil: 'Profile',
    },
  };*/


  private translations = {
    es: {
      home: 'Inicio',
      buscador: 'Buscador',
      workspace: 'Workspace',
      chat: 'Chat',
      perfil: 'Perfil',
    },
    en: {
      home: 'Home',
      buscador: 'Search',
      workspace: 'Workspace',
      chat: 'Chat',
      perfil: 'Profile',
    },
    fr: {
      home: 'Accueil',
      buscador: 'Recherche',
      workspace: 'Espace de travail',
      chat: 'Chat',
      perfil: 'Profil',
    },
    de: {
      home: 'Startseite',
      buscador: 'Suche',
      workspace: 'Arbeitsbereich',
      chat: 'Chat',
      perfil: 'Profil',
    },
    it: {
      home: 'Home',
      buscador: 'Ricerca',
      workspace: 'Workspace',
      chat: 'Chat',
      perfil: 'Profilo',
    },
    pt: {
      home: 'Início',
      buscador: 'Busca',
      workspace: 'Espaço de trabalho',
      chat: 'Chat',
      perfil: 'Perfil',
    },
    ru: {
      home: 'Главная',
      buscador: 'Поиск',
      workspace: 'Рабочее пространство',
      chat: 'Чат',
      perfil: 'Профиль',
    },
    'zh-CN': {
      home: '首页',
      buscador: '搜索',
      workspace: '工作区',
      chat: '聊天',
      perfil: '个人资料',
    },
    'zh-TW': {
      home: '首頁',
      buscador: '搜尋',
      workspace: '工作區',
      chat: '聊天',
      perfil: '個人資料',
    },
    ja: {
      home: 'ホーム',
      buscador: '検索',
      workspace: 'ワークスペース',
      chat: 'チャット',
      perfil: 'プロフィール',
    },
    ko: {
      home: '홈',
      buscador: '검색',
      workspace: '작업 공간',
      chat: '채팅',
      perfil: '프로필',
    },
    ar: {
      home: 'الصفحة الرئيسية',
      buscador: 'بحث',
      workspace: 'مساحة العمل',
      chat: 'دردشة',
      perfil: 'الملف الشخصي',
    },
    hi: {
      home: 'मुखपृष्ठ',
      buscador: 'खोज',
      workspace: 'कार्यक्षेत्र',
      chat: 'चैट',
      perfil: 'प्रोफ़ाइल',
    },
    bn: {
      home: 'হোম',
      buscador: 'অনুসন্ধান',
      workspace: 'কর্মক্ষেত্র',
      chat: 'চ্যাট',
      perfil: 'প্রোফাইল',
    },
    nl: {
      home: 'Startpagina',
      buscador: 'Zoeken',
      workspace: 'Werkruimte',
      chat: 'Chat',
      perfil: 'Profiel',
    },
    sv: {
      home: 'Hem',
      buscador: 'Sök',
      workspace: 'Arbetsyta',
      chat: 'Chat',
      perfil: 'Profil',
    },
    no: {
      home: 'Hjem',
      buscador: 'Søk',
      workspace: 'Arbeidsområde',
      chat: 'Chat',
      perfil: 'Profil',
    },
    fi: {
      home: 'Aloitus',
      buscador: 'Haku',
      workspace: 'Työtila',
      chat: 'Keskustelu',
      perfil: 'Profiili',
    },
    da: {
      home: 'Hjem',
      buscador: 'Søg',
      workspace: 'Arbejdsområde',
      chat: 'Chat',
      perfil: 'Profil',
    },
    pl: {
      home: 'Strona główna',
      buscador: 'Szukaj',
      workspace: 'Obszar roboczy',
      chat: 'Czat',
      perfil: 'Profil',
    },
    tr: {
      home: 'Ana sayfa',
      buscador: 'Arama',
      workspace: 'Çalışma alanı',
      chat: 'Sohbet',
      perfil: 'Profil',
    },
    el: {
      home: 'Αρχική',
      buscador: 'Αναζήτηση',
      workspace: 'Χώρος εργασίας',
      chat: 'Συνομιλία',
      perfil: 'Προφίλ',
    },
    cs: {
      home: 'Domov',
      buscador: 'Hledat',
      workspace: 'Pracovní prostor',
      chat: 'Chat',
      perfil: 'Profil',
    },
    he: {
      home: 'דף הבית',
      buscador: 'חיפוש',
      workspace: 'מרחב עבודה',
      chat: 'צ\'אט',
      perfil: 'פרופיל',
    },
    hu: {
      home: 'Főoldal',
      buscador: 'Keresés',
      workspace: 'Munkaterület',
      chat: 'Csevegés',
      perfil: 'Profil',
    },
    vi: {
      home: 'Trang chủ',
      buscador: 'Tìm kiếm',
      workspace: 'Khu vực làm việc',
      chat: 'Trò chuyện',
      perfil: 'Hồ sơ',
    },
    id: {
      home: 'Beranda',
      buscador: 'Pencarian',
      workspace: 'Ruang kerja',
      chat: 'Obrolan',
      perfil: 'Profil',
    },
    th: {
      home: 'หน้าแรก',
      buscador: 'ค้นหา',
      workspace: 'พื้นที่ทำงาน',
      chat: 'แชท',
      perfil: 'โปรไฟล์',
    },
    ca: {
      home: 'Inici',
      buscador: 'Cercar',
      workspace: 'Espai de treball',
      chat: 'Xat',
      perfil: 'Perfil',
    },
    ro: {
      home: 'Acasă',
      buscador: 'Căutare',
      workspace: 'Spațiu de lucru',
      chat: 'Chat',
      perfil: 'Profil',
    },
    uk: {
      home: 'Головна',
      buscador: 'Пошук',
      workspace: 'Робоча зона',
      chat: 'Чат',
      perfil: 'Профіль',
    },
    sr: {
      home: 'Početna',
      buscador: 'Pretraga',
      workspace: 'Radni prostor',
      chat: 'Čat',
      perfil: 'Profil',
    },
    hr: {
      home: 'Početna',
      buscador: 'Pretraga',
      workspace: 'Radni prostor',
      chat: 'Čavrljanje',
      perfil: 'Profil',
    },
    sk: {
      home: 'Domov',
      buscador: 'Hľadanie',
      workspace: 'Pracovný priestor',
      chat: 'Chat',
      perfil: 'Profil',
    },
    lv: {
      home: 'Sākumlapa',
      buscador: 'Meklēšana',
      workspace: 'Darba zona',
      chat: 'Čats',
      perfil: 'Profils',
    },
    et: {
      home: 'Avaleht',
      buscador: 'Otsing',
      workspace: 'Tööruum',
      chat: 'Vestlus',
      perfil: 'Profiil',
    }
  };
  

  // Arreglo de páginas
  public pages = [
    { tab: 'home', name: 'Inicio', icon: 'assets/icons/home.svg' },
    { tab: 'user-search', name: 'Buscador', icon: 'assets/icons/buscador.svg' },
    { tab: 'workspace', name: 'Workspace', icon: 'assets/icons/workspace.svg' },
    { tab: 'chats', name: 'Chat', icon: 'assets/icons/chat.svg' },
    { tab: 'my-profile', name: 'Perfil', icon: 'assets/icons/perfil.svg' }
  ];

  isAndroid: boolean = false;
  isIOS: boolean = false;

  constructor(private utilitiesService: UtilitiesService,
              private translate: TranslateService,
              private apiService: ApiService,
              public platform: Platform) {
    
    this.isIOS = this.platform.is('ios');
    this.isAndroid = this.platform.is('android');

    this.apiService.translatesChanges.subscribe(() => {
      console.log("cambio tabs traduccion>>>");
      this.utilitiesService.getLang().then((result) => {
        const prefijo = result;
  
        console.log(prefijo); // Esto debería mostrar "en"
        if (prefijo==null) {
          console.log("No idioma");
          this.utilitiesService.saveLang('es');
    
          
        } else {
          this.setLanguage(prefijo || 'es'); // Cambiar a 'es' si no hay idioma
        }
      });
      
    });

    console.log(this.translate.langs.length);
    //console.log(this.utilitiesService.getLang());
    console.log('---------');
   // const prefijo = this.someFunction();
    this.utilitiesService.getLang().then((result) => {
      const prefijo = result;
      console.log(prefijo); // Esto debería mostrar "en"
      if (prefijo==null) {
        console.log("No idioma");
        this.utilitiesService.saveLang('es');
  
        
      } else {
        this.setLanguage(prefijo || 'es'); // Cambiar a 'es' si no hay idioma
      }
    });
 // console.log(prefijo);
    // Verificar si no hay idioma establecido y guardarlo
    

    

    this.utilitiesService.getUserId().then((result) => {
      this.apiService.chatUserStatus({userId:result}).subscribe((result) => {
        console.log('DATOS',result);
        if(result['state']){
  
        }
  
      });
    });

    
    
  }


  

  async someFunction() {
    const prefijo = await this.utilitiesService.getLang();
    console.log(prefijo); // Esto debería mostrar "en" o el valor resuelto de la promesa
  }

  // Método para establecer el idioma
  private setLanguage(lang: string) {
    /*this.home = this.translations[lang].home;
    this.buscador = this.translations[lang].buscador;
    this.workspace = this.translations[lang].workspace;
    this.chat = this.translations[lang].chat;
    this.perfil = this.translations[lang].perfil;

    this.pages = [
      { tab: 'home', name: this.home, icon: 'assets/icons/home.svg' },
      { tab: 'user-search', name: this.buscador, icon: 'assets/icons/buscador.svg' },
      { tab: 'workspace', name: this.workspace, icon: 'assets/icons/workspace.svg' },
      { tab: 'chats', name: this.chat, icon: 'assets/icons/chat.svg' },
      { tab: 'my-profile', name: this.perfil, icon: 'assets/icons/perfil.svg' }
    ];*/

    this.actualizarTabs();
  }




  ngOnInit() {
    // Suscribirse a notificaciones de nuevos mensajes
    /*this.apiService.nuevosMensajes$.subscribe(hayNuevos => {
      this.hayNuevosMensajes = hayNuevos;
      this.actualizarTabs();
    });

    // Suscribirse a notificaciones de nuevas solicitudes
    this.apiService.nuevasSolicitudes$.subscribe(hayNuevas => {
      this.hayNuevasSolicitudes = hayNuevas;
      this.actualizarTabs();
    });*/

    this.actualizarTabs();

    this.apiService.chatUserStatusChanges.subscribe(() => {
      this.actualizarTabs();
    });

  }

  actualizarTabs0() {
    this.utilitiesService.getLang().then((result) => {
      let prefijo = result || 'es';
  
      this.utilitiesService.getUserId().then((result) => {
        this.apiService.chatUserStatus({ userId: result }).subscribe((status) => {
          const nuevosMensajes = status['mensajesNuevos'] > 0;
          const nuevasSolicitudes = status['solicitudesNuevas'] > 0;
  
          // Solo actualizamos si el estado cambia
          if (this.hayNuevosMensajes !== nuevosMensajes || this.hayNuevasSolicitudes !== nuevasSolicitudes) {
            this.hayNuevosMensajes = nuevosMensajes;
            this.hayNuevasSolicitudes = nuevasSolicitudes;
  
            // Buscamos el tab de "chats" y actualizamos su icono en lugar de recrear todo el array
            this.pages = this.pages.map(p => 
              p.tab === 'chats' ? { 
                ...p, 
                icon: (this.hayNuevosMensajes || this.hayNuevasSolicitudes) 
                  ? 'assets/icons/chat2.svg' 
                  : 'assets/icons/chat.svg' 
              } : p
            );
          }
        });
      });
    });
  }
  


  actualizarTabs1() {

    this.utilitiesService.getLang().then((result) => {

      let prefijo = result;
      console.log(prefijo); // Esto debería mostrar "en"
      if (prefijo==null) {
        console.log("No idioma");
        this.utilitiesService.saveLang('es');
        prefijo='es';
      }

      this.home = this.translations[prefijo].home;
      this.buscador = this.translations[prefijo].buscador;
      this.workspace = this.translations[prefijo].workspace;
      this.chat = this.translations[prefijo].chat;
      this.perfil = this.translations[prefijo].perfil;



      this.utilitiesService.getUserId().then((result) => {
        this.apiService.chatUserStatus({userId:result}).subscribe((result) => {
          console.log('DATOS',result);
          if(result['mensajesNuevos']>0){
            this.hayNuevosMensajes=true;
          }
          else{
            this.hayNuevosMensajes=false;
          }

          if(result['solicitudesNuevas']>0){
            this.hayNuevasSolicitudes=true;
          }
          else{
            this.hayNuevasSolicitudes=false;
          }



          this.pages = [
            { tab: 'home', name: this.home, icon: 'assets/icons/home.svg' },
            { tab: 'user-search', name: this.buscador, icon: 'assets/icons/buscador.svg' },
            { tab: 'workspace', name: this.workspace, icon: 'assets/icons/workspace.svg' },
            { 
              tab: 'chats', 
              name: this.chat, 
              icon: (this.hayNuevosMensajes || this.hayNuevasSolicitudes)
                ? 'assets/icons/chat2.svg' 
                : 'assets/icons/chat.svg' 
            },
            { tab: 'my-profile', name: this.perfil, icon: 'assets/icons/perfil.svg' }
          ];


    
        });
      });




      


    });
  }




  actualizarTabspresubida() {
  this.utilitiesService.getLang().then((result) => {
    let prefijo = result || 'es';

    if (!prefijo) {
      console.log("No idioma");
      this.utilitiesService.saveLang('es');
      prefijo = 'es';
    }

    // Asignar traducciones
    this.home = this.translations[prefijo].home;
    this.buscador = this.translations[prefijo].buscador;
    this.workspace = this.translations[prefijo].workspace;
    this.chat = this.translations[prefijo].chat;
    this.perfil = this.translations[prefijo].perfil;

    // Obtener el userId y estado del chat
    this.utilitiesService.getUserId().then((userId) => {
      this.apiService.chatUserStatus({ userId }).subscribe((status) => {
        const nuevosMensajes = status['mensajesNuevos'] > 0;
        const nuevasSolicitudes = status['solicitudesNuevas'] > 0;

        // Actualizar estado interno
        this.hayNuevosMensajes = nuevosMensajes;
        this.hayNuevasSolicitudes = nuevasSolicitudes;

        // Reconstruir tabs con traducciones y nuevo estado
        this.pages = [
          { tab: 'home', name: this.home, icon: 'assets/icons/home.svg' },
          { tab: 'user-search', name: this.buscador, icon: 'assets/icons/buscador.svg' },
          { tab: 'workspace', name: this.workspace, icon: 'assets/icons/workspace.svg' },
          { 
            tab: 'chats', 
            name: this.chat, 
            icon: (this.hayNuevosMensajes || this.hayNuevasSolicitudes)
              ? 'assets/icons/chat2.svg' 
              : 'assets/icons/chat.svg' 
          },
          { tab: 'my-profile', name: this.perfil, icon: 'assets/icons/perfil.svg' }
        ];
      });
    });
  });
}

actualizarTabs() {
  this.utilitiesService.getLang().then((result) => {
    let prefijo = result || 'es';

    if (!prefijo) {
      console.log("No idioma");
      this.utilitiesService.saveLang('es');
      prefijo = 'es';
    }

    // Asignar traducciones
    this.home = this.translations[prefijo].home;
    this.buscador = this.translations[prefijo].buscador;
    this.workspace = this.translations[prefijo].workspace;
    this.chat = this.translations[prefijo].chat;
    this.perfil = this.translations[prefijo].perfil;

    // Obtener el userId y estado del chat
    this.utilitiesService.getUserId().then((userId) => {
      this.apiService.chatUserStatus({ userId }).subscribe((status) => {
        const nuevosMensajes = status['mensajesNuevos'] > 0;
        const nuevasSolicitudes = status['solicitudesNuevas'] > 0;

        // Actualizar estado interno
        this.hayNuevosMensajes = nuevosMensajes;
        this.hayNuevasSolicitudes = nuevasSolicitudes;

        // ACTUALIZAR SIN REEMPLAZAR ARRAY
        this.pages.forEach(p => {
          switch (p.tab) {
            case 'home':
              p.name = this.home;
              break;
            case 'user-search':
              p.name = this.buscador;
              break;
            case 'workspace':
              p.name = this.workspace;
              break;
            case 'chats':
              p.name = this.chat;
              p.icon = (this.hayNuevosMensajes || this.hayNuevasSolicitudes)
                ? 'assets/icons/chat2.svg'
                : 'assets/icons/chat.svg';
              break;
            case 'my-profile':
              p.name = this.perfil;
              break;
          }
        });
      });
    });
  });
}



}
