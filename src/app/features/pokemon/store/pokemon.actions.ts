import { Pokemon } from '../../../core/models/pokemon.model';

/**
 * Pokemon Actions
 * 
 * Defines all actions for Pokemon state management
 * - LoadPage: Initiates loading of a specific page
 * - LoadPageSuccess: Handles successful page load
 * - LoadPageFailure: Handles page load errors
 * - SelectPokemon: Opens detail view for a Pokemon
 * - DeselectPokemon: Closes detail view
 * - RetryLoad: Retries failed page load
 */

export namespace PokemonActions {
    /**
     * Load a specific page of Pokemon
     * Validates: Requirements 1.4, 3.8, 3.9, 3.10
     */
    export class LoadPage {
        static readonly type = '[Pokemon] Load Page';
        constructor(public page: number) { }
    }

    /**
     * Successfully loaded Pokemon page
     * Validates: Requirements 1.4, 4.1
     */
    export class LoadPageSuccess {
        static readonly type = '[Pokemon] Load Page Success';
        constructor(public pokemon: Pokemon[], public page: number) { }
    }

    /**
     * Failed to load Pokemon page
     * Validates: Requirements 5.1, 5.3
     */
    export class LoadPageFailure {
        static readonly type = '[Pokemon] Load Page Failure';
        constructor(public error: string) { }
    }

    /**
     * Select a Pokemon to view details
     * Validates: Requirements 4.1, 4.10
     */
    export class SelectPokemon {
        static readonly type = '[Pokemon] Select Pokemon';
        constructor(public pokemonId: number) { }
    }

    /**
     * Deselect Pokemon and close detail view
     * Validates: Requirements 4.10
     */
    export class DeselectPokemon {
        static readonly type = '[Pokemon] Deselect Pokemon';
    }

    /**
     * Retry loading the current page after an error
     * Validates: Requirements 5.3
     */
    export class RetryLoad {
        static readonly type = '[Pokemon] Retry Load';
    }
}
