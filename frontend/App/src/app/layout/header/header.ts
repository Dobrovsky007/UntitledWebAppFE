import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  imports: [CommonModule,
    MatToolbarModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatInputModule,
    FormsModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  searchQuery = '';
  showSearch = false;

  toggleSearch() {
    this.showSearch = !this.showSearch;
    // Optionally focus the input when shown
    setTimeout(() => {
      const el = document.getElementById('search-input');
      if (el) (el as HTMLInputElement).focus();
    }, 0);
  }
}
