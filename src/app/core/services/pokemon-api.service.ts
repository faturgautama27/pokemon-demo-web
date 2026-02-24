import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, forkJoin, of, mergeMap } from 'rxjs';
import { map, catchError, retry, delay } from 'rxjs/operators';
import { Pokemon, capitalizeName, formatPokemonNumber } from '../models/pokemon.model';
import { PokemonDetailResponse, PokemonBasic } from '../models/api-response.model';

/**
 * Pokemon API Service
 * 
 * Handles all interactions with PokeAPI V2
 * - Fetches Pokemon list and details
 * - Transforms API responses to application models
 * - Implements error handling with retry logic
 * - Throttles concurrent requests (max 5)
 */
@Injectable({
    providedIn: 'root'
})
export class PokemonApiService {
    private readonly http = inject(HttpClient);
    private readonly baseUrl = 'https://pokeapi.co/api/v2';

    // Request throttling: max 5 concurrent requests
    private readonly maxConcurrentRequests = 5;

    /**
     * Get Pokemon list with pagination
     * @param offset - Starting index (0-based)
     * @param limit - Number of Pokemon to fetch
     * @returns Observable of Pokemon basic info array
     */
    getPokemonList(offset: number, limit: number): Observable<PokemonBasic[]> {
        const url = `${this.baseUrl}/pokemon?offset=${offset}&limit=${limit}`;

        return this.http.get<{ results: PokemonBasic[] }>(url).pipe(
            map(response => response.results),
            retry({
                count: 3,
                delay: (error, retryCount) => this.getRetryDelay(retryCount)
            }),
            catchError(error => this.handleError(error))
        );
    }

    /**
     * Get detailed Pokemon data by ID
     * @param id - Pokemon ID (1-151)
     * @returns Observable of transformed Pokemon data
     */
    getPokemonDetail(id: number): Observable<Pokemon> {
        const url = `${this.baseUrl}/pokemon/${id}`;

        return this.http.get<PokemonDetailResponse>(url).pipe(
            map(response => this.transformPokemonDetail(response)),
            retry({
                count: 3,
                delay: (error, retryCount) => this.getRetryDelay(retryCount)
            }),
            catchError(error => this.handleError(error))
        );
    }

    /**
     * Fetch multiple Pokemon in parallel with throttling
     * @param ids - Array of Pokemon IDs
     * @returns Observable of Pokemon array
     */
    getPokemonBatch(ids: number[]): Observable<Pokemon[]> {
        if (ids.length === 0) {
            return of([]);
        }

        // Split into chunks of maxConcurrentRequests to throttle
        const chunks: number[][] = [];
        for (let i = 0; i < ids.length; i += this.maxConcurrentRequests) {
            chunks.push(ids.slice(i, i + this.maxConcurrentRequests));
        }

        // Process chunks sequentially, but requests within each chunk in parallel
        return of(...chunks).pipe(
            mergeMap(chunk => {
                const requests = chunk.map(id => this.getPokemonDetail(id));
                return forkJoin(requests);
            }, 1), // Process one chunk at a time
            // Flatten the array of arrays into a single array
            map((results, index) => results),
            // Collect all results
            mergeMap((chunkResults, index) => {
                if (index === chunks.length - 1) {
                    // Last chunk, return all accumulated results
                    return of(chunkResults);
                }
                return of(chunkResults);
            })
        ).pipe(
            // Collect all chunks into a single array
            mergeMap(results => of(results)),
            // Flatten nested arrays
            map(results => results.flat ? results.flat() : results)
        );
    }

    /**
     * Transform API response to application Pokemon model
     * @param response - Raw API response
     * @returns Transformed Pokemon object
     */
    private transformPokemonDetail(response: PokemonDetailResponse): Pokemon {
        return {
            id: response.id,
            name: capitalizeName(response.name),
            number: formatPokemonNumber(response.id),
            imageUrl: response.sprites.other['official-artwork'].front_default || response.sprites.front_default,
            types: response.types
                .sort((a, b) => a.slot - b.slot)
                .map(t => capitalizeName(t.type.name)),
            weight: response.weight,
            height: response.height,
            abilities: response.abilities.map(a => ({
                name: capitalizeName(a.ability.name),
                isHidden: a.is_hidden
            })),
            moves: response.moves.map(m => ({
                name: capitalizeName(m.move.name),
                learnMethod: m.version_group_details[0]?.move_learn_method.name || 'unknown'
            }))
        };
    }

    /**
     * Calculate retry delay with exponential backoff
     * @param retryCount - Current retry attempt (1-based)
     * @returns Observable that delays by 1s, 2s, or 4s
     */
    private getRetryDelay(retryCount: number): Observable<number> {
        const delayMs = Math.pow(2, retryCount - 1) * 1000; // 1s, 2s, 4s
        return of(delayMs).pipe(delay(delayMs));
    }

    /**
     * Handle HTTP errors with user-friendly messages
     * @param error - HTTP error response
     * @returns Observable that throws formatted error
     */
    private handleError(error: HttpErrorResponse): Observable<never> {
        let errorMessage: string;

        if (error.status === 0) {
            // Network error
            errorMessage = 'Unable to connect. Please check your internet connection.';
            console.error('Network error:', error.error);
        } else if (error.status === 404) {
            // Not found
            errorMessage = 'Pokemon not found';
            console.error('404 error:', error.message);
        } else if (error.status === 429) {
            // Rate limit
            errorMessage = 'Too many requests. Please try again in a moment.';
            console.error('Rate limit error:', error.message);
        } else if (error.status >= 500) {
            // Server error
            errorMessage = 'Service temporarily unavailable. Please try again.';
            console.error('Server error:', error.status, error.message);
        } else {
            // Other errors
            errorMessage = 'An unexpected error occurred';
            console.error('HTTP error:', error.status, error.message);
        }

        return throwError(() => new Error(errorMessage));
    }
}
