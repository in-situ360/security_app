import { Component, OnInit, OnDestroy } from '@angular/core';
import { UtilitiesService } from 'src/app/services/utilities.service';

@Component({
  selector: 'app-insitu-loading',
  templateUrl: './insitu-loading.component.html',
  styleUrls: ['./insitu-loading.component.scss'],
})
export class InsituLoadingComponent implements OnInit, OnDestroy {

  private timeoutId: any = null;
  public showComponent: boolean = false;

  constructor(private utilities: UtilitiesService) { }

  ngOnInit() {
    // Iniciar el timer cuando el componente se muestra
    this.showComponent=true;
    this.timeoutId = setTimeout(() => {
      //this.utilities.showToast('hola mundo');
    }, 2000); // 2 segundos
  }

  ngOnDestroy() {
    // Limpiar el timer cuando el componente se destruye
    if (this.timeoutId) {
       this.showComponent=false;
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

}
