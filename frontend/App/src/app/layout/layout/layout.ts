import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar/sidebar';
import { Header } from '../header/header';
import { MobileMenu } from '../mobile-menu/mobile-menu';


@Component({
  selector: 'app-layout',
  imports: [CommonModule, RouterModule, Sidebar, Header, MobileMenu],
  templateUrl: './layout.html',
  styleUrl: './layout.scss'
})
export class Layout {
  isMobileMenuOpen = false;

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }
}
