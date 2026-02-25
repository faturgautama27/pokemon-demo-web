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

    // Filtering
    selectedType: string | null;
    filteredPokemonIds: number[];

    // UI state
    loading: boolean;
    error: string | null;
    selectedPokemonId: number | null;
    selectedPokemon: Pokemon | null;
    loadingDetail: boolean;
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
        selectedType: null,
        filteredPokemonIds: [],
        loading: false,
        error: null,
        selectedPokemonId: null,
        selectedPokemon: null,
        loadingDetail: false
    }
})
@Injectable()
export class PokemonState {
    private readonly pokemonApiService = inject(PokemonApiService);

    /**
     * Load a page of Pokemon
     * Calculates offset as (page - 1) * 10
     * Considers type filter if active
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

        // If filtering by type, use filtered IDs
        if (state.selectedType && state.filteredPokemonIds.length > 0) {
            const startIndex = (action.page - 1) * state.itemsPerPage;
            const endIndex = startIndex + state.itemsPerPage;
            const pageIds = state.filteredPokemonIds.slice(startIndex, endIndex);

            // Fetch detailed Pokemon data for filtered IDs
            return this.pokemonApiService.getPokemonBatch(pageIds).pipe(
                tap(pokemon => {
                    ctx.dispatch(new PokemonActions.LoadPageSuccess(pokemon, action.page));
                }),
                catchError(error => {
                    ctx.dispatch(new PokemonActions.LoadPageFailure(error.message));
                    return of(null);
                })
            );
        }

        // Otherwise, load normally
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
     * Fetches Pokemon detail from API if not in current list
     */
    @Action(PokemonActions.SelectPokemon)
    selectPokemon(ctx: StateContext<PokemonStateModel>, action: PokemonActions.SelectPokemon) {
        const state = ctx.getState();

        // First, check if Pokemon is in current list
        const pokemonInList = state.pokemonList.find(p => p.id === action.pokemonId);

        if (pokemonInList) {
            // Pokemon found in current list, use it directly
            ctx.patchState({
                selectedPokemonId: action.pokemonId,
                selectedPokemon: pokemonInList,
                loadingDetail: false
            });
            return;
        }

        // Pokemon not in list, fetch from API
        ctx.patchState({
            selectedPokemonId: action.pokemonId,
            selectedPokemon: null,
            loadingDetail: true
        });

        return this.pokemonApiService.getPokemonDetail(action.pokemonId).pipe(
            tap(pokemon => {
                ctx.patchState({
                    selectedPokemon: pokemon,
                    loadingDetail: false
                });
            }),
            catchError(error => {
                console.error('Failed to load Pokemon detail:', error);
                ctx.patchState({
                    selectedPokemon: null,
                    loadingDetail: false
                });
                return of(null);
            })
        );
    }

    /**
     * Deselect Pokemon and close detail view
     */
    @Action(PokemonActions.DeselectPokemon)
    deselectPokemon(ctx: StateContext<PokemonStateModel>) {
        ctx.patchState({
            selectedPokemonId: null,
            selectedPokemon: null,
            loadingDetail: false
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

    /**
     * Filter Pokemon by type
     */
    @Action(PokemonActions.FilterByType)
    filterByType(ctx: StateContext<PokemonStateModel>, action: PokemonActions.FilterByType) {
        ctx.patchState({
            loading: true,
            error: null,
            selectedType: action.typeName
        });

        return this.pokemonApiService.getPokemonByType(action.typeName).pipe(
            tap(pokemonBasics => {
                // Extract Pokemon IDs
                const ids = pokemonBasics.map(p => {
                    const urlParts = p.url.split('/');
                    return parseInt(urlParts[urlParts.length - 2]);
                });

                // Calculate total pages based on filtered results
                const totalPages = Math.ceil(ids.length / ctx.getState().itemsPerPage);

                ctx.patchState({
                    filteredPokemonIds: ids,
                    totalPages: totalPages || 1,
                    currentPage: 1
                });

                // Load first page of filtered results
                ctx.dispatch(new PokemonActions.LoadPage(1));
            }),
            catchError(error => {
                ctx.patchState({
                    loading: false,
                    error: error.message
                });
                return of(null);
            })
        );
    }

    /**
     * Clear type filter
     */
    @Action(PokemonActions.ClearFilter)
    clearFilter(ctx: StateContext<PokemonStateModel>) {
        ctx.patchState({
            selectedType: null,
            filteredPokemonIds: [],
            totalPages: 15,
            currentPage: 1
        });

        // Load first page without filter
        ctx.dispatch(new PokemonActions.LoadPage(1));
    }
}
