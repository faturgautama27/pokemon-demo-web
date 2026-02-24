import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { Pokemon } from '../../../../core/models/pokemon.model';
import { PokemonActions } from '../../store/pokemon.actions';
import { PokemonSelectors } from '../../store/pokemon.selectors';
import { PokemonCardComponent } from '../pokemon-card/pokemon-card.component';
import { PaginationComponent } from '../pagination/pagination.component';
import { PokemonDetailComponent } from '../pokemon-detail/pokemon-detail.component';

/**
 * PokemonListComponent
 * 
 * Main container component displaying the grid of Pokemon cards and pagination controls.
 * Orchestrates the Pokemon list view by connecting to NGXS store for state management.
 */
@Component({
    selector: 'app-pokemon-list',
    standalone: true,
    imports: [
        CommonModule,
        PokemonCardComponent,
        PaginationComponent,
        PokemonDetailComponent
    ],
    templateUrl: './pokemon-list.component.html',
    styleUrls: ['./pokemon-list.component.scss']
})
export class PokemonListComponent implements OnInit {
    // State observables
    pokemonList$: Observable<Pokemon[]>;
    loading$: Observable<boolean>;
    error$: Observable<string | null>;
    currentPage$: Observable<number>;
    totalPages$: Observable<number>;
    selectedPokemon$: Observable<Pokemon | null>;
    isDetailVisible$: Observable<boolean>;

    constructor(private store: Store) {
        // Subscribe to Pokemon state selectors
        this.pokemonList$ = this.store.select(PokemonSelectors.pokemonList);
        this.loading$ = this.store.select(PokemonSelectors.loading);
        this.error$ = this.store.select(PokemonSelectors.error);
        this.currentPage$ = this.store.select(PokemonSelectors.currentPage);
        this.totalPages$ = this.store.select(PokemonSelectors.totalPages);
        this.selectedPokemon$ = this.store.select(PokemonSelectors.selectedPokemon);
        this.isDetailVisible$ = this.store.select(PokemonSelectors.isDetailVisible);
    }

    ngOnInit(): void {
        // Load first page on component initialization
        this.store.dispatch(new PokemonActions.LoadPage(1));
    }

    /**
     * Handle Pokemon card click event
     * Dispatches SelectPokemon action to show detail popup
     */
    onCardClick(pokemonId: number): void {
        this.store.dispatch(new PokemonActions.SelectPokemon(pokemonId));
    }

    /**
     * Handle detail popup close event
     * Dispatches DeselectPokemon action to hide detail popup
     */
    onDetailClose(): void {
        this.store.dispatch(new PokemonActions.DeselectPokemon());
    }

    /**
     * Handle pagination page change event
     * Dispatches LoadPage action to load new page
     */
    onPageChange(page: number): void {
        this.store.dispatch(new PokemonActions.LoadPage(page));
    }

    /**
     * Handle retry button click event
     * Dispatches RetryLoad action to retry failed page load
     */
    onRetry(): void {
        this.store.dispatch(new PokemonActions.RetryLoad());
    }
}
