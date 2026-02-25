import { Selector } from '@ngxs/store';
import { PokemonState, PokemonStateModel } from './pokemon.state';
import { Pokemon } from '../../../core/models/pokemon.model';

/**
 * Pokemon Selectors
 * 
 * Provides reactive access to Pokemon state
 * - Pagination selectors (currentPage, totalPages)
 * - Data selectors (pokemonList)
 * - UI state selectors (loading, error)
 * - Detail view selectors (selectedPokemon, isDetailVisible)
 */
export class PokemonSelectors {
    /**
     * Get current page number
     */
    @Selector([PokemonState])
    static currentPage(state: PokemonStateModel): number {
        return state.currentPage;
    }

    /**
     * Get total number of pages
     */
    @Selector([PokemonState])
    static totalPages(state: PokemonStateModel): number {
        return state.totalPages;
    }

    /**
     * Get current page Pokemon list
     */
    @Selector([PokemonState])
    static pokemonList(state: PokemonStateModel): Pokemon[] {
        return state.pokemonList;
    }

    /**
     * Get loading state
     */
    @Selector([PokemonState])
    static loading(state: PokemonStateModel): boolean {
        return state.loading;
    }

    /**
     * Get error state
     */
    @Selector([PokemonState])
    static error(state: PokemonStateModel): string | null {
        return state.error;
    }

    /**
     * Get selected Pokemon for detail view
     * Returns the Pokemon object stored in state
     */
    @Selector([PokemonState])
    static selectedPokemon(state: PokemonStateModel): Pokemon | null {
        return state.selectedPokemon;
    }

    /**
     * Check if detail view should be visible
     */
    @Selector([PokemonState])
    static isDetailVisible(state: PokemonStateModel): boolean {
        return state.selectedPokemonId !== null;
    }

    /**
     * Check if Pokemon detail is loading
     */
    @Selector([PokemonState])
    static loadingDetail(state: PokemonStateModel): boolean {
        return state.loadingDetail;
    }

    /**
     * Get selected type filter
     */
    @Selector([PokemonState])
    static selectedType(state: PokemonStateModel): string | null {
        return state.selectedType;
    }
}
