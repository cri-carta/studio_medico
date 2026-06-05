import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms'; // Ti servirà per i form di login
import { AuthRoutingModule } from './auth-routing.module';
import { LoginComponent } from './login/login';

@NgModule({
  imports: [
    CommonModule,
    LoginComponent,
    ReactiveFormsModule,
    AuthRoutingModule
  ]
})
export class AuthModule { } 