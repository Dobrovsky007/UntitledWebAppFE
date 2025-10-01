import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar/sidebar';
import { Header } from '../header/header';


@Component({
  selector: 'app-layout',
  imports: [CommonModule, RouterModule, Sidebar, Header],
  templateUrl: './layout.html',
  styleUrl: './layout.scss'
})
export class Layout {

}
