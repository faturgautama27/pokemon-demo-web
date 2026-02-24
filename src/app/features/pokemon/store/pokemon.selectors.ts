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
     * Validates: Requirements 1.1, 1.2
     */
    @Selector([PokemonState])
    static currentPage(state: PokemonStateModel): number {
        return state.currentPage;
    }

    /**
     * Get total number of pages
     * Validates: Requirements 1.1, 1.2
     */
    @Selector([PokemonState])
    static totalPages(state: PokemonStateModel): number {
        return state.totalPages;
    }

    /**
     * Get current page Pokemon list
     * Validates: Requirements 1.1, 1.2, 1.3
     */
    @Selector([PokemonState])
    static pokemonList(state: PokemonStateModel): Pokemon[] {
        return state.pokemonList;
    }

    /**
     * Get loading state
     * Validates: Requirements 1.5
     */
    @Selector([PokemonState])
    static loading(state: PokemonStateModel): boolean {
        return state.loading;
    }

    /**
     * Get error state
     * Validates: Requirements 5.1
     */
    @Selector([PokemonState])
    static error(state: PokemonStateModel): string | null {
        return state.error;
    }

    /**
     * Get selected Pokemon for detail view
     * Returns null if no Pokemon is selected
     * Validates: Requirements 4.1, 4.10
     */
    @Selector([PokemonState])
    static selectedPokemon(state: PokemonStateModel): Pokemon | null {
        if (!state.selectedPokemonId) {
            return null;
        }
        return state.pokemonList.find(p => p.id === state.selectedPokemonId) || null;
    }

    /**
     * Check if detail view should be visible
     * Validates: Requirements 4.1, 4.10
     */
    @Selector([PokemonState])
    static isDetailVisible(state: PokemonStateModel): boolean {
        return state.selectedPokemonId !== null;
    }
}
