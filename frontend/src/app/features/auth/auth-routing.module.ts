import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login'; // Assicurati di aver creato questo componente

const routes: Routes = [
  // Il path vuoto '' qui corrisponde a '/auth' grazie al lazy loading
  { path: '', component: LoginComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)], // IMPORTANTE: forChild e non forRoot
  exports: [RouterModule]
})
export class AuthRoutingModule { }