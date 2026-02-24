import { Component } from '@angular/core';
import { PokemonListComponent } from './features/pokemon/components/pokemon-list/pokemon-list.component';

/**
 * AppComponent
 * 
 * Root component of the Pokemon Demo Web Application.
 * Renders the main PokemonListComponent which orchestrates the entire Pokemon display functionality.
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [PokemonListComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  title = 'Pokemon Demo';
}
