/**
 * PokeAPI Response Models
 * 
 * Interfaces matching the structure of PokeAPI V2 responses
 * These models represent the raw API data before transformation
 */

/**
 * Response from GET /pokemon?offset={offset}&limit={limit}
 */
export interface PokemonListResponse {
    count: number;
    next: string | null;
    previous: string | null;
    results: PokemonBasic[];
}

/**
 * Basic Pokemon information from list endpoint
 */
export interface PokemonBasic {
    name: string;
    url: string;
}

/**
 * Response from GET /pokemon/{id}
 * Complete Pokemon detail information
 */
export interface PokemonDetailResponse {
    id: number;
    name: string;
    sprites: {
        front_default: string;
        other: {
            'official-artwork': {
                front_default: string;
            };
        };
    };
    types: TypeSlot[];
    weight: number;
    height: number;
    abilities: AbilitySlot[];
    moves: MoveSlot[];
}

/**
 * Pokemon type slot from API response
 */
export interface TypeSlot {
    slot: number;
    type: {
        name: string;
    };
}

/**
 * Pokemon ability slot from API response
 */
export interface AbilitySlot {
    ability: {
        name: string;
    };
    is_hidden: boolean;
}

/**
 * Pokemon move slot from API response
 */
export interface MoveSlot {
    move: {
        name: string;
    };
    version_group_details: {
        move_learn_method: {
            name: string;
        };
    }[];
}
