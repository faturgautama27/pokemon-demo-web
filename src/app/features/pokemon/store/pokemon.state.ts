import { Injectable, inject } from '@angular/core';
import { State, Action, StateContext } from '@ngxs/store';
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { Pokemon } from '../../../core/models/pokemon.model';
import { PokemonApiService } from '../../../core/services/pokemon-api.service';
import { PokemonActions } from './pokemon.actions';

/**
 * Pokemon State Model
 * 
 * Defines the shape of the Pokemon state
 * Validates: Requirements 1.1, 1.2, 1.3, 1.4, 1.5, 4.1, 4.10
 */
export interface PokemonStateModel {
    // Pagination
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;

    // Pokemon data
    pokemonList: Pokemon[];

    // UI state
    loading: boolean;
    error: string | null;
    selectedPokemonId: number | null;
}

/**
 * Pokemon State
 * 
 * Manages Pokemon application state with NGXS
 * - Handles pagination (15 pages, 10 items per page)
 * - Fetches Pokemon data from API
 * - Manages loading and error states
 * - Handles Pokemon selection for detail view
 */
@State<PokemonStateModel>({
    name: 'pokemon',
    defaults: {
        currentPage: 1,
        totalPages: 15,
        itemsPerPage: 10,
        pokemonList: [],
        loading: false,
        error: null,
        selectedPokemonId: null
    }
})
@Injectable()
export class PokemonState {
    private readonly pokemonApiService = inject(PokemonApiService);

    /**
     * Load a page of Pokemon
     * Calculates offset as (page - 1) * 10
     */
    @Action(PokemonActions.LoadPage)
    loadPage(ctx: StateContext<PokemonStateModel>, action: PokemonActions.LoadPage) {
        const state = ctx.getState();

        // Set loading state and clear error
        ctx.patchState({
            loading: true,
            error: null,
            currentPage: action.page
        });

        // Calculate offset: (page - 1) * 10
        const offset = (action.page - 1) * state.itemsPerPage;
        const limit = state.itemsPerPage;

        // Fetch Pokemon list, then fetch details for each Pokemon
        return this.pokemonApiService.getPokemonList(offset, limit).pipe(
            tap(pokemonBasics => {
                // Extract Pokemon IDs from URLs
                const ids = pokemonBasics.map(p => {
                    const urlParts = p.url.split('/');
                    return parseInt(urlParts[urlParts.length - 2]);
                });

                // Fetch detailed Pokemon data
                this.pokemonApiService.getPokemonBatch(ids).pipe(
                    tap(pokemon => {
                        ctx.dispatch(new PokemonActions.LoadPageSuccess(pokemon, action.page));
                    }),
                    catchError(error => {
                        ctx.dispatch(new PokemonActions.LoadPageFailure(error.message));
                        return of(null);
                    })
                ).subscribe();
            }),
            catchError(error => {
                ctx.dispatch(new PokemonActions.LoadPageFailure(error.message));
                return of(null);
            })
        );
    }

    /**
     * Handle successful page load
     */
    @Action(PokemonActions.LoadPageSuccess)
    loadPageSuccess(ctx: StateContext<PokemonStateModel>, action: PokemonActions.LoadPageSuccess) {
        ctx.patchState({
            pokemonList: action.pokemon,
            currentPage: action.page,
            loading: false,
            error: null
        });
    }

    /**
     * Handle page load failure
     */
    @Action(PokemonActions.LoadPageFailure)
    loadPageFailure(ctx: StateContext<PokemonStateModel>, action: PokemonActions.LoadPageFailure) {
        ctx.patchState({
            loading: false,
            error: action.error
        });
    }

    /**
     * Select a Pokemon to view details
     */
    @Action(PokemonActions.SelectPokemon)
    selectPokemon(ctx: StateContext<PokemonStateModel>, action: PokemonActions.SelectPokemon) {
        ctx.patchState({
            selectedPokemonId: action.pokemonId
        });
    }

    /**
     * Deselect Pokemon and close detail view
     */
    @Action(PokemonActions.DeselectPokemon)
    deselectPokemon(ctx: StateContext<PokemonStateModel>) {
        ctx.patchState({
            selectedPokemonId: null
        });
    }

    /**
     * Retry loading the current page
     */
    @Action(PokemonActions.RetryLoad)
    retryLoad(ctx: StateContext<PokemonStateModel>) {
        const state = ctx.getState();
        ctx.dispatch(new PokemonActions.LoadPage(state.currentPage));
    }
}
