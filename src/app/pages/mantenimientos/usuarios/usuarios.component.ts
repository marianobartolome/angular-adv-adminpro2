import { Component, OnDestroy, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { delay } from 'rxjs/operators';

import { Usuario } from 'src/app/models/usuario.model';

import { BusquedasService } from 'src/app/services/busquedas.service';
import { ModalImagenService } from 'src/app/services/modal-imagen.service';
import { UsuarioService } from 'src/app/services/usuario.service';
import { Subscription } from 'rxjs';




@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styles: [
  ]
})
export class UsuariosComponent implements OnInit,OnDestroy {

  public totalUsuarios: number=0;
  public usuarios:Usuario[]=[];
  public usuariosTemp:Usuario[]=[];

  public imgSubs!:Subscription;
  public desde:number=0;
  public cargando:boolean=true;

  constructor(  private usuarioService:UsuarioService,
                private busquedasService:BusquedasService,
                private modalImagenService:ModalImagenService) { }
  ngOnDestroy(): void {
    this.imgSubs.unsubscribe();
  }

  ngOnInit(): void {
    this.cargarUsuarios();
    this.imgSubs=this.modalImagenService.nuevaImagen
      .pipe(delay(500))    
      .subscribe(img=> this.cargarUsuarios());
  }

  cargarUsuarios(){
    this.cargando=true;
    this.usuarioService.cargarUsuarios(this.desde)
      .subscribe( ({ total,usuarios }) =>{
        this.totalUsuarios=total;
        
        this.usuarios=usuarios; 
        this.usuariosTemp=usuarios;
        this.cargando=false; 
        
      })
  }

  cambiarPagina(valor:number){
    this.desde+=valor;

    if (this.desde < 0) {
      this.desde = 0;

    } else if(this.desde >= this.totalUsuarios){
      this.desde-= valor;
    }

    this.cargarUsuarios();
  }

  buscar(termino:string){
    console.log(this.usuariosTemp);
    if (termino.length===0) {
      return this.usuarios= this.usuariosTemp;
    } 
      return this.busquedasService.buscar('usuarios',termino)
          .subscribe( (resp: any)=> {
            this.usuarios=resp;
      });
      
  }

  eliminarUsuario(usuario:Usuario){
    if(usuario.uid===this.usuarioService.uid){
      return Swal.fire('Error','No puede borrarse a sí mismo','error');
    }
    
    return Swal.fire({
      title: '¿Borrar usuario?',
      text: `Esta por borrar a ${ usuario.nombre}`,
      icon: 'question',
      showCancelButton: true,
      
      confirmButtonText: 'Si, borrarlo'
    }).then((result) => {
      if (result.isConfirmed) {
       this.usuarioService.eliminarUsuario(usuario)
          .subscribe( _resp => {
            this.cargarUsuarios();
            Swal.fire(
              'Usuario borrado', 
              `${usuario.nombre} se ha borrado correctamente`,
              'success'
            );
          });
      }
    })
  }

  cambiarRole(usuario:Usuario){
    this.usuarioService.guardarUsuario(usuario)
      .subscribe( resp=>{
        console.log(resp);
      })
  }

  abrirModal(usuario:Usuario){
    console.log(usuario);
    this.modalImagenService.abrirModal('usuarios', usuario.uid, usuario.img);

  }

}
