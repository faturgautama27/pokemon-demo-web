/**
 * Pokemon Data Models
 * 
 * Core interfaces and utilities for Pokemon data representation
 */

/**
 * Main Pokemon interface representing a complete Pokemon entity
 */
export interface Pokemon {
    id: number;
    name: string;
    number: string; // 3-digit format: "001", "002", etc.
    imageUrl: string;
    types: string[]; // ["Fire"], ["Grass", "Poison"]
    weight: number; // in hectograms
    height: number; // in decimeters
    abilities: Ability[];
    moves: Move[];
}

/**
 * Pokemon ability interface
 */
export interface Ability {
    name: string;
    isHidden: boolean;
}

/**
 * Pokemon move interface
 */
export interface Move {
    name: string;
    learnMethod: string;
}

/**
 * Utility Functions
 */

/**
 * Format Pokemon ID as 3-digit zero-padded string
 * @param id - Pokemon ID (1-151)
 * @returns Formatted string (e.g., 1 → "001", 42 → "042", 151 → "151")
 */
export function formatPokemonNumber(id: number): string {
    return id.toString().padStart(3, '0');
}

/**
 * Capitalize Pokemon name from API format to display format
 * Converts lowercase hyphenated names to capitalized words with spaces
 * @param name - API name (e.g., "bulbasaur", "mr-mime")
 * @returns Capitalized name (e.g., "Bulbasaur", "Mr Mime")
 */
export function capitalizeName(name: string): string {
    return name
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}
